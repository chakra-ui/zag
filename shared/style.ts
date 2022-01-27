import type { CSSObject } from "@emotion/react"
import { keyframes } from "@emotion/css"

export const comboboxStyle: CSSObject = {
  '[role="listbox"]': {
    listStyleType: "none",
    padding: "0",
    margin: "0",
    border: "1px solid lightgray",
    maxWidth: "300px",
  },

  '[role="option"][aria-selected="true"], [role="option"][data-highlighted]': {
    backgroundColor: "red",
    color: "white",
  },
}

export const menuStyle: CSSObject = {
  '[role="menu"]': {
    margin: "0",
    width: "160px",
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "5px",
    boxShadow: "rgb(22 23 24 / 35%) 0px 10px 38px -10px, rgb(22 23 24 / 20%) 0px 10px 20px -15px",
  },
  '[role="menu"]:focus': {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "-3px",
  },
  '[role="menuitem"]': {
    all: "unset",
    fontSize: "14px",
    lineHeight: 1,
    color: "rgb(87, 70, 175)",
    display: "flex",
    alignItems: "center",
    height: "25px",
    position: "relative",
    userSelect: "none",
    borderRadius: "3px",
    padding: "0px 5px 0px 25px",
    "&[data-selected]": {
      backgroundColor: "rgb(110, 86, 207)",
      color: "rgb(253, 252, 254)",
    },
    "&[data-disabled]": {
      opacity: 0.4,
    },
  },
  "button[aria-controls]:focus": {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "-3px",
  },
}

export const popoverStyle: CSSObject = {
  "*:focus": {
    outline: "2px dashed blue",
    outlineOffset: "2px",
  },
  ".popover": {
    display: "flex",
    gap: "24px",
  },
  ".popover__content": {
    background: "white",
    padding: "20px",
    borderRadius: "4px",
    boxShadow: "rgba(14,18,22,.35) 0 10px 38px -10px,rgba(14,18,22,.2) 0 10px 20px -15px",
    width: "260px",
    position: "absolute",
    top: "40px",
    left: "124px",
  },
  ".popover__content:focus": {
    boxShadow: "rgba(14,18,22,.35) 0 10px 38px -10px,rgba(14,18,22,.2) 0 10px 20px -15px, #c4b8f3 0 0 0 2px",
  },
  ".popover__title": {
    fontSize: "15px",
    lineHeight: "19px",
    fontWeight: "bold",
  },
  ".popover__body": {
    paddingTop: "12px",
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    fontSize: "14px",
  },
  ".popover__close-button": {
    position: "absolute",
    right: "0px",
    top: "-20px",
  },
  ".popover__arrow [data-part=arrow--inner]": {
    "--arrow-background": "white",
    "--arrow-shadow-color": "#ebebeb",
    boxShadow: "var(--box-shadow)",
  },
}

export const rangeSliderStyle: CSSObject = {
  ".slider": {
    "--slider-thumb-size": "20px",
    "--slider-track-height": "4px",
    height: "var(--slider-thumb-size)",
    display: "flex",
    alignItems: "center",
    margin: "45px",
    maxWidth: "200px",
    position: "relative",
  },
  ".slider__thumb": {
    all: "unset",
    width: "var(--slider-thumb-size)",
    height: "var(--slider-thumb-size)",
    borderRadius: ["9999px", "999px"],
    background: "white",
    boxShadow: "rgba(0, 0, 0, 0.14) 0px 2px 10px",
  },
  ".slider__thumb:focus-visible": {
    boxShadow: "rgb(0 0 0 / 22%) 0px 0px 0px 5px",
  },
  ".slider__thumb:hover": { backgroundColor: "rgb(245, 242, 255)" },
  ".slider__track": {
    height: "var(--slider-track-height)",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "9999px",
    flexGrow: 1,
  },
  ".slider__range": {
    background: "magenta",
    borderRadius: "inherit",
    height: "100%",
  },
}

export const ratingStyle: CSSObject = {
  ".rating": {
    display: "flex",
  },
  ".rating__rate": {
    margin: "0 3px",
    background: "salmon",
    width: "20px",
    height: "20px",
    padding: "1px",
  },
  ".rating__rate:focus": {
    outline: "2px solid royalblue",
  },
  ".rating__rate[data-highlighted]": {
    background: "red",
  },
}

