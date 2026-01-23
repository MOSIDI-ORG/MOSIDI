import { useRoute, useRouter } from "vue-router"
import { watch } from "vue"
import { useDatasetSearchStore } from "@/stores/datasetSearch"
import { useaddedDatasetsStore } from "@/stores/addedDatasets"

export function useIndicatorDeepLink(addLayerToMap) {
  const route = useRoute()
  const router = useRouter()
  const datasetSearchStore = useDatasetSearchStore()
  const addedDatasetsStore = useaddedDatasetsStore()

  /* -----------------------------
     URL → App
  ------------------------------ */
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

 
}

  /* -----------------------------
     App → URL
  ------------------------------ */
  function syncDatasetToUrl() {
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
      ([name, meta]) => `${name}:${meta.geometry_type}`
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
  }

  return { attach }
}
