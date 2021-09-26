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
