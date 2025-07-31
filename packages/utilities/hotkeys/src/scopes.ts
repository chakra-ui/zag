import { getState } from "./state"
import type { RootNode } from "./types"

// Set active scopes for a root node
export function setScope(scopes: string | string[], getRootNode?: () => RootNode): void {
  const root = getRootNode ? getRootNode() : document
  const { activeScopes } = getState(root)

  activeScopes.clear()
  const scopeArray = Array.isArray(scopes) ? scopes : [scopes]
  scopeArray.forEach((scope) => activeScopes.add(scope))
}

// Add scope to active scopes
export function addScope(scope: string, getRootNode?: () => RootNode): void {
  const root = getRootNode ? getRootNode() : document
  const { activeScopes } = getState(root)
  activeScopes.add(scope)
}

// Remove scope from active scopes
export function removeScope(scope: string, getRootNode?: () => RootNode): void {
  const root = getRootNode ? getRootNode() : document
  const { activeScopes } = getState(root)
  activeScopes.delete(scope)

  // Ensure we always have at least the default scope
  if (activeScopes.size === 0) {
    activeScopes.add("*")
  }
}

// Get currently active scopes
export function getActiveScopes(getRootNode?: () => RootNode): readonly string[] {
  const root = getRootNode ? getRootNode() : document
  const { activeScopes } = getState(root)
  return Array.from(activeScopes)
}

// Check if a scope is currently active
export function isScopeActive(scope: string, getRootNode?: () => RootNode): boolean {
  const root = getRootNode ? getRootNode() : document
  const { activeScopes } = getState(root)
  return activeScopes.has(scope) || activeScopes.has("*")
}
