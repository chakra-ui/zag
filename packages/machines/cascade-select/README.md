# @zag-js/cascade-select

Core logic for the cascade select widget implemented as a state machine

A comprehensive state machine for building cascade select (cascading dropdowns) components with hierarchical data
navigation.

## Features

### 🌳 **Hierarchical Data Support**

- Navigate through nested data structures (continents → countries → states)
- Support for unlimited depth levels
- Dynamic level generation based on data structure
- Efficient tree collection management

### ⌨️ **Full Keyboard Navigation**

- **Arrow keys**: Navigate between items and levels
- **Home/End**: Jump to first/last item at any level
- **Enter/Space**: Select items or navigate into children
- **Escape**: Close dropdown and return focus
- **Arrow Left/Right**: Navigate between parent and child levels

### 🎯 **Flexible Selection Modes**

- **Single selection**: Choose one complete path
- **Multiple selection**: Select multiple paths simultaneously
- **Parent selection**: Allow selection of non-leaf items (optional)
- **Leaf-only selection**: Restrict selection to final items only

### 🎨 **Interaction Models**

- **Click highlighting**: Navigate by clicking items
- **Hover highlighting**: Navigate by mouse hover with grace areas
- **Mixed interaction**: Combine click and hover behaviors
- **Touch-friendly**: Optimized for mobile interactions

### ♿ **Accessibility Built-in**

- **ARIA compliance**: Proper roles, states, and properties
- **Screen reader support**: Descriptive labels and live regions
- **Focus management**: Logical tab order and focus restoration
- **Keyboard-only operation**: Complete functionality without mouse

### 🎛️ **Customizable Behavior**

- **Auto-close options**: Control when dropdown closes after selection
- **Custom separators**: Configure path display formatting
- **Disabled items**: Mark items as non-selectable
- **Read-only mode**: Display-only state
- **Loop navigation**: Circular navigation within levels

### 📱 **UI Integration**

- **Positioning system**: Intelligent dropdown placement with collision detection
- **Scroll management**: Auto-scroll highlighted items into view
- **Level indicators**: Visual representation of navigation depth
- **Loading states**: Handle async data loading
- **Empty states**: Graceful handling of empty data sets

### 🔧 **Developer Experience**

- **Event callbacks**: onChange, onHighlight, onOpen/Close events
- **Custom formatting**: Control display text and value representation
- **Form integration**: Works with native form elements and validation
- **TypeScript support**: Full type safety for data structures

## Common Use Cases

- **Geographic selection**: Country → State → City
- **Category browsing**: Department → Category → Subcategory → Product
- **Organizational hierarchy**: Company → Division → Team → Employee
- **File system navigation**: Folder → Subfolder → File
- **Menu systems**: Main Menu → Submenu → Action

## Installation

```sh
yarn add @zag-js/cascade-select
# or
npm i @zag-js/cascade-select
```

## Contribution

Yes please! See the [contributing guidelines](https://github.com/chakra-ui/zag/blob/main/CONTRIBUTING.md) for details.

## Licence

This project is licensed under the terms of the [MIT license](https://github.com/chakra-ui/zag/blob/main/LICENSE).