export const sliderStyle: CSSObject = {
  form: { margin: "45px" },
  ".slider": {
    marginTop: "12px",
    "--slider-thumb-size": "20px",
    "--slider-track-height": "4px",
    height: "var(--slider-thumb-size)",
    display: "flex",
    alignItems: "center",
    maxWidth: "200px",
    position: "relative",
  },
  ".slider__thumb": {
    all: "unset",
    width: "var(--slider-thumb-size)",
    height: "var(--slider-thumb-size)",
    borderRadius: ["9999px", "999px"],
    background: "white",
    boxShadow: "rgba(0, 0, 0, 0.14) 0px 2px 10px",
    "&:focus-visible": {
      boxShadow: "rgb(0 0 0 / 22%) 0px 0px 0px 5px",
    },
    "&:hover:not([data-disabled])": {
      backgroundColor: "rgb(245, 242, 255)",
    },
    "&[data-disabled]": {
      background: "lightgray",
    },
  },
  ".slider__track": {
    height: "var(--slider-track-height)",
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "9999px",
    flexGrow: 1,
  },
  ".slider__range": {
    background: "magenta",
    borderRadius: "inherit",
    height: "100%",
    "&[data-disabled]": {
      background: "rgba(0, 0, 0, 0.4)",
    },
  },
  output: { marginInlineStart: "12px" },
}

export const splitViewStyle: CSSObject = {
  ".root": { height: "300px" },
  ".pane": {
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    border: "1px solid lightgray",
    overflow: "auto",
  },
  ".splitter": {
    width: "8px",
    background: "#ebebeb",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    transition: "background-color 0.2s ease-in-out",
    outline: "0",
  },
  ".splitter[data-focus]": { background: "#b0baf1" },
  ".splitter:active": { background: "#3f51b5", color: "white" },
  ".splitter-bar": {
    width: "2px",
    height: "40px",
    backgroundColor: "currentColor",
  },
}

export const tagsInputStyle: CSSObject = {
  ".tags-input": {
    display: "inline-block",
    padding: "0 2px",
    background: "#fff",
    border: "1px solid #ccc",
    width: "40em",
    borderRadius: "2px",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
  },
  ".tag": {
    background: "#eee",
    color: "#444",
    padding: "0 4px",
    margin: "2px",
    border: "1px solid #ccc",
    borderRadius: "2px",
    font: "inherit",
    userSelect: "none",
    cursor: "pointer",
    transition: "all 100ms ease",
  },
  ".tag:not([hidden])": { display: "inline-block" },
  ".tag[hidden]": { display: "none !important" },
  ".tag[data-selected]": {
    backgroundColor: "#777",
    borderColor: "#777",
    color: "#eee",
  },
  input: {
    appearance: "none",
    padding: "3px",
    margin: "0",
    background: "none",
    border: "none",
    boxShadow: "none",
    font: "inherit",
    fontSize: "100%",
    outline: "none",
  },
  "input[hidden]": { display: "none !important" },
  "input:not([hidden])": { display: "inline-block !important" },
  ".tag-close": { border: "0", background: "inherit" },
}

export const pinInputStyle: CSSObject = {
  ".pin-input": {
    width: "300px",
    display: "flex",
    marginBottom: "12px",
    gap: "12px",

    input: {
      width: "48px",
      height: "48px",
      textAlign: "center",
      fontSize: "24px",
    },
  },
}

const fadeIn = keyframes({
  from: { opacity: 0 },
  to: { opacity: 1 },
})

const fadeOut = keyframes({
  from: { opacity: 1 },
  to: { opacity: 0 },
})

export const toastStyle: CSSObject = {
  ".toast": {
    background: "rgb(116, 116, 116)",
    borderRadius: "4px",
    color: "white",
    padding: "8px 8px 8px 16px",
    width: "400px",
    animation: `${fadeIn} 0.2s`,
    "&:not([data-open])": {
      animation: `${fadeOut} var(--toast-remove-delay)`,
    },
    "&[data-type=error]": {
      background: "rgb(201, 37, 45)",
    },
    "&[data-type=info]": {
      background: "rgb(13, 102, 208)",
    },
    "&[data-type=warning]": {
      background: "orange",
    },
    "&[data-type=success]": {
      background: "rgb(18, 128, 92)",
    },
    "&[data-type=loading]": {
      background: "purple",
    },
  },
}

