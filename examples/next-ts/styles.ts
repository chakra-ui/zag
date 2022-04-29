import { css } from "@emotion/css"

export const controlsContainer = css({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  order: 1,
  padding: "12px 22px",

  ".checkbox": { display: "flex", alignItems: "end", gap: "4px" },
  ".text": {
    display: "flex",
    flexDirection: "column",
    gap: "8px",
    label: {
      fontWeight: "500",
    },
    "input, select": {
      padding: "4px",
      border: "solid 1px black",
      borderRadius: "4px",
    },
  },
})

export const pageStyle = css({
  display: "flex",
  height: "100vh",
  overflow: "hidden",
  main: {
    flex: "auto",
    display: "flex",
    flexDirection: "column",
  },
})

export const getToolbarStyles = (count: number) =>
  css({
    borderLeft: "solid 1px #d7e0da",
    width: "400px",
    display: "flex",
    flexDirection: "column",
    nav: {
      padding: "16px",
      display: "flex",
      gap: "24px",
      borderBottom: "solid 1px #d7e0da",
      button: {
        all: "unset",
        cursor: "pointer",
        fontWeight: "500",
        "&[data-active]": {
          color: "green",
        },
      },
    },
    "& > div": {
      maxHeight: "100%",
      overflow: "hidden",
    },
    "[data-content]": {
      display: "none",
      "&[data-active]": {
        display: "initial",
      },
    },
    ".viz": {
      fontSize: "13px",
      summary: {
        marginBottom: 24,
        fontFamily: "monospace",
        fontWeight: "bold",
        cursor: "pointer",
      },
      paddingLeft: "14px",
      maxHeight: `${100 / count}%`,
      overflow: "auto",
      borderBottom: "solid 1px #d7e0da",
    },
  })

export const navStyle = css({
  display: "flex",
  flexDirection: "column",
  width: "292px",
  borderRight: "solid 1px #d7e0da",
  header: {
    padding: "8px",
    fontSize: "larger",
    fontWeight: 600,
  },
  a: {
    padding: "6px 14px",
    cursor: "pointer",
    borderLeft: "solid 4px transparent",
    textDecoration: "none",
    color: "black",
  },
  "a:hover": {
    backgroundColor: "rgba(124, 128, 125, 0.4)",
  },
  "a:focus": {
    outline: "none",
  },
  'a[data-active="true"]': {
    borderColor: "green",
    fontWeight: 500,
  },
})
