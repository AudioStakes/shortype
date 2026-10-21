export default async function toggleFullscreen() {
  try {
    if (!document.fullscreenElement) {
      if (typeof document.documentElement.requestFullscreen === 'function') {
        await document.documentElement.requestFullscreen()
      }
    } else {
      if (typeof document.exitFullscreen === 'function') {
        await document.exitFullscreen()
      }
    }
  } catch {
    // A denied fullscreen request leaves the self-scoring option available.
  }
}
