import { formatHotkey } from "../src/format"
import type { FormatHotkeyOptions } from "../src/format"

describe("formatHotkey / Windows", () => {
  const windowsOptions: FormatHotkeyOptions = { platform: "windows" }

  it("basic modifiers / Control+S", () => {
    expect(formatHotkey("Control+S", windowsOptions)).toBe("Ctrl S")
  })

  it("basic modifiers / Alt+T", () => {
    expect(formatHotkey("Alt+T", windowsOptions)).toBe("Alt T")
  })

  it("basic modifiers / Shift+Enter", () => {
    expect(formatHotkey("Shift+Enter", windowsOptions)).toBe("Shift ↵")
  })

  it("basic modifiers / Meta+V", () => {
    expect(formatHotkey("Meta+V", windowsOptions)).toBe("Win V")
  })

  it("combined modifiers / Control+Alt+S", () => {
    expect(formatHotkey("Control+Alt+S", windowsOptions)).toBe("Ctrl Alt S")
  })

  it("combined modifiers / Control+Shift+T", () => {
    expect(formatHotkey("Control+Shift+T", windowsOptions)).toBe("Ctrl Shift T")
  })

  it("combined modifiers / Alt+Shift+Delete", () => {
    expect(formatHotkey("Alt+Shift+Delete", windowsOptions)).toBe("Alt Shift ⌦")
  })

  it("special keys / arrow keys", () => {
    expect(formatHotkey("Control+ArrowUp", windowsOptions)).toBe("Ctrl ↑")
    expect(formatHotkey("Alt+ArrowDown", windowsOptions)).toBe("Alt ↓")
    expect(formatHotkey("Shift+ArrowLeft", windowsOptions)).toBe("Shift ←")
    expect(formatHotkey("Control+ArrowRight", windowsOptions)).toBe("Ctrl →")
  })

  it("special keys / navigation keys", () => {
    expect(formatHotkey("Control+Home", windowsOptions)).toBe("Ctrl Home")
    expect(formatHotkey("Control+End", windowsOptions)).toBe("Ctrl End")
    expect(formatHotkey("Alt+PageUp", windowsOptions)).toBe("Alt PageUp")
    expect(formatHotkey("Alt+PageDown", windowsOptions)).toBe("Alt PageDown")
  })

  it("special keys / function keys", () => {
    expect(formatHotkey("F1", windowsOptions)).toBe("F1")
    expect(formatHotkey("Control+F12", windowsOptions)).toBe("Ctrl F12")
    expect(formatHotkey("Alt+Shift+F5", windowsOptions)).toBe("Alt Shift F5")
  })

  it("special characters / plus key", () => {
    expect(formatHotkey("Control++", windowsOptions)).toBe("Ctrl +")
  })

  it("special characters / minus key", () => {
    expect(formatHotkey("Control+-", windowsOptions)).toBe("Ctrl -")
  })

  it("special characters / equals key", () => {
    expect(formatHotkey("Control+=", windowsOptions)).toBe("Ctrl =")
  })

  it("special characters / bracket keys", () => {
    expect(formatHotkey("Control+[", windowsOptions)).toBe("Ctrl [")
    expect(formatHotkey("Control+]", windowsOptions)).toBe("Ctrl ]")
  })

  it("mod key / mod+S", () => {
    expect(formatHotkey("mod+S", windowsOptions)).toBe("Ctrl S")
  })

  it("mod key / mod+Shift+T", () => {
    expect(formatHotkey("mod+Shift+T", windowsOptions)).toBe("Ctrl Shift T")
  })
})

