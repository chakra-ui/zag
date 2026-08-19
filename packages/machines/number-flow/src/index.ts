export { anatomy } from "./number-flow.anatomy"
export { connect } from "./number-flow.connect"
export { machine } from "./number-flow.machine"
export * from "./number-flow.props"
export type {
  NumberFlowApi as Api,
  NumberFlowMachine as Machine,
  NumberFlowProps as Props,
  NumberFlowService as Service,
  AnimationDetails,
  DigitCellProps,
  ElementIds,
  SymbolProps,
  DigitProps,
  DigitTrackProps,
  TimingOptions,
  ValueChangeDetails,
} from "./number-flow.types"
export { isDigitSegment, isSymbolSegment } from "./utils/segments"
export type { DigitCell, DigitSegment, Segment, SymbolSegment, Trend } from "./utils/segments"
