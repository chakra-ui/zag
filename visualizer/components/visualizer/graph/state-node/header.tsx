interface StateNodeHeaderProps {
  value: string
  tags: string[]
}

export const StateNodeHeader: React.FC<StateNodeHeaderProps> = ({ value, tags }) => {
  return (
    <div data-part="state-node-header">
      <div data-part="state-node-key">
        <div data-part="state-node-key-text" title={value}>
          {value}
        </div>
      </div>
      {tags.length > 0 && (
        <div data-part="state-node-tags">
          {tags.map((tag, i) => (
            <div data-part="state-node-tag" key={i}>
              {tag}
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
