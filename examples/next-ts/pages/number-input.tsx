import { useMachine } from "@ui-machines/react"
import { numberInput } from "@ui-machines/web"
import { StateVisualizer } from "components/state-visualizer"
import { useMount } from "hooks/use-mount"

const AboutPage = () => {
  const [state, send] = useMachine(
    numberInput.machine.withContext({
      min: 0,
      max: 10,
      clampValueOnBlur: true,
    }),
  )
  const ref = useMount<HTMLInputElement>(send)

  const { inputProps, decrementButtonProps, incrementButtonProps } =
    numberInput.connect(state, send)

  return (
    <div>
      <h3>
        React NumberInput with <code>useMachine</code>
      </h3>
      <div>
        <button {...decrementButtonProps}>DEC</button>
        <input ref={ref} {...inputProps} />
        <button {...incrementButtonProps}>INC</button>
      </div>
      <StateVisualizer state={state} />
    </div>
  )
}

export default AboutPage
