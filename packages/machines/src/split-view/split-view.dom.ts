import { SplitViewMachineContext } from "./split-view.machine"

export function getElementIds(uid: string) {
  return {
    root: `${uid}-root`,
    splitter: `${uid}-splitter`,
    toggleButton: `${uid}-toggle-button`,
    splitterLabel: `${uid}-label`,
    primaryPane: `${uid}-primary-pane`,
    secondaryPane: `${uid}-secondary-pane`,
  }
}

export function getElements(ctx: SplitViewMachineContext) {
  const doc = ctx.doc ?? document
  const ids = getElementIds(ctx.uid)

  return {
    splitter: doc.getElementById(ids.splitter),
    primaryPane: doc.getElementById(ids.primaryPane),
  }
}
