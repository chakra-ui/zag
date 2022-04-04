import type { CSSObject } from "@emotion/react"
import { keyframes } from "@emotion/css"

export const accordionStyle: CSSObject = {
  "[data-part=root]": {
    width: "100%",
    maxWidth: "40ch",
  },
}

export const comboboxStyle: CSSObject = {
  "[data-part=root]": {
    display: "inline-flex",
    flexDirection: "column",
  },
  "[data-part=listbox]": {
    listStyleType: "none",
    padding: "0",
    margin: "0",
    border: "1px solid lightgray",
    maxHeight: "400px",
    overflow: "auto",
  },
  "[data-part=option]": {
    '&[aria-selected="true"], &[data-highlighted]': {
      backgroundColor: "red",
      color: "white",
    },
  },
  "[data-part=label]": {
    display: "block",
    marginTop: "12px",
    marginBottom: "4px",
  },
  "[data-part=control]": {
    display: "inline-flex",
    width: "300px",
  },
  "[data-part=input]": {
    flex: "1",
  },
}

export const editableStyle: CSSObject = {
  "[data-part=area]": {
    display: "inline-block",
    marginRight: "0.5em",
    marginBottom: "1em",
  },
  "[data-part=input]": {
    width: "auto",
    background: "transparent",
  },
  "[data-part=preview]": {
    "&[data-empty]": {
      opacity: 0.7,
    },
  },
  "[data-part=control-group]": {
    display: "inline-flex",
    gap: "0.5em",
  },
}

export const menuStyle: CSSObject = {
  "[data-part=content]": {
    margin: "0",
    width: "160px",
    backgroundColor: "white",
    borderRadius: "6px",
    padding: "5px",
    border: "1px solid lightgray",
    listStyleType: "none",
    "&:focus": {
      outline: "2px dashed var(--ring-color)",
      outlineOffset: "-5px",
    },
  },
  "[data-part*=item]": {
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
    "&[data-focus]": {
      outline: "none",
      backgroundColor: "rgb(110, 86, 207)",
      color: "rgb(253, 252, 254)",
    },
    "&[data-disabled]": {
      opacity: 0.4,
    },
  },
  "[data-part=trigger]:focus": {
    outline: "2px dashed var(--ring-color)",
    outlineOffset: "-3px",
  },
}

export const popoverStyle: CSSObject = {
  "[data-part=root]": {
    display: "flex",
    gap: "24px",
  },
  "*:focus": {
    outline: "2px dashed blue",
    outlineOffset: "2px",
  },
  "[data-part=content]": {
    "--arrow-background": "white",
    "--arrow-size": "10px",
    background: "white",
    padding: "20px",
    borderRadius: "4px",
    position: "relative",
    filter: "drop-shadow(0 4px 8px rgba(0, 0, 0, 0.2))",
    width: "260px",
  },
  "[data-part=title]": {
    fontSize: "15px",
    lineHeight: "19px",
    fontWeight: "bold",
  },
  "[data-part=body]": {
    paddingTop: "12px",
    display: "flex",
    alignItems: "flex-start",
    flexDirection: "column",
    gap: "12px",
    position: "relative",
    fontSize: "14px",
  },
  "[data-part=close-button]": {
    position: "absolute",
    right: "0px",
    top: "-20px",
  },
  "[data-part=arrow]": {
    "--arrow-background": "white",
    "--arrow-shadow-color": "#ebebeb",
    boxShadow: "var(--box-shadow)",
  },
}

export const ratingStyle: CSSObject = {
  "[data-part=item-group]": {
    display: "inline-flex",
  },
  "[data-part=item]": {
    width: "20px",
    height: "20px",
    padding: "1px",
    "&:focus": {
      outline: "2px solid royalblue",
    },
  },
  "[data-part=star]": {
    color: "#bdbdbd",
    "[data-highlighted] &": {
      color: "#ffb400",
    },
    "[data-highlighted][data-disabled] &": {
      color: "#a1a1a1",
    },
    "[dir=rtl] [data-half] &": {
      transform: "scale(-1, 1)",
    },
  },
}

