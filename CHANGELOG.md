# CHANGELOG

All notable changes to this project will be documented in this file.

> For v0.x changelog, see the [v0 branch](https://github.com/chakra-ui/zag/blob/v0/CHANGELOG.md)

## [Unreleased]

See the [Changesets](./.changeset) for the latest changes.

## [1.0.0](./#1.0.0) - 2025-02-22

- **Core**: Rewrite machines for increased performance and initial mount time. The results show roughly 1.5x - 4x
  performance improvements across components.

- **[Breaking] Toast**

  - Require the creation of a toast store using `createStore`
  - Solid.js: Require the usage of `<Key>` component to render toasts
