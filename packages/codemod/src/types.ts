export interface Note {
  /** 1-based line in the transformed file */
  line: number
  message: string
}

export interface TransformResult {
  code: string
  /** Number of edits applied */
  changes: number
  /** Things the codemod could not rewrite safely */
  notes: Note[]
}
