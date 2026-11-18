// Not a benchmark screen: one of every component the agent bridge describes beyond the benchmark's own, to check
// each description reads and drives its machine. Checked by checks/components.mjs.
// Open it with ?screen=react-zag-components&agent.
import * as angleSlider from "@zag-js/angle-slider"
import * as carousel from "@zag-js/carousel"
import * as cascadeSelect from "@zag-js/cascade-select"
import * as collapsible from "@zag-js/collapsible"
import * as colorPicker from "@zag-js/color-picker"
import * as combobox from "@zag-js/combobox"
import * as dateInput from "@zag-js/date-input"
import * as datePicker from "@zag-js/date-picker"
import * as drawer from "@zag-js/drawer"
import * as editable from "@zag-js/editable"
import * as fileUpload from "@zag-js/file-upload"
import * as floatingPanel from "@zag-js/floating-panel"
import * as gridlist from "@zag-js/gridlist"
import * as hoverCard from "@zag-js/hover-card"
import * as listbox from "@zag-js/listbox"
import * as navigationMenu from "@zag-js/navigation-menu"
import * as numberInput from "@zag-js/number-input"
import * as pagination from "@zag-js/pagination"
import * as passwordInput from "@zag-js/password-input"
import * as pinInput from "@zag-js/pin-input"
import * as popover from "@zag-js/popover"
import * as radioGroup from "@zag-js/radio-group"
import * as ratingGroup from "@zag-js/rating-group"
import { normalizeProps, useMachine } from "@zag-js/react"
import * as slider from "@zag-js/slider"
import * as splitter from "@zag-js/splitter"
import * as steps from "@zag-js/steps"
import * as tagsInput from "@zag-js/tags-input"
import * as timer from "@zag-js/timer"
import * as toast from "@zag-js/toast"
import * as toggle from "@zag-js/toggle"
import * as toggleGroup from "@zag-js/toggle-group"
import * as tooltip from "@zag-js/tooltip"
import * as treeView from "@zag-js/tree-view"
import * as React from "react"
import { createRoot } from "react-dom/client"

// What the page did, for the checks to read.
type Log = { pressed: string[] }
const log: Log = { pressed: [] }
;(window as unknown as { __log: Log }).__log = log
const pressed = (what: string) => () => log.pressed.push(what)

