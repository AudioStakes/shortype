import type { NavigatorExtend } from '@/types/interfaces'

export default async function lockKeyboard() {
  const navigatorExtend = navigator as NavigatorExtend
  try {
    await navigatorExtend.keyboard?.lock?.()
  } catch {
    // Keyboard lock is optional; unsupported shortcuts still allow self scoring.
  }
}
