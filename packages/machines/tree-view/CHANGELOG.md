# @zag-js/tree-view

## 1.26.1

### Patch Changes

- [`2189d00`](https://github.com/chakra-ui/zag/commit/2189d009d758228318fdbea3da2e951d7792f141) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fixed issue where pressing `F2` on any tree node would lock
  navigation and prevent selecting other nodes.
  - The rename feature now requires the `canRename` callback to be explicitly provided, making it opt-in rather than
    opt-out.
- Updated dependencies []:
  - @zag-js/anatomy@1.26.1
  - @zag-js/core@1.26.1
  - @zag-js/types@1.26.1
  - @zag-js/collection@1.26.1
  - @zag-js/utils@1.26.1
  - @zag-js/dom-query@1.26.1

## 1.26.0

### Minor Changes

- [`3a2c24f`](https://github.com/chakra-ui/zag/commit/3a2c24f5faa53d9cf19a3e549d87daa5ef5462cd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support for renaming tree node labels with validation and
  control features.

  This feature enables users to edit tree node labels inline, unlocking use cases like file explorers, folder management
  systems, content hierarchies, and any tree-based interface where users need to rename items.

  ## Key Features

  ### Basic Renaming
  - Press `F2` on any node to enter rename mode
  - Input is automatically focused and synced with current label
  - Press `Enter` to submit or `Escape` to cancel
  - Blur event automatically submits changes
  - IME composition events are properly handled for international input

  ### Validation & Control
  - **`canRename`** - Control which nodes are renameable based on node type or custom logic
  - **`onRenameStart`** - Called when rename mode starts (useful for analytics, showing hints)
  - **`onBeforeRename`** - Validate rename before accepting (e.g., prevent duplicates, empty names)
  - **Empty name prevention** - Automatically stays in rename mode if submitted name is empty/whitespace
  - **Label trimming** - Labels are automatically trimmed before being passed to callbacks
  - **`onRenameComplete`** - Handle the rename and update your collection

  ### Styling & Visual State
  - **`data-renaming`** attribute - Added to both item and branch elements when in rename mode for easy styling
  - **`nodeState.renaming`** - Boolean property to check if a node is currently being renamed

  ## API

  ```tsx
  const [collection, setCollection] = useState(initialCollection)

  useMachine(tree.machine, {
    collection,

    // Control which nodes can be renamed
    canRename: (node, indexPath) => {
      // Only allow renaming leaf nodes (files), not branches (folders)
      return !node.children
    },

    // Called when rename mode starts
    onRenameStart: (details) => {
      // details contains: { value, node, indexPath }
      console.log("Started renaming:", details.node.name)
      // Track analytics, show hints, etc.
    },

    // Validate before accepting rename
    onBeforeRename: (details) => {
      // Note: details.label is already trimmed by the machine

      // Prevent empty names
      if (!details.label) return false

      // Prevent duplicate names at the same level
      const parentPath = details.indexPath.slice(0, -1)
      const parent = parentPath.length > 0 ? collection.at(parentPath) : collection.rootNode
      const siblings = parent?.children || []

      const hasDuplicate = siblings.some((sibling) => sibling.name === details.label && sibling.id !== details.value)

      return !hasDuplicate
    },

    // Handle successful rename
    onRenameComplete: (details) => {
      // details contains: { value, label (trimmed), indexPath }
      const node = collection.at(details.indexPath)
      const updatedCollection = collection.replace(details.indexPath, {
        ...node,
        name: details.label,
      })
      setCollection(updatedCollection)
    },
  })
  ```

  ## Component Integration

  ```tsx
  const TreeNode = ({ node, indexPath, api }) => {
    const nodeState = api.getNodeState({ node, indexPath })

    return (
      <div {...api.getItemProps({ node, indexPath })}>
        <FileIcon />

        {/* Show text when not renaming */}
        <span
          {...api.getItemTextProps({ node, indexPath })}
          style={{ display: nodeState.renaming ? "none" : "inline" }}
        >
          {node.name}
        </span>

        {/* Show input when renaming */}
        <input {...api.getNodeRenameInputProps({ node, indexPath })} />
      </div>
    )
  }
  ```

  ## Programmatic API

  ```tsx
  // Start renaming a node
  api.startRenaming(nodeValue)

  // Submit rename with new label
  api.submitRenaming(nodeValue, newLabel)

  // Cancel renaming
  api.cancelRenaming()
  ```

  ## Node State & Styling

  The `nodeState` now includes a `renaming` property to track rename mode:

  ```tsx
  const nodeState = api.getNodeState({ node, indexPath })
  // nodeState.renaming -> boolean
  ```

  Both `getItemProps` and `getBranchControlProps` now include a `data-renaming` attribute for styling:

  ```css
  /* Style items being renamed */
  [data-part="item"][data-renaming] {
    outline: 2px solid blue;
  }

  /* Style branch controls being renamed */
  [data-part="branch-control"][data-renaming] {
    background: rgba(0, 0, 255, 0.1);
  }
  ```

  ## Use Cases Unlocked
  1. **File Explorers** - Allow users to rename files and folders with validation
  2. **Content Management** - Edit page titles, categories, or navigation items in-place
  3. **Folder Organization** - Rename folders with duplicate prevention
  4. **Project Management** - Edit task names, project hierarchies
  5. **Knowledge Bases** - Rename articles, sections, or categories inline

  ## Example: File Explorer with Smart Validation

  ```tsx
  useMachine(tree.machine, {
    collection,

    canRename: (node, indexPath) => {
      // Prevent renaming system files
      if (node.system) return false
      // Prevent renaming locked files
      if (node.locked) return false
      // Only allow renaming files, not folders
      return !node.children
    },

    onBeforeRename: (details) => {
      // Note: details.label is already trimmed

      // Check file extension rules
      if (!details.label.includes(".")) {
        console.error("File must have an extension")
        return false
      }

      // Validate file name characters
      if (/[<>:"/\\|?*]/.test(details.label)) {
        console.error("Invalid characters in filename")
        return false
      }

      return true
    },

    onRenameComplete: (details) => {
      // Update collection and sync to backend
      const node = collection.at(details.indexPath)
      const updatedCollection = collection.replace(details.indexPath, {
        ...node,
        name: details.label,
        lastModified: new Date(),
      })
      setCollection(updatedCollection)

      // Sync to server
      api.renameFile(details.value, details.label)
    },
  })
  ```

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.26.0
  - @zag-js/core@1.26.0
  - @zag-js/types@1.26.0
  - @zag-js/collection@1.26.0
  - @zag-js/utils@1.26.0
  - @zag-js/dom-query@1.26.0

## 1.25.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.25.0
  - @zag-js/core@1.25.0
  - @zag-js/types@1.25.0
  - @zag-js/collection@1.25.0
  - @zag-js/utils@1.25.0
  - @zag-js/dom-query@1.25.0

## 1.24.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.2
  - @zag-js/core@1.24.2
  - @zag-js/types@1.24.2
  - @zag-js/collection@1.24.2
  - @zag-js/utils@1.24.2
  - @zag-js/dom-query@1.24.2

## 1.24.1

### Patch Changes

- Updated dependencies [[`ab0d4f7`](https://github.com/chakra-ui/zag/commit/ab0d4f73d6ca0571cb09ebad5bf724fe81e94ef8)]:
  - @zag-js/core@1.24.1
  - @zag-js/anatomy@1.24.1
  - @zag-js/types@1.24.1
  - @zag-js/collection@1.24.1
  - @zag-js/utils@1.24.1
  - @zag-js/dom-query@1.24.1

## 1.24.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.24.0
  - @zag-js/core@1.24.0
  - @zag-js/types@1.24.0
  - @zag-js/collection@1.24.0
  - @zag-js/utils@1.24.0
  - @zag-js/dom-query@1.24.0

## 1.23.0

### Patch Changes

- Updated dependencies [[`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`47011ad`](https://github.com/chakra-ui/zag/commit/47011add7c99572aaa162846cf01781ea42d35ac),
  [`92c0bf5`](https://github.com/chakra-ui/zag/commit/92c0bf5f5e283451c6be989e63ff02188054be9a),
  [`50391e1`](https://github.com/chakra-ui/zag/commit/50391e11eb7f9af1f23f44661a8bc522c591175c)]:
  - @zag-js/dom-query@1.23.0
  - @zag-js/core@1.23.0
  - @zag-js/anatomy@1.23.0
  - @zag-js/types@1.23.0
  - @zag-js/collection@1.23.0
  - @zag-js/utils@1.23.0

## 1.22.1

### Patch Changes

- Updated dependencies [[`4790d22`](https://github.com/chakra-ui/zag/commit/4790d22ee49c02daafad02aa4f5beb5fcdd507f7)]:
  - @zag-js/collection@1.22.1
  - @zag-js/anatomy@1.22.1
  - @zag-js/core@1.22.1
  - @zag-js/types@1.22.1
  - @zag-js/utils@1.22.1
  - @zag-js/dom-query@1.22.1

## 1.22.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.22.0
  - @zag-js/core@1.22.0
  - @zag-js/types@1.22.0
  - @zag-js/collection@1.22.0
  - @zag-js/utils@1.22.0
  - @zag-js/dom-query@1.22.0

## 1.21.9

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.9
  - @zag-js/core@1.21.9
  - @zag-js/types@1.21.9
  - @zag-js/collection@1.21.9
  - @zag-js/utils@1.21.9
  - @zag-js/dom-query@1.21.9

## 1.21.8

### Patch Changes

- Updated dependencies [[`dd1519a`](https://github.com/chakra-ui/zag/commit/dd1519a668f315e2feab7aed51007f3380880229)]:
  - @zag-js/dom-query@1.21.8
  - @zag-js/core@1.21.8
  - @zag-js/anatomy@1.21.8
  - @zag-js/types@1.21.8
  - @zag-js/collection@1.21.8
  - @zag-js/utils@1.21.8

## 1.21.7

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.7
  - @zag-js/core@1.21.7
  - @zag-js/types@1.21.7
  - @zag-js/collection@1.21.7
  - @zag-js/utils@1.21.7
  - @zag-js/dom-query@1.21.7

## 1.21.6

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.6
  - @zag-js/core@1.21.6
  - @zag-js/types@1.21.6
  - @zag-js/collection@1.21.6
  - @zag-js/utils@1.21.6
  - @zag-js/dom-query@1.21.6

## 1.21.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.5
  - @zag-js/core@1.21.5
  - @zag-js/types@1.21.5
  - @zag-js/collection@1.21.5
  - @zag-js/utils@1.21.5
  - @zag-js/dom-query@1.21.5

## 1.21.4

### Patch Changes

- Updated dependencies [[`d07647c`](https://github.com/chakra-ui/zag/commit/d07647cc53cec91d126653dec056c7dd7f9805a7)]:
  - @zag-js/collection@1.21.4
  - @zag-js/anatomy@1.21.4
  - @zag-js/core@1.21.4
  - @zag-js/types@1.21.4
  - @zag-js/utils@1.21.4
  - @zag-js/dom-query@1.21.4

## 1.21.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.3
  - @zag-js/core@1.21.3
  - @zag-js/types@1.21.3
  - @zag-js/collection@1.21.3
  - @zag-js/utils@1.21.3
  - @zag-js/dom-query@1.21.3

## 1.21.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.2
  - @zag-js/core@1.21.2
  - @zag-js/types@1.21.2
  - @zag-js/collection@1.21.2
  - @zag-js/utils@1.21.2
  - @zag-js/dom-query@1.21.2

## 1.21.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.1
  - @zag-js/core@1.21.1
  - @zag-js/types@1.21.1
  - @zag-js/collection@1.21.1
  - @zag-js/utils@1.21.1
  - @zag-js/dom-query@1.21.1

## 1.21.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.21.0
  - @zag-js/core@1.21.0
  - @zag-js/types@1.21.0
  - @zag-js/collection@1.21.0
  - @zag-js/utils@1.21.0
  - @zag-js/dom-query@1.21.0

## 1.20.1

### Patch Changes

- [`c4061c8`](https://github.com/chakra-ui/zag/commit/c4061c8b4f0eaec9d51ff0a4846b2efad01fe4dd) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fixed issue where tree view doesn't scroll into view when content
  overflows.

- Updated dependencies []:
  - @zag-js/anatomy@1.20.1
  - @zag-js/core@1.20.1
  - @zag-js/types@1.20.1
  - @zag-js/collection@1.20.1
  - @zag-js/utils@1.20.1
  - @zag-js/dom-query@1.20.1

## 1.20.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.20.0
  - @zag-js/core@1.20.0
  - @zag-js/types@1.20.0
  - @zag-js/collection@1.20.0
  - @zag-js/utils@1.20.0
  - @zag-js/dom-query@1.20.0

## 1.19.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.19.0
  - @zag-js/core@1.19.0
  - @zag-js/types@1.19.0
  - @zag-js/collection@1.19.0
  - @zag-js/utils@1.19.0
  - @zag-js/dom-query@1.19.0

## 1.18.5

### Patch Changes

- [`1b13205`](https://github.com/chakra-ui/zag/commit/1b1320589e8956afe7823aca3075f64574d7f8ad) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `onExpandedChange`, `onSelectionChange` and
  `onFocusChange` doesn't infer the tree node types

- [`59a7bfb`](https://github.com/chakra-ui/zag/commit/59a7bfb7215b4c9d13d11487f50ad852cd8347a9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue destructuring returned api could throw an ESLint
  `unbound-method` warning

- Updated dependencies []:
  - @zag-js/anatomy@1.18.5
  - @zag-js/core@1.18.5
  - @zag-js/types@1.18.5
  - @zag-js/collection@1.18.5
  - @zag-js/utils@1.18.5
  - @zag-js/dom-query@1.18.5

## 1.18.4

### Patch Changes

- Updated dependencies [[`8d0179b`](https://github.com/chakra-ui/zag/commit/8d0179b282dc6bedbd7d782192c82df872bf5697)]:
  - @zag-js/collection@1.18.4
  - @zag-js/anatomy@1.18.4
  - @zag-js/core@1.18.4
  - @zag-js/types@1.18.4
  - @zag-js/utils@1.18.4
  - @zag-js/dom-query@1.18.4

## 1.18.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.18.3
  - @zag-js/core@1.18.3
  - @zag-js/types@1.18.3
  - @zag-js/collection@1.18.3
  - @zag-js/utils@1.18.3
  - @zag-js/dom-query@1.18.3

## 1.18.2

### Patch Changes

- Updated dependencies [[`3b583f8`](https://github.com/chakra-ui/zag/commit/3b583f8e71dcf625d09d895f90e26e454b725cc5),
  [`11843e6`](https://github.com/chakra-ui/zag/commit/11843e6adf62b906006890c8003b38da2850c8ee)]:
  - @zag-js/collection@1.18.2
  - @zag-js/utils@1.18.2
  - @zag-js/core@1.18.2
  - @zag-js/anatomy@1.18.2
  - @zag-js/types@1.18.2
  - @zag-js/dom-query@1.18.2

## 1.18.1

### Patch Changes

- [`1da9046`](https://github.com/chakra-ui/zag/commit/1da90469c28d201f388cbdc1291034a5c1867060) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `id` in the tree node state

- Updated dependencies []:
  - @zag-js/anatomy@1.18.1
  - @zag-js/core@1.18.1
  - @zag-js/types@1.18.1
  - @zag-js/collection@1.18.1
  - @zag-js/utils@1.18.1
  - @zag-js/dom-query@1.18.1

## 1.18.0

### Patch Changes

- [`6092c58`](https://github.com/chakra-ui/zag/commit/6092c58dd37289debb54360038d7b77a58bcdc0f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Improve support for rendering tree items as links

- Updated dependencies []:
  - @zag-js/anatomy@1.18.0
  - @zag-js/core@1.18.0
  - @zag-js/types@1.18.0
  - @zag-js/collection@1.18.0
  - @zag-js/utils@1.18.0
  - @zag-js/dom-query@1.18.0

## 1.17.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.4
  - @zag-js/core@1.17.4
  - @zag-js/types@1.17.4
  - @zag-js/collection@1.17.4
  - @zag-js/utils@1.17.4
  - @zag-js/dom-query@1.17.4

## 1.17.3

### Patch Changes

- [`bc70411`](https://github.com/chakra-ui/zag/commit/bc7041187e5b8dc950c7e6b57aadc1e50b8a3850) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix tree traversal for querying last node.

- Updated dependencies [[`bc70411`](https://github.com/chakra-ui/zag/commit/bc7041187e5b8dc950c7e6b57aadc1e50b8a3850)]:
  - @zag-js/collection@1.17.3
  - @zag-js/anatomy@1.17.3
  - @zag-js/core@1.17.3
  - @zag-js/types@1.17.3
  - @zag-js/utils@1.17.3
  - @zag-js/dom-query@1.17.3

## 1.17.2

### Patch Changes

- [`2ce6e5c`](https://github.com/chakra-ui/zag/commit/2ce6e5c2296d07c16220eb85fbd720a5b33e1f48) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose node details in `onExpandChange`, `onSelectionChange` and
  `onFocusChange`

- Updated dependencies [[`2ce6e5c`](https://github.com/chakra-ui/zag/commit/2ce6e5c2296d07c16220eb85fbd720a5b33e1f48)]:
  - @zag-js/collection@1.17.2
  - @zag-js/anatomy@1.17.2
  - @zag-js/core@1.17.2
  - @zag-js/types@1.17.2
  - @zag-js/utils@1.17.2
  - @zag-js/dom-query@1.17.2

## 1.17.1

### Patch Changes

- [`05084b6`](https://github.com/chakra-ui/zag/commit/05084b68ac69a0cee4d4b532beba454ed9336d5f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Fix issue where clicking a branch with indeterminate state
  doesn't check its child nodes.
  - Remove `aria-busy` attribute from branch trigger when not loading children.
- Updated dependencies [[`4b6302f`](https://github.com/chakra-ui/zag/commit/4b6302fc9104f1ae8cd89a0f0157884fb775a65a)]:
  - @zag-js/anatomy@1.17.1
  - @zag-js/core@1.17.1
  - @zag-js/types@1.17.1
  - @zag-js/collection@1.17.1
  - @zag-js/utils@1.17.1
  - @zag-js/dom-query@1.17.1

## 1.17.0

### Minor Changes

- [`f4015be`](https://github.com/chakra-ui/zag/commit/f4015becaf1eab89db527df2cd3c16332ef0bdfb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `getItemCheckboxProps` to `getNodeCheckboxProps` since it
  can be used in both items and branches

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.17.0
  - @zag-js/core@1.17.0
  - @zag-js/types@1.17.0
  - @zag-js/collection@1.17.0
  - @zag-js/utils@1.17.0
  - @zag-js/dom-query@1.17.0

## 1.16.0

### Minor Changes

- [`f0545c6`](https://github.com/chakra-ui/zag/commit/f0545c61ef151e5e4480b0cc1d7401dda4653094) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Add support for checkbox state for checkbox trees via
  `defaultCheckedValue`, `checkedValue`, `onCheckedChange` props
  - Add callback for when `loadChildren` fails via `onLoadChildrenError` prop
  - Add `api.getCheckedMap` method to get the checked state of all nodes

- [`075404e`](https://github.com/chakra-ui/zag/commit/075404e6f3722522fc50f790f9498601b94e2e15) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where `api.collapse` and `api.deselect` throws error
  when called without arguments

### Patch Changes

- Updated dependencies [[`f0545c6`](https://github.com/chakra-ui/zag/commit/f0545c61ef151e5e4480b0cc1d7401dda4653094),
  [`6f6c8f3`](https://github.com/chakra-ui/zag/commit/6f6c8f329d9eb9d9889eff4317c84a4f41d4bfb2)]:
  - @zag-js/collection@1.16.0
  - @zag-js/types@1.16.0
  - @zag-js/dom-query@1.16.0
  - @zag-js/core@1.16.0
  - @zag-js/anatomy@1.16.0
  - @zag-js/utils@1.16.0

## 1.15.7

### Patch Changes

- Updated dependencies [[`3de5dd0`](https://github.com/chakra-ui/zag/commit/3de5dd059f847bd68cafaae230e706783ff43dc6)]:
  - @zag-js/collection@1.15.7
  - @zag-js/anatomy@1.15.7
  - @zag-js/core@1.15.7
  - @zag-js/types@1.15.7
  - @zag-js/utils@1.15.7
  - @zag-js/dom-query@1.15.7

## 1.15.6

### Patch Changes

- Updated dependencies [[`bb9b1e1`](https://github.com/chakra-ui/zag/commit/bb9b1e128ee9ff6318bbbbb2505c192435f05d1e)]:
  - @zag-js/collection@1.15.6
  - @zag-js/anatomy@1.15.6
  - @zag-js/core@1.15.6
  - @zag-js/types@1.15.6
  - @zag-js/utils@1.15.6
  - @zag-js/dom-query@1.15.6

## 1.15.5

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.5
  - @zag-js/core@1.15.5
  - @zag-js/types@1.15.5
  - @zag-js/collection@1.15.5
  - @zag-js/utils@1.15.5
  - @zag-js/dom-query@1.15.5

## 1.15.4

### Patch Changes

- Updated dependencies [[`e5f698d`](https://github.com/chakra-ui/zag/commit/e5f698d082ea8ae7f9f45958c4e319de7c7b6107)]:
  - @zag-js/dom-query@1.15.4
  - @zag-js/core@1.15.4
  - @zag-js/anatomy@1.15.4
  - @zag-js/types@1.15.4
  - @zag-js/collection@1.15.4
  - @zag-js/utils@1.15.4

## 1.15.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.3
  - @zag-js/core@1.15.3
  - @zag-js/types@1.15.3
  - @zag-js/collection@1.15.3
  - @zag-js/utils@1.15.3
  - @zag-js/dom-query@1.15.3

## 1.15.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.15.2
  - @zag-js/core@1.15.2
  - @zag-js/types@1.15.2
  - @zag-js/collection@1.15.2
  - @zag-js/utils@1.15.2
  - @zag-js/dom-query@1.15.2

## 1.15.1

### Patch Changes

- Updated dependencies [[`af01eeb`](https://github.com/chakra-ui/zag/commit/af01eebf013dd9c16821474a26d846f502530feb)]:
  - @zag-js/collection@1.15.1
  - @zag-js/anatomy@1.15.1
  - @zag-js/core@1.15.1
  - @zag-js/types@1.15.1
  - @zag-js/utils@1.15.1
  - @zag-js/dom-query@1.15.1

## 1.15.0

### Minor Changes

- [#2498](https://github.com/chakra-ui/zag/pull/2498)
  [`ce98b54`](https://github.com/chakra-ui/zag/commit/ce98b54a9cf6c241bc15ce5bbb017797438ecdc6) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add support lazy loading node children

### Patch Changes

- Updated dependencies [[`ce98b54`](https://github.com/chakra-ui/zag/commit/ce98b54a9cf6c241bc15ce5bbb017797438ecdc6)]:
  - @zag-js/collection@1.15.0
  - @zag-js/anatomy@1.15.0
  - @zag-js/core@1.15.0
  - @zag-js/types@1.15.0
  - @zag-js/utils@1.15.0
  - @zag-js/dom-query@1.15.0

## 1.14.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.14.0
  - @zag-js/core@1.14.0
  - @zag-js/types@1.14.0
  - @zag-js/collection@1.14.0
  - @zag-js/utils@1.14.0
  - @zag-js/dom-query@1.14.0

## 1.13.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.1
  - @zag-js/core@1.13.1
  - @zag-js/types@1.13.1
  - @zag-js/collection@1.13.1
  - @zag-js/utils@1.13.1
  - @zag-js/dom-query@1.13.1

## 1.13.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.13.0
  - @zag-js/core@1.13.0
  - @zag-js/types@1.13.0
  - @zag-js/collection@1.13.0
  - @zag-js/utils@1.13.0
  - @zag-js/dom-query@1.13.0

## 1.12.4

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.4
  - @zag-js/core@1.12.4
  - @zag-js/types@1.12.4
  - @zag-js/collection@1.12.4
  - @zag-js/utils@1.12.4
  - @zag-js/dom-query@1.12.4

## 1.12.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.3
  - @zag-js/core@1.12.3
  - @zag-js/types@1.12.3
  - @zag-js/collection@1.12.3
  - @zag-js/utils@1.12.3
  - @zag-js/dom-query@1.12.3

## 1.12.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.2
  - @zag-js/core@1.12.2
  - @zag-js/types@1.12.2
  - @zag-js/collection@1.12.2
  - @zag-js/utils@1.12.2
  - @zag-js/dom-query@1.12.2

## 1.12.1

### Patch Changes

- Updated dependencies [[`eb31845`](https://github.com/chakra-ui/zag/commit/eb318457bea7f7a2dc3a219f463dcd74f8acd49e)]:
  - @zag-js/collection@1.12.1
  - @zag-js/anatomy@1.12.1
  - @zag-js/core@1.12.1
  - @zag-js/types@1.12.1
  - @zag-js/utils@1.12.1
  - @zag-js/dom-query@1.12.1

## 1.12.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.12.0
  - @zag-js/core@1.12.0
  - @zag-js/types@1.12.0
  - @zag-js/collection@1.12.0
  - @zag-js/utils@1.12.0
  - @zag-js/dom-query@1.12.0

## 1.11.0

### Patch Changes

- Updated dependencies [[`a2ee03f`](https://github.com/chakra-ui/zag/commit/a2ee03f8a6fd7bd7baf4143ecda2efe5cff5a860)]:
  - @zag-js/collection@1.11.0
  - @zag-js/anatomy@1.11.0
  - @zag-js/core@1.11.0
  - @zag-js/types@1.11.0
  - @zag-js/utils@1.11.0
  - @zag-js/dom-query@1.11.0

## 1.10.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.10.0
  - @zag-js/core@1.10.0
  - @zag-js/types@1.10.0
  - @zag-js/collection@1.10.0
  - @zag-js/utils@1.10.0
  - @zag-js/dom-query@1.10.0

## 1.9.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.3
  - @zag-js/core@1.9.3
  - @zag-js/types@1.9.3
  - @zag-js/collection@1.9.3
  - @zag-js/utils@1.9.3
  - @zag-js/dom-query@1.9.3

## 1.9.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.2
  - @zag-js/core@1.9.2
  - @zag-js/types@1.9.2
  - @zag-js/collection@1.9.2
  - @zag-js/utils@1.9.2
  - @zag-js/dom-query@1.9.2

## 1.9.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.9.1
  - @zag-js/core@1.9.1
  - @zag-js/types@1.9.1
  - @zag-js/collection@1.9.1
  - @zag-js/utils@1.9.1
  - @zag-js/dom-query@1.9.1

## 1.9.0

### Patch Changes

- Updated dependencies [[`490dd9f`](https://github.com/chakra-ui/zag/commit/490dd9fa6355eb25c6bbb77406cae24835453af5)]:
  - @zag-js/collection@1.9.0
  - @zag-js/anatomy@1.9.0
  - @zag-js/core@1.9.0
  - @zag-js/types@1.9.0
  - @zag-js/utils@1.9.0
  - @zag-js/dom-query@1.9.0

## 1.8.2

### Patch Changes

- Updated dependencies [[`25d93b8`](https://github.com/chakra-ui/zag/commit/25d93b8be12e8df26ed04c5d298c66f54910fe85)]:
  - @zag-js/dom-query@1.8.2
  - @zag-js/core@1.8.2
  - @zag-js/anatomy@1.8.2
  - @zag-js/types@1.8.2
  - @zag-js/collection@1.8.2
  - @zag-js/utils@1.8.2

## 1.8.1

### Patch Changes

- Updated dependencies [[`c3c1642`](https://github.com/chakra-ui/zag/commit/c3c164296cd643f2fb7c12c0d1fe9c406eba352f)]:
  - @zag-js/dom-query@1.8.1
  - @zag-js/core@1.8.1
  - @zag-js/anatomy@1.8.1
  - @zag-js/types@1.8.1
  - @zag-js/collection@1.8.1
  - @zag-js/utils@1.8.1

## 1.8.0

### Patch Changes

- Updated dependencies [[`0cb6c0e`](https://github.com/chakra-ui/zag/commit/0cb6c0e70193b8a30c17c96f2b739be215f266ed),
  [`66f7828`](https://github.com/chakra-ui/zag/commit/66f7828541102fcf4f0fba05bb241e20a5ed45cb)]:
  - @zag-js/collection@1.8.0
  - @zag-js/core@1.8.0
  - @zag-js/anatomy@1.8.0
  - @zag-js/types@1.8.0
  - @zag-js/utils@1.8.0
  - @zag-js/dom-query@1.8.0

## 1.7.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.7.0
  - @zag-js/core@1.7.0
  - @zag-js/types@1.7.0
  - @zag-js/collection@1.7.0
  - @zag-js/utils@1.7.0
  - @zag-js/dom-query@1.7.0

## 1.6.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.2
  - @zag-js/core@1.6.2
  - @zag-js/types@1.6.2
  - @zag-js/collection@1.6.2
  - @zag-js/utils@1.6.2
  - @zag-js/dom-query@1.6.2

## 1.6.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.1
  - @zag-js/core@1.6.1
  - @zag-js/types@1.6.1
  - @zag-js/collection@1.6.1
  - @zag-js/utils@1.6.1
  - @zag-js/dom-query@1.6.1

## 1.6.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.6.0
  - @zag-js/core@1.6.0
  - @zag-js/types@1.6.0
  - @zag-js/collection@1.6.0
  - @zag-js/utils@1.6.0
  - @zag-js/dom-query@1.6.0

## 1.5.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.5.0
  - @zag-js/core@1.5.0
  - @zag-js/types@1.5.0
  - @zag-js/collection@1.5.0
  - @zag-js/utils@1.5.0
  - @zag-js/dom-query@1.5.0

## 1.4.2

### Patch Changes

- Updated dependencies [[`469d927`](https://github.com/chakra-ui/zag/commit/469d927388e32ebafb8db22f6ad199b15b65b0bb)]:
  - @zag-js/collection@1.4.2
  - @zag-js/anatomy@1.4.2
  - @zag-js/core@1.4.2
  - @zag-js/types@1.4.2
  - @zag-js/utils@1.4.2
  - @zag-js/dom-query@1.4.2

## 1.4.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.1
  - @zag-js/core@1.4.1
  - @zag-js/types@1.4.1
  - @zag-js/collection@1.4.1
  - @zag-js/utils@1.4.1
  - @zag-js/dom-query@1.4.1

## 1.4.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.4.0
  - @zag-js/core@1.4.0
  - @zag-js/types@1.4.0
  - @zag-js/collection@1.4.0
  - @zag-js/utils@1.4.0
  - @zag-js/dom-query@1.4.0

## 1.3.3

### Patch Changes

- Updated dependencies [[`66ba41b`](https://github.com/chakra-ui/zag/commit/66ba41bb10b232ff08e3cfbfc6cbf2a1c7449e21)]:
  - @zag-js/utils@1.3.3
  - @zag-js/core@1.3.3
  - @zag-js/collection@1.3.3
  - @zag-js/anatomy@1.3.3
  - @zag-js/types@1.3.3
  - @zag-js/dom-query@1.3.3

## 1.3.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.2
  - @zag-js/core@1.3.2
  - @zag-js/types@1.3.2
  - @zag-js/collection@1.3.2
  - @zag-js/utils@1.3.2
  - @zag-js/dom-query@1.3.2

## 1.3.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.3.1
  - @zag-js/core@1.3.1
  - @zag-js/types@1.3.1
  - @zag-js/collection@1.3.1
  - @zag-js/utils@1.3.1
  - @zag-js/dom-query@1.3.1

## 1.3.0

### Patch Changes

- [`01566a1`](https://github.com/chakra-ui/zag/commit/01566a171ef426410b29b881fe1014bd26c2f86f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where machines that hold complex objects

- Updated dependencies []:
  - @zag-js/anatomy@1.3.0
  - @zag-js/core@1.3.0
  - @zag-js/types@1.3.0
  - @zag-js/collection@1.3.0
  - @zag-js/utils@1.3.0
  - @zag-js/dom-query@1.3.0

## 1.2.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.1
  - @zag-js/core@1.2.1
  - @zag-js/types@1.2.1
  - @zag-js/collection@1.2.1
  - @zag-js/utils@1.2.1
  - @zag-js/dom-query@1.2.1

## 1.2.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.2.0
  - @zag-js/core@1.2.0
  - @zag-js/types@1.2.0
  - @zag-js/collection@1.2.0
  - @zag-js/utils@1.2.0
  - @zag-js/dom-query@1.2.0

## 1.1.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@1.1.0
  - @zag-js/core@1.1.0
  - @zag-js/types@1.1.0
  - @zag-js/collection@1.1.0
  - @zag-js/utils@1.1.0
  - @zag-js/dom-query@1.1.0

## 1.0.2

### Patch Changes

- Updated dependencies [[`2fdf79c`](https://github.com/chakra-ui/zag/commit/2fdf79c82a5cbfa876adc858886ce22b8b52d8fb)]:
  - @zag-js/collection@1.0.2
  - @zag-js/anatomy@1.0.2
  - @zag-js/core@1.0.2
  - @zag-js/types@1.0.2
  - @zag-js/utils@1.0.2
  - @zag-js/dom-query@1.0.2

## 1.0.1

### Patch Changes

- [`9883753`](https://github.com/chakra-ui/zag/commit/98837532c3b9c3f3698eee4e158e4318194361f6) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `<component>.Machine` type to help when typecasting generic
  components like combobox and select.

  Here's an example of the combobox component:

  ```ts
  interface Item {
    code: string
    label: string
  }

  const service = useMachine(combobox.machine as combobox.Machine<Item>, {
    id: useId(),
    collection,
  })
  ```

- Updated dependencies []:
  - @zag-js/anatomy@1.0.1
  - @zag-js/core@1.0.1
  - @zag-js/types@1.0.1
  - @zag-js/collection@1.0.1
  - @zag-js/utils@1.0.1
  - @zag-js/dom-query@1.0.1

## 1.0.0

### Patch Changes

- Updated dependencies [[`b1caa44`](https://github.com/chakra-ui/zag/commit/b1caa44085e7f1da0ad24fc7b25178081811646c)]:
  - @zag-js/core@1.0.0
  - @zag-js/anatomy@1.0.0
  - @zag-js/types@1.0.0
  - @zag-js/collection@1.0.0
  - @zag-js/utils@1.0.0
  - @zag-js/dom-query@1.0.0

## 0.82.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.2
  - @zag-js/core@0.82.2
  - @zag-js/types@0.82.2
  - @zag-js/collection@0.82.2
  - @zag-js/utils@0.82.2
  - @zag-js/dom-query@0.82.2

## 0.82.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.1
  - @zag-js/core@0.82.1
  - @zag-js/types@0.82.1
  - @zag-js/collection@0.82.1
  - @zag-js/utils@0.82.1
  - @zag-js/dom-query@0.82.1

## 0.82.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.82.0
  - @zag-js/core@0.82.0
  - @zag-js/types@0.82.0
  - @zag-js/collection@0.82.0
  - @zag-js/utils@0.82.0
  - @zag-js/dom-query@0.82.0

## 0.81.2

### Patch Changes

- Updated dependencies [[`e9313a3`](https://github.com/chakra-ui/zag/commit/e9313a3663285a05c9ac9ac92f1c09fcb27ac818)]:
  - @zag-js/dom-query@0.81.2
  - @zag-js/anatomy@0.81.2
  - @zag-js/core@0.81.2
  - @zag-js/types@0.81.2
  - @zag-js/collection@0.81.2
  - @zag-js/utils@0.81.2

## 0.81.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.81.1
  - @zag-js/core@0.81.1
  - @zag-js/types@0.81.1
  - @zag-js/collection@0.81.1
  - @zag-js/utils@0.81.1
  - @zag-js/dom-query@0.81.1

## 0.81.0

### Patch Changes

- [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor and streamline packages

- Updated dependencies [[`2e4ae72`](https://github.com/chakra-ui/zag/commit/2e4ae729818cd334d9cfe4ddb15c14dc2aabb6bb),
  [`792939f`](https://github.com/chakra-ui/zag/commit/792939f9d9eac5a97cc46f1b0ab286666ba1edd8),
  [`552e55d`](https://github.com/chakra-ui/zag/commit/552e55db4ec8c0fa86c5b7e5ce3ad08eb350ca68)]:
  - @zag-js/collection@0.81.0
  - @zag-js/dom-query@0.81.0
  - @zag-js/types@0.81.0
  - @zag-js/anatomy@0.81.0
  - @zag-js/core@0.81.0
  - @zag-js/utils@0.81.0

## 0.80.0

### Patch Changes

- Updated dependencies [[`d7617d1`](https://github.com/chakra-ui/zag/commit/d7617d1d95f93b3557eb88ba879737894da42d51)]:
  - @zag-js/dom-query@0.80.0
  - @zag-js/dom-event@0.80.0
  - @zag-js/anatomy@0.80.0
  - @zag-js/core@0.80.0
  - @zag-js/types@0.80.0
  - @zag-js/collection@0.80.0
  - @zag-js/utils@0.80.0

## 0.79.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.3
  - @zag-js/core@0.79.3
  - @zag-js/types@0.79.3
  - @zag-js/collection@0.79.3
  - @zag-js/utils@0.79.3
  - @zag-js/dom-event@0.79.3
  - @zag-js/dom-query@0.79.3

## 0.79.2

### Patch Changes

- Updated dependencies [[`525e645`](https://github.com/chakra-ui/zag/commit/525e645404f56c10919cc9d36279044dff253a08)]:
  - @zag-js/dom-query@0.79.2
  - @zag-js/dom-event@0.79.2
  - @zag-js/anatomy@0.79.2
  - @zag-js/core@0.79.2
  - @zag-js/types@0.79.2
  - @zag-js/collection@0.79.2
  - @zag-js/utils@0.79.2

## 0.79.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.1
  - @zag-js/core@0.79.1
  - @zag-js/types@0.79.1
  - @zag-js/collection@0.79.1
  - @zag-js/utils@0.79.1
  - @zag-js/dom-event@0.79.1
  - @zag-js/dom-query@0.79.1

## 0.79.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.79.0
  - @zag-js/core@0.79.0
  - @zag-js/types@0.79.0
  - @zag-js/collection@0.79.0
  - @zag-js/utils@0.79.0
  - @zag-js/dom-event@0.79.0
  - @zag-js/dom-query@0.79.0

## 0.78.3

### Patch Changes

- Updated dependencies [[`5584a83`](https://github.com/chakra-ui/zag/commit/5584a833151ee9f2c2ef9c07b6d699addfbca18e)]:
  - @zag-js/core@0.78.3
  - @zag-js/anatomy@0.78.3
  - @zag-js/types@0.78.3
  - @zag-js/collection@0.78.3
  - @zag-js/utils@0.78.3
  - @zag-js/dom-event@0.78.3
  - @zag-js/dom-query@0.78.3

## 0.78.2

### Patch Changes

- Updated dependencies [[`ce85272`](https://github.com/chakra-ui/zag/commit/ce85272c3d64dd4c7bae911ec4e4b813234850c2)]:
  - @zag-js/dom-query@0.78.2
  - @zag-js/dom-event@0.78.2
  - @zag-js/anatomy@0.78.2
  - @zag-js/core@0.78.2
  - @zag-js/types@0.78.2
  - @zag-js/collection@0.78.2
  - @zag-js/utils@0.78.2

## 0.78.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.1
  - @zag-js/core@0.78.1
  - @zag-js/types@0.78.1
  - @zag-js/collection@0.78.1
  - @zag-js/utils@0.78.1
  - @zag-js/dom-event@0.78.1
  - @zag-js/dom-query@0.78.1

## 0.78.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.78.0
  - @zag-js/core@0.78.0
  - @zag-js/types@0.78.0
  - @zag-js/collection@0.78.0
  - @zag-js/utils@0.78.0
  - @zag-js/dom-event@0.78.0
  - @zag-js/dom-query@0.78.0

## 0.77.1

### Patch Changes

- [`da4bdce`](https://github.com/chakra-ui/zag/commit/da4bdcece6bbe746975d822a035ff4a314bea996) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Add `data-*` attributes to branch content

- Updated dependencies []:
  - @zag-js/anatomy@0.77.1
  - @zag-js/core@0.77.1
  - @zag-js/types@0.77.1
  - @zag-js/collection@0.77.1
  - @zag-js/utils@0.77.1
  - @zag-js/dom-event@0.77.1
  - @zag-js/dom-query@0.77.1

## 0.77.0

### Minor Changes

- [`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Refactor treeview to use the new tree collection for better
  rendering and logic management.

### Patch Changes

- Updated dependencies [[`a2af4ad`](https://github.com/chakra-ui/zag/commit/a2af4adc6a0d9438e025eadd12eb7eb513131a90)]:
  - @zag-js/collection@0.77.0
  - @zag-js/dom-query@0.77.0
  - @zag-js/utils@0.77.0
  - @zag-js/dom-event@0.77.0
  - @zag-js/core@0.77.0
  - @zag-js/anatomy@0.77.0
  - @zag-js/types@0.77.0

## 0.76.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.76.0
  - @zag-js/core@0.76.0
  - @zag-js/types@0.76.0
  - @zag-js/utils@0.76.0
  - @zag-js/dom-event@0.76.0
  - @zag-js/dom-query@0.76.0

## 0.75.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.75.0
  - @zag-js/core@0.75.0
  - @zag-js/types@0.75.0
  - @zag-js/utils@0.75.0
  - @zag-js/dom-event@0.75.0
  - @zag-js/dom-query@0.75.0

## 0.74.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.2
  - @zag-js/core@0.74.2
  - @zag-js/types@0.74.2
  - @zag-js/utils@0.74.2
  - @zag-js/dom-event@0.74.2
  - @zag-js/dom-query@0.74.2

## 0.74.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.1
  - @zag-js/core@0.74.1
  - @zag-js/types@0.74.1
  - @zag-js/utils@0.74.1
  - @zag-js/dom-event@0.74.1
  - @zag-js/dom-query@0.74.1

## 0.74.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.74.0
  - @zag-js/core@0.74.0
  - @zag-js/types@0.74.0
  - @zag-js/utils@0.74.0
  - @zag-js/dom-event@0.74.0
  - @zag-js/dom-query@0.74.0

## 0.73.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.1
  - @zag-js/core@0.73.1
  - @zag-js/types@0.73.1
  - @zag-js/utils@0.73.1
  - @zag-js/dom-event@0.73.1
  - @zag-js/dom-query@0.73.1

## 0.73.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.73.0
  - @zag-js/core@0.73.0
  - @zag-js/types@0.73.0
  - @zag-js/utils@0.73.0
  - @zag-js/dom-event@0.73.0
  - @zag-js/dom-query@0.73.0

## 0.72.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.72.0
  - @zag-js/core@0.72.0
  - @zag-js/types@0.72.0
  - @zag-js/utils@0.72.0
  - @zag-js/dom-event@0.72.0
  - @zag-js/dom-query@0.72.0

## 0.71.0

### Minor Changes

- [`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - We no longer ship `src` files in the packages.

### Patch Changes

- Updated dependencies [[`b3a251e`](https://github.com/chakra-ui/zag/commit/b3a251e5e10b9b27af353e0f41117329846b14e9)]:
  - @zag-js/core@0.71.0
  - @zag-js/anatomy@0.71.0
  - @zag-js/types@0.71.0
  - @zag-js/utils@0.71.0
  - @zag-js/dom-event@0.71.0
  - @zag-js/dom-query@0.71.0

## 0.70.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.70.0
  - @zag-js/core@0.70.0
  - @zag-js/types@0.70.0
  - @zag-js/utils@0.70.0
  - @zag-js/dom-event@0.70.0
  - @zag-js/dom-query@0.70.0

## 0.69.0

### Patch Changes

- Updated dependencies [[`bf57d7b`](https://github.com/chakra-ui/zag/commit/bf57d7b3933daf9974eaefc443da6f3c37706bb4)]:
  - @zag-js/dom-event@0.69.0
  - @zag-js/dom-query@0.69.0
  - @zag-js/anatomy@0.69.0
  - @zag-js/core@0.69.0
  - @zag-js/types@0.69.0
  - @zag-js/utils@0.69.0

## 0.68.1

### Patch Changes

- [`cafa231`](https://github.com/chakra-ui/zag/commit/cafa2316112cd86f88306bfd1656ba250a782a45) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where programmatic selection does not account for
  singular selection

- Updated dependencies []:
  - @zag-js/anatomy@0.68.1
  - @zag-js/core@0.68.1
  - @zag-js/types@0.68.1
  - @zag-js/utils@0.68.1
  - @zag-js/dom-event@0.68.1
  - @zag-js/dom-query@0.68.1

## 0.68.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.68.0
  - @zag-js/core@0.68.0
  - @zag-js/types@0.68.0
  - @zag-js/utils@0.68.0
  - @zag-js/dom-event@0.68.0
  - @zag-js/dom-query@0.68.0

## 0.67.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.67.0
  - @zag-js/core@0.67.0
  - @zag-js/types@0.67.0
  - @zag-js/utils@0.67.0
  - @zag-js/dom-event@0.67.0
  - @zag-js/dom-query@0.67.0

## 0.66.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.1
  - @zag-js/core@0.66.1
  - @zag-js/types@0.66.1
  - @zag-js/utils@0.66.1
  - @zag-js/dom-event@0.66.1
  - @zag-js/dom-query@0.66.1

## 0.66.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.66.0
  - @zag-js/core@0.66.0
  - @zag-js/types@0.66.0
  - @zag-js/utils@0.66.0
  - @zag-js/dom-event@0.66.0
  - @zag-js/dom-query@0.66.0

## 0.65.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.1
  - @zag-js/core@0.65.1
  - @zag-js/types@0.65.1
  - @zag-js/utils@0.65.1
  - @zag-js/dom-event@0.65.1
  - @zag-js/dom-query@0.65.1

## 0.65.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.65.0
  - @zag-js/core@0.65.0
  - @zag-js/types@0.65.0
  - @zag-js/utils@0.65.0
  - @zag-js/dom-event@0.65.0
  - @zag-js/dom-query@0.65.0

## 0.64.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.64.0
  - @zag-js/core@0.64.0
  - @zag-js/types@0.64.0
  - @zag-js/utils@0.64.0
  - @zag-js/dom-event@0.64.0
  - @zag-js/dom-query@0.64.0

## 0.63.0

### Patch Changes

- Updated dependencies [[`ca437b9`](https://github.com/chakra-ui/zag/commit/ca437b94b49760742bad69aa57a3d6527219782a)]:
  - @zag-js/dom-query@0.63.0
  - @zag-js/dom-event@0.63.0
  - @zag-js/anatomy@0.63.0
  - @zag-js/core@0.63.0
  - @zag-js/types@0.63.0
  - @zag-js/utils@0.63.0

## 0.62.1

### Patch Changes

- Updated dependencies [[`5644790`](https://github.com/chakra-ui/zag/commit/564479081d37cd06bc38043fccf9c229379a1531)]:
  - @zag-js/core@0.62.1
  - @zag-js/anatomy@0.62.1
  - @zag-js/types@0.62.1
  - @zag-js/utils@0.62.1
  - @zag-js/dom-event@0.62.1
  - @zag-js/dom-query@0.62.1

## 0.62.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.62.0
  - @zag-js/core@0.62.0
  - @zag-js/types@0.62.0
  - @zag-js/utils@0.62.0
  - @zag-js/dom-event@0.62.0
  - @zag-js/dom-query@0.62.0

## 0.61.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.1
  - @zag-js/core@0.61.1
  - @zag-js/types@0.61.1
  - @zag-js/utils@0.61.1
  - @zag-js/dom-event@0.61.1
  - @zag-js/dom-query@0.61.1

## 0.61.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.61.0
  - @zag-js/core@0.61.0
  - @zag-js/types@0.61.0
  - @zag-js/utils@0.61.0
  - @zag-js/dom-event@0.61.0
  - @zag-js/dom-query@0.61.0

## 0.60.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.60.0
  - @zag-js/anatomy@0.60.0
  - @zag-js/types@0.60.0
  - @zag-js/utils@0.60.0
  - @zag-js/dom-event@0.60.0
  - @zag-js/dom-query@0.60.0

## 0.59.0

### Patch Changes

- [`0188938`](https://github.com/chakra-ui/zag/commit/01889388bae27a432104554dba7ab35c2eef96c7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where inputs could not be used within tree

- Updated dependencies []:
  - @zag-js/anatomy@0.59.0
  - @zag-js/core@0.59.0
  - @zag-js/types@0.59.0
  - @zag-js/utils@0.59.0
  - @zag-js/dom-event@0.59.0
  - @zag-js/dom-query@0.59.0

## 0.58.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.3
  - @zag-js/core@0.58.3
  - @zag-js/types@0.58.3
  - @zag-js/utils@0.58.3
  - @zag-js/dom-event@0.58.3
  - @zag-js/dom-query@0.58.3

## 0.58.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.58.2
  - @zag-js/core@0.58.2
  - @zag-js/types@0.58.2
  - @zag-js/utils@0.58.2
  - @zag-js/dom-event@0.58.2
  - @zag-js/dom-query@0.58.2

## 0.58.1

### Patch Changes

- [`fe9671e`](https://github.com/chakra-ui/zag/commit/fe9671e093733f43798212cc69847266f27e1d3f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where some api methods throw due to `Array <> Proxy`
  inconsistencies

- Updated dependencies []:
  - @zag-js/anatomy@0.58.1
  - @zag-js/core@0.58.1
  - @zag-js/types@0.58.1
  - @zag-js/utils@0.58.1
  - @zag-js/dom-event@0.58.1
  - @zag-js/dom-query@0.58.1

## 0.58.0

### Minor Changes

- [`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Ensure consistent application of form related properties like
  `invalid`, `required`, and `readOnly`
  - Export `Service` from all machines for use in Lit based components.

### Patch Changes

- Updated dependencies [[`9216a62`](https://github.com/chakra-ui/zag/commit/9216a625e1be9f7dd169501515297a8214f12b93)]:
  - @zag-js/dom-query@0.58.0
  - @zag-js/dom-event@0.58.0
  - @zag-js/anatomy@0.58.0
  - @zag-js/core@0.58.0
  - @zag-js/types@0.58.0
  - @zag-js/utils@0.58.0

## 0.57.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.57.0
  - @zag-js/core@0.57.0
  - @zag-js/types@0.57.0
  - @zag-js/utils@0.57.0
  - @zag-js/dom-event@0.57.0
  - @zag-js/dom-query@0.57.0

## 0.56.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.1
  - @zag-js/core@0.56.1
  - @zag-js/types@0.56.1
  - @zag-js/utils@0.56.1
  - @zag-js/dom-event@0.56.1
  - @zag-js/dom-query@0.56.1

## 0.56.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.56.0
  - @zag-js/core@0.56.0
  - @zag-js/types@0.56.0
  - @zag-js/utils@0.56.0
  - @zag-js/dom-event@0.56.0
  - @zag-js/dom-query@0.56.0

## 0.55.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.55.0
  - @zag-js/core@0.55.0
  - @zag-js/types@0.55.0
  - @zag-js/utils@0.55.0
  - @zag-js/dom-event@0.55.0
  - @zag-js/dom-query@0.55.0

## 0.54.0

### Patch Changes

- Updated dependencies [[`590c177`](https://github.com/chakra-ui/zag/commit/590c1779f5208fb99114c872175e779508f2f96d)]:
  - @zag-js/core@0.54.0
  - @zag-js/anatomy@0.54.0
  - @zag-js/types@0.54.0
  - @zag-js/utils@0.54.0
  - @zag-js/dom-event@0.54.0
  - @zag-js/dom-query@0.54.0

## 0.53.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.53.0
  - @zag-js/core@0.53.0
  - @zag-js/types@0.53.0
  - @zag-js/utils@0.53.0
  - @zag-js/dom-event@0.53.0
  - @zag-js/dom-query@0.53.0

## 0.52.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.52.0
  - @zag-js/core@0.52.0
  - @zag-js/types@0.52.0
  - @zag-js/utils@0.52.0
  - @zag-js/dom-event@0.52.0
  - @zag-js/dom-query@0.52.0

## 0.51.2

### Patch Changes

- [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where keydown event might not fire in React due to
  `nativeEvent` currentTarget not been set sometimes.

- Updated dependencies [[`62eb21b`](https://github.com/chakra-ui/zag/commit/62eb21b60355dd0645936baf4692315134e7488c),
  [`70c2108`](https://github.com/chakra-ui/zag/commit/70c2108928746583687ac50ec51bc701c217ffdc)]:
  - @zag-js/core@0.51.2
  - @zag-js/dom-event@0.51.2
  - @zag-js/dom-query@0.51.2
  - @zag-js/anatomy@0.51.2
  - @zag-js/types@0.51.2
  - @zag-js/utils@0.51.2

## 0.51.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.1
  - @zag-js/core@0.51.1
  - @zag-js/types@0.51.1
  - @zag-js/utils@0.51.1
  - @zag-js/dom-event@0.51.1
  - @zag-js/dom-query@0.51.1

## 0.51.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.51.0
  - @zag-js/core@0.51.0
  - @zag-js/types@0.51.0
  - @zag-js/utils@0.51.0
  - @zag-js/dom-event@0.51.0
  - @zag-js/dom-query@0.51.0

## 0.50.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.50.0
  - @zag-js/core@0.50.0
  - @zag-js/types@0.50.0
  - @zag-js/utils@0.50.0
  - @zag-js/dom-event@0.50.0
  - @zag-js/dom-query@0.50.0

## 0.49.0

### Minor Changes

- [`9b379db`](https://github.com/chakra-ui/zag/commit/9b379db27efa01207772551d95995a28d9ad206f) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Rename `data-docused` to `data-focus` for consistency

### Patch Changes

- Updated dependencies []:
  - @zag-js/core@0.49.0
  - @zag-js/anatomy@0.49.0
  - @zag-js/types@0.49.0
  - @zag-js/utils@0.49.0
  - @zag-js/dom-event@0.49.0
  - @zag-js/dom-query@0.49.0

## 0.48.0

### Minor Changes

- [`c7b781c`](https://github.com/chakra-ui/zag/commit/c7b781c937378dcf45f07e8333360d913fc9f8f1) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Rename some properties for better consistency:
  - `id` -> `value`
  - `expandedIds` -> `expandedValue`
  - `selectedIds` -> `selectedValue`

- [#1435](https://github.com/chakra-ui/zag/pull/1435)
  [`23ed828`](https://github.com/chakra-ui/zag/commit/23ed8283e8190fc9fb6496f4ba8c5eff78bda2d7) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - - Rename `api.getItemState` properties
  - `isDisabled` -> `disabled`
  - `isFocused` -> `focused`
  - `isSelected` -> `selected`
  - Rename `api.getBranchState` properties
    - `isExpanded` -> `expanded`

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.48.0
  - @zag-js/core@0.48.0
  - @zag-js/types@0.48.0
  - @zag-js/utils@0.48.0
  - @zag-js/dom-event@0.48.0
  - @zag-js/dom-query@0.48.0

## 0.47.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.47.0
  - @zag-js/core@0.47.0
  - @zag-js/types@0.47.0
  - @zag-js/utils@0.47.0
  - @zag-js/dom-event@0.47.0
  - @zag-js/dom-query@0.47.0
  - @zag-js/mutation-observer@0.47.0

## 0.46.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.46.0
  - @zag-js/core@0.46.0
  - @zag-js/types@0.46.0
  - @zag-js/utils@0.46.0
  - @zag-js/dom-event@0.46.0
  - @zag-js/dom-query@0.46.0
  - @zag-js/mutation-observer@0.46.0

## 0.45.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.45.0
  - @zag-js/core@0.45.0
  - @zag-js/types@0.45.0
  - @zag-js/utils@0.45.0
  - @zag-js/dom-event@0.45.0
  - @zag-js/dom-query@0.45.0
  - @zag-js/mutation-observer@0.45.0

## 0.44.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.44.0
  - @zag-js/core@0.44.0
  - @zag-js/types@0.44.0
  - @zag-js/utils@0.44.0
  - @zag-js/dom-event@0.44.0
  - @zag-js/dom-query@0.44.0
  - @zag-js/mutation-observer@0.44.0

## 0.43.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.43.0
  - @zag-js/core@0.43.0
  - @zag-js/types@0.43.0
  - @zag-js/utils@0.43.0
  - @zag-js/dom-event@0.43.0
  - @zag-js/dom-query@0.43.0
  - @zag-js/mutation-observer@0.43.0

## 0.42.0

### Patch Changes

- Updated dependencies [[`6122eee`](https://github.com/chakra-ui/zag/commit/6122eee55632899cbaa3cb5505625a25df57f7ce)]:
  - @zag-js/dom-event@0.42.0
  - @zag-js/anatomy@0.42.0
  - @zag-js/core@0.42.0
  - @zag-js/types@0.42.0
  - @zag-js/utils@0.42.0
  - @zag-js/dom-query@0.42.0
  - @zag-js/mutation-observer@0.42.0

## 0.41.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.41.0
  - @zag-js/core@0.41.0
  - @zag-js/types@0.41.0
  - @zag-js/utils@0.41.0
  - @zag-js/dom-event@0.41.0
  - @zag-js/dom-query@0.41.0
  - @zag-js/mutation-observer@0.41.0

## 0.40.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.40.0
  - @zag-js/core@0.40.0
  - @zag-js/types@0.40.0
  - @zag-js/utils@0.40.0
  - @zag-js/dom-event@0.40.0
  - @zag-js/dom-query@0.40.0
  - @zag-js/mutation-observer@0.40.0

## 0.39.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.39.0
  - @zag-js/core@0.39.0
  - @zag-js/types@0.39.0
  - @zag-js/utils@0.39.0
  - @zag-js/dom-event@0.39.0
  - @zag-js/dom-query@0.39.0
  - @zag-js/mutation-observer@0.39.0

## 0.38.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.1
  - @zag-js/core@0.38.1
  - @zag-js/types@0.38.1
  - @zag-js/utils@0.38.1
  - @zag-js/dom-event@0.38.1
  - @zag-js/dom-query@0.38.1
  - @zag-js/mutation-observer@0.38.1

## 0.38.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.38.0
  - @zag-js/core@0.38.0
  - @zag-js/types@0.38.0
  - @zag-js/utils@0.38.0
  - @zag-js/dom-event@0.38.0
  - @zag-js/dom-query@0.38.0
  - @zag-js/mutation-observer@0.38.0

## 0.37.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.3
  - @zag-js/core@0.37.3
  - @zag-js/types@0.37.3
  - @zag-js/utils@0.37.3
  - @zag-js/dom-event@0.37.3
  - @zag-js/dom-query@0.37.3
  - @zag-js/mutation-observer@0.37.3

## 0.37.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.37.2
  - @zag-js/core@0.37.2
  - @zag-js/types@0.37.2
  - @zag-js/utils@0.37.2
  - @zag-js/dom-event@0.37.2
  - @zag-js/dom-query@0.37.2
  - @zag-js/mutation-observer@0.37.2

## 0.37.1

### Patch Changes

- [`d9d5263`](https://github.com/chakra-ui/zag/commit/d9d52636fbd3a731a4764b865ac82afd4f163baf) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Expose `splitProps` function to improve DX of creating custom
  components on top of Zag.js

- Updated dependencies []:
  - @zag-js/anatomy@0.37.1
  - @zag-js/core@0.37.1
  - @zag-js/types@0.37.1
  - @zag-js/utils@0.37.1
  - @zag-js/dom-event@0.37.1
  - @zag-js/dom-query@0.37.1
  - @zag-js/mutation-observer@0.37.1

## 0.37.0

### Minor Changes

- [`4a7d739`](https://github.com/chakra-ui/zag/commit/4a7d73970df14a27473c3dda44f7fb24ef236ebb) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Change value type for `expandedIds` and `selectedIds` from
  `Set<string>` to `string[]`

### Patch Changes

- [`025b98f`](https://github.com/chakra-ui/zag/commit/025b98fbe41980c19e7d96ed2a4d18012bf5cc7d) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Add missing getBranchIndicator fn

- [`d90da1c`](https://github.com/chakra-ui/zag/commit/d90da1cb825964a5ad80f2e2ac7cdc47d0293ff1) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Allow users to open links in tree view

- Updated dependencies [[`2a024fb`](https://github.com/chakra-ui/zag/commit/2a024fbd2e98343218d4d658e91f1d8c751e1a4d)]:
  - @zag-js/types@0.37.0
  - @zag-js/dom-event@0.37.0
  - @zag-js/anatomy@0.37.0
  - @zag-js/core@0.37.0
  - @zag-js/utils@0.37.0
  - @zag-js/dom-query@0.37.0
  - @zag-js/mutation-observer@0.37.0

## 0.36.3

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.3
  - @zag-js/core@0.36.3
  - @zag-js/types@0.36.3
  - @zag-js/utils@0.36.3
  - @zag-js/dom-event@0.36.3
  - @zag-js/dom-query@0.36.3
  - @zag-js/mutation-observer@0.36.3

## 0.36.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.2
  - @zag-js/core@0.36.2
  - @zag-js/types@0.36.2
  - @zag-js/utils@0.36.2
  - @zag-js/dom-event@0.36.2
  - @zag-js/dom-query@0.36.2
  - @zag-js/mutation-observer@0.36.2

## 0.36.1

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.1
  - @zag-js/core@0.36.1
  - @zag-js/types@0.36.1
  - @zag-js/utils@0.36.1
  - @zag-js/dom-event@0.36.1
  - @zag-js/dom-query@0.36.1
  - @zag-js/mutation-observer@0.36.1

## 0.36.0

### Minor Changes

- [`6671d75`](https://github.com/chakra-ui/zag/commit/6671d7539a647827e685b235d72aec477cc51765) Thanks
  [@cschroeter](https://github.com/cschroeter)! - Extend tree view parts

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.36.0
  - @zag-js/core@0.36.0
  - @zag-js/types@0.36.0
  - @zag-js/utils@0.36.0
  - @zag-js/dom-event@0.36.0
  - @zag-js/dom-query@0.36.0
  - @zag-js/mutation-observer@0.36.0

## 0.35.0

### Patch Changes

- Updated dependencies [[`0216161`](https://github.com/chakra-ui/zag/commit/0216161fd3d429409abc96941d33a0c333ef8d36)]:
  - @zag-js/core@0.35.0
  - @zag-js/anatomy@0.35.0
  - @zag-js/types@0.35.0
  - @zag-js/utils@0.35.0
  - @zag-js/dom-event@0.35.0
  - @zag-js/dom-query@0.35.0
  - @zag-js/mutation-observer@0.35.0

## 0.34.0

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.34.0
  - @zag-js/core@0.34.0
  - @zag-js/types@0.34.0
  - @zag-js/utils@0.34.0
  - @zag-js/dom-event@0.34.0
  - @zag-js/dom-query@0.34.0
  - @zag-js/mutation-observer@0.34.0

## 0.33.2

### Patch Changes

- Updated dependencies []:
  - @zag-js/anatomy@0.33.2
  - @zag-js/core@0.33.2
  - @zag-js/types@0.33.2
  - @zag-js/utils@0.33.2
  - @zag-js/dom-event@0.33.2
  - @zag-js/dom-query@0.33.2
  - @zag-js/mutation-observer@0.33.2

## 0.33.1

### Patch Changes

- [`0f4dc57`](https://github.com/chakra-ui/zag/commit/0f4dc57a872f5e7be15f72b7e0c508285d481257) Thanks
  [@segunadebayo](https://github.com/segunadebayo)! - Fix issue where tree view machine types were not exported.

- Updated dependencies []:
  - @zag-js/core@0.33.1
  - @zag-js/anatomy@0.33.1
  - @zag-js/types@0.33.1
  - @zag-js/utils@0.33.1
  - @zag-js/dom-event@0.33.1
  - @zag-js/dom-query@0.33.1
  - @zag-js/mutation-observer@0.33.1

## 0.33.0

### Patch Changes

- Updated dependencies [[`7872cdf`](https://github.com/chakra-ui/zag/commit/7872cdf8aeb28b9a30cd4a016bd12e5366054511)]:
  - @zag-js/core@0.33.0
  - @zag-js/anatomy@0.33.0
  - @zag-js/types@0.33.0
  - @zag-js/utils@0.33.0
  - @zag-js/dom-event@0.33.0
  - @zag-js/dom-query@0.33.0
  - @zag-js/mutation-observer@0.33.0
