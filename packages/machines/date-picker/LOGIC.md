## DatePicker Segment Focus Logic

- The date-picker component has three states: `IDLE`, `FOCUSED`, and `OPEN`

- In the `IDLE` state:

  - When a segment group is focused:
    - Transition to the `FOCUSED` state
    - Set the active index and active segment index
    - Focus the first editable segment

- In the `FOCUSED` state:

  - When a segment group is blurred:
    - Transition to the `IDLE` state
    - Reset the active segment index to -1
    - Reset the active index to start

  - When arrow right key is pressed:
    - Move to the next editable segment
    - If at the last segment, move to the first segment of next input (range mode)

  - When arrow left key is pressed:
    - Move to the previous editable segment
    - If at the first segment, move to the last segment of previous input (range mode)

  - When arrow up key is pressed:
    - Increment the current segment value (day, month, year)
    - Constrain the value within valid bounds
    - Update the date value

  - When arrow down key is pressed:
    - Decrement the current segment value (day, month, year)
    - Constrain the value within valid bounds
    - Update the date value

  - When a digit is typed:
    - Update the current segment value
    - If segment is complete, move to next segment
    - Parse and validate the date

  - When backspace is pressed:
    - Clear the current segment value
    - Move to previous segment if current is empty

  - When delete is pressed:
    - Clear the current segment value
    - Stay on the current segment

  - When enter is pressed:
    - Parse the complete input value
    - Set the focused date if valid
    - Select the focused date

  - When escape is pressed:
    - Revert to the last valid value
    - Blur the segment group

  - When text is pasted:
    - Parse the pasted value as a complete date
    - Update all segments if valid
    - Focus the last segment

- In the `OPEN` state:

  - Segment interactions are disabled
  - Arrow keys control calendar navigation instead
  - Typing characters may trigger date search/filter