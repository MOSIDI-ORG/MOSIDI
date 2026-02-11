import { useRoute, useRouter } from "vue-router"

export function useMapCameraDeepLink(map) {
  const router = useRouter()
  const route = useRoute()
  function initializeMode() {
    if (!route.query.mode) {
      router.replace({
        query: {
          ...route.query,
          mode: 'edit' // Set default mode
        }
      })
    }
  }

  // ---- read URL → map ----
  function applyUrlToMap() {
    if (!map) return

    const lat = Number(route.query.lat)
    const lng = Number(route.query.lng)
    const z = Number(route.query.z)

    if (isFinite(lat) && isFinite(lng) && isFinite(z)) {
      map.jumpTo({
        center: [lng, lat],
        zoom: Math.min(Math.max(z, 3), 22)
      })
    }

    // Apply mode (view/edit)
    const mode = route.query.mode || 'edit' // default to 'edit' if not specified
    applyMapMode(mode)
    
    console.log(route.query.mode, "mode")
  }

  // ---- Apply read-only or edit mode to map ----
  function applyMapMode(mode) {
    if (!map) return

    if (mode === 'view') {
      // Disable interactions for view-only mode
      map.dragPan.disable()
      map.scrollZoom.disable()
      map.boxZoom.disable()
      map.dragRotate.disable()
      map.keyboard.disable()
      map.doubleClickZoom.disable()
      map.touchZoomRotate.disable()
      
      // Optional: Add visual indicator that map is read-only
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = 'default'
      }
      
      console.log('Map set to VIEW ONLY mode')
    } else {
      // Enable interactions for edit mode
      map.dragPan.enable()
      map.scrollZoom.enable()
      map.boxZoom.enable()
      map.dragRotate.enable()
      map.keyboard.enable()
      map.doubleClickZoom.enable()
      map.touchZoomRotate.enable()
      
      if (map.getCanvas()) {
        map.getCanvas().style.cursor = ''
      }
      
      console.log('Map set to EDIT mode')
    }
  }

  // ---- map → URL ----
  function syncMapToUrl() {
    if (!map) return

    const c = map.getCenter()

    router.replace({
      query: {
        ...route.query,          // preserve all params
        lat: c.lat.toFixed(5),
        lng: c.lng.toFixed(5),
        z: map.getZoom().toFixed(2)
      }
    })
  }

  function attach() {
    applyUrlToMap()
    initializeMode()
    map.on("moveend", syncMapToUrl)
    map.on("zoomend", syncMapToUrl)
  }

  function detach() {
    map.off("moveend", syncMapToUrl)
    map.off("zoomend", syncMapToUrl)
  }

  return { attach, detach }
}