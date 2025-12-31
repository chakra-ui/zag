// Refactored from https://github.com/focus-trap/focus-trap/blob/master/index.js
// MIT License

import {
  addDomEvent,
  getActiveElement,
  getControlledElements,
  getDocument,
  getEventTarget,
  getFocusables,
  getTabbables,
  getTabIndex,
  hasControllerElements,
  isControlledByExpandedController,
  isControlledElement,
  isDocument,
  isFocusable,
  isTabbable,
} from "@zag-js/dom-query"
import type {
  ActivateOptions,
  DeactivateOptions,
  FindNextNodeOptions,
  FocusTrapOptions,
  FocusTrapState,
  PauseOptions,
  UnpauseOptions,
} from "./types"

const activeFocusTraps = {
  activateTrap(trapStack: FocusTrap[], trap: FocusTrap) {
    if (trapStack.length > 0) {
      const activeTrap = trapStack[trapStack.length - 1]
      if (activeTrap !== trap) {
        activeTrap.pause()
      }
    }

    const trapIndex = trapStack.indexOf(trap)
    if (trapIndex === -1) {
      trapStack.push(trap)
    } else {
      // move this existing trap to the front of the queue
      trapStack.splice(trapIndex, 1)
      trapStack.push(trap)
    }
  },

  deactivateTrap(trapStack: FocusTrap[], trap: FocusTrap) {
    const trapIndex = trapStack.indexOf(trap)
    if (trapIndex !== -1) {
      trapStack.splice(trapIndex, 1)
    }

    if (trapStack.length > 0) {
      trapStack[trapStack.length - 1].unpause()
    }
  },
}

const sharedTrapStack: FocusTrap[] = []

export class FocusTrap {
  private trapStack: FocusTrap[]
  private config: FocusTrapOptions
  private doc: Document

  private state: FocusTrapState = {
    containers: [],
    containerGroups: [],
    tabbableGroups: [],
    nodeFocusedBeforeActivation: null,
    mostRecentlyFocusedNode: null,
    active: false,
    paused: false,
    delayInitialFocusTimer: undefined,
    recentNavEvent: undefined,
  }

  // Track portal containers that contain controlled elements
  private portalContainers = new Set<HTMLElement>()

  private addPortalContainer(controlledElement: HTMLElement) {
    const portalContainer = controlledElement.parentElement

    if (portalContainer && !this.portalContainers.has(portalContainer)) {
      this.portalContainers.add(portalContainer)

      // Start observing this new portal container if trap is active
      if (this.state.active && !this.state.paused) {
        this.observePortalContainer(portalContainer)
      }
    }
  }

  private observePortalContainer(portalContainer: HTMLElement) {
    this._mutationObserver?.observe(portalContainer, {
      subtree: true,
      childList: true,
      attributes: true,
      attributeFilter: ["aria-controls", "aria-expanded"],
    })
  }

  private updatePortalContainers() {
    if (!this.config.followControlledElements) return

    // Find all controlled elements outside our containers and add their portal containers
    this.state.containers.forEach((container) => {
      const controlledElements = getControlledElements(container)
      controlledElements.forEach((controlledElement) => {
        this.addPortalContainer(controlledElement)
      })
    })
  }

  get active() {
    return this.state.active
  }

  get paused() {
    return this.state.paused
  }

  constructor(elements: HTMLElement | HTMLElement[], options: FocusTrapOptions) {
    this.trapStack = options.trapStack || sharedTrapStack

    const config: FocusTrapOptions = {
      returnFocusOnDeactivate: true,
      escapeDeactivates: true,
      delayInitialFocus: true,
      followControlledElements: true,
      isKeyForward,
      isKeyBackward,
      ...options,
    }

    this.doc = config.document || getDocument(Array.isArray(elements) ? elements[0] : elements)
    this.config = config

    this.updateContainerElements(elements)
    this.setupMutationObserver()
  }

  private findContainerIndex(element: HTMLElement, event?: Event): number {
    const composedPath = typeof event?.composedPath === "function" ? event.composedPath() : undefined
    return this.state.containerGroups.findIndex(
      ({ container, tabbableNodes }) =>
        container.contains(element) ||
        composedPath?.includes(container) ||
        tabbableNodes.find((node) => node === element) ||
        this.isControlledElement(container, element),
    )
  }

