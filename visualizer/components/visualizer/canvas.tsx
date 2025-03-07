import { TransformComponent } from "react-zoom-pan-pinch"

type CanvasProps = {
  children: React.ReactNode
}

export default function Canvas(props: CanvasProps): JSX.Element {
  return (
    <>
      <TransformComponent wrapperClass="wrapper" contentClass="content">
        {props.children}
      </TransformComponent>
    </>
  )
}
