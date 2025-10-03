# Zag.js Playwright Testing Guide

This guide explains how to write E2E tests for Zag.js components using Playwright.

## Overview

Zag.js uses Playwright for end-to-end testing with a Model-based pattern (Page Object Model). Tests verify:

- Accessibility (ARIA attributes, keyboard navigation)
- User interactions (click, drag, keyboard)
- State transitions
- Cross-framework compatibility

## Test File Structure

Tests are located in `e2e/` directory:

```
e2e/
├── _utils.ts                    # Shared utilities
├── models/
│   ├── model.ts                 # Base model class
│   ├── bottom-sheet.model.ts    # Component-specific model
│   └── dialog.model.ts
├── bottom-sheet.e2e.ts          # Test file
├── dialog.e2e.ts
└── ...
```

## Basic Test File Pattern

```typescript
import { expect, test } from "@playwright/test"
import { BottomSheetModel } from "./models/bottom-sheet.model"

let I: BottomSheetModel

test.describe("bottom-sheet", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto()
  })

  test("should have no accessibility violations", async () => {
    await I.clickTrigger()
    await I.checkAccessibility()
  })

  test("should open when trigger is clicked", async () => {
    await I.clickTrigger()
    await I.seeContent()
    await I.seeBackdrop()
  })

  test("should close on escape", async () => {
    await I.clickTrigger()
    await I.pressKey("Escape")
    await I.dontSeeContent()
    await I.seeTriggerIsFocused()
  })
})
```

## Page Object Model Pattern

### Creating a Model Class

Models extend the base `Model` class and encapsulate page interactions:

```typescript
import { expect, type Page } from "@playwright/test"
import { a11y, part, swipe } from "../_utils"
import { Model } from "./model"

const content = part("content")
const trigger = part("trigger")
const backdrop = part("backdrop")

export class BottomSheetModel extends Model {
  constructor(public page: Page) {
    super(page)
  }

  // Navigation
  goto(url = "/bottom-sheet") {
    return this.page.goto(url)
  }

  // Accessibility
  checkAccessibility() {
    return a11y(this.page, "[data-part=content]", ["scrollable-region-focusable"])
  }

  // Locators (private getters)
  private get trigger() {
    return this.page.locator(trigger)
  }

  private get content() {
    return this.page.locator(content)
  }

  private get backdrop() {
    return this.page.locator(backdrop)
  }

  // Actions
  clickTrigger() {
    return this.trigger.click()
  }

  dragGrabber(direction: "up" | "down", distance: number = 100, duration = 500) {
    return swipe(this.page, this.grabber, direction, distance, duration)
  }

  // Assertions
  seeContent() {
    return expect(this.content).toBeVisible()
  }

  dontSeeContent() {
    return expect(this.content).not.toBeVisible()
  }

  seeTriggerIsFocused() {
    return expect(this.trigger).toBeFocused()
  }
}
```

### Model Method Naming Conventions

Use descriptive, action-oriented names:

- **Actions**: `clickTrigger()`, `dragGrabber()`, `typeInInput()`
- **Assertions**: `seeContent()`, `dontSeeBackdrop()`, `seeContentIsFocused()`
- **Getters**: `getContentHeight()`, `getActiveIndex()`
- **Checks**: `checkAccessibility()`, `isScrollableAtTop()`

## Utility Functions

### Part Selector

The `part()` helper creates selectors for component parts (from anatomy):

```typescript
import { part } from "../_utils"

const content = part("content") // => "[data-part=content]"
const trigger = part("trigger") // => "[data-part=trigger]"
```

### Accessibility Testing

The `a11y()` function runs axe-core accessibility checks:

```typescript
import { a11y } from "../_utils"

// Check accessibility of element
await a11y(page, "[data-part=content]")

// Disable specific rules
await a11y(page, "[data-part=content]", ["scrollable-region-focusable"])
```

**Common disabled rules:**

- `scrollable-region-focusable`: For scrollable regions without keyboard focus
- `color-contrast`: Automatically disabled (design-dependent)

### Swipe/Drag Utility

The `swipe()` function simulates drag gestures:

