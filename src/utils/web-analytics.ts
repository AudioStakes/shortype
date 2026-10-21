const BEACON_SOURCE = 'https://static.cloudflareinsights.com/beacon.min.js'
const PRODUCTION_ORIGIN = 'https://shortype.vercel.app'
// Public site identifier, not a Cloudflare API credential.
const SITE_TOKEN = 'c6b0115d98a3444ab831061d7b755800'

export function initializeWebAnalytics(): void {
  if (window.location.origin !== PRODUCTION_ORIGIN) {
    return
  }

  const install = (): void => {
    if (document.querySelector(`script[src="${BEACON_SOURCE}"]`)) {
      return
    }
    const script = document.createElement('script')
    script.type = 'module'
    script.async = true
    script.fetchPriority = 'low'
    script.src = BEACON_SOURCE
    script.setAttribute('data-cf-beacon', JSON.stringify({ token: SITE_TOKEN }))
    document.body.append(script)
  }

  if (document.readyState === 'complete') {
    install()
  } else {
    window.addEventListener('load', install, { once: true })
  }
}
