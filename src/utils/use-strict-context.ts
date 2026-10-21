import type { Context } from 'preact'
import { useContext } from 'preact/hooks'

export function useStrictContext<T>(
  context: Context<T | undefined>,
  name?: string,
) {
  const resolved = useContext(context)

  if (resolved === undefined) {
    throw new Error(`Could not resolve ${name ?? 'context'}`)
  }

  return resolved
}
