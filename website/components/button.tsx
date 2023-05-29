import {
  chakra,
  forwardRef,
  HTMLChakraProps,
  ThemingProps,
  useStyleConfig,
} from "@chakra-ui/system"

type ButtonProps = HTMLChakraProps<"button"> &
  ThemingProps<"Button"> & {
    children: React.ReactNode
  }

export const Button = forwardRef<ButtonProps, "button">((props, ref) => {
  const { size, variant, ...ownProps } = props
  const styles = useStyleConfig("Button", { variant, size })
  return <chakra.button ref={ref} __css={styles} {...ownProps}></chakra.button>
})
