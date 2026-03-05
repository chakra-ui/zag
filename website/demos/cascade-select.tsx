import * as cascadeSelect from "@zag-js/cascade-select"
import { normalizeProps, Portal, useMachine } from "@zag-js/react"
import { JSX, useId } from "react"
import { LuCheck, LuChevronRight, LuX } from "react-icons/lu"
import styles from "../styles/machines/cascade-select.module.css"

interface CascadeSelectProps extends Omit<
  cascadeSelect.Props,
  "id" | "collection"
> {}

export function CascadeSelect(props: CascadeSelectProps) {
  const service = useMachine(cascadeSelect.machine, {
    id: useId(),
    collection,
    ...props,
  })

  const api = cascadeSelect.connect(service, normalizeProps)

  return (
    <div className={styles.Root} {...api.getRootProps()}>
      <label className={styles.Label} {...api.getLabelProps()}>
        Location
      </label>
      <div className={styles.Control} {...api.getControlProps()}>
        <button className={styles.Trigger} {...api.getTriggerProps()}>
          <span>{api.valueAsString || "Select location"}</span>
          <span {...api.getIndicatorProps()}>
            <CaretIcon />
          </span>
        </button>
        <button className={styles.ClearTrigger} {...api.getClearTriggerProps()}>
          <LuX />
        </button>
      </div>

      <Portal>
        <div {...api.getPositionerProps()}>
          <div className={styles.Content} {...api.getContentProps()}>
            <TreeNode node={collection.rootNode} api={api} />
          </div>
        </div>
      </Portal>
    </div>
  )
}

interface Node {
  label: string
  value: string
  children?: Node[]
}

const collection = cascadeSelect.collection<Node>({
  nodeToValue: (node) => node.value,
  nodeToString: (node) => node.label,
  nodeToChildren: (node) => node.children ?? [],
  rootNode: {
    label: "ROOT",
    value: "ROOT",
    children: [
      {
        label: "North America",
        value: "north-america",
        children: [
          {
            label: "United States",
            value: "us",
            children: [
              { label: "New York", value: "ny" },
              { label: "California", value: "ca" },
              { label: "Texas", value: "tx" },
            ],
          },
          {
            label: "Canada",
            value: "ca-country",
            children: [
              { label: "Ontario", value: "on" },
              { label: "British Columbia", value: "bc" },
            ],
          },
        ],
      },
      {
        label: "Africa",
        value: "africa",
        children: [
          {
            label: "Nigeria",
            value: "ng",
            children: [
              { label: "Lagos", value: "lagos" },
              { label: "Abuja", value: "abuja" },
            ],
          },
          {
            label: "Kenya",
            value: "ke",
            children: [
              { label: "Nairobi", value: "nairobi" },
              { label: "Mombasa", value: "mombasa" },
            ],
          },
        ],
      },
      {
        label: "Asia",
        value: "asia",
        children: [
          {
            label: "Japan",
            value: "jp",
            children: [
              { label: "Tokyo", value: "tokyo" },
              { label: "Osaka", value: "osaka" },
            ],
          },
          {
            label: "India",
            value: "in",
            children: [
              { label: "Mumbai", value: "mumbai" },
              { label: "Delhi", value: "delhi" },
            ],
          },
        ],
      },
    ],
  },
})

interface TreeNodeProps {
  node: Node
  indexPath?: number[]
  value?: string[]
  api: cascadeSelect.Api
}

const TreeNode = (props: TreeNodeProps): JSX.Element => {
  const { node, indexPath = [], value = [], api } = props

  const nodeProps = { indexPath, value, item: node }
  const nodeState = api.getItemState(nodeProps)
  const children = collection.getNodeChildren(node)

  return (
    <>
      <ul className={styles.List} {...api.getListProps(nodeProps)}>
        {children.map((item, index) => {
          const itemProps = {
            indexPath: [...indexPath, index],
            value: [...value, collection.getNodeValue(item)],
            item,
          }
          const itemState = api.getItemState(itemProps)

          return (
            <li
              className={styles.Item}
              key={collection.getNodeValue(item)}
              {...api.getItemProps(itemProps)}
            >
              <span
                className={styles.ItemText}
                {...api.getItemTextProps(itemProps)}
              >
                {item.label}
              </span>
              <span
                className={styles.ItemIndicator}
                {...api.getItemIndicatorProps(itemProps)}
              >
                <LuCheck />
              </span>
              {itemState.hasChildren && (
                <span className={styles.Chevron}>
                  <LuChevronRight />
                </span>
              )}
            </li>
          )
        })}
      </ul>
      {nodeState.highlightedChild &&
        collection.isBranchNode(nodeState.highlightedChild) && (
          <TreeNode
            node={nodeState.highlightedChild}
            api={api}
            indexPath={[...indexPath, nodeState.highlightedIndex]}
            value={[
              ...value,
              collection.getNodeValue(nodeState.highlightedChild),
            ]}
          />
        )}
    </>
  )
}

const CaretIcon = () => (
  <svg
    stroke="currentColor"
    fill="currentColor"
    strokeWidth="0"
    viewBox="0 0 1024 1024"
    height="1em"
    width="1em"
    xmlns="http://www.w3.org/2000/svg"
  >
    <path d="M840.4 300H183.6c-19.7 0-30.7 20.8-18.5 35l328.4 380.8c9.4 10.9 27.5 10.9 37 0L858.9 335c12.2-14.2 1.2-35-18.5-35z"></path>
  </svg>
)