```typescript
import { swipe } from "../_utils"

// Swipe down 200px over 500ms
await swipe(page, locator, "down", 200, 500)

// Swipe up 100px over 300ms, without releasing
await swipe(page, locator, "up", 100, 300, false)
```

**Parameters:**

- `page`: Playwright page
- `locator`: Element to swipe on
- `direction`: "up" | "down" | "left" | "right"
- `distance`: Pixels to swipe (default: 100)
- `duration`: Animation duration in ms (default: 500)
- `release`: Whether to release pointer after swipe (default: true)

### Pointer Utilities

```typescript
import { pointer } from "../_utils"

// Pointer down
await pointer.down(element)

// Pointer up
await pointer.up(element)

// Pointer move
await pointer.move(element)
```

### Keyboard Utilities

From the base `Model` class:

```typescript
// Press a key once
await I.pressKey("Escape")

// Press multiple times
await I.pressKey("ArrowDown", 3)

// Type text
await I.type("Hello World")

// Move caret
await I.moveCaretTo(5)
```

### Wait Utilities

```typescript
// Wait for animations to complete
await I.waitForOpenState()

// Wait for specific time
await I.wait(500)

// Retry with backoff
import { retry } from "../_utils"

await retry(
  async () => {
    const value = await getSomeValue()
    expect(value).toBe(expected)
  },
  { maxAttempts: 3, delay: 100 },
)
```

## Common Test Patterns

### Testing Accessibility

Always include an accessibility test as the first test:

```typescript
test("should have no accessibility violations", async () => {
  await I.clickTrigger()
  await I.checkAccessibility()
})
```

### Testing Open/Close

```typescript
test("should open when trigger is clicked", async () => {
  await I.clickTrigger()
  await I.seeContent()
  await I.seeBackdrop()
})

test("should close when clicked outside", async () => {
  await I.clickTrigger()
  await I.seeContent()
  await I.clickOutside()
  await I.dontSeeContent()
})

test("should close on escape", async () => {
  await I.clickTrigger()
  await I.pressKey("Escape")
  await I.dontSeeContent()
  await I.seeTriggerIsFocused()
})
```

### Testing Keyboard Navigation

```typescript
test("should navigate with arrow keys", async () => {
  await I.clickTrigger()
  await I.pressKey("ArrowDown")
  await I.seeFirstItemFocused()

  await I.pressKey("ArrowDown")
  await I.seeSecondItemFocused()
})
```

### Testing Drag Interactions

```typescript
test("should close when dragged down past threshold", async () => {
  await I.clickTrigger()
  await I.waitForOpenState()

  const initialHeight = await I.getContentVisibleHeight()
  const dragDistance = Math.floor(initialHeight * 0.3)

  await I.dragGrabber("down", dragDistance)
  await I.dontSeeContent()
})

test("should stay open when dragged slightly", async () => {
  await I.clickTrigger()
  await I.waitForOpenState()

  await I.dragGrabber("down", 100)
  await I.seeContent()
})
```

### Testing Controlled Components

```typescript
test("should sync with controlled prop", async () => {
  await I.goto("/bottom-sheet-controlled")

  // Initial state from prop
  await I.seeContent()

  // External control
  await I.clickControlButton("Close")
  await I.dontSeeContent()
})
```

### Testing Variants

Use `test.describe` blocks for different variants:

```typescript
test.describe("bottom-sheet [snapPoints]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-snap-points")
  })

  test("should snap to defined positions", async () => {
    await I.clickTrigger()
    await I.dragGrabber("down", 300)
    await I.waitForSnapComplete()

    const currentHeight = await I.getContentVisibleHeight()
    expect(currentHeight).toBe(250)
  })
})

test.describe("bottom-sheet [draggable=false]", () => {
  test.beforeEach(async ({ page }) => {
    I = new BottomSheetModel(page)
    await I.goto("/bottom-sheet-draggable-false")
  })

  test("sheet content should not be draggable", async () => {
    await I.clickTrigger()
    await I.waitForOpenState()

    const initialHeight = await I.getContentVisibleHeight()
    await I.dragContent("down", 100)
    const newHeight = await I.getContentVisibleHeight()

    expect(initialHeight - newHeight).toBe(0)
  })
})
```

