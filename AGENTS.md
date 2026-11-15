# AGENTS

## Project Overview

- We are building `easy-template-x` - an open source npm library that generates
  docx documents from templates, in Node or in the browser.
- Templates are plain Word documents with placeholder `{tags}` and
  `{#loop tags}{/loop tags}`.
- Full public documentation is in the `README` file.

## General Behavior

- NEVER use `cd`, all commands should run from the project root.
- Run tests with `yarn test`.
- Run type checks with `yarn typecheck`.
- Run lint with `yarn lint`.
- Run all quality checks (type checks, lint and tests) with `yarn quality`.
- Keep existing comments.
- Do not remove user-added empty lines.
- Don't use Em Dash (—) for anything. Use regular hyphens instead.

## Git Rules

### Safety Rules

- NEVER push to `master`.
- NEVER commit to or base work on `master`; use `develop` instead.
- NEVER create a PR directly to `master`. Always target `develop`.
- NEVER push directly to `develop`. Always create a PR.
- ALWAYS target the `develop` branch in ALL PRs.  
  The only exception is if PRs  are dependent on each other, then the first PR
  should target `develop` and the subsequent PRs should target the previous PR's
  branch.

### Local Working Tree Rules

The following rules apply when working in the same local working tree as me.
They do not apply when working in a separate worktree or in a cloud environment.

- **Do not modify the Git index.** Do not commit, stage or unstage changes. Only
  modify the working tree. I use the staging area to distinguish your changes
  from mine.
- **Do not use the Git stash.** Do not create, apply, pop, drop, or otherwise
  modify stashes. The stash is reserved for my use.

## Coding Rules

- MOST IMPORTANTLY: Stay idiomatic to the codebase. Follow the existing coding
  style and conventions and do not invent or introduce new conventions.