function RadioGroup() {
  const api = radioGroup.connect(useMachine(radioGroup.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <span {...api.getLabelProps()}>Plan</span>
      {["Free", "Pro", "Team"].map((plan) => (
        <label key={plan} {...api.getItemProps({ value: plan.toLowerCase() })}>
          <span {...api.getItemTextProps({ value: plan.toLowerCase() })}>{plan}</span>
          <input {...api.getItemHiddenInputProps({ value: plan.toLowerCase() })} />
          <span {...api.getItemControlProps({ value: plan.toLowerCase() })} />
        </label>
      ))}
    </div>
  )
}

function ToggleGroup() {
  const api = toggleGroup.connect(
    useMachine(toggleGroup.machine, { id: React.useId(), multiple: true }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()} aria-label="Text style">
      {["Bold", "Italic", "Underline"].map((style) => (
        <button key={style} {...api.getItemProps({ value: style.toLowerCase() })}>
          {style}
        </button>
      ))}
    </div>
  )
}

function Toggle() {
  const api = toggle.connect(useMachine(toggle.machine, { id: React.useId() }), normalizeProps)
  return <button {...api.getRootProps()}>Mute</button>
}

function Slider() {
  const api = slider.connect(
    useMachine(slider.machine, { id: React.useId(), defaultValue: [20], step: 5 }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Volume</label>
      <div {...api.getControlProps()}>
        <div {...api.getTrackProps()}>
          <div {...api.getRangeProps()} />
        </div>
        <div {...api.getThumbProps({ index: 0 })}>
          <input {...api.getHiddenInputProps({ index: 0 })} />
        </div>
      </div>
    </div>
  )
}

function AngleSlider() {
  const api = angleSlider.connect(useMachine(angleSlider.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Rotation</label>
      <div {...api.getControlProps()}>
        <div {...api.getThumbProps()} />
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

function NumberInput() {
  const api = numberInput.connect(
    useMachine(numberInput.machine, { id: React.useId(), min: 1, max: 10 }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Seats</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getDecrementTriggerProps()}>-</button>
        <button {...api.getIncrementTriggerProps()}>+</button>
      </div>
    </div>
  )
}

function PinInput({ label, otp }: { label: string; otp?: boolean }) {
  const api = pinInput.connect(useMachine(pinInput.machine, { id: React.useId(), count: 4, otp }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>{label}</label>
      <div {...api.getControlProps()}>
        {api.items.map((index) => (
          <input key={index} {...api.getInputProps({ index })} />
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

function PasswordInput() {
  const api = passwordInput.connect(useMachine(passwordInput.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>New password</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} defaultValue="old-secret" />
        <button {...api.getVisibilityTriggerProps()}>{api.visible ? "Hide" : "Show"}</button>
      </div>
    </div>
  )
}

function Editable() {
  const api = editable.connect(
    useMachine(editable.machine, { id: React.useId(), defaultValue: "Untitled" }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Board title</label>
      <div {...api.getAreaProps()}>
        <input {...api.getInputProps()} />
        <span {...api.getPreviewProps()} />
      </div>
    </div>
  )
}

function TagsInput() {
  const api = tagsInput.connect(
    useMachine(tagsInput.machine, { id: React.useId(), defaultValue: ["bug"] }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Labels</label>
      <div {...api.getControlProps()}>
        {api.value.map((value, index) => (
          <span key={`${value}-${index}`} {...api.getItemProps({ index, value })}>
            <div {...api.getItemPreviewProps({ index, value })}>
              <span {...api.getItemTextProps({ index, value })}>{value}</span>
              <button {...api.getItemDeleteTriggerProps({ index, value })}>x</button>
            </div>
            <input {...api.getItemInputProps({ index, value })} />
          </span>
        ))}
        <input {...api.getInputProps()} />
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

const fruits = ["Apple", "Banana", "Cherry"].map((label) => ({ label, value: label.toLowerCase() }))

function Combobox() {
  const collection = React.useMemo(() => combobox.collection({ items: fruits }), [])
  const api = combobox.connect(useMachine(combobox.machine, { id: React.useId(), collection }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Fruit</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>▾</button>
      </div>
      <div {...api.getPositionerProps()}>
        <ul {...api.getContentProps()}>
          {collection.items.map((item) => (
            <li key={item.value} {...api.getItemProps({ item })}>
              {item.label}
            </li>
          ))}
        </ul>
      </div>
    </div>
  )
}

const cities = ["Lisbon", "Oslo", "Riga"].map((label) => ({ label, value: label.toLowerCase() }))

function Listbox() {
  const collection = React.useMemo(() => listbox.collection({ items: cities }), [])
  const api = listbox.connect(useMachine(listbox.machine, { id: React.useId(), collection }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Office</label>
      <ul {...api.getContentProps()}>
        {collection.items.map((item) => (
          <li key={item.value} {...api.getItemProps({ item })}>
            <span {...api.getItemTextProps({ item })}>{item.label}</span>
          </li>
        ))}
      </ul>
    </div>
  )
}

const mailboxes = ["Inbox", "Archive", "Spam"].map((label) => ({ label, value: label.toLowerCase() }))

function Gridlist() {
  const collection = React.useMemo(() => gridlist.collection({ items: mailboxes }), [])
  const api = gridlist.connect(useMachine(gridlist.machine, { id: React.useId(), collection }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Mailboxes</label>
      <div {...api.getContentProps()}>
        {collection.items.map((item) => (
          <div key={item.value} {...api.getItemProps({ item })}>
            <div {...api.getCellProps()}>
              <span {...api.getItemTextProps({ item })}>{item.label}</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

interface Place {
  label: string
  value: string
  children?: Place[]
}

const places = cascadeSelect.collection<Place>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  nodeToChildren: (node) => node.children,
  rootNode: {
    label: "",
    value: "ROOT",
    children: [
      {
        label: "France",
        value: "fr",
        children: [
          { label: "Paris", value: "paris" },
          { label: "Lyon", value: "lyon" },
        ],
      },
      { label: "Japan", value: "jp", children: [{ label: "Kyoto", value: "kyoto" }] },
    ],
  },
})

function CascadeSelect() {
  const api = cascadeSelect.connect(
    useMachine(cascadeSelect.machine, { id: React.useId(), collection: places }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Location</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>
          <span {...api.getValueTextProps()}>{api.valueAsString || "Pick a city"}</span>
        </button>
      </div>
    </div>
  )
}

function DatePicker() {
  const api = datePicker.connect(useMachine(datePicker.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Due date</label>
      <div {...api.getControlProps()}>
        <input {...api.getInputProps()} />
        <button {...api.getTriggerProps()}>📅</button>
      </div>
    </div>
  )
}

function DateInput() {
  const api = dateInput.connect(useMachine(dateInput.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Start date</label>
      <div {...api.getControlProps()}>
        <div {...api.getSegmentGroupProps()}>
          {api.getSegments().map((segment, index) => (
            <span key={index} {...api.getSegmentProps({ segment })}>
              {segment.text}
            </span>
          ))}
        </div>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

function ColorPicker() {
  const api = colorPicker.connect(
    useMachine(colorPicker.machine, { id: React.useId(), defaultValue: colorPicker.parse("#3b82f6") }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Brand color</label>
      <div {...api.getControlProps()}>
        <button {...api.getTriggerProps()}>{api.valueAsString}</button>
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

function RatingGroup() {
  const api = ratingGroup.connect(useMachine(ratingGroup.machine, { id: React.useId(), count: 5 }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Rating</label>
      <div {...api.getControlProps()}>
        {api.items.map((index) => (
          <span key={index} {...api.getItemProps({ index })}>
            ★
          </span>
        ))}
      </div>
      <input {...api.getHiddenInputProps()} />
    </div>
  )
}

function FileUpload() {
  const api = fileUpload.connect(useMachine(fileUpload.machine, { id: React.useId(), maxFiles: 3 }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Attachments</label>
      <div {...api.getDropzoneProps()}>
        <input {...api.getHiddenInputProps()} />
        <button {...api.getTriggerProps()}>Choose files</button>
      </div>
      {/* Stands in for a person choosing files, which an agent can't. */}
      <button type="button" onClick={() => api.setFiles([new File(["a"], "notes.txt"), new File(["b"], "photo.png")])}>
        Add sample files
      </button>
    </div>
  )
}

interface FileNode {
  id: string
  name: string
  children?: FileNode[]
}

const files = treeView.collection<FileNode>({
  nodeToValue: (node) => node.id,
  nodeToString: (node) => node.name,
  rootNode: {
    id: "ROOT",
    name: "",
    children: [
      {
        id: "src",
        name: "src",
        children: [
          { id: "src/app.tsx", name: "app.tsx" },
          { id: "src/index.ts", name: "index.ts" },
        ],
      },
      { id: "readme.md", name: "README.md" },
    ],
  },
})

function TreeNode({ node, indexPath, api }: { node: FileNode; indexPath: number[]; api: treeView.Api }) {
  const nodeProps = { indexPath, node }
  const state = api.getNodeState(nodeProps)
  if (!state.isBranch) {
    return (
      <div {...api.getNodeProps(nodeProps)}>
        <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>
    )
  }
  return (
    <div {...api.getNodeGroupProps(nodeProps)}>
      <div {...api.getNodeProps(nodeProps)}>
        <span {...api.getNodeTextProps(nodeProps)}>{node.name}</span>
      </div>
      <div {...api.getNodeGroupContentProps(nodeProps)}>
        {node.children?.map((child, index) => (
          <TreeNode key={child.id} node={child} indexPath={[...indexPath, index]} api={api} />
        ))}
      </div>
    </div>
  )
}

function TreeView() {
  const api = treeView.connect(useMachine(treeView.machine, { id: React.useId(), collection: files }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <h3 {...api.getLabelProps()}>Project files</h3>
      <div {...api.getTreeProps()}>
        {files.rootNode.children?.map((node, index) => (
          <TreeNode key={node.id} node={node} indexPath={[index]} api={api} />
        ))}
      </div>
    </div>
  )
}

function Collapsible() {
  const api = collapsible.connect(useMachine(collapsible.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <button {...api.getTriggerProps()}>Advanced options</button>
      <div {...api.getContentProps()}>
        <label>
          Proxy URL <input />
        </label>
      </div>
    </div>
  )
}

function Popover() {
  const api = popover.connect(useMachine(popover.machine, { id: React.useId() }), normalizeProps)
  return (
    <div>
      <button {...api.getTriggerProps()}>Share</button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getTitleProps()}>Share link</div>
          <div {...api.getDescriptionProps()}>Anyone with the link can view.</div>
          <button type="button" onClick={pressed("copy link")}>
            Copy link
          </button>
        </div>
      </div>
    </div>
  )
}

function Drawer() {
  const api = drawer.connect(useMachine(drawer.machine, { id: React.useId() }), normalizeProps)
  return (
    <div>
      <button {...api.getTriggerProps()}>Open cart</button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <h2 {...api.getTitleProps()}>Cart</h2>
          <button type="button" onClick={pressed("checkout")}>
            Checkout
          </button>
        </div>
      </div>
    </div>
  )
}

function FloatingPanel() {
  const api = floatingPanel.connect(useMachine(floatingPanel.machine, { id: React.useId() }), normalizeProps)
  return (
    <div>
      <button {...api.getTriggerProps()}>Open notes</button>
      <div {...api.getPositionerProps()}>
        <div {...api.getContentProps()}>
          <div {...api.getDragTriggerProps()}>
            <div {...api.getHeaderProps()}>
              <p {...api.getTitleProps()}>Notes</p>
            </div>
          </div>
          <div {...api.getBodyProps()}>
            <button type="button" onClick={pressed("pin")}>
              Pin
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}

function HoverCard() {
  const api = hoverCard.connect(useMachine(hoverCard.machine, { id: React.useId() }), normalizeProps)
  return (
    <div>
      <a href="#profile" {...api.getTriggerProps()}>
        @ada
      </a>
      {api.open && (
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>Ada Lovelace, first programmer</div>
        </div>
      )}
    </div>
  )
}

function Tooltip() {
  const api = tooltip.connect(useMachine(tooltip.machine, { id: React.useId() }), normalizeProps)
  return (
    <div>
      <button {...api.getTriggerProps()} aria-label="Archive" onClick={pressed("archive")}>
        🗄
      </button>
      {api.open && (
        <div {...api.getPositionerProps()}>
          <div {...api.getContentProps()}>Move to the archive</div>
        </div>
      )}
    </div>
  )
}

function NavigationMenu() {
  const api = navigationMenu.connect(useMachine(navigationMenu.machine, { id: React.useId() }), normalizeProps)
  return (
    <nav {...api.getRootProps()} aria-label="Main">
      <ul {...api.getListProps()}>
        {["Products", "Company"].map((name) => (
          <li key={name} {...api.getItemProps({ value: name.toLowerCase() })}>
            <button {...api.getTriggerProps({ value: name.toLowerCase() })}>{name}</button>
            <div {...api.getContentProps({ value: name.toLowerCase() })}>{name} links</div>
          </li>
        ))}
      </ul>
    </nav>
  )
}

function Pagination() {
  const api = pagination.connect(
    useMachine(pagination.machine, { id: React.useId(), count: 50, pageSize: 10 }),
    normalizeProps,
  )
  return (
    <nav {...api.getRootProps()} aria-label="Results pages">
      <button {...api.getPreviousTriggerProps()}>Previous</button>
      {api.pages.map((page, index) =>
        page.type === "page" ? (
          <button key={index} {...api.getItemProps(page)}>
            {page.value}
          </button>
        ) : (
          <span key={index} {...api.getEllipsisProps({ index })}>
            …
          </span>
        ),
      )}
      <button {...api.getNextTriggerProps()}>Next</button>
    </nav>
  )
}

const stepItems = [
  { value: "account", title: "Account" },
  { value: "profile", title: "Profile" },
  { value: "review", title: "Review" },
]

function Steps() {
  const api = steps.connect(useMachine(steps.machine, { id: React.useId(), items: stepItems }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <div {...api.getListProps()} aria-label="Signup">
        {stepItems.map((step) => (
          <div key={step.value} {...api.getItemProps({ value: step.value })}>
            <button {...api.getTriggerProps({ value: step.value })}>{step.title}</button>
          </div>
        ))}
      </div>
    </div>
  )
}

function Carousel() {
  const api = carousel.connect(useMachine(carousel.machine, { id: React.useId(), count: 3 }), normalizeProps)
  return (
    <div style={{ width: 200 }}>
      <div {...api.getRootProps()} aria-label="Gallery">
        <div {...api.getItemGroupProps()}>
          {[1, 2, 3].map((slide, index) => (
            <div key={slide} {...api.getItemProps({ index })}>
              Slide {slide}
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

function Splitter() {
  const api = splitter.connect(
    useMachine(splitter.machine, { id: React.useId(), panels: [{ id: "sidebar" }, { id: "editor" }] }),
    normalizeProps,
  )
  return (
    <div {...api.getRootProps()} aria-label="Layout" style={{ display: "flex", height: 40 }}>
      <div {...api.getPanelProps({ id: "sidebar" })}>Sidebar</div>
      <div {...api.getResizeTriggerProps({ id: "sidebar:editor" })} style={{ width: 4 }} />
      <div {...api.getPanelProps({ id: "editor" })}>Editor</div>
    </div>
  )
}

function Timer() {
  const api = timer.connect(useMachine(timer.machine, { id: React.useId() }), normalizeProps)
  return (
    <div {...api.getRootProps()} aria-label="Stopwatch">
      <div {...api.getAreaProps()}>
        {api.formattedTime.minutes}:{api.formattedTime.seconds}
      </div>
    </div>
  )
}

const toaster = toast.createStore({ placement: "bottom-end" })

function ToastItem({ actor, index, parent }: { actor: toast.Options; index: number; parent: toast.GroupService }) {
  const api = toast.connect(useMachine(toast.machine, { ...actor, index, parent }), normalizeProps)
  return (
    <div {...api.getRootProps()}>
      <div {...api.getContentProps()}>
        <div {...api.getTitleProps()}>{api.title as React.ReactNode}</div>
      </div>
      {actor.action && <button {...api.getActionTriggerProps()}>{actor.action.label}</button>}
    </div>
  )
}

function Toasts() {
  const service = useMachine(toast.group.machine, { id: React.useId(), store: toaster })
  const api = toast.group.connect(service, normalizeProps)
  return (
    <div>
      <button
        type="button"
        onClick={() =>
          toaster.create({
            title: "Message deleted",
            duration: 60_000,
            action: { label: "Undo", onClick: pressed("undo") },
          })
        }
      >
        Delete message
      </button>
      <div {...api.getGroupProps()}>
        {api.getToasts().map((actor, index) => (
          <ToastItem key={actor.id} actor={actor} index={index} parent={service} />
        ))}
      </div>
    </div>
  )
}

function Screen() {
  return (
    <main className="screen">
      <h1>Components</h1>
      <RadioGroup />
      <ToggleGroup />
      <Toggle />
      <Slider />
      <AngleSlider />
      <NumberInput />
      <PinInput label="Room code" />
      <PinInput label="Verification code" otp />
      <PasswordInput />
      <Editable />
      <TagsInput />
      <Combobox />
      <Listbox />
      <Gridlist />
      <CascadeSelect />
      <DatePicker />
      <DateInput />
      <ColorPicker />
      <RatingGroup />
      <FileUpload />
      <TreeView />
      <Collapsible />
      <Popover />
      <Drawer />
      <FloatingPanel />
      <HoverCard />
      <Tooltip />
      <NavigationMenu />
      <Pagination />
      <Steps />
      <Carousel />
      <Splitter />
      <Timer />
      <Toasts />
    </main>
  )
}

function mount(root: HTMLElement) {
  createRoot(root).render(<Screen />)
}

export { mount }