## Advanced Model Methods

### Custom Getters

```typescript
async getContentVisibleHeight() {
  const isVisible = await this.content.isVisible()
  if (!isVisible) return 0

  const initialHeight = await this.content.evaluate((el) => el.clientHeight)

  const translateY = await this.content.evaluate((el) =>
    getComputedStyle(el).getPropertyValue("--bottom-sheet-translate"),
  )

  const parsedTranslateY = parseInt(translateY, 10)
  return initialHeight - (isNaN(parsedTranslateY) ? 0 : parsedTranslateY)
}
```

### Wait Methods

```typescript
async waitForOpenState() {
  // Wait for element to be visible
  await expect(this.content).toBeVisible()

  // Wait for animations to complete
  await this.content.evaluate((el) =>
    Promise.all(el.getAnimations().map((animation) => animation.finished))
  )
}

async waitForSnapComplete() {
  // Wait for snap animation/transition to complete after drag
  await this.content.evaluate((el) =>
    Promise.all([...el.getAnimations()].map((animation) => animation.finished))
  )
}
```

### Scroll Testing

```typescript
async isScrollableAtTop() {
  const scrollTop = await this.scrollable.evaluate((el) => el.scrollTop)
  return scrollTop === 0
}

scrollContent(distance: number) {
  return this.scrollable.evaluate((el, dist) => {
    el.scrollTop += dist
  }, distance)
}
```

## Writing Assertions

### Visibility Assertions

```typescript
// Element is visible
await expect(locator).toBeVisible()

// Element is not visible
await expect(locator).not.toBeVisible()

// Element is hidden (in DOM but not visible)
await expect(locator).toBeHidden()
```

### Focus Assertions

```typescript
// Element has focus
await expect(locator).toBeFocused()

// Element doesn't have focus
await expect(locator).not.toBeFocused()
```

### Attribute Assertions

```typescript
// Has attribute
await expect(locator).toHaveAttribute("data-state", "open")

// Has ARIA attribute
await expect(locator).toHaveAttribute("aria-expanded", "true")
```

### Value Assertions

```typescript
// Exact match
expect(value).toBe(expected)

// Close to (for floating point)
expect(value).toBeCloseTo(expected, 0)

// Greater than
expect(value).toBeGreaterThan(10)
```

### Custom Assertions in Models

```typescript
seeActiveIndex(index: number) {
  return retry(async () => {
    const activeIndex = await this.getActiveIndex()
    expect(activeIndex).toBe(index)
  })
}
```

## Running Tests

### Run All Tests

```bash
# All frameworks
pnpm test

# Specific framework
pnpm e2e-react
pnpm e2e-vue
pnpm e2e-solid
pnpm e2e-svelte
```

### Run Specific Test File

```bash
pnpm pw-test bottom-sheet.e2e.ts
```

### Run in UI Mode

```bash
pnpm pw-test --ui
```

### Run Specific Test

```typescript
// Use .only to run a single test
test.only("should close on escape", async () => {
  // ...
})

// Use .skip to skip a test
test.skip("should handle edge case", async () => {
  // ...
})
```

### Debug Tests

```bash
# Run with debug flag
pnpm pw-test bottom-sheet.e2e.ts --debug

# Use pause in test
test("should do something", async ({ page }) => {
  await I.clickTrigger()
  await page.pause() // Opens inspector
  await I.seeContent()
})
```

### View Test Reports

```bash
pnpm pw-report
```

## Configuration

Tests are configured in `playwright.config.ts`:

```typescript
export default defineConfig({
  testDir: "./e2e",
  use: {
    baseURL: "http://localhost:3000", // React example server
  },
  webServer: {
    command: "pnpm start-react",
    port: 3000,
  },
})
```

## Best Practices

### 1. Use the Model Pattern

Encapsulate all page interactions in model classes. Tests should read like natural language:

