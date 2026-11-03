import { steps } from "styled-system/recipes"

export function Steps(props: { children: React.ReactNode }) {
  return <div className={steps()}>{props.children}</div>
}
