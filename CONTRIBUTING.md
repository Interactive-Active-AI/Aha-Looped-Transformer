# Contributing to Aha Looped Transformer

Thank you for helping the atlas grow. Submit an [Issue Form](https://github.com/Interactive-Active-AI/Aha-Looped-Transformer/issues/new?template=submit-paper.yml) or a pull request adding one file in `data/papers/`.

## Scope

Work on looped Transformers, shared recurrent cores, adaptive recursion and latent reasoning. Categories overlap: select a primary browsing category and explain the connection in the summary. Do not submit advertising or unverified performance claims.

## Data format

Use a unique lowercase hyphenated `id`, with a matching `<id>.yaml` filename. See existing entries. Both normal YAML and JSON (a YAML subset) are accepted.

```yaml
id: your-method
name: Your method
title: Full paper title
arxiv: '2601.12345' # Canonical ID without a version or URL
published: '2026-01-01' # First publication, not the date added to the atlas
authors:
  - Author Name
group: core # adaptive | core | full
summary: A short original explanation of the main idea.
diagram: 'Prelude → [ Core ] × R → Coda'
depth: Variable recurrent depth
kv: See paper
notes: Relevant distinctions and limitations, supported by the paper.
code: '' # Optional official https URL; project site is also allowed
weights: '' # Optional official https URL
verified: '2026-09-15' # Last source check
```

The example ID and date above are placeholders, not a research reference. Use “See paper” for unknown technical details. A schema must describe the actual method; do not infer it from a name. Existing entries include reading notes for claims that require context.

## Review and publishing

1. For an Issue Form, automation checks the arXiv ID, enriches title/authors/publication date from the public Hugging Face paper API, validates the complete catalog, runs tests and builds the site.
2. The bot prepares a **review branch** and a link for a maintainer to create the PR. Where organization policy permits, it opens a draft PR automatically. If metadata is unavailable, it leaves an explanation; use a direct PR with source-backed metadata. After fixing an issue, a maintainer can retry the `Paper submission` workflow with its number. Repeating a submission with an existing PR does not overwrite that PR.
3. A maintainer verifies relevance, bibliographic fields, summary, official source ownership and any performance qualifications; fills technical fields when supported; marks the PR ready; and merges it.
4. A push to `main` rebuilds and deploys all views to GitHub Pages. The README is generated from the same data. The prior deployment remains available if the build fails.

Please distinguish independent parameter count from effective unrolled depth, configurable budgets from learned stopping, and theoretical compute savings from measured end-to-end latency. A released checkpoint is not proof that we reproduced its results.

Run `pnpm test && pnpm build` before submitting code or data changes. Do not edit the generated README table by hand. Fork PR workflows have read-only permissions; submission automation runs trusted code from `main` and treats issue text only as data. Submitted URLs are not fetched by the bot except the validated arXiv ID through the fixed public metadata endpoint.

By contributing original descriptions, you offer those descriptions under CC BY 4.0; code changes are offered under MIT. Cite the paper and preserve its authorship. Do not copy abstracts or figures without appropriate permission.
