# @zag-js/tree-view

Core logic for the tree-view widget implemented as a state machine

## Installation

```sh
yarn add @zag-js/tree-view
# or
npm i @zag-js/tree-view
```

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).

## Component API

```jsx
<Tree.Root>
  <Tree.Label>Tree</Tree.Label>

  <Tree.Tree>
    <Tree.Item>Leaf 1</Tree.Item>
    <Tree.Branch>
      <Tree.BranchControl>
        <Tree.BranchTrigger>
          <ChevronRightIcon />
        </Tree.BranchTrigger>
        <Tree.BranchText>Branch 1</Tree.BranchText>
      </Tree.BranchControl>

      <Tree.BranchContent>
        <Tree.Item>Leaf 2</Tree.Item>
        <Tree.Item>
          <Icon />
          <Tree.ItemText>Leaf 3</Tree.ItemText>
        </Tree.Item>
      </Tree.BranchContent>
    </Tree.Branch>
  </Tree.Tree>
</Tree.Root>
```

### TODO

- shift + arrow down: select all items between the last selected item and the item above/below the last selected item
- shift + arrow right: collapse/expand all items between the last selected item and the item above/below the last
  selected item
