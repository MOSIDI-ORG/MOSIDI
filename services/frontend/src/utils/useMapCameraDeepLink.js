import { useRoute, useRouter } from "vue-router"

export function useMapCameraDeepLink(map) {
  const router = useRouter()
  const route = useRoute()

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
  }

  // ---- map → URL ----
  function syncMapToUrl() {
    if (!map) return

    const c = map.getCenter()

    router.replace({
      query: {
        ...route.query,          // preserve future params (indicator, year…)
        lat: c.lat.toFixed(5),
        lng: c.lng.toFixed(5),
        z: map.getZoom().toFixed(2)
      }
    })
  }

  function attach() {
    applyUrlToMap()
    map.on("moveend", syncMapToUrl)
    map.on("zoomend", syncMapToUrl)
  }

  function detach() {
    map.off("moveend", syncMapToUrl)
    map.off("zoomend", syncMapToUrl)
  }

  return { attach, detach }
}