export const sliderStyle: CSSObject = {
  "[data-part=root]": {
    margin: "45px",
    maxWidth: "320px",
    display: "flex",
    flexDirection: "column",
    "&[data-orientation=vertical]": {
      height: "240px",
    },
  },
  "[data-part=control]": {
    "--slider-thumb-size": "20px",
    "--slider-track-height": "4px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
    position: "relative",
    "&[data-orientation=horizontal]": {
      height: "var(--slider-thumb-size)",
    },
    "&[data-orientation=vertical]": {
      width: "var(--slider-thumb-size)",
    },
  },
  "[data-part=thumb]": {
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
  ".control-area": {
    marginTop: "12px",
    display: "flex",
    "[data-orientation=horizontal] &": {
      flexDirection: "column",
      width: "100%",
    },
    "[data-orientation=vertical] &": {
      flexDirection: "row",
      height: "100%",
    },
  },
  "[data-part=track]": {
    background: "rgba(0, 0, 0, 0.2)",
    borderRadius: "9999px",
    "&[data-orientation=horizontal]": {
      height: "var(--slider-track-height)",
      width: "100%",
    },
    "&[data-orientation=vertical]": {
      height: "100%",
      width: "var(--slider-track-height)",
    },
  },
  "[data-part=range]": {
    background: "magenta",
    borderRadius: "inherit",
    "&[data-disabled]": {
      background: "rgba(0, 0, 0, 0.4)",
    },
    "&[data-orientation=horizontal]": {
      height: "100%",
    },
    "&[data-orientation=vertical]": {
      width: "100%",
    },
  },
  "[data-part=output]": {
    marginInlineStart: "12px",
  },
  "[data-part=marker-group]": {
    "&[data-orientation=vertical]": {
      height: "100%",
    },
  },
  "[data-part=marker]": {
    color: "lightgray",
    "&[data-state=under-value]": {
      color: "red",
    },
  },
}

export const splitterStyle: CSSObject = {
  ".root": {
    height: "300px",
  },
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
    "&[data-focus]:not([data-disabled])": {
      background: "#b0baf1",
    },
    "&:active:not([data-disabled]])": {
      background: "#3f51b5",
      color: "white",
    },
    "&[data-disabled]": {
      opacity: "0.5",
    },
  },
  ".splitter-bar": {
    width: "2px",
    height: "40px",
    backgroundColor: "currentColor",
  },
}

export const tagsInputStyle: CSSObject = {
  "[data-part=control]": {
    padding: "0 2px",
    background: "#fff",
    border: "1px solid #ccc",
    width: "40em",
    borderRadius: "2px",
    boxShadow: "inset 0 1px 2px rgba(0, 0, 0, 0.1)",
    "&[data-disabled]": {
      background: "#f9f9f9",
    },
    "&[data-focus], &:focus": {
      borderColor: "red",
      outline: 0,
    },
  },
  "[data-part=tag]": {
    background: "#eee",
    color: "#444",
    padding: "0 4px",
    margin: "2px",
    border: "1px solid #ccc",
    borderRadius: "2px",
    font: "inherit",
    userSelect: "none",
    cursor: "pointer",
    display: "inline-block",
    "&[hidden]": {
      display: "none !important",
    },
    "&[data-selected]": {
      backgroundColor: "#777",
      borderColor: "#777",
      color: "#eee",
    },
    "&[data-disabled]": {
      opacity: 0.6,
      cursor: "default",
    },
  },
  "[data-part*=input]": {
    appearance: "none",
    padding: "3px",
    margin: "0",
    background: "none",
    border: "none",
    boxShadow: "none",
    font: "inherit",
    fontSize: "100%",
    outline: "none",
    display: "inline-block !important",
    "&[hidden]": {
      display: "none !important",
    },
    "&:disabled": {
      opacity: 0.6,
    },
  },
  "[data-part=delete-button]": {
    all: "unset",
  },
}

