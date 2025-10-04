---
"@zag-js/tree-view": minor
---

Add support for renaming tree node labels with validation and control features.

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
      <span {...api.getItemTextProps({ node, indexPath })} style={{ display: nodeState.renaming ? "none" : "inline" }}>
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
