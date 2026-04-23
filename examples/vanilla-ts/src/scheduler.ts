import * as scheduler from "@zag-js/scheduler"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"
import { Component } from "./component"

export class Scheduler extends Component<scheduler.Props, scheduler.Api> {
  initMachine(props: scheduler.Props) {
    return new VanillaMachine(scheduler.machine, props)
  }

  initApi() {
    return scheduler.connect(this.machine.service, normalizeProps)
  }

  private el<T extends HTMLElement = HTMLElement>(sel: string) {
    return this.rootEl.querySelector<T>(sel)
  }

  private syncHeader() {
    const header = this.el(".scheduler-header")
    if (header) this.spreadProps(header, this.api.getHeaderProps())

    const prev = this.el(".scheduler-prev")
    if (prev) {
      this.spreadProps(prev, this.api.getPrevTriggerProps())
      prev.textContent = this.api.prevTriggerIcon
    }
    const today = this.el(".scheduler-today")
    if (today) {
      this.spreadProps(today, this.api.getTodayTriggerProps())
      today.textContent = this.api.todayTriggerLabel
    }
    const next = this.el(".scheduler-next")
    if (next) {
      this.spreadProps(next, this.api.getNextTriggerProps())
      next.textContent = this.api.nextTriggerIcon
    }
    const title = this.el(".scheduler-title")
    if (title) {
      this.spreadProps(title, this.api.getHeaderTitleProps())
      title.textContent = this.api.visibleRangeText.formatted
    }
  }

  private syncColHeaders() {
    const container = this.el(".scheduler-col-headers")
    if (!container) return
    const days = this.api.visibleDays
    const existing = Array.from(container.querySelectorAll(".scheduler-header-cell:not(.scheduler-gutter-header)"))
    while (existing.length > days.length) {
      const c = existing.pop()
      if (c) container.removeChild(c)
    }
    days.forEach((d, i) => {
      let cell = existing[i] as HTMLElement
      if (!cell) {
        cell = this.doc.createElement("div")
        cell.className = "scheduler-header-cell"
        const lbl = this.doc.createElement("span")
        lbl.className = "scheduler-header-day-label"
        const num = this.doc.createElement("span")
        num.className = "scheduler-header-day-num"
        cell.appendChild(lbl)
        cell.appendChild(num)
        container.appendChild(cell)
      }
      const lbl = cell.querySelector<HTMLElement>(".scheduler-header-day-label")
      const num = cell.querySelector<HTMLElement>(".scheduler-header-day-num")
      if (lbl) lbl.textContent = this.api.weekDays[i % 7].short
      if (num) num.textContent = String(d.day)
    })
  }

  private syncTimeGutter() {
    const gutter = this.el(".scheduler-time-gutter")
    if (!gutter) return
    this.spreadProps(gutter, this.api.getTimeGutterProps())
    const hours = this.api.hourRange.hours
    const existing = Array.from(gutter.querySelectorAll<HTMLElement>(".scheduler-hour-label"))
    while (existing.length > hours.length) {
      const h = existing.pop()
      if (h) gutter.removeChild(h)
    }
    hours.forEach((h, i) => {
      let node = existing[i]
      if (!node) {
        node = this.doc.createElement("div")
        node.className = "scheduler-hour-label"
        gutter.appendChild(node)
      }
      Object.assign(node.style, h.style as any)
      node.textContent = h.label
    })
  }

  private renderEvent(event: scheduler.SchedulerEvent, columnEl: HTMLElement, existing: HTMLElement | null) {
    const el = existing ?? this.doc.createElement("div")
    this.spreadProps(el, this.api.getEventProps({ event }))
    if (!existing) {
      const title = this.doc.createElement("div")
      title.className = "scheduler-event-title"
      const handle = this.doc.createElement("div")
      handle.className = "scheduler-resize-handle"
      const grip = this.doc.createElement("div")
      grip.className = "scheduler-resize-grip"
      handle.appendChild(grip)
      el.appendChild(title)
      el.appendChild(handle)
      columnEl.appendChild(el)
    }
    const title = el.querySelector<HTMLElement>(".scheduler-event-title")
    if (title) title.textContent = event.title ?? ""
    const handle = el.querySelector<HTMLElement>(".scheduler-resize-handle")
    if (handle) this.spreadProps(handle, this.api.getEventResizeHandleProps({ event, edge: "end" }))
    return el
  }

