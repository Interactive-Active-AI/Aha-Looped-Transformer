import fs from 'node:fs';
import path from 'node:path';
import YAML from 'yaml';
export const ROOT = process.cwd();
export const REPO = 'https://github.com/Interactive-Active-AI/Aha-Looped-Transformer';
export const SITE = 'https://interactive-active-ai.github.io/Aha-Looped-Transformer';
export const groups = {adaptive:'Adaptive depth',core:'Core recurrence',full:'Full-stack recurrence'};
export function normalizeArxiv(value) {
 const m=String(value).trim().match(/^(?:https:\/\/(?:www\.)?arxiv\.org\/(?:abs|pdf)\/)?(\d{4}\.\d{4,5})(?:v\d+)?(?:\.pdf)?$/);
 if(!m) throw Error('Use an arXiv ID or https://arxiv.org/abs/… URL.');
 return m[1];
}
export function validatePaper(p) {
 if(!p || typeof p!=='object' || Array.isArray(p)) throw Error('Paper must be an object.');
 for(const key of ['id','name','title','arxiv','published','summary','group','diagram','depth','kv','notes','verified']) {
  if(typeof p[key]!=='string'|| !p[key].trim() || p[key].length>3000 || /[\u0000-\u0008\u000b\u000c\u000e-\u001f]/.test(p[key])) throw Error(`Invalid ${key}`);
 }
 if(!/^[a-z0-9]+(?:-[a-z0-9]+)*$/.test(p.id)||p.id.length>90) throw Error('Invalid id');
 if(!Object.hasOwn(groups,p.group)) throw Error('Invalid group');
 if(normalizeArxiv(p.arxiv)!==p.arxiv) throw Error('Use a canonical arXiv ID');
 for(const k of ['published','verified']) if(!/^\d{4}-\d{2}-\d{2}$/.test(p[k])||Number.isNaN(Date.parse(p[k]))||new Date(p[k]).toISOString().slice(0,10)!==p[k]) throw Error(`Invalid date: ${k}`);
 if(!Array.isArray(p.authors)||!p.authors.length||p.authors.some(a=>typeof a!=='string'||!a.trim()||a.length>200)) throw Error('Invalid authors');
 for(const k of ['code','weights']) if(p[k]) {
  const u=new URL(p[k]); if(u.protocol!=='https:'||u.username||u.password||!u.hostname.includes('.')||p[k].length>1000) throw Error(`Invalid ${k} URL`);
 }
 return p;
}
export function loadPapers(dir=path.join(ROOT,'data/papers')) {
 const ids=new Set(),arxiv=new Set();
 return fs.readdirSync(dir).filter(f=>f.endsWith('.yaml')).map(f=>{
  const p=validatePaper(YAML.parse(fs.readFileSync(path.join(dir,f),'utf8'),{maxAliasCount:0}));
  if(f!==`${p.id}.yaml`) throw Error('Filename must match id: '+f);
  if(ids.has(p.id)||arxiv.has(p.arxiv)) throw Error('Duplicate paper: '+f);
  ids.add(p.id);arxiv.add(p.arxiv);return p;
 }).sort((a,b)=>b.published.localeCompare(a.published)||a.id.localeCompare(b.id));
}
