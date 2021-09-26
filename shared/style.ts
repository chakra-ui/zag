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
