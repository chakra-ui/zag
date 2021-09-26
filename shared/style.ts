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
