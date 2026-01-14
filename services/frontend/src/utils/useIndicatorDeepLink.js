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
    const indicatorName = route.query.indicator
    if (!indicatorName) return

    if (datasetSearchStore.selectedDataset !== indicatorName) {
      datasetSearchStore.setSelecteddatasetName(indicatorName)

      // THIS is the important part
      await addLayerToMap(indicatorName, "indikator")
    }
  }

  /* -----------------------------
     App → URL
  ------------------------------ */
  function syncDatasetToUrl() {
    if (!datasetSearchStore.selectedDataset) return

    router.replace({
      query: {
        ...route.query,
        indicator: datasetSearchStore.selectedDataset
      }
    })
  }

  function attach() {
    applyUrlToStore()
    watch(() => datasetSearchStore.selectedDataset, syncDatasetToUrl)
  }

  return { attach }
}
