import * as datePicker from "@zag-js/date-picker"
import { Component } from "./component"
import { normalizeProps, VanillaMachine } from "@zag-js/vanilla"

export class DatePicker extends Component<datePicker.Props, datePicker.Api> {
  initMachine(props: datePicker.Props) {
    return new VanillaMachine(datePicker.machine, {
      ...props,
    })
  }

  initApi() {
    return datePicker.connect(this.machine.service, normalizeProps)
  }

  private syncMonthSelect = () => {
    const monthSelect = this.rootEl.querySelector<HTMLSelectElement>(".date-picker-month-select")
    if (!monthSelect) return

    this.spreadProps(monthSelect, this.api.getMonthSelectProps())

    const months = this.api.getMonths()
    const existingOptions = Array.from(monthSelect.querySelectorAll("option"))

    while (existingOptions.length > months.length) {
      const option = existingOptions.pop()
      if (option) monthSelect.removeChild(option)
    }

    months.forEach((month, index) => {
      let optionEl = existingOptions[index]

      if (!optionEl) {
        optionEl = this.doc.createElement("option")
        monthSelect.appendChild(optionEl)
      }

      optionEl.value = String(month.value)
      optionEl.textContent = month.label
      optionEl.disabled = month.disabled ?? false
    })
  }

  private syncYearSelect = () => {
    const yearSelect = this.rootEl.querySelector<HTMLSelectElement>(".date-picker-year-select")
    if (!yearSelect) return

    this.spreadProps(yearSelect, this.api.getYearSelectProps())

    const years = this.api.getYears()
    const existingOptions = Array.from(yearSelect.querySelectorAll("option"))

    while (existingOptions.length > years.length) {
      const option = existingOptions.pop()
      if (option) yearSelect.removeChild(option)
    }

    years.forEach((year, index) => {
      let optionEl = existingOptions[index]

      if (!optionEl) {
        optionEl = this.doc.createElement("option")
        yearSelect.appendChild(optionEl)
      }

      optionEl.value = String(year.value)
      optionEl.textContent = year.label
      optionEl.disabled = year.disabled ?? false
    })
  }

  private syncWeekDays = () => {
    const headerRow = this.rootEl.querySelector<HTMLElement>(".date-picker-header-row")
    if (!headerRow) return

    const existingCells = Array.from(headerRow.querySelectorAll("th"))

    while (existingCells.length > this.api.weekDays.length) {
      const cell = existingCells.pop()
      if (cell) headerRow.removeChild(cell)
    }

    this.api.weekDays.forEach((day, index) => {
      let cellEl = existingCells[index]

      if (!cellEl) {
        cellEl = this.doc.createElement("th")
        cellEl.scope = "col"
        headerRow.appendChild(cellEl)
      }

      cellEl.setAttribute("aria-label", day.long)
      cellEl.textContent = day.narrow
    })
  }

  private syncDayGrid = () => {
    const tbody = this.rootEl.querySelector<HTMLElement>(".date-picker-day-tbody")
    if (!tbody) return

    this.spreadProps(tbody, this.api.getTableBodyProps({ view: "day" }))

    const existingRows = Array.from(tbody.querySelectorAll("tr"))

    while (existingRows.length > this.api.weeks.length) {
      const row = existingRows.pop()
      if (row) tbody.removeChild(row)
    }

    this.api.weeks.forEach((week, rowIndex) => {
      let rowEl = existingRows[rowIndex]

      if (!rowEl) {
        rowEl = this.doc.createElement("tr")
        tbody.appendChild(rowEl)
      }

      this.spreadProps(rowEl, this.api.getTableRowProps({ view: "day" }))

      const existingCells = Array.from(rowEl.querySelectorAll("td"))

      while (existingCells.length > week.length) {
        const cell = existingCells.pop()
        if (cell) rowEl.removeChild(cell)
      }

      week.forEach((value, cellIndex) => {
        let cellEl = existingCells[cellIndex]

        if (!cellEl) {
          cellEl = this.doc.createElement("td")
          const triggerEl = this.doc.createElement("div")
          cellEl.appendChild(triggerEl)
          rowEl.appendChild(cellEl)
        }

        this.spreadProps(cellEl, this.api.getDayTableCellProps({ value }))

        const triggerEl = cellEl.querySelector<HTMLElement>("div")
        if (triggerEl) {
          this.spreadProps(triggerEl, this.api.getDayTableCellTriggerProps({ value }))
          triggerEl.textContent = String(value.day)
        }
      })
    })
  }

