# Contributing to Zag

Bug reports, documentation improvements, and new component ideas are welcome. Browse
[good first issues](https://github.com/chakra-ui/zag/contribute) or
[open an issue](https://github.com/chakra-ui/zag/issues) to discuss a bug or proposal.

For bug reports, include the affected component, framework, package version, and steps to reproduce. A small
reproduction helps us investigate. For feature requests, describe the use case and the behavior you need.

## Local setup

Use the Node.js version in [`.nvmrc`](./.nvmrc) and pnpm 12, as specified in [`package.json`](./package.json). If pnpm
11 fails to switch versions with an `ENOEXEC` error, install pnpm 12 directly with `npm install -g pnpm@12`.

```sh
git clone https://github.com/chakra-ui/zag.git
cd zag
pnpm install
pnpm build
pnpm start-react
```

Build the packages before starting example apps or browser tests so their workspace dependencies are available.

## Development commands

| Task                         | Command                 |
| ---------------------------- | ----------------------- |
| Build packages               | `pnpm build`            |
| Run unit tests               | `pnpm test`             |
| Check types                  | `pnpm typecheck`        |
| Lint                         | `pnpm lint`             |
| Generate a component machine | `pnpm generate-machine` |
| Generate a utility package   | `pnpm generate-util`    |
| Start the docs website       | `pnpm start-website`    |

Example apps live in [`examples/`](./examples). Use these commands to test changes in a framework:

| Framework          | Example app          | Browser tests     |
| ------------------ | -------------------- | ----------------- |
| React              | `pnpm start-react`   | `pnpm e2e-react`  |
| Vue                | `pnpm start-vue`     | `pnpm e2e-vue`    |
| Solid              | `pnpm start-solid`   | `pnpm e2e-solid`  |
| Svelte             | `pnpm start-svelte`  | `pnpm e2e-svelte` |
| Preact             | `pnpm start-preact`  | `pnpm e2e-preact` |
| Vanilla JavaScript | `pnpm start-vanilla` | —                 |

Install Playwright browsers with `pnpm exec playwright install` before running browser tests. The test runner starts the
example app automatically.

## Submitting changes

- Keep pull requests focused on one fix or feature, and explain the resulting behavior.
- Follow the [WAI-ARIA authoring practices](https://www.w3.org/WAI/ARIA/apg/) when changing component interactions.
- Check keyboard navigation, focus behavior, and relevant framework examples. Add regression tests for bug fixes.
- Run the relevant tests, type checks, and lint before submitting.
- Update the docs when changing a public API. For published package changes, add a changeset with `pnpm exec changeset`.
- Use [conventional commits](https://www.conventionalcommits.org/), such as `fix(dialog): restore focus on close`.

For bug fixes and user-visible features, record the same interaction before and after the change as H.264 `.mp4` files
under `e2e/evidence/<issue-or-feature>/`. Keep recordings out of commits unless requested.
