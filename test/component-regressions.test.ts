import { h } from 'preact'
import { describe, expect, test, vi } from 'vitest'

import About from '@/components/About'
import CategoryCard from '@/components/CategoryCard'
import Key from '@/components/Key'
import Modal from '@/components/Modal'
import ModalContent from '@/components/ModalContent'
import useEventListener from '@/composables/use-event-listener'
import useKeyboardEventListener from '@/composables/use-keyboard-event-listener'
import ModalKey from '@/stores/modal-key'

import { render, waitFor } from './dom-helpers'

function EventListenerHarness({ onEvent }: { onEvent: (e: Event) => void }) {
  useEventListener('click', onEvent, { capture: true })

  return null
}

function KeyboardListenerHarness({
  onKey,
  type = 'keydown',
  enabled = true,
}: {
  onKey: (event: KeyboardEvent) => void
  type?: 'keydown' | 'keyup'
  enabled?: boolean
}) {
  useKeyboardEventListener(type, onKey, enabled)
  return h(
    'div',
    null,
    h('button', { type: 'button' }, 'action'),
    h('input', null),
  )
}

describe('component regressions', () => {
  test('Modal opens natively, focuses its close control, handles cancellation, and restores focus', () => {
    const trigger = document.createElement('button')
    document.body.append(trigger)
    trigger.focus()
    const onClose = vi.fn()
    const rendered = render(
      h(Modal, {
        children: h('span', null, 'dialog content'),
        isShow: true,
        onClose,
        label: 'Test dialog',
      }),
    )
    const dialog = rendered.container as HTMLDialogElement
    expect(dialog.open).toBe(true)
    expect(dialog.getAttribute('aria-label')).toBe('Test dialog')
    expect(document.activeElement).toBe(
      dialog.querySelector('.ui-close-button'),
    )
    const cancel = new Event('cancel', { cancelable: true })
    dialog.dispatchEvent(cancel)
    expect(cancel.defaultPrevented).toBe(true)
    expect(onClose).toHaveBeenCalledOnce()
    rendered.unmount()
    expect(document.activeElement).toBe(trigger)
    trigger.remove()
  })

  test('category controls expose their selected state', () => {
    const { container } = render(
      h(CategoryCard, {
        name: 'Navigation',
        masteredRate: 0,
        isSelected: true,
      }),
    )
    expect(container.getAttribute('aria-pressed')).toBe('true')
  })

  test.each([
    'Enter',
    ' ',
    'Escape',
  ])('keyboard controls retain native %s behavior', (key) => {
    const onKey = vi.fn()
    const { container } = render(h(KeyboardListenerHarness, { onKey }))
    const event = new KeyboardEvent('keydown', {
      key,
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('button')?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onKey).not.toHaveBeenCalled()
  })

  test('Tab reaches the training listener without blocking focus navigation', () => {
    const onKey = vi.fn()
    const { container } = render(h(KeyboardListenerHarness, { onKey }))
    const event = new KeyboardEvent('keydown', {
      key: 'Tab',
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('button')?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onKey).toHaveBeenCalledWith(event)
  })

  test('text fields retain their keyboard events', () => {
    const onKey = vi.fn()
    const { container } = render(h(KeyboardListenerHarness, { onKey }))
    const event = new KeyboardEvent('keydown', {
      key: 'r',
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('input')?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onKey).not.toHaveBeenCalled()
  })

  test('disabled game listeners leave keyboard events untouched', () => {
    const onKey = vi.fn()
    render(h(KeyboardListenerHarness, { onKey, enabled: false }))
    const event = new KeyboardEvent('keydown', { key: 'r', cancelable: true })
    window.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onKey).not.toHaveBeenCalled()
  })

  test('key releases clear game input while allowing native control behavior', () => {
    const onKey = vi.fn()
    const { container } = render(
      h(KeyboardListenerHarness, { onKey, type: 'keyup' }),
    )
    const event = new KeyboardEvent('keyup', {
      key: 'Meta',
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('button')?.dispatchEvent(event)
    expect(event.defaultPrevented).toBe(false)
    expect(onKey).toHaveBeenCalledWith(event)
  })

  test.each([
    'keydown',
    'keyup',
  ] as const)('open dialogs retain %s events even before listener cleanup', (type) => {
    const onKey = vi.fn()
    const { container } = render(
      h(
        'div',
        null,
        h(KeyboardListenerHarness, { onKey, type }),
        h(Modal, {
          isShow: true,
          onClose: vi.fn(),
          children: h('button', { type: 'button' }, 'dialog action'),
        }),
      ),
    )
    const event = new KeyboardEvent(type, {
      key: 'r',
      bubbles: true,
      cancelable: true,
    })
    container.querySelector('dialog button')?.dispatchEvent(event)
    expect(onKey).not.toHaveBeenCalled()
    expect(event.defaultPrevented).toBe(false)
  })

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
      hidePrivacyModal: vi.fn(),
      hideToolsAndCategoriesModal: vi.fn(),
      modalState: {
        isAboutModalVisible: false,
        isPrivacyModalVisible: false,
        isToolsAndCategoriesModalVisible: false,
      },
      showAboutModal: vi.fn(),
      showPrivacyModal: vi.fn(),
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
