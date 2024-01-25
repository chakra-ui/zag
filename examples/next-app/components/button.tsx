export const Button = (props: React.ComponentProps<"button">) => {
  return (
    <button
      style={{
        padding: "24px",
        borderRadius: "4px",
        borderWidth: "1px",
        borderColor: "gray",
      }}
      {...props}
    />
  )
}
