<template>
    
    <div v-if="indicatorArray[selectedDataset] && tableMetadata" class="bivariate-ui">
        <div class="header">
            <div width="371" class="mb-2 ml-1 mr-1">
                <v-text-field
                    :label="$t('dataset-filter.search')"
                    prepend-inner-icon="mdi-magnify"
                    class="expanding-search"
                    filled
                    outlined
                    density="compact"
                    clearable
                    dense
                    single-line
                    hide-details
                    v-model="layerSearchText"
                >
                </v-text-field>
                    
            </div>
            <div class="ml-1 mr-1 mb-2">
                <v-row no-gutters>
                    <v-col >
                        <v-select
                            :items="datasetTypes"
                            :item-title="'alias'"
                            :item-value="'name'"
                            :label="$t('dataset-filter.filter-label.type')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded  
                            v-model="selectedDatasetType"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=dataSources
                            :label="$t('dataset-filter.filter-label.source')"
                            
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                                
                            v-model="selectedDatasetSource"
                        ></v-select>
                    </v-col>
                    
                
                </v-row>
                <v-row no-gutters class="mt-2">
                    <v-col>
                        <v-select
                            :items=geometryTypes
                            :label="$t('dataset-filter.filter-label.geometry')"
                                variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                            v-model="selectedGeometryTypee"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=availableYearsForIndicatorFilter
                            :label="$t('dataset-filter.filter-label.time')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                            v-model="selectedYearIndicatorFilter"
                        ></v-select>
                    </v-col>
                </v-row>
            </div>
            </div>
                   
            <v-card class="dataset-filter-ui mx-auto text-left animated-transform"  width="371">
                <v-list lines="two" style="background-color:transparent;" class="ml-1 mr-1">
                    <span style="font-size: 1rem; font-weight: 500;" class="ml-2">{{filteredItems?.length + ' '+  $t('dataset-filter.results')}}</span>
                    <v-list-item
                        v-for="(metadata, index) in filteredItems"
                        :key="index"
                        v-model="indicatorArray[selectedDataset]['secondIndicatorName']"
                        @click=addIndicator(metadata)
                        @mouseover="hoveredItem = index"
                        @mouseleave="hoveredItem = null"
                        style="border-radius: 5px;"
                    >
                    

                    <v-list-item-subtitle 
                        v-if="metadata.dct_type === 'indikator'" 
                        class="text-wrap text-caption"
                    >
                        {{ metadata.dcatde_politicalgeocodingleveluri }}
                    </v-list-item-subtitle>

                    <v-list-item-title class="text-wrap" v-text="metadata.dct_title"></v-list-item-title>
                    
                    <v-list-item-subtitle class="text-wrap text-caption" v-text="metadata.dct_catalog_publisher"></v-list-item-subtitle>


                        <template v-slot:prepend>
                            <v-avatar>
                                <v-img 
                                    :src="getIcon(metadata.dct_title, index, metadata.geometry_type)"
                                    max-height="40"
                                    max-width="40"
                                    style="cursor: pointer;"
                                    
                                ></v-img>
                            </v-avatar>
                        </template>
                        <!-- RIGHT SIDE SELECT -->
                    <template  v-slot:append>
                        <div v-if="selectedSecondIndicator == metadata.dct_title && indicatorArray[selectedDataset]['secondIndicator']"  @click.stop @mouseover.stop @mouseleave.stop>
                        <v-select
                            :items="indicatorArray[selectedDataset]['secondIndicator']['availailableYearsForSecondSelectedIndicator']"
                            dense
                            hide-details
                            variant="underlined"
                            style="width: 120px;"
                            v-model="indicatorArray[selectedDataset]['secondIndicator']['secondSelectedYear']"
                            @update:modelValue="filterBySecondYear()"
                        ></v-select>
                        </div>
                    </template>
                        
                        
                
                    </v-list-item>
        

                </v-list>
  

            </v-card>
            <!-- FIXED BOTTOM BAR -->
            <div v-if="selectedIndicators.length > 0" class="bottom-bar">
            <!-- Header -->
            <div class="bottom-bar-header">
                <v-icon size="16" color="rgba(255,255,255,0.7)">mdi-layers</v-icon>
                <span class="bottom-bar-title">Selected Datasets</span>
                <v-chip size="x-small" color="primary" variant="tonal" class="count-chip">
                    {{ selectedIndicators.length }}
                </v-chip>
            </div>

            <!-- Chips -->
            <div class="chips-row">
                <v-chip
                v-for="(indicator, i) in selectedIndicators"
                :key="indicator.indicatorname"
                :closable="i !== 0"
                size="small"
                color="primary"
                variant="tonal"
                class="chip-item"
                @click:close="removeIndicator(i)"
            >
                {{ indicator.indicatorname }}
            </v-chip>
            </div>

            <!-- Apply Button -->
            <div class="bottom-bar-actions">
                <v-btn
                    size="small"
                    variant="flat"
                    color="primary"
                    rounded="lg"
                    prepend-icon="mdi-check"
                    :disabled="selectedIndicators.length !== 3"
                    @click="applyIndicators"
                >
                    Apply 
                </v-btn>
                <v-btn
                    size="small"
                    variant="flat"
                    color="primary"
                    rounded="lg"
                    class="ml-2"
                    prepend-icon="mdi-close"
                    :disabled="selectedIndicators.length !== 3"
                    @click="clearIndicators"
                >
                    Clear
                </v-btn>
            </div>
            
        </div>
          
        </div>
            
