<script setup lang="ts">
import * as checkbox from "@zag-js/checkbox"
import * as field from "@zag-js/field"
import * as fieldsetMachine from "@zag-js/fieldset"
import { normalizeProps, useMachine } from "@zag-js/vue"
import { CheckIcon } from "lucide-vue-next"
import "@styles/checkbox.css"
import "@styles/field.css"

const outerDisabled = ref(false)
const innerDisabled = ref(false)

const shippingId = useId()
const shippingService = useMachine(
  fieldsetMachine.machine,
  computed(() => ({ id: shippingId, disabled: outerDisabled.value })),
)
const shipping = computed(() => fieldsetMachine.connect(shippingService, normalizeProps))

const addressId = useId()
const addressService = useMachine(
  fieldsetMachine.machine,
  computed(() => ({ id: addressId, disabled: innerDisabled.value })),
)
const address = computed(() => fieldsetMachine.connect(addressService, normalizeProps))

const nameService = useMachine(field.machine, { id: useId() })
const name = computed(() => field.connect(nameService, normalizeProps))

const streetService = useMachine(field.machine, { id: useId() })
const street = computed(() => field.connect(streetService, normalizeProps))

const saveService = useMachine(checkbox.machine, { id: useId(), name: "save" })
const save = computed(() => checkbox.connect(saveService, normalizeProps))
</script>

<template>
  <main class="field-page">
    <div class="options">
      <label> <input v-model="outerDisabled" type="checkbox" /> Disable shipping </label>
      <label> <input v-model="innerDisabled" type="checkbox" /> Disable address </label>
    </div>
    <form @submit.prevent>
      <fieldset v-bind="shipping.getRootProps()">
        <legend v-bind="shipping.getLegendProps()">Shipping</legend>
        <div v-bind="name.getRootProps()">
          <label v-bind="name.getLabelProps()">Recipient</label>
          <input v-bind="name.getInputProps()" name="recipient" />
        </div>

        <fieldset v-bind="address.getRootProps()">
          <legend v-bind="address.getLegendProps()">Address</legend>
          <div v-bind="street.getRootProps()">
            <label v-bind="street.getLabelProps()">Street</label>
            <input v-bind="street.getInputProps()" name="street" />
          </div>
          <label v-bind="save.getRootProps()">
            <div v-bind="save.getControlProps()">
              <span v-bind="save.getIndicatorProps()">
                <CheckIcon />
              </span>
            </div>
            <span v-bind="save.getLabelProps()">Save this address</span>
            <input v-bind="save.getHiddenInputProps()" />
          </label>
        </fieldset>
      </fieldset>
    </form>
  </main>
</template>
