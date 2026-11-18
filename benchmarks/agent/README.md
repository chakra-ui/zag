# Agent benchmark

How much work does it take an AI agent to use a screen built with Zag? This is a port of the
[ui-sdk agent benchmark](https://github.com/vercel-labs/ui/tree/main/benchmarks/agent) (Apache-2.0). The task, the
settings screen, the harness, the prompt and the scoring are unchanged, so Zag's numbers can be compared with the ones
published there. The ui-sdk screen, [`src/screens/react-ui-sdk.tsx`](src/screens/react-ui-sdk.tsx), is ui-sdk's own,
unchanged, on `@ui-sdk/react` 0.1.0-beta.5 from npm. The Zag screen,
[`src/screens/react-zag.tsx`](src/screens/react-zag.tsx), builds the same page from Zag machines with `@zag-js/react`.

| Framework | Library | Tools         |
| --------- | ------- | ------------- |
| React     | ui-sdk  | Browser tools |
| React     | ui-sdk  | Agent tools   |
| React     | Zag     | Browser tools |
| React     | Zag     | Agent tools   |

Browser tools are how agents use most pages today: read the accessibility tree, click, type, press a key. They follow
the Playwright MCP server's tools. Agent tools are the three tools each library's bridge gives an agent, `snapshot`,
`query` and `act`: ui-sdk's from `@ui-sdk/react/agent`, Zag's from [`@zag-js/agent`](../../packages/agent), each with
its own tool descriptions. Every screen runs with both, so you can tell what the tools change apart from what the
library changes.

## Results

One run per row, all four rows at the same time on one machine, with Sonnet through Claude Code, on November 16, 2026.
Every run was correct. Run with `--runs 3` for medians.

### Closed panels unmount (`--panels unmount`, the default)

Closed tabs and accordion items leave the page, as ui-sdk's panels do by default. The Zag screen renders a panel only
while it's open.

| Library | Tools   | Tool calls | Text read | Time | Tokens | Cost   |
| ------- | ------- | ---------- | --------- | ---- | ------ | ------ |
| ui-sdk  | Browser | 17         | 41.3k     | 35 s | 259.2k | $0.127 |
| ui-sdk  | Agent   | 10         | 8.9k      | 20 s | 75.6k  | $0.047 |
| Zag     | Browser | 18         | 38.5k     | 38 s | 265.8k | $0.122 |
| Zag     | Agent   | 11         | 16.2k     | 22 s | 91.3k  | $0.063 |

The Zag agent row was measured before three changes to `@zag-js/agent`, which this mode exercises and which haven't been
benchmarked yet: `act` lists components that came onto the page as one line each, remembers the values of fields whose
tab unmounted (and reopens the tab when a step names one), and reports rows whose text changed, like a role.

### Closed panels stay, hidden (`--panels keep`)

Closed tabs and accordion items stay in the page with `hidden`, as Zag's content parts do by default. The ui-sdk screen
adds `keepMounted`.

| Library | Tools   | Tool calls | Text read | Time | Tokens | Cost   |
| ------- | ------- | ---------- | --------- | ---- | ------ | ------ |
| ui-sdk  | Browser | 17         | 41.3k     | 31 s | 259.4k | $0.127 |
| ui-sdk  | Agent   | 11         | 11.3k     | 23 s | 96.3k  | $0.055 |
| Zag     | Browser | 18         | 38.4k     | 34 s | 265.9k | $0.122 |
| Zag     | Agent   | 5          | 9.3k      | 11 s | 37.5k  | $0.034 |

With browser tools, the panel mode changes little. With agent tools, it decides how far the agent can see ahead. Zag's
bridge lists components in closed panels that are still in the page, marked `hidden`, so the agent can make every change
in one `act`. ui-sdk's bridge lists only components that are shown or were shown before, so its agent works tab by tab
either way. When panels unmount, neither bridge can see what's behind a closed tab.

Cost is what Claude Code reports at API prices. On a Claude subscription, runs count against its usage limits instead.

## The task

The screen has three tabs, 24 members with a menu on every row, a confirm dialog and an accordion of switches. The agent
is asked to:

- rename the project to Atlas
- set the visibility to Internal
- make Priya Shah an admin
- remove Tom Becker and confirm
- in Email, turn Deploy failures on and Weekly digest off, and leave Slack alone
- save

A run is correct when the page saved once, with exactly those changes.

## Run it

You need the [Claude Code CLI](https://claude.com/claude-code), signed in, and Chromium for Playwright
(`pnpm exec playwright install chromium`). Each run starts one Claude Code agent, which is billed to your account.

```sh
pnpm install
pnpm --filter zag-agent-benchmark bench
pnpm --filter zag-agent-benchmark bench --runs 3 --headless
```

| Flag          | Default   |                                                                                        |
| ------------- | --------- | -------------------------------------------------------------------------------------- |
| `--framework` | `react`   | Only `react` for now.                                                                  |
| `--runs`      | `1`       | How many times to run every row.                                                       |
| `--model`     | `sonnet`  | Any model the Claude Code CLI takes.                                                   |
| `--panels`    | `unmount` | `unmount` or `keep`: whether closed tabs and accordion items stay in the page, hidden. |
| `--headless`  |           | Run without windows.                                                                   |
| `--width`     | `480`     | The width of each window.                                                              |
| `--out`       |           | Where to write results. A temporary folder.                                            |

Results go to `results.json`, with every tool call an agent made in `calls.jsonl` beside it: its arguments, and the text
it returned, under `output`. Set `CHROMIUM` to use a browser of your own.

To look at a screen by hand, run `pnpm --filter zag-agent-benchmark dev` and open
`http://localhost:5410/?screen=react-zag` or `?screen=react-ui-sdk`. Add `&panels=keep` to keep closed panels in the
page. Add `&agent` to put the agent tools on the page as `window.__agent`.

## Checks

Scripted Playwright checks of `@zag-js/agent`, with no agent and no Claude usage:

```sh
node checks/rejects.mjs
```

It drives [`src/screens/react-zag-rejects.tsx`](src/screens/react-zag-rejects.tsx), a page that isn't part of the
benchmark: controlled switches and a checkbox whose parent refuses a change, takes only `true`, or answers with
`"indeterminate"`. It checks that `act` lists each one in `rejected` with what was asked and what the page kept.

## What is measured

- **Tool calls:** every call the agent made, including the last one, `done`.
- **Text read:** the characters the tools returned.
- **Time:** from the agent's start to its last message.
- **Tokens and cost:** what Claude Code reported for the run.
- **Correct:** whether the page saved once with the right values.

## Add a screen

Write it in `src/screens/<framework>-<library>.tsx` with the same labels as the others, report the save through `save`
from [`src/settings.ts`](src/settings.ts), and add a row to `frameworks` in [`harness/bench.mjs`](harness/bench.mjs).
