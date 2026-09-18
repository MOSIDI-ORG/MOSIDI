const DEFAULT_CONFIG_NAME = 'default'

let cachedConfig = null

function getRequestedConfigName() {
  const params = new URLSearchParams(window.location.search)
  return params.get('site') || DEFAULT_CONFIG_NAME
}

async function fetchConfig(name) {
  const response = await fetch(`${process.env.BASE_URL}configs/${name}.json`)
  if (!response.ok) {
    throw new Error(`Failed to load config "${name}": ${response.status}`)
  }
  return response.json()
}

function applyDocumentMeta(config) {
  if (config.title) {
    document.title = config.title
  }
  if (config.favicon) {
    let link = document.querySelector("link[rel~='icon']")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'icon'
      document.head.appendChild(link)
    }
    link.href = `${process.env.BASE_URL}${config.favicon}`
  }
}

// Applies the `fonts` and `colors` blocks of a site config as CSS custom
// properties on :root, so plain CSS (e.g. `var(--color-button)`) can react
// to the active site config without any per-component config lookups.
function applyTheme(config) {
  const root = document.documentElement.style
  const fonts = config.fonts || {}
  const colors = config.colors || {}

  if (fonts.url) {
    let link = document.querySelector("link[data-config-font]")
    if (!link) {
      link = document.createElement('link')
      link.rel = 'stylesheet'
      link.dataset.configFont = 'true'
      document.head.appendChild(link)
    }
    link.href = fonts.url
  }
  if (fonts.family) {
    root.setProperty('--app-font-family', fonts.family)
  }

  if (colors.background) {
    root.setProperty('--color-background', colors.background)
  }
  if (colors.button) {
    root.setProperty('--color-button', colors.button)
  }
  if (colors['button-hover']) {
    root.setProperty('--color-button-hover', colors['button-hover'])
  }
}

// Loads the runtime config named by the `config` URL parameter (falling back
// to default.json if absent or if loading fails) and caches it for getConfig().
export async function loadConfig() {
  const requestedName = getRequestedConfigName()

  try {
    cachedConfig = await fetchConfig(requestedName)
  } catch (err) {
    console.warn(`[config] Could not load "${requestedName}.json", falling back to "${DEFAULT_CONFIG_NAME}.json".`, err)
    if (requestedName === DEFAULT_CONFIG_NAME) {
      cachedConfig = {}
    } else {
      try {
        cachedConfig = await fetchConfig(DEFAULT_CONFIG_NAME)
      } catch (fallbackErr) {
        console.error(`[config] Could not load "${DEFAULT_CONFIG_NAME}.json" either.`, fallbackErr)
        cachedConfig = {}
      }
    }
  }

  applyDocumentMeta(cachedConfig)
  applyTheme(cachedConfig)
  return cachedConfig
}

export function getConfig() {
  if (!cachedConfig) {
    throw new Error('[config] getConfig() called before loadConfig() resolved.')
  }
  return cachedConfig
}
