import { useRoute } from "vue-router"
import { useDatasetSearchStore } from '../stores/datasetSearch'


export function useCartographyDeepLink({
  mapStylizationFromDeepLink,
  changeLayerOpacity,
  setLayerPintProperty,
  addSecondIndicator
}) {
  const route = useRoute()
  const datasetSearchStore  = useDatasetSearchStore()


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
  let secondIndicator
  if(parts[4]){
    secondIndicator= parts[4]?.trim()
  }   

  return {
    name,
    datatype,
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

    const { name, datatype, opacity, palette, secondIndicator } = parsed
    console.log(`Applying dataset from URL: ${name}, type: ${datatype}, opacity: ${opacity}, palette: ${palette}, secondIndicator: ${secondIndicator}`)

    // WAIT HERE: Don't proceed until the store actually has this indicator
    //await waitForStore(name);
    if (palette.length && mapStylizationFromDeepLink) {
      mapStylizationFromDeepLink(palette,datatype, name)
    }

    if ((datatype=="Polygon" || datatype=="polygon" || datatype=="MultiPolygon" || datatype=="multipolygon") && changeLayerOpacity){
      console.log("polygon opacity set from deeplink")
      changeLayerOpacity(opacity, name)
    }
    else if (datatype=="raster" && setLayerPintProperty){
      console.log("raster opacity set from deeplink")
      setLayerPintProperty(name, 'raster-opacity', opacity)
    }

    if (secondIndicator!==null && addSecondIndicator){
      let metadata = datasetSearchStore.tableMetadata.find(item => item['dct_title'] === secondIndicator)
      if (metadata){
          datasetSearchStore.selectedDataset = name

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
    applyUrlToStore()
  }

  return {
    attach,
    requiredIndicators,
  }
}
