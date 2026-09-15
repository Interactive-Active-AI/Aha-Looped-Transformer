import fs from 'node:fs';
import {execFileSync} from 'node:child_process';
import {pathToFileURL} from 'node:url';
import YAML from 'yaml';
import {normalizeArxiv,validatePaper,loadPapers,ROOT} from './catalog.mjs';
export function parseForm(body) {
 const fields={};
 for(const match of String(body).matchAll(/^### ([^\n]+)\n+([\s\S]*?)(?=^### |$(?![\s\S]))/gm)) {
  if(Object.hasOwn(fields,match[1])) throw Error('Duplicate form heading.');
  fields[match[1]]=match[2].trim()==='_No response_'?'':match[2].trim();
 }
 return fields;
}
export function makePaper(fields,meta,today) {
 const arxiv=normalizeArxiv(fields['Paper URL or arXiv ID']);
 const group={'Adaptive depth':'adaptive','Core recurrence':'core','Full-stack recurrence':'full'}[fields['Primary category']];
 return validatePaper({id:'arxiv-'+arxiv.replace('.','-'),name:fields['Short name']||meta.title,title:meta.title.replace(/\s+/g,' ').trim(),arxiv,published:meta.publishedAt.slice(0,10),authors:meta.authors.map(a=>a.name),group,summary:fields['Short summary'],diagram:'See paper for architecture',depth:'See paper',kv:'See paper',notes:'Community-submitted work. Consult the linked paper for architecture details and experimental conditions.',code:fields['Official code or project URL']||'',weights:fields['Official weights URL']||'',verified:today});
}
async function run(){
 const event=JSON.parse(fs.readFileSync(process.env.GITHUB_EVENT_PATH,'utf8'));
 const repo=process.env.GITHUB_REPOSITORY;
 if(!/^[\w.-]+\/[\w.-]+$/.test(repo||''))throw Error('Missing repository');
 const token=process.env.GH_TOKEN;
 async function api(route,method='GET',body){const r=await fetch(`https://api.github.com/repos/${repo}${route}`,{method,headers:{Authorization:`Bearer ${token}`,Accept:'application/vnd.github+json','Content-Type':'application/json'},body:body?JSON.stringify(body):undefined});if(!r.ok){const error=new Error(`GitHub request ${r.status}: ${route}`);error.status=r.status;throw error;}return r.status===204?null:r.json();}
 const number=Number(event.issue?.number||event.inputs?.issue_number);
 if(!Number.isSafeInteger(number)||number<1)throw Error('Invalid issue number');
 const issue=await api('/issues/'+number);
 if(issue.pull_request||issue.state!=='open'||!issue.title.startsWith('[Paper]')){console.log('Not an open paper submission; skipping.');return;}
 const branch='submission/issue-'+number;
 const existing=await api('/pulls?state=all&head='+encodeURIComponent(repo.split('/')[0]+':'+branch));
 if(existing.length){console.log('A pull request already exists for this issue.');return;}
 let p;
 try {
  const fields=parseForm(issue.body);
  const id=normalizeArxiv(fields['Paper URL or arXiv ID']);
  if(loadPapers().some(p=>p.arxiv===id))throw Error('This arXiv paper is already in the collection. Use a correction issue instead.');
  // Fetch only a fixed public metadata endpoint; never execute or fetch submitted source URLs.
  const response=await fetch('https://huggingface.co/api/papers/'+id,{signal:AbortSignal.timeout(30000)});
  if(!response.ok)throw Error('Bibliographic metadata is unavailable. Please submit a YAML file in a pull request using CONTRIBUTING.md.');
  p=makePaper(fields,await response.json(),new Date().toISOString().slice(0,10));
  fs.writeFileSync(`${ROOT}/data/papers/${p.id}.yaml`,YAML.stringify(p));
  execFileSync('pnpm',['test'],{cwd:ROOT,stdio:'inherit'});
  execFileSync('pnpm',['build'],{cwd:ROOT,stdio:'inherit'});
 } catch(error) {
  const safe=String(error.message).replace(/@/g,'＠').slice(0,800);
  const comments=await api(`/issues/${number}/comments`);
  if(!comments.some(c=>c.body?.includes('<!-- aha-submission-feedback -->')))await api(`/issues/${number}/comments`,'POST',{body:`<!-- aha-submission-feedback -->\nThe submission needs attention: ${safe}\n\nSee [the contribution guide](https://github.com/${repo}/blob/main/CONTRIBUTING.md). After correction, a maintainer can rerun **Paper submission** with this issue number.`});
  throw error;
 }
 const baseSha=execFileSync('git',['rev-parse','HEAD'],{cwd:ROOT,encoding:'utf8'}).trim();
 const commit=await api('/git/commits/'+baseSha);
 const tree=await api('/git/trees','POST',{base_tree:commit.tree.sha,tree:[`data/papers/${p.id}.yaml`,'README.md'].map(file=>({path:file,mode:'100644',type:'blob',content:fs.readFileSync(`${ROOT}/${file}`,'utf8')}))});
 const next=await api('/git/commits','POST',{message:`Add paper submission from issue #${number}`,tree:tree.sha,parents:[baseSha]});
 // A failed attempt may have left an unreviewed branch; never overwrite its content.
 try{await api('/git/refs','POST',{ref:'refs/heads/'+branch,sha:next.sha});}catch(error){throw Error('Could not create submission branch. Inspect any existing branch before retrying. '+error.message);}
 const prBody={title:'[Paper] '+p.name.slice(0,160),head:branch,base:'main',draft:true,body:`Closes #${number}\n\nAdds a community submission from https://arxiv.org/abs/${p.arxiv}. Bibliographic metadata was fetched from the public Hugging Face paper record. Schema validation, tests and static build passed before this draft was created.\n\n**Maintainer review required:** verify relevance, summaries, category, source ownership, dates and architecture details. Replace unknown fields when supported by the paper, mark ready, then merge to publish.\n\nThe submission bot does not approve or merge pull requests.`};
 try {
  const pr=await api('/pulls','POST',prBody);
  await api(`/issues/${number}/comments`,'POST',{body:`The submission passed automated validation and a static build. Draft pull request: ${pr.html_url}\n\nA maintainer will verify the sources before publication.`});
  console.log('Created draft PR '+pr.html_url);
 } catch(error) {
  if(error.status!==403)throw error;
  const compare=`https://github.com/${repo}/compare/main...${branch}?expand=1`;
  await api(`/issues/${number}/comments`,'POST',{body:`The submission passed automated validation, tests and a static build. The prepared branch is ready for review.\n\nThis organization does not allow automated PR creation. A maintainer can [review the changes and create a pull request](${compare}). Include \`Closes #${number}\` in the PR description, check the sources and merge to publish automatically.\n\nNo organization-wide permission change is required.`});
  console.log('Prepared review branch '+compare);
 }

}
if(process.argv[1]&&import.meta.url===pathToFileURL(process.argv[1]).href)run().catch(e=>{console.error(e.message);process.exitCode=1;});
