import * as timer from "@zag-js/timer"
import { Component } from "./component"
import { normalizeProps, spreadProps, VanillaMachine } from "./lib"

export class Timer extends Component<timer.Props, timer.Api> {
  initMachine(props: timer.Props) {
    return new VanillaMachine(timer.machine, {
      ...props,
    })
  }

  initApi() {
    return timer.connect(this.machine.service, normalizeProps)
  }

  render() {
    spreadProps(this.rootEl, this.api.getRootProps())

    const area = this.rootEl.querySelector<HTMLElement>(".timer-area")
    if (area) spreadProps(area, this.api.getAreaProps())

    const days = this.rootEl.querySelector<HTMLElement>(".timer-days")
    if (days) {
      spreadProps(days, this.api.getItemProps({ type: "days" }))
      days.textContent = this.api.formattedTime.days
    }

    const hours = this.rootEl.querySelector<HTMLElement>(".timer-hours")
    if (hours) {
      spreadProps(hours, this.api.getItemProps({ type: "hours" }))
      hours.textContent = this.api.formattedTime.hours
    }

    const minutes = this.rootEl.querySelector<HTMLElement>(".timer-minutes")
    if (minutes) {
      spreadProps(minutes, this.api.getItemProps({ type: "minutes" }))
      minutes.textContent = this.api.formattedTime.minutes
    }

    const seconds = this.rootEl.querySelector<HTMLElement>(".timer-seconds")
    if (seconds) {
      spreadProps(seconds, this.api.getItemProps({ type: "seconds" }))
      seconds.textContent = this.api.formattedTime.seconds
    }

    const separators = this.rootEl.querySelectorAll<HTMLElement>(".timer-separator")
    separators.forEach((separator) => {
      spreadProps(separator, this.api.getSeparatorProps())
    })

    const control = this.rootEl.querySelector<HTMLElement>(".timer-controls")
    if (control) spreadProps(control, this.api.getControlProps())

    const startBtn = this.rootEl.querySelector<HTMLElement>(".timer-start")
    if (startBtn) {
      spreadProps(startBtn, this.api.getActionTriggerProps({ action: "start" }))
      startBtn.style.display = this.api.running || this.api.paused ? "none" : "inline-block"
    }

    const pauseBtn = this.rootEl.querySelector<HTMLElement>(".timer-pause")
    if (pauseBtn) {
      spreadProps(pauseBtn, this.api.getActionTriggerProps({ action: "pause" }))
      pauseBtn.style.display = this.api.running ? "inline-block" : "none"
    }

    const resumeBtn = this.rootEl.querySelector<HTMLElement>(".timer-resume")
    if (resumeBtn) {
      spreadProps(resumeBtn, this.api.getActionTriggerProps({ action: "resume" }))
      resumeBtn.style.display = this.api.paused ? "inline-block" : "none"
    }

    const resetBtn = this.rootEl.querySelector<HTMLElement>(".timer-reset")
    if (resetBtn) spreadProps(resetBtn, this.api.getActionTriggerProps({ action: "reset" }))
  }
}
