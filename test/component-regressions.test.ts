import { h } from 'preact'
import { describe, expect, test, vi } from 'vitest'

import About from '@/components/About'
import Key from '@/components/Key'
import Modal from '@/components/Modal'
import ModalContent from '@/components/ModalContent'
import useEventListener from '@/composables/use-event-listener'
import ModalKey from '@/stores/modal-key'

import { render, waitFor } from './dom-helpers'

function EventListenerHarness({ onEvent }: { onEvent: (e: Event) => void }) {
  useEventListener('click', onEvent, { capture: true })

  return null
}

describe('component regressions', () => {
  test('Modal does not render a placeholder when hidden', () => {
    const { queryByTestId } = render(
      h(Modal, {
        children: h('span', null, 'hidden modal'),
        isShow: false,
        onClose: vi.fn(),
      }),
    )

    expect(queryByTestId('modal')).toBeNull()
  })

  test('About does not render a placeholder when hidden', () => {
    const modalStore = {
      hideAboutModal: vi.fn(),
      hideToolsAndCategoriesModal: vi.fn(),
      modalState: {
        isAboutModalVisible: false,
        isToolsAndCategoriesModalVisible: false,
      },
      showAboutModal: vi.fn(),
      showToolsAndCategoriesModal: vi.fn(),
    }

    const { queryByTestId } = render(
      h(ModalKey.Provider, { value: modalStore }, h(About, { isShow: false })),
    )

    expect(queryByTestId('modal')).toBeNull()
  })

  test('ModalContent renders visible content when shown', async () => {
    const { container, getByText } = render(
      h(ModalContent, {
        children: h('span', null, 'hello'),
        isEnterFromRight: true,
        isShow: true,
      }),
    )

    getByText('hello')
    await waitFor(() => {
      expect(container.className).toContain('opacity-100')
      expect(container.className).toContain('translate-x-0')
    })
  })

  test('ModalContent enters from different sides based on props', async () => {
    const right = render(
      h(ModalContent, {
        children: h('span', null, 'right'),
        isEnterFromRight: true,
        isShow: true,
      }),
    )
    const left = render(
      h(ModalContent, {
        children: h('span', null, 'left'),
        isEnterFromRight: false,
        isShow: true,
      }),
    )

    expect(right.container.className).toContain('translate-x-4')
    expect(left.container.className).toContain('-translate-x-4')

    await waitFor(() => {
      expect(right.container.className).toContain('translate-x-0')
      expect(left.container.className).toContain('translate-x-0')
    })
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