  private syncMonthGrid = () => {
    const tbody = this.rootEl.querySelector<HTMLElement>(".date-picker-month-tbody")
    if (!tbody) return

    this.spreadProps(tbody, this.api.getTableBodyProps({ view: "month" }))

    const monthsGrid = this.api.getMonthsGrid({ columns: 4, format: "short" })
    const existingRows = Array.from(tbody.querySelectorAll("tr"))

    while (existingRows.length > monthsGrid.length) {
      const row = existingRows.pop()
      if (row) tbody.removeChild(row)
    }

    monthsGrid.forEach((months, rowIndex) => {
      let rowEl = existingRows[rowIndex]

      if (!rowEl) {
        rowEl = this.doc.createElement("tr")
        tbody.appendChild(rowEl)
      }

      this.spreadProps(rowEl, this.api.getTableRowProps())

      const existingCells = Array.from(rowEl.querySelectorAll("td"))

      while (existingCells.length > months.length) {
        const cell = existingCells.pop()
        if (cell) rowEl.removeChild(cell)
      }

      months.forEach((month, cellIndex) => {
        let cellEl = existingCells[cellIndex]

        if (!cellEl) {
          cellEl = this.doc.createElement("td")
          const triggerEl = this.doc.createElement("div")
          cellEl.appendChild(triggerEl)
          rowEl.appendChild(cellEl)
        }

        this.spreadProps(cellEl, this.api.getMonthTableCellProps({ ...month, columns: 4 }))

        const triggerEl = cellEl.querySelector<HTMLElement>("div")
        if (triggerEl) {
          this.spreadProps(triggerEl, this.api.getMonthTableCellTriggerProps({ ...month, columns: 4 }))
          triggerEl.textContent = month.label
        }
      })
    })
  }

  private syncYearGrid = () => {
    const tbody = this.rootEl.querySelector<HTMLElement>(".date-picker-year-tbody")
    if (!tbody) return

    this.spreadProps(tbody, this.api.getTableBodyProps())

    const yearsGrid = this.api.getYearsGrid({ columns: 4 })
    const existingRows = Array.from(tbody.querySelectorAll("tr"))

    while (existingRows.length > yearsGrid.length) {
      const row = existingRows.pop()
      if (row) tbody.removeChild(row)
    }

    yearsGrid.forEach((years, rowIndex) => {
      let rowEl = existingRows[rowIndex]

      if (!rowEl) {
        rowEl = this.doc.createElement("tr")
        tbody.appendChild(rowEl)
      }

      this.spreadProps(rowEl, this.api.getTableRowProps({ view: "year" }))

      const existingCells = Array.from(rowEl.querySelectorAll("td"))

      while (existingCells.length > years.length) {
        const cell = existingCells.pop()
        if (cell) rowEl.removeChild(cell)
      }

      years.forEach((year, cellIndex) => {
        let cellEl = existingCells[cellIndex]

        if (!cellEl) {
          cellEl = this.doc.createElement("td")
          const triggerEl = this.doc.createElement("div")
          cellEl.appendChild(triggerEl)
          rowEl.appendChild(cellEl)
        }

        this.spreadProps(cellEl, this.api.getYearTableCellProps({ ...year, columns: 4 }))

        const triggerEl = cellEl.querySelector<HTMLElement>("div")
        if (triggerEl) {
          this.spreadProps(triggerEl, this.api.getYearTableCellTriggerProps({ ...year, columns: 4 }))
          triggerEl.textContent = year.label
        }
      })
    })
  }

