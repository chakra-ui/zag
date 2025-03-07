export function parseGuardCondition(condition: string): string {
  // Tokenize the input string
  const tokens: { type: "condition" | "bracket" | "name" | "comma" | "space"; value: string }[] = []

  let currentIndex = 0

  while (currentIndex < condition.length) {
    const char = condition[currentIndex]

    // Handle conditions (and, or, not)
    if (condition.substring(currentIndex).match(/^(and|or|not)(?=\(|\s)/)) {
      const match = condition.substring(currentIndex).match(/^(and|or|not)/)![0]
      tokens.push({ type: "condition", value: match })
      currentIndex += match.length
      continue
    }

    // Handle brackets
    if (char === "(" || char === ")") {
      tokens.push({ type: "bracket", value: char })
      currentIndex++
      continue
    }

    // Handle quoted strings
    if (char === '"') {
      const endQuoteIndex = condition.indexOf('"', currentIndex + 1)
      if (endQuoteIndex !== -1) {
        const quotedString = condition.substring(currentIndex, endQuoteIndex + 1)
        tokens.push({ type: "name", value: quotedString })
        currentIndex = endQuoteIndex + 1
        continue
      }
    }

    // Handle commas
    if (char === ",") {
      tokens.push({ type: "comma", value: char })
      currentIndex++
      continue
    }

    // Handle spaces
    if (char === " ") {
      tokens.push({ type: "space", value: char })
      currentIndex++
      continue
    }

    // Handle unquoted function arguments (likely identifiers)
    if (/[a-zA-Z0-9_]/.test(char)) {
      let identifier = ""
      let i = currentIndex

      while (i < condition.length && /[a-zA-Z0-9_]/.test(condition[i])) {
        identifier += condition[i]
        i++
      }

      tokens.push({ type: "name", value: `"${identifier}"` })
      currentIndex = i
      continue
    }

    // Skip unknown characters
    currentIndex++
  }

  // Convert tokens to HTML
  let html = ""

  for (const token of tokens) {
    switch (token.type) {
      case "condition":
        html += `<span class="condition">${token.value}</span>`
        break
      case "bracket":
        html += `<span class="bracket">${token.value}</span>`
        break
      case "name":
        html += `<span class="name">${token.value}</span>`
        break
      case "comma":
        html += token.value
        break
      case "space":
        html += token.value
        break
    }
  }

  return html
}