  private syncDayColumns() {
    const container = this.el(".scheduler-time-grid")
    if (!container) return
    const days = this.api.visibleDays
    const existing = Array.from(container.querySelectorAll<HTMLElement>("[data-scheduler-day-column]"))
    while (existing.length > days.length) {
      const c = existing.pop()
      if (c) container.removeChild(c)
    }
    days.forEach((d, i) => {
      let col = existing[i]
      if (!col) {
        col = this.doc.createElement("div")
        container.appendChild(col)
      }
      this.spreadProps(col, this.api.getDayColumnProps({ date: d }))

      // hour lines (reuse)
      const hours = this.api.hourRange.hours
      const lineNodes = Array.from(col.querySelectorAll<HTMLElement>(".scheduler-hour-line"))
      while (lineNodes.length > hours.length) {
        const n = lineNodes.pop()
        if (n) col.removeChild(n)
      }
      hours.forEach((h, hi) => {
        let node = lineNodes[hi]
        if (!node) {
          node = this.doc.createElement("div")
          node.className = "scheduler-hour-line"
          col.insertBefore(node, col.firstChild)
        }
        Object.assign(node.style, h.style as any)
      })

      // events
      const eventsForDay = this.api.getEventsForDay(d)
      const existingEvents = new Map<string, HTMLElement>()
      col.querySelectorAll<HTMLElement>("[data-scheduler-event]").forEach((e) => {
        const id = e.getAttribute("data-event-id")
        if (id) existingEvents.set(id, e)
      })
      const seen = new Set<string>()
      eventsForDay.forEach((event) => {
        seen.add(event.id)
        this.renderEvent(event, col, existingEvents.get(event.id) ?? null)
      })
      existingEvents.forEach((el, id) => {
        if (!seen.has(id)) col.removeChild(el)
      })

      // selected slot
      const slot = this.api.getSelectedSlot({ date: d })
      let slotEl = col.querySelector<HTMLElement>("[data-scheduler-slot-highlight]")
      if (slot) {
        if (!slotEl) {
          slotEl = this.doc.createElement("div")
          col.appendChild(slotEl)
        }
        this.spreadProps(slotEl, slot.props)
      } else if (slotEl) {
        col.removeChild(slotEl)
      }

      // drag origin
      const origin = this.api.getDragOrigin({ date: d })
      let originEl = col.querySelector<HTMLElement>("[data-scheduler-drag-origin]")
      if (origin) {
        if (!originEl) {
          originEl = this.doc.createElement("div")
          col.appendChild(originEl)
        }
        this.spreadProps(originEl, origin.props)
      } else if (originEl) {
        col.removeChild(originEl)
      }

      // drag ghost
      const ghost = this.api.getDragGhost({ date: d })
      let ghostEl = col.querySelector<HTMLElement>("[data-scheduler-drag-ghost]")
      if (ghost) {
        if (!ghostEl) {
          ghostEl = this.doc.createElement("div")
          const gt = this.doc.createElement("div")
          gt.className = "scheduler-event-title"
          ghostEl.appendChild(gt)
          col.appendChild(ghostEl)
        }
        this.spreadProps(ghostEl, ghost.props)
        const gt = ghostEl.querySelector<HTMLElement>(".scheduler-event-title")
        if (gt) gt.textContent = ghost.event.title ?? ""
      } else if (ghostEl) {
        col.removeChild(ghostEl)
      }
    })
  }

  render() {
    const root = this.el("[data-part='root']") ?? this.rootEl
    this.spreadProps(root, this.api.getRootProps())
    const grid = this.el(".scheduler-time-grid")
    if (grid) this.spreadProps(grid, this.api.getGridProps())
    this.syncHeader()
    this.syncColHeaders()
    this.syncTimeGutter()
    this.syncDayColumns()
  }
}
