<script lang="ts">
  import Presence from "$lib/components/presence.svelte"
  import * as popover from "@zag-js/popover"
  import { normalizeProps, portal, useMachine } from "@zag-js/svelte"

  interface Document {
    id: number
    name: string
    type: string
    size: string
    modified: string
  }

  const documents: Document[] = [
    { id: 1, name: "Project Proposal.pdf", type: "PDF", size: "2.4 MB", modified: "2024-01-15" },
    { id: 2, name: "Budget 2024.xlsx", type: "Excel", size: "856 KB", modified: "2024-01-14" },
    { id: 3, name: "Meeting Notes.docx", type: "Word", size: "124 KB", modified: "2024-01-13" },
    { id: 4, name: "Design Mockups.fig", type: "Figma", size: "4.2 MB", modified: "2024-01-12" },
    { id: 5, name: "Code Review.md", type: "Markdown", size: "45 KB", modified: "2024-01-11" },
  ]

  let activeDocument = $state<Document | null>(null)

  const id = $props.id()
  const service = useMachine(popover.machine, {
    id,
    onTriggerValueChange({ value }) {
      const doc = documents.find((d) => `${d.id}` === value) ?? null
      activeDocument = doc
    },
  })

  const api = $derived(popover.connect(service, normalizeProps))
</script>

<main>
  <section style="margin-bottom: 40px;">
    <h2>Document Manager - Popover with Multiple Triggers</h2>

    <table style="width: 100%; border-collapse: collapse; margin-top: 20px;">
      <thead>
        <tr style="background-color: #f3f4f6; text-align: left;">
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Name</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Type</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Size</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Modified</th>
          <th style="padding: 12px; border-bottom: 2px solid #e5e7eb;">Actions</th>
        </tr>
      </thead>
      <tbody>
        {#each documents as doc (doc.id)}
          <tr style="border-bottom: 1px solid #e5e7eb;">
            <td style="padding: 12px;">{doc.name}</td>
            <td style="padding: 12px;">{doc.type}</td>
            <td style="padding: 12px;">{doc.size}</td>
            <td style="padding: 12px;">{doc.modified}</td>
            <td style="padding: 12px;">
              <button {...api.getTriggerProps({ value: `${doc.id}` })}>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="16"
                  height="16"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  stroke-width="2"
                  stroke-linecap="round"
                  stroke-linejoin="round"
                >
                  <circle cx="12" cy="12" r="1" />
                  <circle cx="12" cy="5" r="1" />
                  <circle cx="12" cy="19" r="1" />
                </svg>
              </button>
            </td>
          </tr>
        {/each}
      </tbody>
    </table>

    <div
      style="margin-top: 20px; padding: 12px; background-color: #f9fafb; border-radius: 6px;"
    >
      <strong>Active Trigger:</strong> {api.triggerValue || "-"} <br />
      <strong>Active Document:</strong>
      {activeDocument ? `${activeDocument.name} (${activeDocument.type})` : "-"}
    </div>
  </section>

  {#if api.open}
    <div use:portal {...api.getPositionerProps()}>
      <Presence
        {...api.getContentProps()}
        style="position: relative; background-color: white; border: 1px solid #e5e7eb; border-radius: 8px; box-shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1); padding: 12px; min-width: 200px;"
      >
        <div {...api.getTitleProps()} style="font-weight: bold; margin-bottom: 8px;">
          {activeDocument?.name}
        </div>
        <div style="display: flex; flex-direction: column; gap: 8px;">
          <button
            style="text-align: left; padding: 8px; border-radius: 4px; border: none; cursor: pointer;"
          >
            Open
          </button>
          <button
            style="text-align: left; padding: 8px; border-radius: 4px; border: none; cursor: pointer;"
          >
            Rename
          </button>
          <button
            style="text-align: left; padding: 8px; border-radius: 4px; border: none; cursor: pointer; color: red;"
          >
            Delete
          </button>
          <button
            {...api.getCloseTriggerProps()}
            style="position: absolute; top: 8px; right: 8px; padding: 4px; border: none; background: none; cursor: pointer; font-size: 16px;"
          >
            ✕
          </button>
        </div>
      </Presence>
    </div>
  {/if}
</main>
