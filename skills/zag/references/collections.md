# Collections

Select, combobox and listbox read their options from a list collection, not an `items` array. The collection tells the
machine each item's value, label and disabled state, which drive selection, typeahead, keyboard navigation and what the
form submits.

```ts
const collection = select.collection({
  items: countries,
  itemToValue: (item) => item.code,
  itemToString: (item) => item.name,
  isItemDisabled: (item) => item.soldOut,
})

useMachine(select.machine, { id, collection })
```

Items shaped `{ value, label, disabled }` need no accessors. Values are always strings.

Render your items from the same array you passed in, and pass each item to `getItemProps({ item })`.

## When items change

Build a new collection from the new items and pass it to the machine. Collections are immutable. In React, build it in
the render or with `useMemo`. In Vue, Svelte and Solid, pass the props as a `computed` or a function so the machine sees
the new collection (see [frameworks.md](frameworks.md)).

## Filtering a combobox

The combobox doesn't filter for you. Filter in `onInputValueChange` and build the collection from the result:

```tsx
import { createFilter } from "@zag-js/i18n-utils"

const { contains } = createFilter({ sensitivity: "base" })
const [items, setItems] = useState(countries)
const collection = combobox.collection({ items, itemToValue: (i) => i.code, itemToString: (i) => i.name })

useMachine(combobox.machine, {
  id,
  collection,
  onInputValueChange({ inputValue }) {
    setItems(countries.filter((item) => contains(item.name, inputValue)))
  },
})
```

`createFilter` matches with `Intl.Collator`, so accents and case don't get in the way.

## Groups

Pass `groupBy`, and optionally `groupSort`, then render `collection.group()`, which returns `[group, items]` pairs, with
`getItemGroupProps` and `getItemGroupLabelProps`.

## Other collections

| Need                                                   | Use                                                                                                                | Docs                                         |
| ------------------------------------------------------ | ------------------------------------------------------------------------------------------------------------------ | -------------------------------------------- |
| Tree view, cascade select                              | `treeView.collection({ rootNode, nodeToValue, nodeToString, nodeToChildren })`, or `cascadeSelect.collection(...)` | `{docs}/components/{framework}/tree-view.md` |
| Items loaded from a server, with sorting and filtering | `@zag-js/async-list`                                                                                               | `{docs}/utilities/async-list.md`             |
| Thousands of items                                     | `@zag-js/virtualizer`, with the machine's `scrollToIndexFn`                                                        | `{docs}/utilities/virtualizer.md`            |
| Grid layouts (listbox)                                 | `listbox.gridCollection(...)`                                                                                      | `{docs}/utilities/grid-collection.md`        |
