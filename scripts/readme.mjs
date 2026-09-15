import fs from 'node:fs';
import {loadPapers,groups,ROOT,REPO,SITE} from './catalog.mjs';
const escape=s=>s.replace(/[\\|\[\]<>*_`]/g,c=>'\\'+c).replace(/\s+/g,' ');
const papers=loadPapers();
fs.writeFileSync(ROOT+'/README.md',`# Aha Looped Transformer

**Think deeper. Find your Aha.** An open visual atlas of recurrent computation, adaptive depth, and latent reasoning.

[Explore the live atlas](${SITE}/) · [Submit a paper](${REPO}/issues/new?template=submit-paper.yml) · [Contribution guide](CONTRIBUTING.md)

Browse ${papers.length} curated works, follow their publication timeline, and compare recurrence and depth control. The site uses the rose, blue and lavender palette of [Yue Su’s homepage](https://selen-suyue.github.io/), with a motion-aware recurrent particle animation.

## Collection

This table and the website are generated from the same files in \`data/papers/\`. Dates indicate first publication. Categories are browsing aids, not an exhaustive taxonomy. Links indicate available materials; they do not imply independent reproduction.

| Work | First published | Focus | Sources |
| --- | --- | --- | --- |
${papers.map(p=>`| [${escape(p.name)}](${SITE}/papers/${p.id}/) | ${p.published} | ${groups[p.group]} | [Paper](https://arxiv.org/abs/${p.arxiv})${p.code?` · [Code / project](${p.code})`:''}${p.weights?` · [Weights](${p.weights})`:''} |`).join('\n')}

## Contribute

Submit the GitHub Issue Form. Automation checks the fields, enriches bibliographic metadata, and prepares a review branch and a pull-request link (or opens a draft PR where permitted). A maintainer verifies the paper and merges it; the site then rebuilds automatically. Alternatively, add one YAML file in a pull request. No account is needed to browse; submitting uses your GitHub account.

An unreviewed submission is never published directly. Optional source links are reviewed by maintainers. See [CONTRIBUTING.md](CONTRIBUTING.md) for the data schema and editorial checks.

## Development

Requires Node.js 22.12+ (CI uses Node 24) and pnpm 11.19.0.

\`\`\`sh
pnpm install --frozen-lockfile
pnpm dev
pnpm test
pnpm build
\`\`\`

Astro generates static, independently addressable paper pages. Small browser scripts provide filters, comparison and Canvas animation. No database, tracking, runtime API keys or hosted application server.

## Deployment & automation

GitHub Pages deploys from the Actions workflow after a push to \`main\`. In repository Settings → Pages, choose **GitHub Actions**. Submission automation uses only this repository’s temporary \`GITHUB_TOKEN\`. This organization currently restricts automated PR creation, so the bot creates a validated review branch and posts a link for a maintainer to create the PR. If draft PR creation is permitted in the future, it happens automatically. The bot never approves or merges PRs.

The submission workflow validates and builds its generated change before creating the draft PR, because bot-created PRs do not automatically trigger ordinary PR workflows. Fork pull requests run with read-only access. Publication uses a separate, main-only Pages job. Failed builds leave the previous deployment available. README is generated during deployment and synchronized to the repository only when it changes.

## License

Code is [MIT licensed](LICENSE). Original curated descriptions in \`data/\` are [CC BY 4.0](https://creativecommons.org/licenses/by/4.0/). Paper titles, bibliographic facts and linked third-party research remain attributable to their original authors; this project does not relicense those works.
`);