describe("formatHotkey / Mac", () => {
  const macOptions: FormatHotkeyOptions = { platform: "mac" }

  it("basic modifiers / Control+S", () => {
    expect(formatHotkey("Control+S", macOptions)).toBe("⌃ S")
  })

  it("basic modifiers / Alt+T", () => {
    expect(formatHotkey("Alt+T", macOptions)).toBe("⌥ T")
  })

  it("basic modifiers / Shift+Enter", () => {
    expect(formatHotkey("Shift+Enter", macOptions)).toBe("⇧ ↵")
  })

  it("basic modifiers / Meta+V", () => {
    expect(formatHotkey("Meta+V", macOptions)).toBe("⌘ V")
  })

  it("combined modifiers / Control+Alt+S", () => {
    expect(formatHotkey("Control+Alt+S", macOptions)).toBe("⌃ ⌥ S")
  })

  it("combined modifiers / Control+Shift+T", () => {
    expect(formatHotkey("Control+Shift+T", macOptions)).toBe("⌃ ⇧ T")
  })

  it("combined modifiers / Alt+Shift+Delete", () => {
    expect(formatHotkey("Alt+Shift+Delete", macOptions)).toBe("⌥ ⇧ ⌦")
  })

  it("special keys / arrow keys", () => {
    expect(formatHotkey("Control+ArrowUp", macOptions)).toBe("⌃ ↑")
    expect(formatHotkey("Alt+ArrowDown", macOptions)).toBe("⌥ ↓")
    expect(formatHotkey("Shift+ArrowLeft", macOptions)).toBe("⇧ ←")
    expect(formatHotkey("Control+ArrowRight", macOptions)).toBe("⌃ →")
  })

  it("special keys / navigation keys", () => {
    expect(formatHotkey("Control+Home", macOptions)).toBe("⌃ Home")
    expect(formatHotkey("Control+End", macOptions)).toBe("⌃ End")
    expect(formatHotkey("Alt+PageUp", macOptions)).toBe("⌥ PageUp")
    expect(formatHotkey("Alt+PageDown", macOptions)).toBe("⌥ PageDown")
  })

  it("special keys / function keys", () => {
    expect(formatHotkey("F1", macOptions)).toBe("F1")
    expect(formatHotkey("Control+F12", macOptions)).toBe("⌃ F12")
    expect(formatHotkey("Alt+Shift+F5", macOptions)).toBe("⌥ ⇧ F5")
  })

  it("mod key / mod+S", () => {
    expect(formatHotkey("mod+S", macOptions)).toBe("⌘ S")
  })

  it("mod key / mod+Shift+T", () => {
    expect(formatHotkey("mod+Shift+T", macOptions)).toBe("⇧ ⌘ T")
  })
})

describe("formatHotkey / styles / symbols", () => {
  const options: FormatHotkeyOptions = { platform: "windows", style: "symbols" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl ↑")
  })

  it("Control+Enter", () => {
    expect(formatHotkey("Control+Enter", options)).toBe("Ctrl ↵")
  })

  it("Control+Space", () => {
    expect(formatHotkey("Control+Space", options)).toBe("Ctrl ␣")
  })
})

describe("formatHotkey / styles / text", () => {
  const options: FormatHotkeyOptions = { platform: "windows", style: "text" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl Up")
  })

  it("Control+Enter", () => {
    expect(formatHotkey("Control+Enter", options)).toBe("Ctrl Enter")
  })

  it("Control+Space", () => {
    expect(formatHotkey("Control+Space", options)).toBe("Ctrl Space")
  })
})

describe("formatHotkey / styles / mixed / Mac", () => {
  const options: FormatHotkeyOptions = { platform: "mac", style: "mixed" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("⌃ S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("⌃ ↑")
  })
})