  private isControlledElement(container: HTMLElement, element: HTMLElement): boolean {
    if (!this.config.followControlledElements) return false
    return isControlledElement(container, element)
  }

  private updateTabbableNodes() {
    this.state.containerGroups = this.state.containers.map((container) => {
      const tabbableNodes = getTabbables(container, { getShadowRoot: this.config.getShadowRoot })
      const focusableNodes = getFocusables(container, { getShadowRoot: this.config.getShadowRoot })

      const firstTabbableNode = tabbableNodes[0]
      const lastTabbableNode = tabbableNodes[tabbableNodes.length - 1]

      // Use tabbableNodes directly instead of searching through focusableNodes
      const firstDomTabbableNode = firstTabbableNode
      const lastDomTabbableNode = lastTabbableNode

      // Optimize: single iteration with early exit
      let posTabIndexesFound = false
      for (let i = 0; i < tabbableNodes.length; i++) {
        if (getTabIndex(tabbableNodes[i]) > 0) {
          posTabIndexesFound = true
          break
        }
      }

      function nextTabbableNode(node: HTMLElement, forward = true) {
        const nodeIdx = tabbableNodes.indexOf(node)

        if (nodeIdx >= 0) {
          return tabbableNodes[nodeIdx + (forward ? 1 : -1)]
        }

        // Node not in tabbableNodes, find it in focusableNodes
        const focusableIdx = focusableNodes.indexOf(node)
        if (focusableIdx < 0) return undefined

        // Search for next/prev tabbable without allocations
        if (forward) {
          for (let i = focusableIdx + 1; i < focusableNodes.length; i++) {
            if (isTabbable(focusableNodes[i])) return focusableNodes[i]
          }
        } else {
          for (let i = focusableIdx - 1; i >= 0; i--) {
            if (isTabbable(focusableNodes[i])) return focusableNodes[i]
          }
        }

        return undefined
      }

      return {
        container,
        tabbableNodes,
        focusableNodes,
        posTabIndexesFound,
        firstTabbableNode,
        lastTabbableNode,
        firstDomTabbableNode,
        lastDomTabbableNode,
        nextTabbableNode,
      }
    })

    this.state.tabbableGroups = this.state.containerGroups.filter((group) => group.tabbableNodes.length > 0)

    // throw if no groups have tabbable nodes and we don't have a fallback focus node either
    if (
      this.state.tabbableGroups.length <= 0 &&
      !this.getNodeForOption("fallbackFocus") // returning false not supported for this option
    ) {
      throw new Error(
        "Your focus-trap must have at least one container with at least one tabbable node in it at all times",
      )
    }

    if (this.state.containerGroups.find((g) => g.posTabIndexesFound) && this.state.containerGroups.length > 1) {
      throw new Error(
        "At least one node with a positive tabindex was found in one of your focus-trap's multiple containers. Positive tabindexes are only supported in single-container focus-traps.",
      )
    }
  }

  private listenerCleanups: VoidFunction[] = []

  private addListeners() {
    if (!this.state.active) return

    // There can be only one listening focus trap at a time
    activeFocusTraps.activateTrap(this.trapStack, this)

    this.state.delayInitialFocusTimer = this.config.delayInitialFocus
      ? delay(() => {
          this.tryFocus(this.getInitialFocusNode())
        })
      : this.tryFocus(this.getInitialFocusNode())

    this.listenerCleanups.push(
      addDomEvent(this.doc, "focusin", this.handleFocus, true),
      addDomEvent(this.doc, "mousedown", this.handlePointerDown, { capture: true, passive: false }),
      addDomEvent(this.doc, "touchstart", this.handlePointerDown, { capture: true, passive: false }),
      addDomEvent(this.doc, "click", this.handleClick, { capture: true, passive: false }),
      addDomEvent(this.doc, "keydown", this.handleTabKey, { capture: true, passive: false }),
      addDomEvent(this.doc, "keydown", this.handleEscapeKey),
    )

    return this
  }

