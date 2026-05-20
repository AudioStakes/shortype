import { mount, type VueWrapper } from '@vue/test-utils'
import { nextTick } from 'vue'

type TextMatcher = string | RegExp

const mountedWrappers: VueWrapper[] = []

const normalize = (text: string) => text.replace(/\s+/g, ' ').trim()

const matchesText = (text: string, matcher: TextMatcher) => {
  const normalized = normalize(text)

  return typeof matcher === 'string'
    ? normalized === matcher
    : matcher.test(normalized)
}

const queryAllByTextIn = (root: Element, matcher: TextMatcher) =>
  Array.from(root.querySelectorAll('*')).filter((element) =>
    matchesText(element.textContent ?? '', matcher),
  ) as HTMLElement[]

const getByTextIn = (root: Element, matcher: TextMatcher) => {
  const found = queryAllByTextIn(root, matcher)[0]

  if (!found) {
    throw new Error(`Unable to find text: ${String(matcher)}`)
  }

  return found
}

const queryByTextIn = (root: Element, matcher: TextMatcher) =>
  queryAllByTextIn(root, matcher)[0] ?? null

const getByTestIdIn = (root: Element, testId: string) => {
  const found = root.querySelector(`[data-testid="${testId}"]`)

  if (!found) {
    throw new Error(`Unable to find test id: ${testId}`)
  }

  return found as HTMLElement
}

export const render = (
  component: unknown,
  options: Record<string, unknown> = {},
) => {
  const wrapper = mount(component as never, {
    attachTo: document.body,
    ...options,
  }) as VueWrapper

  mountedWrappers.push(wrapper)

  const root = wrapper.element as HTMLElement

  return {
    container: root,
    getByText: (matcher: TextMatcher) => getByTextIn(root, matcher),
    queryByText: (matcher: TextMatcher) => queryByTextIn(root, matcher),
    queryAllByText: (matcher: TextMatcher) => queryAllByTextIn(root, matcher),
    getByTestId: (testId: string) => getByTestIdIn(root, testId),
    queryByTestId: (testId: string) =>
      root.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null,
    unmount: () => wrapper.unmount(),
  }
}

export const within = (root: Element) => ({
  getByText: (matcher: TextMatcher) => getByTextIn(root, matcher),
  queryByText: (matcher: TextMatcher) => queryByTextIn(root, matcher),
  queryAllByText: (matcher: TextMatcher) => queryAllByTextIn(root, matcher),
  getByTestId: (testId: string) => getByTestIdIn(root, testId),
  queryByTestId: (testId: string) =>
    root.querySelector(`[data-testid="${testId}"]`) as HTMLElement | null,
})

export const click = async (element: Element) => {
  ;(element as HTMLElement).dispatchEvent(
    new MouseEvent('click', { bubbles: true, cancelable: true }),
  )
  await nextTick()
}

export const waitFor = async (assertion: () => unknown, timeoutMs = 1000) => {
  const startedAt = Date.now()
  let lastError: unknown

  while (Date.now() - startedAt < timeoutMs) {
    try {
      assertion()
      return
    } catch (error) {
      lastError = error
      await new Promise((resolve) => setTimeout(resolve, 10))
    }
  }

  throw lastError ?? new Error('waitFor timed out')
}

export const waitForElementToBeRemoved = async (
  target: Element | (() => Element | null),
  timeoutMs = 1000,
) => {
  await waitFor(() => {
    const element = typeof target === 'function' ? target() : target

    if (element && document.body.contains(element)) {
      throw new Error('Element still present')
    }
  }, timeoutMs)
}

export const cleanup = () => {
  while (mountedWrappers.length > 0) {
    mountedWrappers.pop()?.unmount()
  }
}
