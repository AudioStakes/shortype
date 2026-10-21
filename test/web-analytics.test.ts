// @vitest-environment-options {"settings":{"disableJavaScriptFileLoading":true,"handleDisabledFileLoadingAsSuccess":true}}

import { afterEach, describe, expect, test, vi } from 'vitest'

import { initializeWebAnalytics } from '@/utils/web-analytics'

const BEACON_SOURCE = 'https://static.cloudflareinsights.com/beacon.min.js'
const beaconSelector = `script[src="${BEACON_SOURCE}"]`

function mockOrigin(origin: string) {
  const addEventListener = vi.fn()
  vi.stubGlobal('window', { location: new URL(origin), addEventListener })
  return addEventListener
}

afterEach(() => {
  document.querySelectorAll(beaconSelector).forEach((script) => {
    script.remove()
  })
  vi.unstubAllGlobals()
  vi.restoreAllMocks()
})

describe('Cloudflare Web Analytics', () => {
  test.each([
    'http://localhost:5173',
    'https://shortype-preview.vercel.app',
    'https://shortype.vercel.app.example.com',
    'http://shortype.vercel.app',
  ])('does not load analytics on %s', (origin) => {
    const addEventListener = mockOrigin(origin)
    initializeWebAnalytics()
    expect(document.querySelector(beaconSelector)).toBeNull()
    expect(addEventListener).not.toHaveBeenCalled()
  })

  test('installs the dedicated public beacon only once on production', () => {
    mockOrigin('https://shortype.vercel.app')
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('complete')

    initializeWebAnalytics()
    initializeWebAnalytics()

    const scripts = document.querySelectorAll<HTMLScriptElement>(beaconSelector)
    expect(scripts).toHaveLength(1)
    expect(scripts[0]?.type).toBe('module')
    expect(scripts[0]?.async).toBe(true)
    expect(scripts[0]?.fetchPriority).toBe('low')
    expect(JSON.parse(scripts[0]?.dataset.cfBeacon ?? '{}')).toEqual({
      token: 'c6b0115d98a3444ab831061d7b755800',
    })
  })

  test('waits until page load and avoids an existing beacon', () => {
    const addEventListener = mockOrigin('https://shortype.vercel.app')
    vi.spyOn(document, 'readyState', 'get').mockReturnValue('loading')

    initializeWebAnalytics()

    expect(document.querySelector(beaconSelector)).toBeNull()
    expect(addEventListener).toHaveBeenCalledWith(
      'load',
      expect.any(Function),
      {
        once: true,
      },
    )
    const install = addEventListener.mock.calls[0]?.[1]
    const existing = document.createElement('script')
    existing.src = BEACON_SOURCE
    document.body.append(existing)
    install()
    expect(document.querySelectorAll(beaconSelector)).toHaveLength(1)
    existing.remove()
    install()
    expect(document.querySelectorAll(beaconSelector)).toHaveLength(1)
  })
})