</template>

<script setup>
import {ref, computed, watch, defineEmits} from "vue"
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { storeToRefs } from 'pinia'
import { useIndicatorStore } from '@/stores/indicator'
import {getIndicatorData} from "../services/backend.calls";
import {getternaryDataFromDB} from "../services/backend.calls";
const emit = defineEmits("addTernaryLayerToMap", "backtoUnivariateMap")
const indicatorStore = useIndicatorStore()

let {  tableMetadata, selectedDataset } = storeToRefs(useDatasetSearchStore())
let {indicatorArray} = storeToRefs(useIndicatorStore())
let selectedIndicators = ref([])

watch(
    () => indicatorArray.value[selectedDataset.value] ,
    (newVal ) => {
        if (newVal) {
            selectedGeometryTypee.value = newVal.granularity
            if(indicatorArray.value[selectedDataset.value]?.ternaryData==undefined){
                const granularity = newVal.granularity
                const indicatorname = selectedDataset.value.replace(`_${granularity}`, '').replace(granularity, '')
                const selectedYear = newVal.selectedYear
                selectedIndicators.value = [{ indicatorname, granularity, selectedYear }]
                console.log(selectedIndicators.value)
            }
            else {
                selectedIndicators.value = indicatorArray.value[selectedDataset.value]?.ternaryData?.indicatorsInfo

            }
        }
    },
    { immediate: true }
    
)

let selectedDatasetType = ref('');
let selectedDatasetSource = ref('');
let selectedGeometryTypee = ref('');
let selectedYearIndicatorFilter = ref('');
let layerSearchText = ref('');
let {  activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())
let hoveredItem = ref(null)
let dataSources = ref(null)
let geometryTypes = ref(null)
let availableYearsForIndicatorFilter =ref(null)
let selectedSecondIndicator = ref(null)
const datasetTypes = computed(() => {
  if (activatedDatasetSearch.value === 'indicator') {
    return [{ alias: 'Indicator', name: 'indikator' }];
  } else if (activatedDatasetSearch.value === 'geodata') {
    return [{ alias: 'WMS', name: 'raster' }];
  } else {
    return [
      { alias: 'Indicator', name: 'indikator' },
      { alias: 'WMS', name: 'raster' },
      { alias: 'All', name: 'all' },
    ];
  }
});



