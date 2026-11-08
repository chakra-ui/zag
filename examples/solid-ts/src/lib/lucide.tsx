import type { JSX } from "@solidjs/web"
import type { IconNode } from "lucide"
import * as lucide from "lucide"
import { omit } from "solid-js"

export interface LucideProps extends JSX.SvgSVGAttributes<SVGSVGElement> {
  size?: number | string
  strokeWidth?: number | string
}

const toMarkup = (node: IconNode) =>
  node
    .map(([tag, attrs]) => {
      const props = Object.entries(attrs)
        .map(([key, value]) => `${key}="${value}"`)
        .join(" ")
      return `<${tag} ${props}></${tag}>`
    })
    .join("")

const toKebab = (name: string) => name.replace(/([a-z0-9])([A-Z])/g, "$1-$2").toLowerCase()

function createIcon(name: string, node: IconNode) {
  const markup = toMarkup(node)
  return (props: LucideProps) => {
    const rest = omit(props, "size", "strokeWidth", "color", "class")
    return (
      <svg
        xmlns="http://www.w3.org/2000/svg"
        width={props.size ?? 24}
        height={props.size ?? 24}
        viewBox="0 0 24 24"
        fill="none"
        stroke={props.color ?? "currentColor"}
        stroke-width={props.strokeWidth ?? 2}
        stroke-linecap="round"
        stroke-linejoin="round"
        class={["lucide", `lucide-${toKebab(name)}`, props.class].filter(Boolean).join(" ")}
        aria-hidden="true"
        {...rest}
        innerHTML={markup}
      />
    )
  }
}

