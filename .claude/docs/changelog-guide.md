# Changelog Guide

Guidelines for writing changesets and changelog entries. Based on practices from GitHub, Raycast, Vercel, and Stripe.

## User Impact Over Implementation

Describe what users gain, not what changed in code.

- **Bad:** "Refactored toast props type extraction"
- **Good:** "Fix toast `parent` prop type (fixes #2983)"

## Be Concise

- One line when possible
- Skip filler ("We're excited to announce..."). Lead with the outcome.

## Structure

Group by impact when multiple changes:

1. Breaking changes (prefix with `Breaking:`)
2. New features
3. Fixes

## Link Context

Reference issues (`#123`), PRs, or docs when it helps users understand the change.

## User-Facing Only

Include only changes that affect users. Skip internal refactors, dependency updates, and changes users won't notice.