export const pinInputStyle: CSSObject = {
  "[data-part=root]": {
    width: "300px",
    display: "flex",
    marginBottom: "12px",
    gap: "12px",
  },
  "[data-part=input]": {
    width: "48px",
    height: "48px",
    textAlign: "center",
    fontSize: "24px",
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

const spin = keyframes({
  from: { transform: "rotate(0deg)" },
  to: { transform: "rotate(360deg)" },
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
  ".spin": {
    animation: `${spin} 1s linear infinite`,
  },
}

export const dialogStyle: CSSObject = {
  "[data-part=backdrop]": {
    backgroundColor: "rgba(0, 0, 0, 0.44)",
    position: "fixed",
    inset: "0px",
  },
  "[data-part=title]": {
    margin: "0px",
    fontWeight: 500,
    color: "rgb(26, 21, 35)",
    fontSize: "17px",
  },
  "[data-part=description]": {
    margin: "10px 0px 20px",
    color: "rgb(111, 110, 119)",
    fontSize: "15px",
    lineHeight: 1.5,
  },
  "[data-part=underlay]": {
    height: "100vh",
    width: "100vw",
    position: "fixed",
    inset: "0px",
    display: "flex",
    alignItems: "center",
    justifyContent: "center",
  },
  "[data-part=content]": {
    backgroundColor: "white",
    borderRadius: "6px",
    boxShadow: "rgb(14 18 22 / 35%) 0px 10px 38px -10px, rgb(14 18 22 / 20%) 0px 10px 20px -15px",
    width: "100%",
    maxWidth: "450px",
    maxHeight: "85vh",
    padding: "24px",
    position: "relative",
  },
  "[data-part=close-button]": {
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
    "&:focus": {
      outline: "2px blue solid",
      outlineOffset: "2px",
    },
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
  "[data-part=root]": {
    maxWidth: "20em",
  },
  "[data-part=trigger-group]": {
    margin: "0 0 -0.1em",
    overflow: "visible",
  },
  "[data-part=trigger]": {
    position: "relative",
    margin: "0",
    padding: "0.3em 0.5em 0.4em",
    border: "1px solid hsl(219, 1%, 72%)",
    borderRadius: "0.2em 0.2em 0 0",
    boxShadow: "0 0 0.2em hsl(219, 1%, 72%)",
    overflow: "visible",
    fontSize: "inherit",
    background: "hsl(220, 20%, 94%)",
    "&:hover, &:focus, &:active": {
      outline: "0",
      borderRadius: "0",
      color: "inherit",
    },
    "&[data-selected]": {
      borderRadius: "0",
      background: "hsl(220, 43%, 99%)",
      outline: "0",
      "&:not(:focus):not(:hover)::before": {
        borderTop: "5px solid hsl(218, 96%, 48%)",
      },
      "&::after": {
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
    },
    "&:hover::before, &:focus::before": {
      borderColor: "hsl(20, 96%, 48%)",
    },
    "&:hover::before, &:focus::before, &[data-selected]::before": {
      position: "absolute",
      bottom: "100%",
      right: "-1px",
      left: "-1px",
      borderRadius: "0.2em 0.2em 0 0",
      borderTop: "3px solid hsl(20, 96%, 48%)",
      content: '""',
    },
  },
  "[data-part=content]": {
    position: "relative",
    zIndex: 2,
    padding: "0.5em 0.5em 0.7em",
    border: "1px solid hsl(219, 1%, 72%)",
    borderRadius: "0 0.2em 0.2em 0.2em",
    boxShadow: "0 0 0.2em hsl(219, 1%, 72%)",
    background: "hsl(220, 43%, 99%)",
    "& p": {
      margin: "0",
    },
    "& * + p": {
      marginTop: "1em",
    },
    "&:focus": {
      borderColor: "hsl(20, 96%, 48%)",
      boxShadow: "0 0 0.2em hsl(20, 96%, 48%)",
      outline: "0",
      "&::after": {
        position: "absolute",
        bottom: "0",
        right: "-1px",
        left: "-1px",
        borderBottom: "3px solid hsl(20, 96%, 48%)",
        borderRadius: "0 0 0.2em 0.2em",
        content: '""',
      },
    },
  },
  "[data-part=indicator]": {
    height: "4px",
    backgroundColor: "red",
    zIndex: 10,
  },
}

export const tooltipStyles: CSSObject = {
  "[data-part=content]": {
    zIndex: 1,
    padding: "0.25em 0.5em",
    boxShadow: "2px 2px 10px hsla(0, 0%, 0%, 0.1)",
    whiteSpace: "nowrap",
    fontSize: "85%",
    background: "#f0f0f0",
    color: "#444",
    border: "solid 1px #ccc",
  },
}