export const AlignCenterIcon = createIcon("AlignCenter", lucide.AlignCenter)
export const AlignJustifyIcon = createIcon("AlignJustify", lucide.AlignJustify)
export const AlignLeftIcon = createIcon("AlignLeft", lucide.AlignLeft)
export const AlignRightIcon = createIcon("AlignRight", lucide.AlignRight)
export const ArrowDownIcon = createIcon("ArrowDown", lucide.ArrowDown)
export const ArrowDownLeft = createIcon("ArrowDownLeft", lucide.ArrowDownLeft)
export const ArrowRight = createIcon("ArrowRight", lucide.ArrowRight)
export const ArrowRightIcon = createIcon("ArrowRight", lucide.ArrowRight)
export const ArrowUpDownIcon = createIcon("ArrowUpDown", lucide.ArrowUpDown)
export const ArrowUpIcon = createIcon("ArrowUp", lucide.ArrowUp)
export const BoldIcon = createIcon("Bold", lucide.Bold)
export const CalendarIcon = createIcon("Calendar", lucide.Calendar)
export const Car = createIcon("Car", lucide.Car)
export const Check = createIcon("Check", lucide.Check)
export const CheckIcon = createIcon("Check", lucide.Check)
export const CheckSquareIcon = createIcon("CheckSquare", lucide.CheckSquare)
export const ChevronDown = createIcon("ChevronDown", lucide.ChevronDown)
export const ChevronDownIcon = createIcon("ChevronDown", lucide.ChevronDown)
export const ChevronLeft = createIcon("ChevronLeft", lucide.ChevronLeft)
export const ChevronLeftIcon = createIcon("ChevronLeft", lucide.ChevronLeft)
export const ChevronRight = createIcon("ChevronRight", lucide.ChevronRight)
export const ChevronRightIcon = createIcon("ChevronRight", lucide.ChevronRight)
export const ChevronsLeftIcon = createIcon("ChevronsLeft", lucide.ChevronsLeft)
export const ChevronsRightIcon = createIcon("ChevronsRight", lucide.ChevronsRight)
export const ChevronsUpDownIcon = createIcon("ChevronsUpDown", lucide.ChevronsUpDown)
export const CircleCheck = createIcon("CircleCheck", lucide.CircleCheck)
export const CircleX = createIcon("CircleX", lucide.CircleX)
export const ClipboardCheck = createIcon("ClipboardCheck", lucide.ClipboardCheck)
export const ClipboardCopyIcon = createIcon("ClipboardCopy", lucide.ClipboardCopy)
export const Coffee = createIcon("Coffee", lucide.Coffee)
export const CookingPot = createIcon("CookingPot", lucide.CookingPot)
export const CornerDownLeftIcon = createIcon("CornerDownLeft", lucide.CornerDownLeft)
export const Dumbbell = createIcon("Dumbbell", lucide.Dumbbell)
export const EraserIcon = createIcon("Eraser", lucide.Eraser)
export const ExternalLinkIcon = createIcon("ExternalLink", lucide.ExternalLink)
export const EyeIcon = createIcon("Eye", lucide.Eye)
export const EyeOffIcon = createIcon("EyeOff", lucide.EyeOff)
export const FileIcon = createIcon("File", lucide.File)
export const Folder = createIcon("Folder", lucide.Folder)
export const FolderIcon = createIcon("Folder", lucide.Folder)
export const GitBranchIcon = createIcon("GitBranch", lucide.GitBranch)
export const GripVertical = createIcon("GripVertical", lucide.GripVertical)
export const HandIcon = createIcon("Hand", lucide.Hand)
export const HeartIcon = createIcon("Heart", lucide.Heart)
export const Info = createIcon("Info", lucide.Info)
export const ItalicIcon = createIcon("Italic", lucide.Italic)
export const LayoutGridIcon = createIcon("LayoutGrid", lucide.LayoutGrid)
export const ListIcon = createIcon("List", lucide.List)
export const ListTreeIcon = createIcon("ListTree", lucide.ListTree)
export const LoaderCircle = createIcon("LoaderCircle", lucide.LoaderCircle)
export const LoaderCircleIcon = createIcon("LoaderCircle", lucide.LoaderCircle)
export const Maximize2 = createIcon("Maximize2", lucide.Maximize2)
export const Minus = createIcon("Minus", lucide.Minus)
export const MinusIcon = createIcon("Minus", lucide.Minus)
export const MinusSquareIcon = createIcon("MinusSquare", lucide.MinusSquare)
export const MoreVerticalIcon = createIcon("MoreVertical", lucide.MoreVertical)
export const MousePointer2Icon = createIcon("MousePointer2", lucide.MousePointer2)
export const MoveHorizontalIcon = createIcon("MoveHorizontal", lucide.MoveHorizontal)
export const PauseIcon = createIcon("Pause", lucide.Pause)
export const PawPrint = createIcon("PawPrint", lucide.PawPrint)
export const PencilIcon = createIcon("Pencil", lucide.Pencil)
export const PlayIcon = createIcon("Play", lucide.Play)
export const PlusIcon = createIcon("Plus", lucide.Plus)
export const RotateCcw = createIcon("RotateCcw", lucide.RotateCcw)
export const RotateCwIcon = createIcon("RotateCw", lucide.RotateCw)
export const SearchIcon = createIcon("Search", lucide.Search)
export const Snowflake = createIcon("Snowflake", lucide.Snowflake)
export const SquareIcon = createIcon("Square", lucide.Square)
export const TagIcon = createIcon("Tag", lucide.Tag)
export const TriangleAlert = createIcon("TriangleAlert", lucide.TriangleAlert)
export const UnderlineIcon = createIcon("Underline", lucide.Underline)
export const Waves = createIcon("Waves", lucide.Waves)
export const Wifi = createIcon("Wifi", lucide.Wifi)
export const X = createIcon("X", lucide.X)
export const XIcon = createIcon("X", lucide.X)
export const FocusIcon = createIcon("Focus", lucide.Focus)
export const Maximize2Icon = createIcon("Maximize2", lucide.Maximize2)
export const Minimize2Icon = createIcon("Minimize2", lucide.Minimize2)
export const PanelBottomIcon = createIcon("PanelBottom", lucide.PanelBottom)
export const PanelRightIcon = createIcon("PanelRight", lucide.PanelRight)
export const SquareDashedIcon = createIcon("SquareDashed", lucide.SquareDashed)