describe("formatHotkey / Windows / basic", () => {
  const options: FormatHotkeyOptions = { platform: "windows" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Alt+T", () => {
    expect(formatHotkey("Alt+T", options)).toBe("Alt T")
  })

  it("Shift+Enter", () => {
    expect(formatHotkey("Shift+Enter", options)).toBe("Shift ↵")
  })

  it("Meta+V", () => {
    expect(formatHotkey("Meta+V", options)).toBe("Win V")
  })

  it("Control+Alt+S", () => {
    expect(formatHotkey("Control+Alt+S", options)).toBe("Ctrl Alt S")
  })

  it("Control+Shift+T", () => {
    expect(formatHotkey("Control+Shift+T", options)).toBe("Ctrl Shift T")
  })

  it("Alt+Shift+Delete", () => {
    expect(formatHotkey("Alt+Shift+Delete", options)).toBe("Alt Shift ⌦")
  })

  it("arrow keys", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl ↑")
    expect(formatHotkey("Alt+ArrowDown", options)).toBe("Alt ↓")
    expect(formatHotkey("Shift+ArrowLeft", options)).toBe("Shift ←")
    expect(formatHotkey("Control+ArrowRight", options)).toBe("Ctrl →")
  })

  it("navigation keys", () => {
    expect(formatHotkey("Control+Home", options)).toBe("Ctrl Home")
    expect(formatHotkey("Control+End", options)).toBe("Ctrl End")
    expect(formatHotkey("Alt+PageUp", options)).toBe("Alt PageUp")
    expect(formatHotkey("Alt+PageDown", options)).toBe("Alt PageDown")
  })

  it("function keys", () => {
    expect(formatHotkey("F1", options)).toBe("F1")
    expect(formatHotkey("Control+F12", options)).toBe("Ctrl F12")
    expect(formatHotkey("Alt+Shift+F5", options)).toBe("Alt Shift F5")
  })

  it("special characters", () => {
    expect(formatHotkey("Control++", options)).toBe("Ctrl +")
    expect(formatHotkey("Control+-", options)).toBe("Ctrl -")
    expect(formatHotkey("Control+=", options)).toBe("Ctrl =")
    expect(formatHotkey("Control+[", options)).toBe("Ctrl [")
    expect(formatHotkey("Control+]", options)).toBe("Ctrl ]")
  })

  it("mod key", () => {
    expect(formatHotkey("mod+S", options)).toBe("Ctrl S")
    expect(formatHotkey("mod+Shift+T", options)).toBe("Ctrl Shift T")
  })

  it("sequences / Control+X > Control+V", () => {
    expect(formatHotkey("Control+X > Control+V", options)).toBe("Ctrl X then Ctrl V")
  })

  it("sequences / complex / Control+A > Control+C > Control+V", () => {
    expect(formatHotkey("Control+A > Control+C > Control+V", options)).toBe("Ctrl A then Ctrl C then Ctrl V")
  })

  it("edge cases / empty string", () => {
    expect(formatHotkey("", options)).toBe("")
  })

  it("edge cases / single key A", () => {
    expect(formatHotkey("A", options)).toBe("A")
  })

  it("edge cases / single key Enter", () => {
    expect(formatHotkey("Enter", options)).toBe("↵")
  })

  it("edge cases / whitespace", () => {
    expect(formatHotkey("  Control+S  ", options)).toBe("Ctrl S")
  })

  it("useShortNames / default", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })
})

describe("formatHotkey / Mac / basic", () => {
  const options: FormatHotkeyOptions = { platform: "mac" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("⌃ S")
  })

  it("Alt+T", () => {
    expect(formatHotkey("Alt+T", options)).toBe("⌥ T")
  })

  it("Shift+Enter", () => {
    expect(formatHotkey("Shift+Enter", options)).toBe("⇧ ↵")
  })

  it("Meta+V", () => {
    expect(formatHotkey("Meta+V", options)).toBe("⌘ V")
  })

  it("Control+Alt+S", () => {
    expect(formatHotkey("Control+Alt+S", options)).toBe("⌃ ⌥ S")
  })

  it("Control+Shift+T", () => {
    expect(formatHotkey("Control+Shift+T", options)).toBe("⌃ ⇧ T")
  })

  it("Alt+Shift+Delete", () => {
    expect(formatHotkey("Alt+Shift+Delete", options)).toBe("⌥ ⇧ ⌦")
  })

  it("arrow keys", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("⌃ ↑")
    expect(formatHotkey("Alt+ArrowDown", options)).toBe("⌥ ↓")
    expect(formatHotkey("Shift+ArrowLeft", options)).toBe("⇧ ←")
    expect(formatHotkey("Control+ArrowRight", options)).toBe("⌃ →")
  })

  it("navigation keys", () => {
    expect(formatHotkey("Control+Home", options)).toBe("⌃ Home")
    expect(formatHotkey("Control+End", options)).toBe("⌃ End")
    expect(formatHotkey("Alt+PageUp", options)).toBe("⌥ PageUp")
    expect(formatHotkey("Alt+PageDown", options)).toBe("⌥ PageDown")
  })

  it("function keys", () => {
    expect(formatHotkey("F1", options)).toBe("F1")
    expect(formatHotkey("Control+F12", options)).toBe("⌃ F12")
    expect(formatHotkey("Alt+Shift+F5", options)).toBe("⌥ ⇧ F5")
  })

  it("mod key", () => {
    expect(formatHotkey("mod+S", options)).toBe("⌘ S")
    expect(formatHotkey("mod+Shift+T", options)).toBe("⇧ ⌘ T")
  })

  it("sequences / Control+X > Control+V", () => {
    expect(formatHotkey("Control+X > Control+V", options)).toBe("⌃ X then ⌃ V")
  })
})