  private removeListeners() {
    if (!this.state.active) return
    this.listenerCleanups.forEach((cleanup) => cleanup())
    this.listenerCleanups = []
    return this
  }

  private handleFocus = (event: FocusEvent) => {
    const target = getEventTarget(event) as HTMLElement
    const targetContained = this.findContainerIndex(target, event) >= 0

    // In Firefox when you Tab out of an iframe the Document is briefly focused.
    if (targetContained || isDocument(target)) {
      if (targetContained) {
        this.state.mostRecentlyFocusedNode = target
      }
    } else {
      // escaped! pull it back in to where it just left
      event.stopImmediatePropagation()

      // focus will escape if the MRU node had a positive tab index and user tried to nav forward;
      //  it will also escape if the MRU node had a 0 tab index and user tried to nav backward
      //  toward a node with a positive tab index
      let nextNode // next node to focus, if we find one
      let navAcrossContainers = true

      if (this.state.mostRecentlyFocusedNode) {
        if (getTabIndex(this.state.mostRecentlyFocusedNode) > 0) {
          // MRU container index must be >=0 otherwise we wouldn't have it as an MRU node...
          const mruContainerIdx = this.findContainerIndex(this.state.mostRecentlyFocusedNode)
          // there MAY not be any tabbable nodes in the container if there are at least 2 containers
          //  and the MRU node is focusable but not tabbable (focus-trap requires at least 1 container
          //  with at least one tabbable node in order to function, so this could be the other container
          //  with nothing tabbable in it)
          const { tabbableNodes } = this.state.containerGroups[mruContainerIdx]

          if (tabbableNodes.length > 0) {
            // MRU tab index MAY not be found if the MRU node is focusable but not tabbable
            const mruTabIdx = tabbableNodes.findIndex((node) => node === this.state.mostRecentlyFocusedNode)

            if (mruTabIdx >= 0) {
              if (this.config.isKeyForward!(this.state.recentNavEvent!)) {
                if (mruTabIdx + 1 < tabbableNodes.length) {
                  nextNode = tabbableNodes[mruTabIdx + 1]
                  navAcrossContainers = false
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              } else {
                if (mruTabIdx - 1 >= 0) {
                  nextNode = tabbableNodes[mruTabIdx - 1]
                  navAcrossContainers = false
                }
                // else, don't wrap within the container as focus should move to next/previous
                //  container
              }
              // else, don't find in container order without considering direction too
            }
          }
          // else, no tabbable nodes in that container (which means we must have at least one other
          //  container with at least one tabbable node in it, otherwise focus-trap would've thrown
          //  an error the last time updateTabbableNodes() was run): find next node among all known
          //  containers
        } else {
          // check to see if there's at least one tabbable node with a positive tab index inside
          //  the trap because focus seems to escape when navigating backward from a tabbable node
          //  with tabindex=0 when this is the case (instead of wrapping to the tabbable node with
          //  the greatest positive tab index like it should)
          if (!this.state.containerGroups.some((g) => g.tabbableNodes.some((n) => getTabIndex(n) > 0))) {
            // no containers with tabbable nodes with positive tab indexes which means the focus
            //  escaped for some other reason and we should just execute the fallback to the
            //  MRU node or initial focus node, if any
            navAcrossContainers = false
          }
        }
      } else {
        // no MRU node means we're likely in some initial condition when the trap has just
        //  been activated and initial focus hasn't been given yet, in which case we should
        //  fall through to trying to focus the initial focus node, which is what should
        //  happen below at this point in the logic
        navAcrossContainers = false
      }

      if (navAcrossContainers) {
        nextNode = this.findNextNavNode({
          // move FROM the MRU node, not event-related node (which will be the node that is
          //  outside the trap causing the focus escape we're trying to fix)
          target: this.state.mostRecentlyFocusedNode,
          isBackward: this.config.isKeyBackward!(this.state.recentNavEvent!),
        })
      }

      if (nextNode) {
        this.tryFocus(nextNode)
      } else {
        this.tryFocus(this.state.mostRecentlyFocusedNode || this.getInitialFocusNode())
      }
    }

    this.state.recentNavEvent = undefined // clear
  }

  private handlePointerDown = (event: MouseEvent | TouchEvent) => {
    const target = getEventTarget(event) as HTMLElement

    if (this.findContainerIndex(target, event) >= 0) {
      return
    }

    if (valueOrHandler(this.config.clickOutsideDeactivates, event)) {
      this.deactivate({ returnFocus: this.config.returnFocusOnDeactivate })
      return
    }

    if (valueOrHandler(this.config.allowOutsideClick, event)) {
      return
    }

    event.preventDefault()
  }

  private handleClick = (event: MouseEvent) => {
    const target = getEventTarget(event) as HTMLElement

    if (this.findContainerIndex(target, event) >= 0) {
      return
    }

    if (valueOrHandler(this.config.clickOutsideDeactivates, event)) {
      return
    }

    if (valueOrHandler(this.config.allowOutsideClick, event)) {
      return
    }

    event.preventDefault()
    event.stopImmediatePropagation()
  }

  private handleTabKey = (event: KeyboardEvent) => {
    if (this.config.isKeyForward!(event) || this.config.isKeyBackward!(event)) {
      this.state.recentNavEvent = event
      const isBackward = this.config.isKeyBackward!(event)

      const destinationNode = this.findNextNavNode({ event, isBackward })
      if (!destinationNode) return

      if (isTabEvent(event)) {
        event.preventDefault()
      }

      this.tryFocus(destinationNode)
    }
  }

  private handleEscapeKey = (event: KeyboardEvent) => {
    if (isEscapeEvent(event) && valueOrHandler(this.config.escapeDeactivates, event) !== false) {
      event.preventDefault()
      this.deactivate()
    }
  }

  private _mutationObserver?: MutationObserver

  private setupMutationObserver = () => {
    const win = this.doc.defaultView || window
    this._mutationObserver = new win.MutationObserver((mutations) => {
      const isFocusedNodeRemoved = mutations.some((mutation) => {
        const removedNodes = Array.from(mutation.removedNodes)
        return removedNodes.some((node) => node === this.state.mostRecentlyFocusedNode)
      })

      if (isFocusedNodeRemoved) {
        this.tryFocus(this.getInitialFocusNode())
      }

      // Check if any controlled elements were added or if aria-controls/aria-expanded was modified
      const hasControlledChanges = mutations.some((mutation) => {
        // Check for aria-controls or aria-expanded attribute changes
        if (
          mutation.type === "attributes" &&
          (mutation.attributeName === "aria-controls" || mutation.attributeName === "aria-expanded")
        ) {
          return true
        }

        // Check if any added nodes have controllers or might be controlled elements
        if (mutation.type === "childList" && mutation.addedNodes.length > 0) {
          return Array.from(mutation.addedNodes).some((node) => {
            if (node.nodeType !== Node.ELEMENT_NODE) return false
            const element = node as Element

            // Check if this element or its descendants have controllers
            if (hasControllerElements(element)) {
              return true
            }

            // If this element has an ID and is not inside our containers,
            // it might be a controlled element (portalled content)
            if (element.id && !this.state.containers.some((c) => c.contains(element))) {
              return isControlledByExpandedController(element)
            }

            return false
          })
        }

        return false
      })

      if (hasControlledChanges && this.state.active && !this.state.paused) {
        // Update tabbable nodes when controlled elements change
        this.updateTabbableNodes()
        // Update portal containers when controlled elements change
        this.updatePortalContainers()
      }
    })
  }

  private updateObservedNodes = () => {
    this._mutationObserver?.disconnect()

    if (this.state.active && !this.state.paused) {
      // Observe containers for changes
      this.state.containers.map((container) => {
        this._mutationObserver?.observe(container, {
          subtree: true,
          childList: true,
          attributes: true,
          attributeFilter: ["aria-controls", "aria-expanded"],
        })
      })

      // Observe discovered portal containers
      this.portalContainers.forEach((portalContainer) => {
        this.observePortalContainer(portalContainer)
      })
    }
  }

  private getInitialFocusNode = () => {
    let node = this.getNodeForOption("initialFocus", { hasFallback: true })

    // false explicitly indicates we want no initialFocus at all
    if (node === false) {
      return false
    }

    if (node === undefined || (node && !isFocusable(node))) {
      // option not specified nor focusable: use fallback options
      const activeElement = getActiveElement(this.doc)
      if (activeElement && this.findContainerIndex(activeElement) >= 0) {
        node = activeElement
      } else {
        const firstTabbableGroup = this.state.tabbableGroups[0]
        const firstTabbableNode = firstTabbableGroup && firstTabbableGroup.firstTabbableNode

        // NOTE: `fallbackFocus` option function cannot return `false` (not supported)
        node = firstTabbableNode || this.getNodeForOption("fallbackFocus")
      }
    } else if (node === null) {
      // option is a VALID selector string that doesn't yield a node: use the `fallbackFocus`
      //  option instead of the default behavior when the option isn't specified at all
      node = this.getNodeForOption("fallbackFocus")
    }

    if (!node) {
      throw new Error("Your focus-trap needs to have at least one focusable element")
    }

    if (!node.isConnected) {
      node = this.getNodeForOption("fallbackFocus")
    }

    return node
  }

  private tryFocus = (node: HTMLElement | false | null) => {
    if (node === false) return
    if (node === getActiveElement(this.doc)) return
    if (!node || !node.focus) {
      this.tryFocus(this.getInitialFocusNode())
      return
    }

    node.focus({ preventScroll: !!this.config.preventScroll })
    // NOTE: focus() API does not trigger focusIn event so set MRU node manually
    this.state.mostRecentlyFocusedNode = node

    if (isSelectableInput(node)) {
      node.select()
    }
  }

  activate(activateOptions?: ActivateOptions) {
    if (this.state.active) {
      return this
    }

    const onActivate = this.getOption(activateOptions, "onActivate")
    const onPostActivate = this.getOption(activateOptions, "onPostActivate")
    const checkCanFocusTrap = this.getOption(activateOptions, "checkCanFocusTrap")

    if (!checkCanFocusTrap) {
      this.updateTabbableNodes()
    }

    this.state.active = true
    this.state.paused = false
    this.state.nodeFocusedBeforeActivation = getActiveElement(this.doc)

    onActivate?.()

    const finishActivation = () => {
      if (checkCanFocusTrap) {
        this.updateTabbableNodes()
      }
      this.addListeners()
      this.updateObservedNodes()
      onPostActivate?.()
    }

    if (checkCanFocusTrap) {
      checkCanFocusTrap(this.state.containers.concat()).then(finishActivation, finishActivation)
      return this
    }

    finishActivation()
    return this
  }

  deactivate = (deactivateOptions?: DeactivateOptions) => {
    if (!this.state.active) return this

    const options = {
      onDeactivate: this.config.onDeactivate,
      onPostDeactivate: this.config.onPostDeactivate,
      checkCanReturnFocus: this.config.checkCanReturnFocus,
      ...deactivateOptions,
    }

    clearTimeout(this.state.delayInitialFocusTimer)
    this.state.delayInitialFocusTimer = undefined

    this.removeListeners()
    this.state.active = false
    this.state.paused = false
    this.updateObservedNodes()

    activeFocusTraps.deactivateTrap(this.trapStack, this)

    // Clear portal containers on deactivation
    this.portalContainers.clear()

    const onDeactivate = this.getOption(options, "onDeactivate")
    const onPostDeactivate = this.getOption(options, "onPostDeactivate")
    const checkCanReturnFocus = this.getOption(options, "checkCanReturnFocus")
    const returnFocus = this.getOption(options, "returnFocus", "returnFocusOnDeactivate")

    onDeactivate?.()

    const finishDeactivation = () => {
      delay(() => {
        if (returnFocus) {
          const returnFocusNode = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)
          this.tryFocus(returnFocusNode)
        }
        onPostDeactivate?.()
      })
    }

    if (returnFocus && checkCanReturnFocus) {
      const returnFocusNode = this.getReturnFocusNode(this.state.nodeFocusedBeforeActivation)
      checkCanReturnFocus(returnFocusNode).then(finishDeactivation, finishDeactivation)
      return this
    }

    finishDeactivation()
    return this
  }

