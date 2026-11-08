<script setup lang="ts">
import * as clipboard from "@zag-js/clipboard"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { ClipboardCheck, ClipboardCopyIcon } from "lucide-vue-next"
import "@styles/clipboard.css"

const snippets = [
  { id: "install", title: "Install", code: "pnpm add @zag-js/clipboard" },
  {
    id: "import",
    title: "Import",
    code: 'import * as clipboard from "@zag-js/clipboard"',
  },
  {
    id: "usage",
    title: "Usage",
    code: "const service = useMachine(clipboard.machine, { id: useId() })\nconst api = clipboard.connect(service, normalizeProps)",
  },
]

const activeId = ref<string | null>(null)

const service = useMachine(clipboard.machine, {
  id: useId(),
  timeout: 1000,
})

const api = computed(() => clipboard.connect(service, normalizeProps))

const copy = (snippet: (typeof snippets)[number]) => {
  activeId.value = snippet.id
  api.value.setValue(snippet.code)
  api.value.copy()
}
</script>

<template>
  <main>
    <div class="code-blocks">
      <div v-bind="api.getRootProps()">
        <div v-for="snippet in snippets" :key="snippet.id" class="block">
          <div class="block-header">
            <strong>{{ snippet.title }}</strong>
            <button
              type="button"
              :data-testid="`copy-${snippet.id}`"
              :data-copied="api.copied && activeId === snippet.id ? '' : undefined"
              :aria-label="`${api.copied && activeId === snippet.id ? 'Copied!' : 'Copy'} ${snippet.title} snippet`"
              @click="copy(snippet)"
            >
              <ClipboardCheck v-if="api.copied && activeId === snippet.id" />
              <ClipboardCopyIcon v-else />
              <span>{{ api.copied && activeId === snippet.id ? "Copied!" : "Copy" }}</span>
            </button>
          </div>
          <pre :data-testid="`code-${snippet.id}`">{{ snippet.code }}</pre>
        </div>
      </div>
    </div>
  </main>

  <Toolbar>
    <StateVisualizer :state="service" />
  </Toolbar>
</template>
