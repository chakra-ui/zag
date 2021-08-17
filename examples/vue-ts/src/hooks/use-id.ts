/**
 * Credit: https://github.com/reach/reach-ui/blob/develop/packages/auto-id/src/index.tsx
 *
 * Why does this hook exist?
 *   1. Accessibiliy APIs rely heavily on element IDs
 *   2. Requiring developers to put IDs on every Chakra component
 *      is cumbersome and error-prone.
 *   3. With a components model, we can generate IDs for them!
 *
 * Solutions to ID problem:
 * 1. Generate random IDs
 *    We did this before in prior projects
 *    Since then, we've learned some things about performance for
 *    components especially with SSR.
 *
 *    This may not be a good idea because during server rendering
 *    the IDs will be statically generated, and during client-side hydration,
 *    the IDs may not match, when booting up the Vue App. Vue will then
 *    go ahead and recreate the entire application.
 *
 * 2. Don't server render IDs. Instead patch on client `onMounted`
 *    In this approach, generated ID is an empty string on the first render.
 *    This way the client and server possess the same ID.
 *
 *    When the component is finally mounted, we patch the ID.
 *    This may cause a re-render on the client, but it shouldn't be a
 *    big problem, because:
 *
 *        1. Components using `useId` composable are small
 *        2. With solution 1, it would cause a re-render anyway.
 *        3. This patch only runs once. (Only when the `onMounted` life
 *           -cycle hook is called.)
 *
 */

import { computed, onBeforeMount, onMounted, ref } from "vue"

let serverHandoffComplete = false
let _id = 0
const genId = () => ++_id

/**
 * Generates a unique id
 *
 * @param id external ID provided by consumer/user.
 * @param prefix prefix to append before the id
 */
export const useId = (id?: string, prefix?: string) => {
  const initialId = id || (serverHandoffComplete ? genId() : null)
  const uid = ref(initialId)

  onBeforeMount(() => {
    if (serverHandoffComplete === false) {
      serverHandoffComplete = true
    }
  })

  onMounted(() => {
    if (uid.value === null) {
      uid.value = genId()
    }
  })

  return computed(() => {
    const __id__ = uid.value !== null ? uid.value.toString() : undefined
    return (prefix ? `${prefix}-${__id__}` : __id__) as string
  })
}

/**
 * Hook to generate ids for use in compound components
 *
 * @param id the external id passed from the user
 * @param prefixes array of prefixes to use
 */
export function useIds(id?: string, ...prefixes: string[]) {
  const __id__ = useId(id)
  return prefixes.map((prefix) => computed(() => `${prefix}-${__id__.value}`))
}
