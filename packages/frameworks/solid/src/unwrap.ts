const toPOJO = (v: any) => JSON.parse(JSON.stringify(v))

export const unwrap = (state: any) => ({
  value: String(state.value),
  previousValue: String(state.previousValue),
  context: toPOJO(state.context),
  event: toPOJO(state.event),
  done: Boolean(state.done),
  tags: Array.from(state.tags),
})
