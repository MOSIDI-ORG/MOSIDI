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
  return cachedConfig
}

export function getConfig() {
  if (!cachedConfig) {
    throw new Error('[config] getConfig() called before loadConfig() resolved.')
  }
  return cachedConfig
}