  pause = (pauseOptions?: PauseOptions) => {
    if (this.state.paused || !this.state.active) {
      return this
    }

    const onPause = this.getOption(pauseOptions, "onPause")
    const onPostPause = this.getOption(pauseOptions, "onPostPause")

    this.state.paused = true
    onPause?.()

    this.removeListeners()
    this.updateObservedNodes()

    onPostPause?.()
    return this
  }

  unpause = (unpauseOptions?: UnpauseOptions) => {
    if (!this.state.paused || !this.state.active) {
      return this
    }

    const onUnpause = this.getOption(unpauseOptions, "onUnpause")
    const onPostUnpause = this.getOption(unpauseOptions, "onPostUnpause")

    this.state.paused = false
    onUnpause?.()

    this.updateTabbableNodes()
    this.addListeners()
    this.updateObservedNodes()

    onPostUnpause?.()
    return this
  }

  updateContainerElements = (containerElements: HTMLElement | HTMLElement[]) => {
    this.state.containers = Array.isArray(containerElements)
      ? containerElements.filter(Boolean)
      : [containerElements].filter(Boolean)

    if (this.state.active) {
      this.updateTabbableNodes()
    }

    this.updateObservedNodes()

    return this
  }

  private getReturnFocusNode = (previousActiveElement: HTMLElement | null) => {
    const node = this.getNodeForOption("setReturnFocus", {
      params: [previousActiveElement],
    })
    return node ? node : node === false ? false : previousActiveElement
  }