describe("formatHotkey / styles / symbols", () => {
  const options: FormatHotkeyOptions = { platform: "windows", style: "symbols" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl ↑")
  })

  it("Control+Enter", () => {
    expect(formatHotkey("Control+Enter", options)).toBe("Ctrl ↵")
  })

  it("Control+Space", () => {
    expect(formatHotkey("Control+Space", options)).toBe("Ctrl ␣")
  })
})

describe("formatHotkey / styles / text", () => {
  const options: FormatHotkeyOptions = { platform: "windows", style: "text" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl Up")
  })

  it("Control+Enter", () => {
    expect(formatHotkey("Control+Enter", options)).toBe("Ctrl Enter")
  })

  it("Control+Space", () => {
    expect(formatHotkey("Control+Space", options)).toBe("Ctrl Space")
  })
})

describe("formatHotkey / styles / mixed / Mac", () => {
  const options: FormatHotkeyOptions = { platform: "mac", style: "mixed" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("⌃ S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("⌃ ↑")
  })
})

describe("formatHotkey / styles / mixed / Windows", () => {
  const options: FormatHotkeyOptions = { platform: "windows", style: "mixed" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })

  it("Control+ArrowUp", () => {
    expect(formatHotkey("Control+ArrowUp", options)).toBe("Ctrl ↑")
  })
})

describe("formatHotkey / sequences / custom separator", () => {
  const options: FormatHotkeyOptions = { platform: "windows", sequenceSeparator: " → " }

  it("Control+X > Control+V", () => {
    expect(formatHotkey("Control+X > Control+V", options)).toBe("Ctrl X → Ctrl V")
  })
})

describe("formatHotkey / custom separators / plus", () => {
  const options: FormatHotkeyOptions = { platform: "windows", separator: "+" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl+S")
  })

  it("Control+Alt+S", () => {
    expect(formatHotkey("Control+Alt+S", options)).toBe("Ctrl+Alt+S")
  })
})

describe("formatHotkey / custom separators / dash", () => {
  const options: FormatHotkeyOptions = { platform: "windows", separator: "-" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl-S")
  })
})

describe("formatHotkey / custom separators / empty", () => {
  const options: FormatHotkeyOptions = { platform: "windows", separator: "" }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("CtrlS")
  })
})

describe("formatHotkey / edge cases / auto platform detection", () => {
  it("Control+S", () => {
    expect(() => formatHotkey("Control+S")).not.toThrow()
    expect(typeof formatHotkey("Control+S")).toBe("string")
  })
})

describe("formatHotkey / useShortNames / Windows / false", () => {
  const options: FormatHotkeyOptions = { platform: "windows", useShortNames: false }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })
})

describe("formatHotkey / useShortNames / Mac / false", () => {
  const options: FormatHotkeyOptions = { platform: "mac", useShortNames: false }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("⌃ S")
  })
})

describe("formatHotkey / useShortNames / Linux / false", () => {
  const options: FormatHotkeyOptions = { platform: "linux", useShortNames: false }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })
})

describe("formatHotkey / useShortNames / Linux / true", () => {
  const options: FormatHotkeyOptions = { platform: "linux", useShortNames: true }

  it("Control+S", () => {
    expect(formatHotkey("Control+S", options)).toBe("Ctrl S")
  })
})
