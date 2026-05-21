import { h } from 'preact'
import { describe, expect, test, vi } from 'vitest'

import Key from '@/components/Key'
import ModalContent from '@/components/ModalContent'
import useEventListener from '@/composables/use-event-listener'

import { render } from './dom-helpers'

function EventListenerHarness({ onEvent }: { onEvent: (e: Event) => void }) {
  useEventListener('click', onEvent, { capture: true })

  return null
}

describe('component regressions', () => {
  test('ModalContent renders visible content when shown', () => {
    const { container, getByText } = render(
      h(ModalContent, {
        children: h('span', null, 'hello'),
        isEnterFromRight: true,
        isShow: true,
      }),
    )

    getByText('hello')
    expect(container.className).toContain('opacity-100')
    expect(container.className).toContain('translate-x-0')
  })

  test('Key adapts text size to long key names', () => {
    const shortKey = render(h(Key, { keyName: 'Tab' }))
    const mediumKey = render(h(Key, { keyName: 'Insert' }))
    const longKey = render(h(Key, { keyName: 'PrintScreen' }))

    expect(shortKey.container.className).toContain('text-3xl')
    expect(mediumKey.container.className).toContain('text-2xl')
    expect(longKey.container.className).toContain('text-sm')
  })

  test('useEventListener removes listeners with the same options it used to add them', () => {
    const addSpy = vi.spyOn(window, 'addEventListener')
    const removeSpy = vi.spyOn(window, 'removeEventListener')
    const onEvent = vi.fn()

    const rendered = render(h(EventListenerHarness, { onEvent }))
    rendered.unmount()

    expect(addSpy).toHaveBeenCalledWith('click', onEvent, { capture: true })
    expect(removeSpy).toHaveBeenCalledWith('click', onEvent, { capture: true })

    addSpy.mockRestore()
    removeSpy.mockRestore()
  })
})