  private getOption = (
    configOverrideOptions: any,
    optionName: keyof any,
    configOptionName?: keyof FocusTrapOptions,
  ) => {
    return configOverrideOptions && configOverrideOptions[optionName] !== undefined
      ? configOverrideOptions[optionName]
      : // @ts-expect-error
        this.config[configOptionName || optionName]
  }

  private getNodeForOption = (
    optionName: keyof FocusTrapOptions,
    { hasFallback = false, params = [] }: { hasFallback?: boolean | undefined; params?: any[] | undefined } = {},
  ) => {
    let optionValue: any = this.config[optionName]
    if (typeof optionValue === "function") optionValue = optionValue(...params)
    if (optionValue === true) optionValue = undefined
    if (!optionValue) {
      if (optionValue === undefined || optionValue === false) {
        return optionValue
      }
      throw new Error(`\`${optionName}\` was specified but was not a node, or did not return a node`)
    }

    let node = optionValue

    if (typeof optionValue === "string") {
      try {
        node = this.doc.querySelector(optionValue) // resolve to node, or null if fails
      } catch (err: any) {
        throw new Error(`\`${optionName}\` appears to be an invalid selector; error="${err.message}"`)
      }

      if (!node) {
        if (!hasFallback) {
          throw new Error(`\`${optionName}\` as selector refers to no known node`)
        }
      }
    }

    return node
  }

