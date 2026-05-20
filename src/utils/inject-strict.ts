import type { Context } from 'preact'
import { useContext } from 'preact/hooks'

// Keep this small helper so the component code stays close to the Vue version.
export function injectStrict<T>(
  context: Context<T | undefined>,
  name?: string,
) {
  const resolved = useContext(context)

  if (resolved === undefined) {
    throw new Error(`Could not resolve ${name ?? 'context'}`)
  }

  return resolved
}
