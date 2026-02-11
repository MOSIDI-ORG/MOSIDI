import { useRoute, useRouter } from "vue-router"
import { watch } from "vue"
import { useDatasetSearchStore } from "@/stores/datasetSearch"
import { useaddedDatasetsStore } from "@/stores/addedDatasets"
import { useIndicatorStore } from "@/stores/indicator"

export function useIndicatorDeepLink(addLayerToMap) {
  const route = useRoute()
  const router = useRouter()
  const datasetSearchStore = useDatasetSearchStore()
  const addedDatasetsStore = useaddedDatasetsStore()
  const indicatorStore = useIndicatorStore()

  /* -----------------------------
     URL → App
  ------------------------------ */
  let isInitializing = true;

  async function applyUrlToStore() {
  /* -----------------------------
    restore added datasets
  ------------------------------ */
  const added = route.query.added_datasets
  if (added) {
    
    const entries = Array.isArray(added)
      ? added
      : added.split(",")

    if (entries.length>0){
      datasetSearchStore.searchInitiated=true
    }
    for (const entry of entries) {
      const [name, type] = entry.split(":")
      if (!name || !type) continue
        await addLayerToMap(name, type)
     
    }
  }
  addedDatasetsStore.declareReadyToCartographyDeepLink()
  isInitializing = false;
 
}

  /* -----------------------------
     App → URL
  ------------------------------ */
  function syncDatasetToUrl() {
    if (isInitializing) return;
    if (!datasetSearchStore.selectedDataset) return

  let type = null
  if (datasetSearchStore.selectedDatasetType === "indikator") type = "indikator"
  if (datasetSearchStore.selectedDatasetType === "raster") type = "raster"
  if (!type) return

  let addedDatasets = []

  // ✅ addedLayers = [ { name: { geometry_type, ... } } ]
  const layersObj = addedDatasetsStore?.addedLayers
  if (layersObj) {
    addedDatasets = Object.entries(layersObj).map(
      ([name, meta]) => {
        // 2. Extract opacity (using your 'fill-opacity' key)
        const opacity = indicatorStore.indicatorArray[name]?.['fill-opacity'] ?? 1

        // 3. Extract palette (using your 'colorPalette' key)
        // Strip '#' to keep URL cleaner
        const palette = indicatorStore.indicatorArray[name]?.colorPalette
          ? indicatorStore.indicatorArray[name].colorPalette.map(c => c.replace('#', '')).join('|')
          : ''
        
        const secondIndicator = indicatorStore.indicatorArray[name]?.secondIndicatorName
        ? indicatorStore.indicatorArray[name]?.secondIndicatorName : null
        return `${name}:${meta.geometry_type}:${opacity}:${palette}:${secondIndicator}`
      }
    )
  }

  router.replace({
    query: {
      ...route.query,

      dataset: datasetSearchStore.selectedDataset,
      type,

      ...(addedDatasets.length && {
        added_datasets: addedDatasets.join(",")
      })
    }
  })
}



  function attach() {
    applyUrlToStore()
    watch(() => datasetSearchStore.selectedDataset, syncDatasetToUrl)
    watch(() => datasetSearchStore.selectedDatasetType, syncDatasetToUrl)
    watch(
      () =>
        Object.entries(addedDatasetsStore.addedLayers ?? {}).map(([name]) => ({
          name,
          opacity: indicatorStore.indicatorArray[name]?.['fill-opacity'],
          palette: indicatorStore.indicatorArray[name]?.colorPalette,
          secondIndicator: indicatorStore.indicatorArray[name]?.secondIndicatorName
        })),
      syncDatasetToUrl,
      { deep: true }
    )
    
  }

  return { attach }
}