  render() {
    // Output display
    const visibleRange = this.rootEl.querySelector<HTMLElement>(".date-picker-visible-range")
    if (visibleRange) visibleRange.textContent = `Visible range: ${this.api.visibleRangeText.formatted}`

    const selectedOutput = this.rootEl.querySelector<HTMLElement>(".date-picker-selected")
    if (selectedOutput) selectedOutput.textContent = `Selected: ${this.api.valueAsString ?? "-"}`

    const focusedOutput = this.rootEl.querySelector<HTMLElement>(".date-picker-focused")
    if (focusedOutput) focusedOutput.textContent = `Focused: ${this.api.focusedValueAsString}`

    // Control
    const control = this.rootEl.querySelector<HTMLElement>(".date-picker-control")
    if (control) this.spreadProps(control, this.api.getControlProps())

    const input = this.rootEl.querySelector<HTMLInputElement>(".date-picker-input")
    if (input) this.spreadProps(input, this.api.getInputProps())

    const clearTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-clear")
    if (clearTrigger) this.spreadProps(clearTrigger, this.api.getClearTriggerProps())

    const trigger = this.rootEl.querySelector<HTMLElement>(".date-picker-trigger")
    if (trigger) this.spreadProps(trigger, this.api.getTriggerProps())

    // Positioner and content
    const positioner = this.rootEl.querySelector<HTMLElement>(".date-picker-positioner")
    if (positioner) this.spreadProps(positioner, this.api.getPositionerProps())

    const content = this.rootEl.querySelector<HTMLElement>(".date-picker-content")
    if (content) this.spreadProps(content, this.api.getContentProps())

    // Month/Year selects
    this.syncMonthSelect()
    this.syncYearSelect()

    // Day view
    const dayView = this.rootEl.querySelector<HTMLElement>(".date-picker-day-view")
    if (dayView) dayView.hidden = this.api.view !== "day"

    const dayViewControl = this.rootEl.querySelector<HTMLElement>(".date-picker-day-view-control")
    if (dayViewControl) this.spreadProps(dayViewControl, this.api.getViewControlProps({ view: "year" }))

    const dayPrevTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-day-prev")
    if (dayPrevTrigger) this.spreadProps(dayPrevTrigger, this.api.getPrevTriggerProps())

    const dayViewTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-day-view-trigger")
    if (dayViewTrigger) {
      this.spreadProps(dayViewTrigger, this.api.getViewTriggerProps())
      dayViewTrigger.textContent = this.api.visibleRangeText.start
    }

    const dayNextTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-day-next")
    if (dayNextTrigger) this.spreadProps(dayNextTrigger, this.api.getNextTriggerProps())

    const dayTable = this.rootEl.querySelector<HTMLElement>(".date-picker-day-table")
    if (dayTable) this.spreadProps(dayTable, this.api.getTableProps({ view: "day" }))

    const dayTableHeader = this.rootEl.querySelector<HTMLElement>(".date-picker-day-thead")
    if (dayTableHeader) this.spreadProps(dayTableHeader, this.api.getTableHeaderProps({ view: "day" }))

    const headerRow = this.rootEl.querySelector<HTMLElement>(".date-picker-header-row")
    if (headerRow) this.spreadProps(headerRow, this.api.getTableRowProps({ view: "day" }))

    this.syncWeekDays()
    this.syncDayGrid()

    // Month view
    const monthView = this.rootEl.querySelector<HTMLElement>(".date-picker-month-view")
    if (monthView) monthView.hidden = this.api.view !== "month"

    const monthViewControl = this.rootEl.querySelector<HTMLElement>(".date-picker-month-view-control")
    if (monthViewControl) this.spreadProps(monthViewControl, this.api.getViewControlProps({ view: "month" }))

    const monthPrevTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-month-prev")
    if (monthPrevTrigger) this.spreadProps(monthPrevTrigger, this.api.getPrevTriggerProps({ view: "month" }))

    const monthViewTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-month-view-trigger")
    if (monthViewTrigger) {
      this.spreadProps(monthViewTrigger, this.api.getViewTriggerProps({ view: "month" }))
      monthViewTrigger.textContent = String(this.api.visibleRange.start.year)
    }

    const monthNextTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-month-next")
    if (monthNextTrigger) this.spreadProps(monthNextTrigger, this.api.getNextTriggerProps({ view: "month" }))

    const monthTable = this.rootEl.querySelector<HTMLElement>(".date-picker-month-table")
    if (monthTable) this.spreadProps(monthTable, this.api.getTableProps({ view: "month", columns: 4 }))

    this.syncMonthGrid()

    // Year view
    const yearView = this.rootEl.querySelector<HTMLElement>(".date-picker-year-view")
    if (yearView) yearView.hidden = this.api.view !== "year"

    const yearViewControl = this.rootEl.querySelector<HTMLElement>(".date-picker-year-view-control")
    if (yearViewControl) this.spreadProps(yearViewControl, this.api.getViewControlProps({ view: "year" }))

    const yearPrevTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-year-prev")
    if (yearPrevTrigger) this.spreadProps(yearPrevTrigger, this.api.getPrevTriggerProps({ view: "year" }))

    const yearViewText = this.rootEl.querySelector<HTMLElement>(".date-picker-year-view-text")
    if (yearViewText) {
      const decade = this.api.getDecade()
      yearViewText.textContent = `${decade.start} - ${decade.end}`
    }

    const yearNextTrigger = this.rootEl.querySelector<HTMLElement>(".date-picker-year-next")
    if (yearNextTrigger) this.spreadProps(yearNextTrigger, this.api.getNextTriggerProps({ view: "year" }))

    const yearTable = this.rootEl.querySelector<HTMLElement>(".date-picker-year-table")
    if (yearTable) this.spreadProps(yearTable, this.api.getTableProps({ view: "year", columns: 4 }))

    this.syncYearGrid()
  }
}