  private findNextNavNode = (opts: FindNextNodeOptions) => {
    const { event, isBackward = false } = opts
    // @ts-expect-error
    const target = opts.target || (getEventTarget(event) as HTMLElement)

    this.updateTabbableNodes()

    let destinationNode = null

    if (this.state.tabbableGroups.length > 0) {
      // make sure the target is actually contained in a group
      // NOTE: the target may also be the container itself if it's focusable
      //  with tabIndex='-1' and was given initial focus
      const containerIndex = this.findContainerIndex(target, event)
      const containerGroup = containerIndex >= 0 ? this.state.containerGroups[containerIndex] : undefined

      if (containerIndex < 0) {
        // target not found in any group: quite possible focus has escaped the trap,
        //  so bring it back into...
        if (isBackward) {
          // ...the last node in the last group
          destinationNode = this.state.tabbableGroups[this.state.tabbableGroups.length - 1].lastTabbableNode
        } else {
          // ...the first node in the first group
          destinationNode = this.state.tabbableGroups[0].firstTabbableNode
        }
      } else if (isBackward) {
        // REVERSE

        // is the target the first tabbable node in a group?
        let startOfGroupIndex = this.state.tabbableGroups.findIndex(
          ({ firstTabbableNode }) => target === firstTabbableNode,
        )

        if (
          startOfGroupIndex < 0 &&
          (containerGroup?.container === target ||
            (isFocusable(target) && !isTabbable(target) && !containerGroup?.nextTabbableNode(target, false)))
        ) {
          // an exception case where the target is either the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle shift+tab as if focus were on the container's
          //  first tabbable node, and go to the last tabbable node of the LAST group
          startOfGroupIndex = containerIndex
        }

        if (startOfGroupIndex >= 0) {
          // YES: then shift+tab should go to the last tabbable node in the
          //  previous group (and wrap around to the last tabbable node of
          //  the LAST group if it's the first tabbable node of the FIRST group)
          const destinationGroupIndex =
            startOfGroupIndex === 0 ? this.state.tabbableGroups.length - 1 : startOfGroupIndex - 1

          const destinationGroup = this.state.tabbableGroups[destinationGroupIndex]

          destinationNode =
            getTabIndex(target) >= 0 ? destinationGroup.lastTabbableNode : destinationGroup.lastDomTabbableNode
          //@ts-expect-error
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup?.nextTabbableNode(target, false)
        }
      } else {
        // FORWARD

        // is the target the last tabbable node in a group?
        let lastOfGroupIndex = this.state.tabbableGroups.findIndex(
          ({ lastTabbableNode }) => target === lastTabbableNode,
        )

        if (
          lastOfGroupIndex < 0 &&
          (containerGroup?.container === target ||
            (isFocusable(target) && !isTabbable(target) && !containerGroup?.nextTabbableNode(target)))
        ) {
          // an exception case where the target is the container itself, or
          //  a non-tabbable node that was given focus (i.e. tabindex is negative
          //  and user clicked on it or node was programmatically given focus)
          //  and is not followed by any other tabbable node, in which
          //  case, we should handle tab as if focus were on the container's
          //  last tabbable node, and go to the first tabbable node of the FIRST group
          lastOfGroupIndex = containerIndex
        }

        if (lastOfGroupIndex >= 0) {
          // YES: then tab should go to the first tabbable node in the next
          //  group (and wrap around to the first tabbable node of the FIRST
          //  group if it's the last tabbable node of the LAST group)
          const destinationGroupIndex =
            lastOfGroupIndex === this.state.tabbableGroups.length - 1 ? 0 : lastOfGroupIndex + 1

          const destinationGroup = this.state.tabbableGroups[destinationGroupIndex]

          destinationNode =
            getTabIndex(target) >= 0 ? destinationGroup.firstTabbableNode : destinationGroup.firstDomTabbableNode
          //@ts-expect-error
        } else if (!isTabEvent(event)) {
          // user must have customized the nav keys so we have to move focus manually _within_
          //  the active group: do this based on the order determined by tabbable()
          destinationNode = containerGroup?.nextTabbableNode(target)
        }
      }
    } else {
      // no groups available
      // NOTE: the fallbackFocus option does not support returning false to opt-out
      destinationNode = this.getNodeForOption("fallbackFocus")
    }

    return destinationNode
  }
}

const isKeyboardEvent = (event: Event): event is KeyboardEvent => event.type === "keydown"
const isTabEvent = (event: Event) => isKeyboardEvent(event) && event?.key === "Tab"

const isKeyForward = (e: Event) => isKeyboardEvent(e) && e.key === "Tab" && !e?.shiftKey
const isKeyBackward = (e: Event) => isKeyboardEvent(e) && e.key === "Tab" && e?.shiftKey

const valueOrHandler = (value: any, ...params: any[]) => (typeof value === "function" ? value(...params) : value)

const isEscapeEvent = (event: KeyboardEvent) => !event.isComposing && event.key === "Escape"

const delay = (fn: () => void) => setTimeout(fn, 0)

const isSelectableInput = (node: HTMLElement): node is HTMLInputElement =>
  node.localName === "input" && "select" in node && typeof node.select === "function"
