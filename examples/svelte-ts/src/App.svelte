<script lang="ts">
  import { dataAttr } from "@zag-js/dom-query"
  import { routesData } from "@zag-js/shared"
  import { Link, Route, Router } from "svelte-routing"
  import Accordion from "./routes/accordion.svelte"
  import AngleSlider from "./routes/angle-slider.svelte"
  import Avatar from "./routes/avatar.svelte"
  import Carousel from "./routes/carousel.svelte"
  import Checkbox from "./routes/checkbox.svelte"
  import Clipboard from "./routes/clipboard.svelte"
  import Collapsible from "./routes/collapsible.svelte"
  import ColorPicker from "./routes/color-picker.svelte"
  import Combobox from "./routes/combobox.svelte"
  import ContextMenu from "./routes/context-menu.svelte"
  import DatePickerMulti from "./routes/date-picker-multi.svelte"
  import DatePickerRange from "./routes/date-picker-range.svelte"
  import DatePicker from "./routes/date-picker.svelte"
  import Dialog from "./routes/dialog.svelte"
  import Editable from "./routes/editable.svelte"
  import FileUpload from "./routes/file-upload.svelte"
  import FloatingPanel from "./routes/floating-panel.svelte"
  import HoverCard from "./routes/hover-card.svelte"
  import Index from "./routes/index.svelte"
  import MenuOptions from "./routes/menu-options.svelte"
  import Menu from "./routes/menu.svelte"
  import NestedMenu from "./routes/menu-nested.svelte"
  import NumberInput from "./routes/number-input.svelte"
  import Pagination from "./routes/pagination.svelte"
  import PinInput from "./routes/pin-input.svelte"
  import Popover from "./routes/popover.svelte"
  import Progress from "./routes/progress.svelte"
  import QrCode from "./routes/qr-code.svelte"
  import RadioGroup from "./routes/radio-group.svelte"
  import RangeSlider from "./routes/range-slider.svelte"
  import RatingGroup from "./routes/rating-group.svelte"
  import SegmentControl from "./routes/segment-control.svelte"
  import Select from "./routes/select.svelte"
  import SignaturePad from "./routes/signature-pad.svelte"
  import Slider from "./routes/slider.svelte"
  import Splitter from "./routes/splitter.svelte"
  import Switch from "./routes/switch.svelte"
  import Tabs from "./routes/tabs.svelte"
  import TagsInput from "./routes/tags-input.svelte"
  import TimePicker from "./routes/time-picker.svelte"
  import TimerCountdown from "./routes/timer-countdown.svelte"
  import TimerStopwatch from "./routes/timer-stopwatch.svelte"
  import ToastOverlap from "./routes/toast-overlap.svelte"
  import ToastStacked from "./routes/toast-stacked.svelte"
  import ToggleGroup from "./routes/toggle-group.svelte"
  import Tooltip from "./routes/tooltip.svelte"
  import Tour from "./routes/tour.svelte"
  import TreeView from "./routes/tree-view.svelte"

  const sortedRoutes = routesData.sort((a, b) => a.label.localeCompare(b.label))

  const paths = [
    { path: "/", component: Index },
    { path: "/accordion", component: Accordion },
    { path: "/avatar", component: Avatar },
    { path: "/angle-slider", component: AngleSlider },
    { path: "/carousel", component: Carousel },
    { path: "/checkbox", component: Checkbox },
    { path: "/clipboard", component: Clipboard },
    { path: "/collapsible", component: Collapsible },
    { path: "/color-picker", component: ColorPicker },
    { path: "/combobox", component: Combobox },
    { path: "/context-menu", component: ContextMenu },
    { path: "/date-picker", component: DatePicker },
    { path: "/date-picker-multi", component: DatePickerMulti },
    { path: "/date-picker-range", component: DatePickerRange },
    { path: "/dialog", component: Dialog },
    { path: "/editable", component: Editable },
    { path: "/file-upload", component: FileUpload },
    { path: "/floating-panel", component: FloatingPanel },
    { path: "/hover-card", component: HoverCard },
    { path: "/menu-nested", component: NestedMenu },
    { path: "/menu", component: Menu },
    { path: "/menu-options", component: MenuOptions },
    { path: "/number-input", component: NumberInput },
    { path: "/pagination", component: Pagination },
    { path: "/pin-input", component: PinInput },
    { path: "/popover", component: Popover },
    { path: "/progress", component: Progress },
    { path: "/range-slider", component: RangeSlider },
    { path: "/radio-group", component: RadioGroup },
    { path: "/rating-group", component: RatingGroup },
    { path: "/segment-control", component: SegmentControl },
    { path: "/select", component: Select },
    { path: "/splitter", component: Splitter },
    { path: "/signature-pad", component: SignaturePad },
    { path: "/slider", component: Slider },
    { path: "/switch", component: Switch },
    { path: "/tabs", component: Tabs },
    { path: "/tags-input", component: TagsInput },
    { path: "/time-picker", component: TimePicker },
    { path: "/toast-overlap", component: ToastOverlap },
    { path: "/toast-stacked", component: ToastStacked },
    { path: "/toggle-group", component: ToggleGroup },
    { path: "/tooltip", component: Tooltip },
    { path: "/tour", component: Tour },
    { path: "/tree-view", component: TreeView },
    { path: "/timer-countdown", component: TimerCountdown },
    { path: "/timer-stopwatch", component: TimerStopwatch },
    { path: "/qr-code", component: QrCode },
  ]
</script>

<Router>
  <div class="page">
    <aside class="nav">
      <header>Zagjs</header>
      {#each sortedRoutes as route}
        <Link getProps={({ isCurrent }) => ({ "data-active": dataAttr(isCurrent) })} to={route.path}>
          {route.label}
        </Link>
      {/each}
    </aside>

    {#each paths as { path, component }}
      <Route {path}>
        <svelte:component this={component} />
      </Route>
    {/each}
  </div>
</Router>
