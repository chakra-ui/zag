export const comboboxStyle = {
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

export const menuStyle = {
  '[role="menu"]': {
    maxWidth: "160px",
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

export const popoverStyle = {
  '[role="dialog"]': {
    background: "red",
    padding: "20px",
  },
  '[role="dialog"]:focus': {
    outline: "2px solid royalblue",
  },
}

export const rangeSliderStyle = {
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

export const ratingStyle = {
  ".rating": { display: "flex" },
  ".rating__rate": { margin: "0 3px", background: "salmon" },
  ".rating__rate:focus": { outline: "2px solid royalblue" },
  ".rating__rate[data-highlighted]": { background: "red" },
}

export const sliderStyle = {
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
  output: { marginInlineStart: "12px", color: "lightslategray" },
}

export const splitViewStyle = {
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

export const tagsInputStyle = {
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
    appearance: "none !important",
    padding: "3px",
    margin: "0 !important",
    background: "none !important",
    border: "none !important",
    boxShadow: "none !important",
    font: "inherit !important",
    fontSize: "100% !important",
    outline: "none !important",
  },
  "input[hidden]": { display: "none !important" },
  "input:not([hidden])": { display: "inline-block !important" },
  ".tag-close": { border: "0", background: "inherit" },
}
