<script lang="ts">
  import * as field from "@zag-js/field"
  import { normalizeProps, useMachine } from "@zag-js/svelte"
  import { z } from "zod"
  import "@styles/field.css"

  const passwordSchema = z
    .string()
    .min(8, "At least 8 characters")
    .regex(/[A-Z]/, "One uppercase letter")
    .regex(/[0-9]/, "One number")

  const id = $props.id()
  const service = useMachine(field.machine, {
    id,
    required: true,
    validationMode: "onChange",
    validate: ({ value }: field.ValidateDetails) =>
      passwordSchema.safeParse(value).error?.issues.map((issue) => issue.message),
  })

  const api = $derived(field.connect(service, normalizeProps))
</script>

<main class="field-page">
  <form onsubmit={(e) => e.preventDefault()}>
    <div {...api.getRootProps()}>
      <label {...api.getLabelProps()}>Password</label>
      <input {...api.getInputProps()} name="password" type="password" />
      <div {...api.getErrorTextProps()}>
        <ul>
          {#each api.errors as error (error)}
            <li>{error}</li>
          {/each}
        </ul>
      </div>
      <span {...api.getIndicatorProps({ type: "valid" })}>Strong password</span>
    </div>
    <div class="actions">
      <button type="submit">Save</button>
    </div>
  </form>
</main>
