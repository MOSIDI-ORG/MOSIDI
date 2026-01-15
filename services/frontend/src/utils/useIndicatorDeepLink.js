// composables/useIndicatorDeepLink.js
import { useRoute, useRouter } from "vue-router"
import { watch } from "vue"
import { useDatasetSearchStore } from "@/stores/datasetSearch"

export function useIndicatorDeepLink(addLayerToMap) {
  const route = useRoute()
  const router = useRouter()
  const datasetSearchStore = useDatasetSearchStore()

  /* -----------------------------
     URL → App
  ------------------------------ */
  async function applyUrlToStore() {
    const name = route.query.dataset
    const type = route.query.type // "indikator" or "raster"

    if (!name || !type) return

    if (datasetSearchStore.selectedDataset !== name) {
      datasetSearchStore.setSelecteddatasetName(name)
      await addLayerToMap(name, type)
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

    router.replace({
      query: {
        ...route.query,
        dataset: datasetSearchStore.selectedDataset,
        type
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