export const dialogStyle: CSSObject = {
  ".dialog__overlay": {
    backgroundColor: "rgba(0, 0, 0, 0.44)",
    position: "fixed",
    inset: "0px",
  },
  ".dialog__title": {
    margin: "0px",
    fontWeight: 500,
    color: "rgb(26, 21, 35)",
    fontSize: "17px",
  },
  ".dialog__description": {
    margin: "10px 0px 20px",
    color: "rgb(111, 110, 119)",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  ".dialog__content": {
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px",
    position: "fixed",
    top: "50%",
    left: "50%",
    transform: "translate(-50%, -50%)",
    width: "90vw",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: "25px",
  },
  ".dialog__close-button": {
    fontFamily: "inherit",
    height: "25px",
    width: "25px",
    display: "inline-flex",
    alignItems: "center",
    justifyContent: "center",
    color: "rgb(87, 70, 175)",
    position: "absolute",
    top: "10px",
    right: "10px",
    borderRadius: "100%",
  },
  ".dialog__close-button:focus": {
    outline: "2px blue solid",
    outlineOffset: "2px",
  },
}

export const toggleStyle: CSSObject = {
  ".toggle": {
    backgroundColor: "white",
    color: "rgb(111, 110, 119)",
    height: "40px",
    width: "40px",
    fontSize: "16px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    borderRadius: "4px",
    "&[data-pressed]": {
      fontWeight: "bold",
      backgroundColor: "rgb(215, 207, 249)",
      color: "rgb(32, 19, 75)",
    },
  },
}

export const tabsStyle: CSSObject = {
  ".tabs": { maxWidth: "20em" },
  '[role="tablist"]': { margin: "0 0 -0.1em", overflow: "visible" },
  '[role="tab"]': {
    position: "relative",
    margin: "0",
    padding: "0.3em 0.5em 0.4em",
    border: "1px solid hsl(219, 1%, 72%)",
    borderRadius: "0.2em 0.2em 0 0",
    boxShadow: "0 0 0.2em hsl(219, 1%, 72%)",
    overflow: "visible",
    fontSize: "inherit",
    background: "hsl(220, 20%, 94%)",
  },
  '[role="tab"]:hover::before,\n[role="tab"]:focus::before,\n[role="tab"][aria-selected="true"]::before': {
    position: "absolute",
    bottom: "100%",
    right: "-1px",
    left: "-1px",
    borderRadius: "0.2em 0.2em 0 0",
    borderTop: "3px solid hsl(20, 96%, 48%)",
    content: '""',
  },
  '[role="tab"][aria-selected="true"]': {
    borderRadius: "0",
    background: "hsl(220, 43%, 99%)",
    outline: "0",
  },
  '[role="tab"][aria-selected="true"]:not(:focus):not(:hover)::before': {
    borderTop: "5px solid hsl(218, 96%, 48%)",
  },
  '[role="tab"][aria-selected="true"]::after': {
    position: "absolute",
    zIndex: 3,
    bottom: "-1px",
    right: "0",
    left: "0",
    height: "0.3em",
    background: "hsl(220, 43%, 99%)",
    boxShadow: "none",
    content: '""',
  },
  '[role="tab"]:hover,\n[role="tab"]:focus,\n[role="tab"]:active': {
    outline: "0",
    borderRadius: "0",
    color: "inherit",
  },
  '[role="tab"]:hover::before,\n[role="tab"]:focus::before': {
    borderColor: "hsl(20, 96%, 48%)",
  },
  '[role="tabpanel"]': {
    position: "relative",
    zIndex: 2,
    padding: "0.5em 0.5em 0.7em",
    border: "1px solid hsl(219, 1%, 72%)",
    borderRadius: "0 0.2em 0.2em 0.2em",
    boxShadow: "0 0 0.2em hsl(219, 1%, 72%)",
    background: "hsl(220, 43%, 99%)",
  },
  '[role="tabpanel"]:focus': {
    borderColor: "hsl(20, 96%, 48%)",
    boxShadow: "0 0 0.2em hsl(20, 96%, 48%)",
    outline: "0",
  },
  '[role="tabpanel"]:focus::after': {
    position: "absolute",
    bottom: "0",
    right: "-1px",
    left: "-1px",
    borderBottom: "3px solid hsl(20, 96%, 48%)",
    borderRadius: "0 0 0.2em 0.2em",
    content: '""',
  },
  '[role="tabpanel"] p': { margin: "0" },
  '[role="tabpanel"] * + p': { marginTop: "1em" },
  ".tabs__indicator": { height: "4px", backgroundColor: "red", zIndex: 10 },
}

export const tooltipStyles: CSSObject = {
  "[data-tooltip]": {
    zIndex: 1,
    width: "100px",
    position: "absolute",
    padding: "0.25em 0.5em",
    boxShadow: "2px 2px 10px hsla(0, 0%, 0%, 0.1)",
    whiteSpace: "nowrap",
    fontSize: "85%",
    background: "#f0f0f0",
    color: "#444",
    border: "solid 1px #ccc",
  },
}
