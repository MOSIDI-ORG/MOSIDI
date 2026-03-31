import { useRoute } from "vue-router"
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { watch } from "vue"
import { useaddedDatasetsStore } from "@/stores/addedDatasets"

export function useCartographyDeepLink({
  mapStylizationFromDeepLink,
  changeLayerOpacity,
  setLayerPintProperty,
  addSecondIndicator
}) {
  const route = useRoute()
  const datasetSearchStore  = useDatasetSearchStore()

  const addedDatasetsStore = useaddedDatasetsStore()

  /* -----------------------------
     Helpers
  ------------------------------ */

  function parseDatasetEntry(entry) {
  // 1. Split by colon but limit the initial split to handle the palette separately
  const parts = entry.split(":");
  const name = parts[0]?.trim();
  if (!name) return null;

  const datatype = parts[1] || "indikator";
  const granularity = parts[2]?.trim();
  // 2. Opacity check
  const opacity = parts[3] !== undefined && !isNaN(Number(parts[3]))
    ? Number(parts[3])
    : 1;

  // 3. Palette logic: specifically look at index 3
  let palette = [];
  if (parts[4]) {
    palette = parts[4]
      .split("|")
      .map(c => c.trim())
      .filter(Boolean)
      .map(c => c.startsWith('#') ? c : `#${c}`); // Ensure # is only added if missing
  }
  let secondIndicator
  if(parts[5]){
    secondIndicator= parts[5]?.trim()
  }   

  return {
    name,
    datatype,
    granularity,
    opacity,
    palette,
    secondIndicator
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

  for (const entry of entries) {
    const parsed = parseDatasetEntry(entry)
    if (!parsed) continue

    const { name, datatype, granularity, opacity, palette, secondIndicator } = parsed

    // WAIT HERE: Don't proceed until the store actually has this indicator
    //await waitForStore(name);
    if (palette.length && mapStylizationFromDeepLink) {
      mapStylizationFromDeepLink(palette,datatype, name+'_'+granularity)
    }

    if ((datatype=="Polygon" || datatype=="polygon" || datatype=="MultiPolygon" || datatype=="multipolygon") && changeLayerOpacity){
      changeLayerOpacity(opacity, name+'_'+granularity)
    }
    else if (datatype=="raster" && setLayerPintProperty){
      setLayerPintProperty(name+'_'+granularity, 'raster-opacity', opacity)
    }

    if (secondIndicator!==null && addSecondIndicator){
      let metadata = datasetSearchStore?.tableMetadata?.find(item => item['dct_title'] === secondIndicator)
      if (metadata){
          datasetSearchStore.selectedDataset = name+'_'+granularity

          addSecondIndicator(metadata)

      }
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
    // ✅ Watch readyForCartography, only apply once it's true
    const stopWatch = watch(
      () => addedDatasetsStore.readyForCartography,
      (isReady) => {
        if (isReady) {
          applyUrlToStore()
          stopWatch() // ✅ stop watching after first trigger — only need it once
        }
      },
      { immediate: true } // ✅ in case it's already true when attach() is called
    )
  }

  return {
    attach,
    requiredIndicators,
  }
}
