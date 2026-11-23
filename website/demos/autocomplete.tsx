import * as autocomplete from "@zag-js/autocomplete"
import { createFilter } from "@zag-js/utils/search"
import { Portal, normalizeProps, useMachine } from "@zag-js/react"
import { useId, useMemo, useState } from "react"
import styles from "../styles/machines/autocomplete.module.css"

interface AutocompleteProps extends Omit<
  autocomplete.Props,
  "id" | "collection"
> {}

const filter = createFilter({ sensitivity: "base" })

export function Autocomplete(props: AutocompleteProps) {
  const [value, setValue] = useState("")

  // `list` and `both` show suggestions that match the text
  const filtered = !props.mode || props.mode === "list" || props.mode === "both"

  const collection = useMemo(
    () =>
      autocomplete.collection({
        items: filtered
          ? countries.filter((item) => filter.contains(item.label, value))
          : countries,
        itemToValue: (item) => item.code,
        itemToString: (item) => item.label,
      }),
    [filtered, value],
  )

  const service = useMachine(autocomplete.machine, {
    id: useId(),
    collection,
    placeholder: "Search countries",
    value,
    onValueChange: (details) => setValue(details.value),
    ...props,
  })

  const api = autocomplete.connect(service, normalizeProps)

  return (
    <>
      <div className={styles.Root} {...api.getRootProps()}>
        <label className={styles.Label} {...api.getLabelProps()}>
          Country
        </label>
        <div className={styles.Control} {...api.getControlProps()}>
          <input className={styles.Input} {...api.getInputProps()} />
          <button
            className={styles.ClearTrigger}
            {...api.getClearTriggerProps()}
          >
            ×
          </button>
          <button className={styles.Trigger} {...api.getTriggerProps()}>
            ▾
          </button>
        </div>
      </div>
      <Portal>
        <div className={styles.Positioner} {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <div className={styles.Empty} {...api.getEmptyProps()}>
              No countries match
            </div>
            <ul className={styles.List} {...api.getListProps()}>
              {collection.items.map((item) => (
                <li
                  key={item.code}
                  className={styles.Item}
                  {...api.getItemProps({ item })}
                >
                  <span
                    className={styles.ItemText}
                    {...api.getItemTextProps({ item })}
                  >
                    {item.label}
                  </span>
                </li>
              ))}
            </ul>
          </div>
        </div>
      </Portal>
    </>
  )
}

const countries = [
  { label: "Albania", code: "AL" },
  { label: "Algeria", code: "DZ" },
  { label: "Andorra", code: "AD" },
  { label: "Angola", code: "AO" },
  { label: "Argentina", code: "AR" },
  { label: "Australia", code: "AU" },
  { label: "Austria", code: "AT" },
  { label: "Bahamas", code: "BS" },
  { label: "Benin", code: "BJ" },
  { label: "Brazil", code: "BR" },
  { label: "Canada", code: "CA" },
  { label: "Chile", code: "CL" },
  { label: "Denmark", code: "DK" },
  { label: "Egypt", code: "EG" },
  { label: "France", code: "FR" },
  { label: "Germany", code: "DE" },
  { label: "Ghana", code: "GH" },
  { label: "Japan", code: "JP" },
  { label: "Kenya", code: "KE" },
  { label: "Madagascar", code: "MG" },
  { label: "Malaysia", code: "MY" },
  { label: "Mali", code: "ML" },
  { label: "Malta", code: "MT" },
  { label: "Nigeria", code: "NG" },
  { label: "Norway", code: "NO" },
  { label: "Togo", code: "TG" },
  { label: "Tunisia", code: "TN" },
  { label: "United States", code: "US" },
  { label: "Zambia", code: "ZM" },
]
