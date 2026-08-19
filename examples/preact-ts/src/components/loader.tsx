export function LoaderBar(props: { title?: string }) {
  const title = props.title || "loader bars"

  return (
    <svg className="spinner" height="24" width="24" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
      <title>{title}</title>
      <g fill="currentColor">
        <rect height="6" width="2" fill="currentColor" x="11" />
        <rect
          height="2"
          width="6"
          fill="currentColor"
          opacity="0.9"
          transform="matrix(0.7071 -0.7071 0.7071 0.7071 1.3935 14.6361)"
          x="15.364"
          y="4.636"
        />
        <rect height="2" width="6" fill="currentColor" opacity="0.8" x="18" y="11" />
        <rect
          height="6"
          width="2"
          fill="currentColor"
          opacity="0.7"
          transform="matrix(0.7071 -0.7071 0.7071 0.7071 -7.6066 18.364)"
          x="17.364"
          y="15.364"
        />
        <rect height="6" width="2" fill="currentColor" opacity="0.6" x="11" y="18" />
        <rect
          height="2"
          width="6"
          fill="currentColor"
          opacity="0.5"
          transform="matrix(0.7071 -0.7071 0.7071 0.7071 -11.3346 9.3639)"
          x="2.636"
          y="17.364"
        />
        <rect height="2" width="6" fill="currentColor" opacity="0.4" y="11" />
        <rect
          height="6"
          width="2"
          fill="currentColor"
          opacity="0.3"
          transform="matrix(0.7071 -0.7071 0.7071 0.7071 -2.3345 5.636)"
          x="4.636"
          y="2.636"
        />
      </g>
    </svg>
  )
}