watch(
  () => tableMetadata.value,
  (newVal) => {
    if (!newVal?.length) return

    const seen = new Set()
    const deduped = newVal.filter(item => {
      const key = `${item.dct_title}__${item.dcatde_politicalgeocodingleveluri ?? ''}`
      if (seen.has(key)) return false
      seen.add(key)
      return true
    })

    dataSources.value = [
      ...new Set(deduped.map(item => item.dct_catalog_publisher)),
      "All"
    ]
    geometryTypes.value = [
      ...new Set(deduped.map(item => item.dcatde_politicalgeocodingleveluri)),
      "All"
    ]
    availableYearsForIndicatorFilter.value = [
      ...new Set(
        deduped
          .map(item => new Date(item.dct_temporal_enddate).getFullYear())
          .sort()
      ),
      "All"
    ]
  },
  { immediate: true }
)



const deduplicatedMetadata = computed(() => {
  if (!tableMetadata.value?.length) return []
  const seen = new Set()
  return tableMetadata.value.filter(item => {
    const key = `${item.dct_title}__${item.dcatde_politicalgeocodingleveluri ?? ''}`
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
})

const filteredItems = computed(() => {
  return deduplicatedMetadata.value.filter(item => {  // ← was tableMetadata?.value
    const matchesSearchText = layerSearchText.value
      ? item.dct_title.toLowerCase().includes(layerSearchText.value.toLowerCase())
      : true
    const matchesDatasetType = selectedDatasetType.value && selectedDatasetType.value !== 'all'
      ? item.dct_type === selectedDatasetType.value
      : true
    const preFilterDatasetType = (() => {
      if (activatedDatasetSearch.value === 'indicator') return item.dct_type === 'indikator'
      if (activatedDatasetSearch.value === 'geodata') return item.dct_type === 'raster'
      return true
    })()
    const matchesDatasetSource = selectedDatasetSource.value && selectedDatasetSource.value !== 'All'
      ? item.dct_catalog_publisher === selectedDatasetSource.value
      : true
    const matchesGeometryType = selectedGeometryTypee.value && selectedGeometryTypee.value !== 'All'
      ? item.dcatde_politicalgeocodingleveluri === selectedGeometryTypee.value
      : true
    const matchesDatasetYear = selectedYearIndicatorFilter.value && selectedYearIndicatorFilter.value !== 'All'
      ? new Date(item.dct_temporal_enddate).getFullYear() >= parseInt(selectedYearIndicatorFilter.value)
      : true
    return matchesSearchText && matchesDatasetType && preFilterDatasetType && matchesDatasetSource && matchesGeometryType && matchesDatasetYear
  })
})
const getIcon = (layerName, index, geomType) => {

    const isSelected = selectedIndicators.value?.some(
        item => item.indicatorname === layerName
    );

    if (isSelected && hoveredItem.value === index) {
        return 'icons/minus.svg';
    }
    else if (isSelected) {
        return 'icons/check.svg';
    }
    else if (hoveredItem.value === index) {
        return 'icons/plus.svg';
    }
    else {
        if (geomType === 'Point') {
            return 'icons/point-blue.svg';
        }
        else if (
            geomType === "MultiLineString" ||
            geomType === "LineString" ||
            geomType === "Line"
        ) {
            return 'icons/line-blue.svg';
        }
        else if (
            geomType === "MultiPolygon" ||
            geomType === "Polygon" ||
            geomType === "Geometry"
        ) {
            return 'icons/polygon-blue.svg';
        }
        else {
            return 'icons/raster.svg';
        }
    }
};

const addIndicator = async (metadata) => {
    const exists = selectedIndicators.value.findIndex(i => i.indicatorname === metadata.dct_title)
    
    if (exists !== -1) {
        if (exists === 0) return  // protect base indicator
        selectedIndicators.value = selectedIndicators.value.filter((_, i) => i !== exists)
    } else {
        const indicatorData = await getIndicatorData(metadata.dct_title, metadata.dcatde_politicalgeocodingleveluri)
        selectedIndicators.value.push({
            indicatorname: metadata.dct_title,
            granularity: metadata.dcatde_politicalgeocodingleveluri,
            selectedYear: indicatorData.availabeYears[0][0].at(-1),
        })
    }
}
const applyIndicators =async ()=>{
    // Here you would typically emit an event or call a method to apply the selected indicators to the map
    const data  = await getternaryDataFromDB(selectedIndicators.value)
    const gran = selectedIndicators.value[0].granularity
    const ind1 = selectedIndicators.value[0].indicatorname
    const year1 = selectedIndicators.value[0].selectedYear
    const ind2 = selectedIndicators.value[1].indicatorname
    const year2 = selectedIndicators.value[1].selectedYear
    const ind3 = selectedIndicators.value[2].indicatorname
    const year3 = selectedIndicators.value[2].selectedYear

    const existingSourceId = selectedDataset.value

    const ternaryData = {
        ternaryData: data,
        granularity: gran,
        existingSourceId: existingSourceId,
        indicatorsInfo: [
            { indicatorname: ind1, granularity: gran, selectedYear: year1 },
            { indicatorname: ind2, granularity: gran, selectedYear: year2 },
            { indicatorname: ind3, granularity: gran, selectedYear: year3 }
        ]
    }
    indicatorStore.setTernaryData(ternaryData)
    emit('addTernaryLayerToMap', ternaryData)
}
const removeIndicator = (index) => {
    if (index === 0) return
    selectedIndicators.value = selectedIndicators.value.filter((_, i) => i !== index)
}

const clearIndicators = () => {
    for (let i = selectedIndicators.value.length - 1; i >= 0; i--) {
        if (i !== 0) {
            selectedIndicators.value.splice(i, 1);
        }
    }
    indicatorArray.value[selectedDataset.value].ternaryData = null
    emit("backtoUnivariateMap", selectedDataset.value)
    console.log(indicatorArray.value[selectedDataset.value], "after clearing ternary data")

}


</script>

<style scoped>

.bivariate-ui {
    display: flex;
    flex-direction: column;
    height: 100%;       /* fill the parent */
    overflow: hidden;
}

.header{
    position: sticky;
    z-index: 10;
    background-color: var(--color-background, rgba(0,0,0,1));
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
}

.dataset-filter-ui {
    flex: 1;            /* takes all space not claimed by header/footer */
    overflow-y: scroll;
    background: transparent;
    z-index: 10;
}

.bottom-bar {
    flex-shrink: 0;
    background-color: rgba(15, 15, 15, 0.97);
    border-top: 1px solid rgba(255, 255, 255, 0.1);
    display: flex;
    flex-direction: column;
    align-items: stretch;
    padding: 10px 12px;
    gap: 8px;
    z-index: 20;
}

.bottom-bar-header {
    display: flex;
    align-items: center;
    gap: 6px;
    padding-bottom: 4px;
    border-bottom: 1px solid rgba(255, 255, 255, 0.08);
}

.bottom-bar-title {
    color: rgba(255, 255, 255, 0.85);
    font-size: 0.78rem;
    font-weight: 600;
    letter-spacing: 0.05em;
    text-transform: uppercase;
    flex: 1;
}

.count-chip {
    font-size: 0.7rem;
    font-weight: 700;
}

.chips-row {
    display: flex;
    flex-wrap: wrap;
    gap: 6px;
    max-height: 80px;
    overflow-y: auto;
}

.chip-item {
    font-size: 0.72rem;
    max-width: 160px;
}

.chip-item :deep(.v-chip__content) {
    overflow: hidden;
    text-overflow: ellipsis;
    white-space: nowrap;
    min-width: 0;
    flex: 1;
}

.chip-item :deep(.v-chip__close) {
    flex-shrink: 0;  /* ← never let the close btn get squeezed */
    margin-left: 4px;
}

.bottom-bar-actions {
    display: flex;
    justify-content: center;
    padding-top: 4px;
}
</style>