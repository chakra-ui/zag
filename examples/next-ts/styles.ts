import { css } from "@emotion/css"

export const controlsContainer = css({
  display: "flex",
  flexDirection: "column",
  gap: "14px",
  marginTop: "auto",
  borderTop: "solid 1px #d7e0da",
  order: 1,
  padding: "12px 22px",
  p: {
    fontWeight: "500",
  },
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
  main: {
    flex: "auto",
    display: "flex",
    flexDirection: "column",
    "[data-part=root]": {},
  },
  ".viz": {
    borderLeft: "solid 1px #d7e0da",
    width: "400px",
    fontSize: "13px",
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