```typescript
// Good
await I.clickTrigger()
await I.seeContent()

// Bad
await page.locator("[data-part=trigger]").click()
await expect(page.locator("[data-part=content]")).toBeVisible()
```

### 2. Wait for Animations

Always wait for animations before assertions:

```typescript
await I.clickTrigger()
await I.waitForOpenState() // Wait for open animation
await I.seeContent()
```

### 3. Use Specific Selectors

Prefer `data-part` over CSS classes or text content:

```typescript
// Good
part("content")

// Avoid
;(".content-class")
```

### 4. Test Accessibility

Every component should have accessibility tests:

```typescript
test("should have no accessibility violations", async () => {
  await I.clickTrigger()
  await I.checkAccessibility()
})
```

### 5. Test Keyboard Interactions

Verify keyboard navigation and shortcuts:

```typescript
test("should navigate with keyboard", async () => {
  await I.pressKey("Tab")
  await I.seeTriggerIsFocused()

  await I.pressKey("Enter")
  await I.seeContent()

  await I.pressKey("Escape")
  await I.dontSeeContent()
})
```

### 6. Test Focus Management

Verify focus is restored correctly:

```typescript
test("should restore focus on close", async () => {
  await I.clickTrigger()
  await I.pressKey("Escape")
  await I.seeTriggerIsFocused()
})
```

### 7. Use Retry for Flaky Assertions

Wrap timing-sensitive assertions in retry:

```typescript
await retry(async () => {
  const height = await I.getContentHeight()
  expect(height).toBe(250)
})
```

### 8. Group Related Tests

Use `test.describe` to organize tests:

```typescript
test.describe("bottom-sheet", () => {
  test.describe("opening and closing", () => {
    // Open/close tests
  })

  test.describe("keyboard navigation", () => {
    // Keyboard tests
  })

  test.describe("drag interactions", () => {
    // Drag tests
  })
})
```

### 9. Test Cross-Framework

Run tests against all framework examples to ensure consistency:

```bash
pnpm e2e-react
pnpm e2e-vue
pnpm e2e-solid
pnpm e2e-svelte
```

### 10. Keep Tests Independent

Each test should be able to run in isolation:

```typescript
test.beforeEach(async ({ page }) => {
  I = new BottomSheetModel(page)
  await I.goto() // Fresh page for each test
})
```

## Troubleshooting

### Test Timing Issues

If tests are flaky due to timing:

1. Add proper waits:

```typescript
await I.waitForOpenState()
```

2. Use retry:

```typescript
await retry(async () => {
  await I.seeContent()
})
```

3. Increase timeout:

```typescript
test(
  "slow test",
  async () => {
    // ...
  },
  { timeout: 10000 },
)
```

### Element Not Found

If elements aren't found:

1. Check the selector:

```typescript
console.log(part("content")) // Verify selector format
```

2. Wait for element:

```typescript
await page.waitForSelector(part("content"))
```

3. Check the example page is correct:

```bash
# Visit manually
open http://localhost:3000/bottom-sheet
```

### Animation Issues

If tests fail due to animations:

1. Wait for animations:

```typescript
await element.evaluate((el) => Promise.all(el.getAnimations().map((animation) => animation.finished)))
```

2. Disable animations in test (if appropriate):

```typescript
await page.addStyleTag({
  content: "* { animation-duration: 0s !important; transition-duration: 0s !important; }",
})
```

## Common Test Scenarios

### Modal Dialog

```typescript
test("should trap focus", async () => {
  await I.clickTrigger()
  await I.pressKey("Tab")
  await I.seeFirstButtonFocused()
  await I.pressKey("Tab")
  await I.seeSecondButtonFocused()
  await I.pressKey("Tab")
  await I.seeFirstButtonFocused() // Focus wrapped
})
```

### Form Controls

```typescript
test("should update value on input", async () => {
  await I.clickInput()
  await I.type("test")
  await I.seeInputValue("test")
})
```

### Async Operations

```typescript
test("should load data", async () => {
  await I.clickLoadButton()
  await I.seeLoadingIndicator()
  await I.dontSeeLoadingIndicator()
  await I.seeData()
})
```
