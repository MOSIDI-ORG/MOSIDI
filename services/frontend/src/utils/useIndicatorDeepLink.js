import { useRoute, useRouter } from "vue-router"
import { watch } from "vue"
import { useDatasetSearchStore } from "@/stores/datasetSearch"
import { useaddedDatasetsStore } from "@/stores/addedDatasets"
import { useIndicatorStore } from "@/stores/indicator"
import { useChartStore } from '../stores/chart'


export function useIndicatorDeepLink(addLayerToMap) {
  const route = useRoute()
  const router = useRouter()
  const datasetSearchStore = useDatasetSearchStore()
  const addedDatasetsStore = useaddedDatasetsStore()
  const indicatorStore = useIndicatorStore()
  const chartStore = useChartStore()

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
      const [name, mapType, type, granularity] = entry.split(":")
      if (!name || !mapType || !type) continue
        //indicatorStore.indicatorArray[name]['visualizationType'] = mapType
        await addLayerToMap(name, type, granularity, mapType)
     
    }
  }
  const selectedFeatureStr = route.query.selected_feature
  if (selectedFeatureStr) {
    try {
      chartStore.selectedFeature = JSON.parse(selectedFeatureStr)
    } catch (e) {
      console.warn('Failed to parse selected_feature from URL:', e)
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
        const maptype = indicatorStore.indicatorArray[name]?.visualizationType || 'polygon'
        // 2. Extract opacity (using your 'fill-opacity' key)
        const opacity = indicatorStore.indicatorArray[name]?.['fill-opacity'] ?? 1

        // 3. Extract palette (using your 'colorPalette' key)
        // Strip '#' to keep URL cleaner
        const palette = indicatorStore.indicatorArray[name]?.colorPalette
          ? indicatorStore.indicatorArray[name].colorPalette.map(c => c.replace('#', '')).join('|')
          : ''
        
        const secondIndicator = indicatorStore.indicatorArray[name]?.secondIndicatorName
        ? indicatorStore.indicatorArray[name]?.secondIndicatorName : null

       
        const displayName = meta.dcatde_politicalgeocodingleveluri
        ? name.replace(`_${meta.dcatde_politicalgeocodingleveluri}`, '')
        : name.replace('_unknown', '');
        return `${displayName}:${maptype}:${meta.geometry_type}:${meta.dcatde_politicalgeocodingleveluri}:${opacity}:${palette}:${secondIndicator}`

        
      }
    )
  }
  let selectedFeature = chartStore.selectedFeature 
  ? JSON.stringify(chartStore.selectedFeature)
  : null
  
  router.replace({
    query: {
      ...route.query,

      dataset: datasetSearchStore.selectedDataset,
      type,
      ...(selectedFeature && { selected_feature: selectedFeature }),


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
    watch(() => chartStore.selectedFeature, syncDatasetToUrl)
    watch(
      () =>
        Object.entries(addedDatasetsStore.addedLayers ?? {}).map(([name]) => ({
          name,
          maptype: indicatorStore.indicatorArray[name]?.visualizationType,
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
