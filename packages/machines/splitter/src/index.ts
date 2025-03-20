export { anatomy } from "./splitter.anatomy"
export { connect } from "./splitter.connect"
export { machine } from "./splitter.machine"
export * from "./splitter.props"
export type {
  SplitterApi as Api,
  ElementIds,
  ExpandCollapseDetails,
  SplitterMachine as Machine,
  PanelData,
  PanelProps,
  SplitterProps as Props,
  ResizeDetails,
  ResizeEndDetails,
  ResizeTriggerProps,
  SplitterService as Service,
  SplitterItem as Item,
} from "./splitter.types"
export { getPanelLayout as layout } from "./utils/panel"
