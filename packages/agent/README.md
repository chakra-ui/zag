# @zag-js/agent

Lets an AI agent read and drive the Zag components on a page through three tools, `snapshot`, `query` and `act`, instead
of reading the accessibility tree and clicking.

## Installation

```sh
npm i @zag-js/agent
```

## Usage

```ts
import { agentTools, allComponents, createAgent } from "@zag-js/agent"

// Before your components mount, so it hears every machine as it starts.
const agent = createAgent({ components: allComponents })

// Give `agentTools` to your model, and route each call to agent.snapshot, agent.query or agent.act.
```

See the [agent tools guide](https://zagjs.com/guides/agent-tools) for marking what needs a person, the browser's own
agent (WebMCP), and describing your own machines.

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).
