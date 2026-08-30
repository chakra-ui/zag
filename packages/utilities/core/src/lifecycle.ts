/**
 * Why a cleanup is running: its inputs changed and it will be set up again, or it is being torn
 * down for good. Lets a cleanup release resources gently on a restart, and fully on an exit.
 */
export type TeardownReason = "restart" | "exit"

/** A cleanup that may inspect why it was called. A plain `VoidFunction` is still valid. */
export type Teardown = (reason: TeardownReason) => void
