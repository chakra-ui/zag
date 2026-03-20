/** Min displacement (px) from rest snap before we trust it over a brief opposing velocity tick. */
const RELEASE_DISPLACEMENT_TRUST_PX = 24
const OPEN_SWIPE_HIDDEN_VISIBLE_RATIO = 0.22
const OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER = 1.25
const OPEN_SWIPE_REVEALED_VISIBLE_RATIO = 0.5
const OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY = 650

/**
 * When the user clearly moved the sheet one way, ignore a short opposing velocity sample
 * (coalesced / rubber-band touch end, etc.).
 */
export function adjustReleaseVelocityAgainstDisplacement(velocity: number, displacementFromSnap: number): number {
  const dSign = Math.sign(displacementFromSnap)
  const vSign = Math.sign(velocity)
  if (
    dSign !== 0 &&
    Math.abs(displacementFromSnap) >= RELEASE_DISPLACEMENT_TRUST_PX &&
    vSign !== 0 &&
    vSign !== dSign
  ) {
    return 0
  }
  return velocity
}

/**
 * Swipe-open gesture: damp spurious velocity when the sheet is still almost fully off-screen
 * or nearly committed open.
 */
export function adjustReleaseVelocityForOpenSwipe(
  velocity: number,
  visibleRatio: number,
  swipeVelocityThreshold: number,
): number {
  // Still mostly hidden: ignore moderate “toward open” velocity spikes
  if (
    visibleRatio < OPEN_SWIPE_HIDDEN_VISIBLE_RATIO &&
    velocity < 0 &&
    Math.abs(velocity) < swipeVelocityThreshold * OPEN_SWIPE_HIDDEN_VELOCITY_MULTIPLIER
  ) {
    return 0
  }
  // Largely revealed: small opposing velocity is usually noise
  if (
    visibleRatio > OPEN_SWIPE_REVEALED_VISIBLE_RATIO &&
    velocity > 0 &&
    Math.abs(velocity) < OPEN_SWIPE_REVEALED_OPPOSING_MAX_ABS_VELOCITY
  ) {
    return 0
  }
  return velocity
}
