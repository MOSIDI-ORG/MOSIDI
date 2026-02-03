import { useRoute } from "vue-router"
import { useIndicatorStore } from "@/stores/indicator"

export function useCartographyDeepLink({
  mapStylizationFromDeepLink,
  changeLayerOpacity,
  setLayerPintProperty
}) {
  const route = useRoute()
  const indicatorStore = useIndicatorStore()

  /* -----------------------------
     Helpers
  ------------------------------ */

  function parseDatasetEntry(entry) {
  // 1. Split by colon but limit the initial split to handle the palette separately
  const parts = entry.split(":");
  const name = parts[0]?.trim();
  if (!name) return null;

  const datatype = parts[1] || "indikator";
  
  // 2. Opacity check
  const opacity = parts[2] !== undefined && !isNaN(Number(parts[2]))
    ? Number(parts[2])
    : 1;

  // 3. Palette logic: specifically look at index 3
  let palette = [];
  if (parts[3]) {
    palette = parts[3]
      .split("|")
      .map(c => c.trim())
      .filter(Boolean)
      .map(c => c.startsWith('#') ? c : `#${c}`); // Ensure # is only added if missing
  }

  return {
    name,
    datatype,
    opacity,
    palette,
  };
}

  /* -----------------------------
     URL → App
  ------------------------------ */

  // Inside useCartographyDeepLink function
async function applyUrlToStore() {
  const added = route.query.added_datasets
  if (!added) return

  const entries = Array.isArray(added) ? added : added.split(",")
  // Helper to wait for store initialization
  /*const waitForStore = (name) => {
    return new Promise((resolve) => {
      const check = () => {
        if (indicatorStore.indicatorArray[name]) {
          resolve();
        } else {
          setTimeout(check, 100);
        }
      };
      check();
    });
  };*/

  for (const entry of entries) {
    const parsed = parseDatasetEntry(entry)
    if (!parsed) continue

    const { name, datatype, opacity, palette } = parsed
    console.log(`Applying dataset from URL: ${name}, type: ${datatype}, opacity: ${opacity}, palette: ${palette}`)

    // WAIT HERE: Don't proceed until the store actually has this indicator
    //await waitForStore(name);
    console.log(indicatorStore.indicatorArray, "indicator array in deeplink")
    if (palette.length) {
      mapStylizationFromDeepLink(palette,datatype, name)
    }

    if (datatype=="Polygon" || datatype=="polygon" || datatype=="MultiPolygon" || datatype=="multipolygon"){
      console.log("polygon opacity set from deeplink")
      changeLayerOpacity(opacity, name)
    }
    else if (datatype=="raster"){
      console.log("raster opacity set from deeplink")
      setLayerPintProperty(name, 'raster-opacity', opacity)
    }
    
  }
}

  /* -----------------------------
     Public API
  ------------------------------ */

  const requiredIndicators = (() => {
    const added = route.query.added_datasets
    if (!added) return []

    const entries = Array.isArray(added)
      ? added
      : added.split(",")

    return entries
      .map(e => e.split(":")[0]?.trim())
      .filter(Boolean)
  })()

  function attach() {
    applyUrlToStore()
  }

  return {
    attach,
    requiredIndicators,
  }
}
