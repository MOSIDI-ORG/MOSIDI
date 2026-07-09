<template>

<div v-if="activatedDatasetSearch?.value!==null">
    
    <DatasetUI  
        v-show=" addedDatasetsStore.readyForCartography == true && dataUiInitiated == true"
        @addStyleExpressionByYear="addStyleExpressionByYear" 
        @filterByYear="filterByYear"
        @mapLegend="mapLegend" 
        @mapStylization="mapStylization" 
        @setLayerPintProperty="setLayerPintProperty" 
        @setLayerLayoutProperty="setLayerLayoutProperty" 
        @addStyleLayerToMap="addStyleLayerToMap" 
        @customMapStylization="customMapStylization" 
        @addTernaryLayerToMap="addTernaryLayerToMap"
    ></DatasetUI>
    <div v-show="filterInitiated==true && dataUiInitiated==false">
        
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" class="header mx-auto d-flex align-center animated-transform" width="371">

            <v-card v-show="filterInitiated==true" density="compact" width="371" style="background-color: var(--color-background, black); color: white;">
                <div class="d-flex align-center" style="padding: 8px;">
                    <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">{{$t('dataset-filter.title')}}</span>
                    <v-spacer></v-spacer>
                    <v-img 
                        src="icons/close.svg"
                        max-height="40"
                        max-width="40"
                        style="cursor: pointer;"
                        @click="toggleFilterUI"
                    ></v-img>
                </div>

                <div style="padding: 8px;">
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
                <div class="mb-4 ml-2 mr-2"  >
                    <v-row no-gutters>
                       
                        <v-col>
                            <v-select
                                :items="datasetCategories"
                                :item-title="'label'"
                                :item-value="'value'"
                                :label="$t('dataset-filter.filter-label.category')"
                                dense
                                outlined
                                density="compact"
                                single-line
                                hide-details
                                rounded
                                solo                
                                v-model="selectedDatasetCategory"
                            ></v-select>
                        </v-col>
                        <v-col>
                            <v-select
                                :items=dataSources
                                item-value="value"
                                item-title="label"
                                :label="$t('dataset-filter.filter-label.source')"
                                dense
                                outlined
                                single-line
                                density="compact"
                                hide-details
                                rounded
                                solo 
                                v-model="selectedDatasetSource"
                            >
                               
                            </v-select>
                        </v-col>
                        
                       
                    </v-row>
                    <v-row no-gutters>
                        <v-col>
                            <v-select
                                :items=geometryTypes
                                item-value="value"
                                item-title="label"
                                :label="$t('dataset-filter.filter-label.geometry')"
                                dense
                                outlined
                                single-line
                                hide-details
                                rounded
                                 density="compact"
                                solo 
                                v-model="selectedGeometryTypee"
                            >
                            
                        </v-select>
                        </v-col>
                        <v-col>
                            <v-select
                                :items=availableYearsForIndicatorFilter
                                item-value="value"
                                item-title="label"
                                :label="$t('dataset-filter.filter-label.time')"
                                dense
                                outlined
                                single-line
                                hide-details
                                rounded
                                 density="compact"
                                solo 
                                v-model="selectedYearIndicatorFilter"
                            >
                                
                            </v-select>
                        </v-col>
                    </v-row>
                </div>
            </v-card>
        

        </v-card>
        <v-card
            v-if="isLoading"
            :style="{ left: isMinimized ? '90px' : '382px' }"
            class="header mx-auto d-flex align-center justify-center animated-transform"
            width="371"
            style="background-color: var(--color-background, black); color: white; padding: 16px;"
        >
            <v-progress-circular indeterminate color="white" size="24" class="mr-3" />
            <span>Loading datasets...</span>
        </v-card>
        <v-card 
            :style="{ left: isMinimized ? '90px' : '382px' }" 
            v-show="filterInitiated==true" 
            class="dataset-filter-ui mx-auto text-left animated-transform"  
            width="371"
            >

            <div :style="{ height: activatedDatasetSearch === 'indicator' ? '81%' : '100%' }" class="ml-1 mr-1">
                <span style="font-size: 1rem; font-weight: 500;" class="ml-2">
                {{ filteredItems?.length + ' ' + $t('dataset-filter.results') }}
                </span>

                <v-virtual-scroll
                    :items="filteredItems"
                    :item-height="88"
                    height="calc(100% - 30px)"
                    style="background-color: transparent;"
                >
                <template v-slot:default="{ item, index }">
                    <v-list-item
                    @click="addLayerToMap(item.dct_title, item.geometry_type, item.dcatde_politicalgeocodingleveluri)"
                    style="border-radius: 5px;"
                    @mouseover="hoveredItem = index"
                    @mouseleave="hoveredItem = null"
                    lines="two"
                    >
                    <v-list-item-subtitle 
                        v-if="item.dct_type === 'indikator'" 
                        class="text-wrap text-caption"
                    >
                        {{ item.dcatde_politicalgeocodingleveluri }}, {{ getYear(item.dct_temporal_startdata) }}-{{ getYear(item.dct_temporal_enddate) }}
                    </v-list-item-subtitle>

                    <v-list-item-title class="text-wrap" v-text="item.dct_title"></v-list-item-title>
                    
                    <v-list-item-subtitle class="text-wrap" v-text="item.dct_catalog_publisher"></v-list-item-subtitle>

                    <template v-slot:prepend>
                        <v-avatar :class="{ 'icon-button-circle': getIcon(item.dct_title, index, item.geometry_type, item.dcatde_politicalgeocodingleveluri) === 'icons/plus.svg' }">
                        <svg
                            v-if="getIcon(item.dct_title, index, item.geometry_type, item.dcatde_politicalgeocodingleveluri) === 'icons/plus.svg'"
                            width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="cursor: pointer;"
                        >
                            <path d="M0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40Z" class="icon-button-circle-bg"/>
                            <path d="M29.6291 39.7042H50.3709M40 29.3333V50.0751" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                        </svg>
                        <v-img
                            v-else
                            :src="getIcon(item.dct_title, index, item.geometry_type, item.dcatde_politicalgeocodingleveluri)"
                            max-height="40"
                            max-width="40"
                            style="cursor: pointer;"
                        ></v-img>
                        </v-avatar>
                    </template>

                    <template v-slot:append>
                        <v-btn
                        v-show="hoveredItem === index"
                        density="compact"
                        variant="text"
                        icon
                        class="icon-button-mono"
                        @click.stop="showLayerMetadata(item.dct_title, item.dcatde_politicalgeocodingleveluri), customIndicatorUI = false"
                        >
                        <svg width="18" height="18" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <path d="M19.0984 10.0004C19.0984 12.4139 18.1397 14.7285 16.4331 16.4351C14.7265 18.1416 12.4119 19.1004 9.99844 19.1004C7.58497 19.1004 5.27035 18.1416 3.56377 16.4351C1.85719 14.7285 0.898438 12.4139 0.898438 10.0004C0.898438 7.58692 1.85718 5.2723 3.56377 3.56572C5.27035 1.85914 7.58497 0.900391 9.99844 0.900391C12.4119 0.900391 14.7265 1.85914 16.4331 3.56572C18.1397 5.2723 19.0984 7.58692 19.0984 10.0004ZM11.2005 6.40247C11.5193 6.08366 11.6984 5.65126 11.6984 5.20039C11.6984 4.74952 11.5193 4.31712 11.2005 3.99831C10.8817 3.6795 10.4493 3.50039 9.99844 3.50039C9.54757 3.50039 9.11517 3.6795 8.79636 3.99831C8.47755 4.31712 8.29844 4.74952 8.29844 5.20039C8.29844 5.65126 8.47755 6.08366 8.79636 6.40247C9.11517 6.72128 9.54757 6.90039 9.99844 6.90039C10.4493 6.90039 10.8817 6.72128 11.2005 6.40247ZM8.79844 8.30039C8.34757 8.30039 7.91517 8.4795 7.59636 8.79831C7.27754 9.11712 7.09844 9.54952 7.09844 10.0004C7.09844 10.4513 7.27754 10.8837 7.59636 11.2025C7.79421 11.4003 8.03582 11.5444 8.29844 11.6252V14.8004C8.29844 15.2513 8.47755 15.6837 8.79636 16.0025C9.11517 16.3213 9.54757 16.5004 9.99844 16.5004H11.1984C11.6493 16.5004 12.0817 16.3213 12.4005 16.0025C12.7193 15.6837 12.8984 15.2513 12.8984 14.8004C12.8984 14.3495 12.7193 13.9171 12.4005 13.5983C12.2027 13.4005 11.9611 13.2564 11.6984 13.1756V10.0004C11.6984 9.54952 11.5193 9.11712 11.2005 8.79831C10.8817 8.4795 10.4493 8.30039 9.99844 8.30039H8.79844Z" class="icon-button-mono-fill" stroke-width="1"/>
                        </svg>
                        </v-btn>
                    </template>
                    </v-list-item>
                </template>
                </v-virtual-scroll>
            </div>

            <v-divider v-if="activatedDatasetSearch === 'indicator'"></v-divider>

            <v-list-item
                :subtitle="$t('dataset-filter.custom.subtitle')"
                :title="$t('dataset-filter.custom.title')"
                v-if="activatedDatasetSearch === 'indicator'"
                @click="customIndicatorUI = true, metadataUI = false"  
            >
                <template v-slot:prepend>
                <v-avatar style="cursor: pointer;" class="icon-button-circle">
                    <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                        <path d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z" class="icon-button-circle-bg"/>
                        <path d="M19 33.508H24.6875M21.8438 36.3517V30.6642M31.0859 20L35.3516 24.2656M31.0859 24.2656L35.3516 20M19 22.1329H24.6875M30.375 32.0861H36.0625M30.375 36.3517H36.0625" stroke="#F7F8F9" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                    </svg>
                </v-avatar>
                </template>
            </v-list-item>
            </v-card>
        
    </div>
    <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="filterInitiated==true && customIndicatorUI==true" class="custom-formula-ui mx-auto text-left animated-metadata-transform"  width="371">
        <v-card  density="compact" width="371" style="background-color: var(--color-background, black); color: white;position: sticky; top: 0; z-index: 100;">
            <div class="d-flex align-center" style="padding: 8px;">
                <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">
                    {{ $t('dataset-filter.custom.header') }}
                </span>
                <v-spacer></v-spacer>
                <v-img 
                    src="icons/close.svg"
                    max-height="40"
                    max-width="40"
                    style="cursor: pointer;"
                    @click="customIndicatorUI=false"
                ></v-img>
            </div>
            
                
        </v-card>
        <CustomIndicatorUI
                :selectedColorPalette="selectedColorPalette"
                :isMinimized="isMinimized"
                @addDeckglLayer="addDeckglLayer"
                @updateDeckglLayer="updateDeckglLayer"
                @customMapStylization="customMapStylization"
                @addCustomLayer="addCustomLayer"
                v-if="customIndicatorUI==true"
        ></CustomIndicatorUI>
    </v-card>
    <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="filterInitiated==true && metadataUI==true" class="dataset-metadata-ui mx-auto text-left animated-metadata-transform"  width="371">
        <v-card  density="compact" width="371" style="background-color: var(--color-background, black); color: white;position: sticky; top: 0; z-index: 100;">
            <div class="d-flex align-center" style="padding: 8px;">
                <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">{{ $t('dataset-filter.metadata.title') }}
                   
                        
                    {{ selectedLayerName?.length> 15 ? selectedLayerName.substring(0,15) + '...': selectedLayerName }}
                </span>
                <v-spacer></v-spacer>
                <v-img 
                    src="icons/close.svg"
                    max-height="40"
                    max-width="40"
                    style="cursor: pointer;"
                    @click="metadataUI=false"
                ></v-img>
            </div>
            
                
        </v-card>
        <MetadataUI
            :metadata="selectedLayerMetadata"
            :layer-name="selectedLayerName"
            v-if="metadataUI==true"
        />
    </v-card>
</div>

</template>

<script setup>
import { onMounted, ref, computed, defineEmits, watch, nextTick } from 'vue';
import {getTableMetadata, getIndicatorData, classification, externalLayerFromDB} from "../services/backend.calls";
import { useDatasetSearchStore } from '../stores/datasetSearch'
//import { useMetadataDialogStore } from '../stores/metadataDialog'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useLineStyleStore } from '../stores/lineStyle'
import { useAlertStore } from '@/stores/alert'
import { useProgressStore } from '@/stores/progress'
import { useMapLegendStore } from '@/stores/mapLegend'
import DatasetUI from "@/components/DatasetUI.vue";
import MetadataUI from "@/components/MetadataUI.vue";
import * as colorbrewer from 'colorbrewer';
import { storeToRefs } from 'pinia'

import { usePointStyleStore } from '../stores/pointStyle'
import { usePolygonStyleStore } from '../stores/polygonStyle'
import { useIndicatorStore } from '@/stores/indicator'
import { createHistogram } from '../utils/histogram';
import { useMenuStore } from '../stores/menu'
import CustomIndicatorUI from "@/components/CustomIndicatorUI.vue";
//import { isValidURL } from '../utils/isValidURL';
import { externalLayers } from '../assets/externalLayers'; 
import { useIndicatorDeepLink } from "@/utils/useIndicatorDeepLink"


let { isMinimized } = storeToRefs(useMenuStore())
const emit = defineEmits(["updateDeckglLayer","addDeckglLayer","addStyleExpressionByYear","addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility", "fitBoundsToBBOX", "removeLayerFromMap", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleLayerToMap", "addExternaWMSLayerToMap","addTernaryLayerToMap"]);

let {  filterInitiated, dataUiInitiated, activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())


let externalWMSLayers = ref([])
let { circleStyleParams } = storeToRefs(usePointStyleStore())
let { polygonStyleParams } = storeToRefs(usePolygonStyleStore())
let {  lineStyleParams } = storeToRefs(useLineStyleStore())
//const { metadataa, tablename } = storeToRefs(useMetadataDialogStore())


let layerType = ref(null)
let style = ref(null)
let layout = ref(null)
let selectedIndicator = ref(null)
let isCommuneLayerAdded = ref(false)
let metadata = ref(null)
let availailableYearsForSelectedIndicator = ref([])
let targetYear = ref(null)
let selectedYear = [];
let matchExpression = [];
let classification_result = ref({})
let selectedClassificationMethod = ref("NaturalBreaks")
let selectedColorPalette = ref(colorbrewer.default.RdPu[5])
let metadataUI = ref(false)
let customIndicatorUI = ref(false)

//const metadataDialogStore = useMetadataDialogStore();
const datasetSearchStore = useDatasetSearchStore()
const addedDatasetsStore = useaddedDatasetsStore()
const indicatorStore = useIndicatorStore()
const alertStore = useAlertStore()
const progressStore = useProgressStore()
const mapLegendStore = useMapLegendStore();



let hoveredItem = ref(null)
let tableMetadata = ref([])
let layerSearchText= ref("")
let selectedDatasetType = ref(null)
let selectedDatasetCategory = ref(null)



//let dataSources = ref(null)
//let geometryTypes = ref(null)
let selectedGeometryTypee = ref(null)
let selectedDatasetSource = ref(null)
let selectedLayerMetadata = ref(null)
let selectedLayerName= ref(null)
let selectedYearIndicatorFilter = ref(null)
let isLoading = ref(true)
//let availableYearsForIndicatorFilter =ref(null)

onMounted(async()=>{
    //tableMetadataRequest()
    //getExternalWMSLayers()
    const deepLink = useIndicatorDeepLink(addLayerToMap)

    await Promise.all([
    tableMetadataRequest(),
    getExternalWMSLayers()
  ])
    await nextTick()
    deepLink.attach()
    isLoading.value = false 

})

// reset the selected filter when toggling the activatedDatasetSearch (geodata and indicator)
watch(activatedDatasetSearch, () => {
  // Reset dependent filters
  selectedGeometryTypee.value = null
  selectedDatasetSource.value = null
  selectedLayerMetadata.value = null
  selectedDatasetCategory.value = null
})
const getYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};
const filteredItems = computed(() => {
    const typeFilter = activatedDatasetSearch.value?.toLowerCase()
    return tableMetadata.value.filter(item => {
        const matchesSearchText = layerSearchText.value
            ? item.dct_title.toLowerCase().includes(layerSearchText.value.toLowerCase())
            : true;
        const matchesDatasetType = selectedDatasetType.value && selectedDatasetType.value !== 'all'
            ? item.dct_type === selectedDatasetType.value
            : true;
        const preFilterDatasetType = (() => {
            if (activatedDatasetSearch.value === 'indicator') {
                return item.dct_type === 'indikator';
            } else if (activatedDatasetSearch.value === 'geodata') {
                return item.dct_type === 'raster';
            } else {
                return true; 
            }
        })();
       // ONLY apply category filtering if we are dealing with indicators
        const matchesDatasetCategory = (typeFilter === 'indicator' && selectedDatasetCategory.value && selectedDatasetCategory.value !== 'All')
            ? item.dcat_ap_title === selectedDatasetCategory.value
            : true;
        const matchesDatasetSource = selectedDatasetSource.value && selectedDatasetSource.value !== 'All'
            ? item.dct_catalog_publisher === selectedDatasetSource.value
            : true;
        
        const matchesGeometryType = selectedGeometryTypee.value && selectedGeometryTypee.value !== 'All'
            ? item.dcatde_politicalgeocodingleveluri === selectedGeometryTypee.value
            : true;

        const matchesDatasetYear = selectedYearIndicatorFilter.value && selectedYearIndicatorFilter.value !== 'All'
            ? new Date(item.dct_temporal_enddate).getFullYear() >= parseInt(selectedYearIndicatorFilter.value)
            : true;
        return matchesSearchText && matchesDatasetType && preFilterDatasetType && matchesDatasetCategory && matchesDatasetSource && matchesGeometryType && matchesDatasetYear;
    });
});


const getIcon = (title, index, geomType, granularity)=> {
    let layerName = title+'_'+granularity
        if (addedDatasetsStore.addedLayers[layerName]) {
        return 'icons/check.svg'; 
      } else if (hoveredItem.value === index) {
        return 'icons/plus.svg'; 
      } else {
        if (geomType=='Point'){
            return 'icons/point-blue.svg';
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            return 'icons/line-blue.svg';
        }
        else if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
            return 'icons/polygon-blue.svg';
      }
      else {
            return 'icons/raster.svg';
        }
      }
  }
const toggleFilterUI = ()=>{
    datasetSearchStore.toggleFilter({
        filterInitiated : false
    })
    metadataUI.value= false
}
const tableMetadataRequest = async () => {
  const response = await getTableMetadata()

  tableMetadata.value = deduplicateMetadata(response).sort((a, b) =>
    a.dct_title.localeCompare(b.dct_title, 'de', { sensitivity: 'base' })
  )
}
// reactive filtered metadata based on activatedDatasetSearch
const filteredMeta = computed(() => {
  if (!tableMetadata.value) return []

  const typeFilter = activatedDatasetSearch.value?.toLowerCase()

  return tableMetadata.value.filter(item => {
    if (!item.dct_type) return false
    const itemType = item.dct_type.trim().toLowerCase()

    if (typeFilter === 'indicator') return itemType === 'indikator'
    if (typeFilter === 'geodata') return itemType === 'raster'
    return true
  })
})

const datasetCategories = computed(() => {
  // 1. Safely determine the active filter type (handling strings or wrapped store objects)
  const rawFilter = typeof activatedDatasetSearch.value === 'object' 
    ? activatedDatasetSearch.value?.value 
    : activatedDatasetSearch.value;

  const typeFilter = rawFilter?.toLowerCase()?.trim();

  // 2. If it's NOT an indicator (e.g., geodata), ONLY show the "All" option
  if (typeFilter !== 'indicator') {
    return [
      { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
    ]
  }

  // 3. If it IS an indicator, safely calculate category counts
  const counts = filteredMeta.value.reduce((acc, item) => {
    // Fallback if an indicator row accidentally missing a title string
    const key = item.dcat_ap_title ? item.dcat_ap_title.trim() : 'Uncategorized'
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return [
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      label: `${value} (${count})`
    }))
    .sort((a, b) =>
      a.value.localeCompare(b.value, 'de', { sensitivity: 'base' })
    ),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})
// reactive dataSources with counts
const dataSources = computed(() => {
  const counts = filteredMeta.value.reduce((acc, item) => {
    const key = item.dct_catalog_publisher
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return [
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      label: `${value} (${count})`
    }))
    .sort((a, b) =>
      a.value.localeCompare(b.value, 'de', { sensitivity: 'base' }) // handles German chars
    ),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})

// reactive geometryTypes with counts
const geometryTypes = computed(() => {
  const counts = filteredMeta.value.reduce((acc, item) => {
    const key = item.dcatde_politicalgeocodingleveluri
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return [
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      label: `${value} (${count})`
    })),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})

// reactive availableYears with counts
const availableYearsForIndicatorFilter = computed(() => {
  const years = filteredMeta.value.map(item => new Date(item.dct_temporal_enddate).getFullYear())
  const uniqueYears = Array.from(new Set(years)).sort((a,b)=>a-b)

  return [
    ...uniqueYears.map(year => {
      const count = years.filter(y => y >= year).length
      return { value: year, count, label: `${year} (${count})` }
    }),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})




const showLayerMetadata= (layerName, granularity)=>{
    
    selectedLayerMetadata.value = tableMetadata.value.find(item => item['dct_title'] === layerName && item['dcatde_politicalgeocodingleveluri']===granularity)
    selectedLayerName.value = layerName
    //metadataDialogStore.assignMetadata(selectedLayerMetadata.value,layerName)
    metadataUI.value= true
}
const addLayerToMap = async (layerName,geomType, granularity)=>{    
    
    if (geomType=='raster'){
        let item = externalWMSLayers.value.find(item => item.dct_title === layerName)
        addExternaWMSLayerToMap(item)
        
    }
    let selectedLayerMetadata = tableMetadata.value.find(item => item['dct_title'] === layerName && item['dcatde_politicalgeocodingleveluri']===granularity)
    addedDatasetsStore.addLayer({layerName:layerName, metadata:selectedLayerMetadata})
    if (selectedLayerMetadata?.dct_type==='table'){
        toggleClickedLayer (layerName, geomType)
    }
    else if(selectedLayerMetadata?.dct_type==='indikator'){
        selectedIndicator.value = layerName
        
        await addCommuneTileLayer(layerName+'_'+granularity, selectedLayerMetadata.dcatde_politicalgeocodingleveluri);
        emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
        await getIndicator(selectedIndicator.value, selectedLayerMetadata.dcatde_politicalgeocodingleveluri);
        for(let layer in  addedDatasetsStore.addedLayers){
            
            if (layer!=layerName){
                toggleClickedLayer(layer, "Polygon")
            }
              
        }
        //addedDatasetsStore.addLayer({layerName:layerName, metadata:selectedLayerMetadata})       
    }
   

}

const addExternaWMSLayerToMap=(item)=>{
    if (item.legend_url== undefined){
        alertStore.setAlert({
                text: `There is no legend for ${item.dct_title}`,
                timeout: 2000
            });
    }
    if(addedDatasetsStore.addedLayers[item.dct_title]== undefined){
        emit("addExternaWMSLayerToMap", item)
        addedDatasetsStore.addLayer({layerName:item.dct_title, metadata:item})
        mapLegendStore.setActivatedWMSLegendItem({
            legend_url: item.legend_url,
            legend_title: item.dct_title
        })
        datasetSearchStore.setSelecteddatasetName({
            selectedDataset: item.dct_title
        })
        
        datasetSearchStore.setSelecteddatasetType({
            selectedDatasetType: item.dct_type
        })
    }
    
    
    

}


const addCommuneTileLayer = async (layerName, layerNameInDatabase) => {
    style.value= {
        'fill-color': '#0080ff',
        'fill-opacity': 1,
        'fill-outline-color': 'grey'
    }
    layout.value = {}
    layerType.value="fill"
    let layerSpecification = {
        layerNameInDatabase: layerNameInDatabase,
        id: 'kommunales_gebiet_dashboard' + layerName,
        style: style,
        layout: layout,
        layerType: layerType,
        sourceType: "vector_tile"
    }
    emit("addLayerToMap", layerSpecification);
    isCommuneLayerAdded.value=true
};
const getIndicator = async (indicatorName, granularity) => {
    progressStore.setProgressBar({
        text: `Abrufen des ${indicatorName} ...`,
        progress: true
    })
    const indocatorData =  await getIndicatorData(indicatorName, granularity)
    indicatorStore.setIndicatordata({
        indicator: indocatorData.indicator,
        indicatorName: indicatorName+'_'+granularity,
        availailableYearsForSelectedIndicator: indocatorData.availabeYears[0][0],
        selectedYear: indocatorData.availabeYears[0][0].at(-1),
        colorPalette: colorbrewer.default.RdPu[5],
        granularity: granularity,
        type: "indikator"
    })
    datasetSearchStore.setSelecteddatasetName({
            selectedDataset: indicatorName+'_'+granularity
    })
    datasetSearchStore.setSelecteddatasetType({
            selectedDatasetType: "indikator"
    })
    

    
    if (indocatorData.metadata){
        metadata.value = indocatorData.metadata[0]
    }
    else {
        metadata.value = null
    }
    
    // detect available years for the selected in dicator
    availailableYearsForSelectedIndicator.value = indocatorData.availabeYears[0][0]
    targetYear.value = availailableYearsForSelectedIndicator.value[availailableYearsForSelectedIndicator.value.length - 1];
    filterByYear(indicatorName+'_'+granularity)
        
}
const filterByYear = (indicatorName,userSelectedYear, classificationMethod) => {
    if(classificationMethod){
        selectedClassificationMethod.value = classificationMethod
    }
    if (userSelectedYear){
        targetYear.value = userSelectedYear
    }
    selectedYear.value = []

    matchExpression = null
    indicatorStore.indicatorArray[indicatorName].forEach(innerArray => {
        innerArray.forEach(subArray => {
        selectedYear.value.push(...subArray.filter(item => item.zeitbezug === indicatorStore.indicatorArray[indicatorName].selectedYear));
        });
    });
    classify(indicatorName)
  
    let wertValues =  selectedYear.value
        .filter(item => item.zeitbezug === indicatorStore.indicatorArray[indicatorName].selectedYear)
        .map(item => item.wert);

    createHistogram(wertValues, "histogram");

}
const classify = async(indicatorName) => {
   
    let allattributes = indicatorStore.indicatorArray[indicatorName][0][0].map(item => item.wert);
    
        const response = await classification(allattributes, selectedClassificationMethod.value);
        indicatorStore.setIndicatorClassificationResults({
            indicatorName: indicatorName,
            classification_result: response.intervals_5_classes,
            classification_result_3_intervals: response.intervals_3_classes,
            classificationMethod: selectedClassificationMethod.value
        })
        if (response.intervals_5_classes.warnings) {
            alertStore.setAlert({
                text: response.intervals_5_classes.warnings,
                timeout: 2000
            });
        }
    
    
   
    mapStylization(indicatorName)
    
    progressStore.setProgressBar({
        progress: false
    })

}
const mapStylization = (indicatorName) => {
    selectedYear.value = []
    indicatorStore.indicatorArray[indicatorName].forEach(innerArray => {
        innerArray.forEach(subArray => {
        selectedYear.value.push(...subArray.filter(item => item.zeitbezug === indicatorStore.indicatorArray[indicatorName].selectedYear));
        });
    });
    ////////////////////// ** stylization ** /////////////////
    // Build a GL expression that defines the color for every pg_tileserve (vector tile) feature
    matchExpression = ['match', ['get', 'nationalco']];
    classification_result.value = indicatorStore.indicatorArray[indicatorName].classification_result
    selectedColorPalette.value = indicatorStore.indicatorArray[indicatorName]['colorPalette']


    // conditions for each communale gebiete code
    for (const row of selectedYear.value) {
        const value = row['wert'];
       
        let color;

        if (value <= classification_result.value?.intervals[0]) {
            //color = '#feebe2'; // Class 1
            color = selectedColorPalette.value[0]
            //color = colorbrewer.default.selectedColorPalette.value.title
        } else if (value <= classification_result.value?.intervals[1]) {
            //color = '#fbb4b9'; // Class 2
            color = selectedColorPalette.value[1]
        } else if (value <= classification_result.value?.intervals[2]) {
            //color = '#f768a1'; // Class 3
            color = selectedColorPalette.value[2]
        } else if (value <= classification_result.value?.intervals[3]) {
            //color = '#c51b8a'; // Class 4
            color = selectedColorPalette.value[3]
        } else {
            //color = '#7a0177'; // Class 5 (Default color)
            color = selectedColorPalette.value[4]
        }
        matchExpression.push(row['kennziffer'].toString(), color);
    }

    // Last value is the default color, used where there is no data
    matchExpression.push('rgba(169,169,169, 1)');
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard' + indicatorName , 'fill-color', matchExpression)
    indicatorStore.setColorPalette({
            selectedColorPalette: selectedColorPalette.value
    })
    mapLegend(indicatorName)
}
const addCustomLayer= (array,classes, formula, granularity)=>{
    let customMetadata = {
        dct_title: formula.value,
        dct_type: "custom indikator",
        geometry_type: "Polygon",
        dct_language: "de",
        dct_catalog_description: "Custom Indicator",
        dct_catalog_publisher: "Custom",
        dcatde_politicalgeocodingleveluri: granularity
    }
    addedDatasetsStore.addLayer({layerName:formula.value, metadata:customMetadata})
    indicatorStore.setIndicatordata({
        indicator: [[array]],
        indicatorName: formula.value,
        availailableYearsForSelectedIndicator: [2024],
        selectedYear: 2024,
        colorPalette: colorbrewer.default.RdPu[5],
        type: "custom indikator"
    })
    indicatorStore.setIndicatorClassificationResults({
            indicatorName: formula.value,
            classification_result: classes,
            classification_result_3_intervals: classes,
            classificationMethod: selectedClassificationMethod.value
        })
    addCommuneTileLayer(formula.value, granularity)
    customMapStylization(array,classes, formula)
}
const customMapStylization = (array,classes, formula)=>{
    
    matchExpression = ['match', ['get', 'nationalco']];
    classification_result.value = classes
    selectedColorPalette.value = indicatorStore.indicatorArray[formula.value]['colorPalette']
    // conditions for each communale gebiete code
    for (const row of array) {
        const value = row['calculatedWert'];
       
        let color;

        if (value <= classification_result.value.intervals[0]) {
            //color = '#feebe2'; // Class 1
            color = selectedColorPalette.value[0]
            //color = colorbrewer.default.selectedColorPalette.value.title
        } else if (value <= classification_result.value.intervals[1]) {
            //color = '#fbb4b9'; // Class 2
            color = selectedColorPalette.value[1]
        } else if (value <= classification_result.value.intervals[2]) {
            //color = '#f768a1'; // Class 3
            color = selectedColorPalette.value[2]
        } else if (value <= classification_result.value.intervals[3]) {
            //color = '#c51b8a'; // Class 4
            color = selectedColorPalette.value[3]
        } else {
            //color = '#7a0177'; // Class 5 (Default color)
            color = selectedColorPalette.value[4]
        }
        matchExpression.push(row['kennziffer'].toString(), color);
    }

    // Last value is the default color, used where there is no data
    matchExpression.push('rgba(169,169,169, 1)');
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard' + formula.value , 'fill-color', matchExpression)
    indicatorStore.setColorPalette({
            selectedColorPalette: selectedColorPalette.value
    })
    mapLegend(formula.value)
}
const mapLegend = (indicatorName) => {
    classification_result.value = indicatorStore.indicatorArray[indicatorName]['classification_result']
    const classIntervalsAndColor = [];
    for (let i = 0; i < classification_result?.value?.intervals?.length; i++) {
        const intervalName = `interval${i + 1}`;
        const colorName = `color${i + 1}`;
        const intervalValue = classification_result.value.intervals[i].toFixed(2);
        const colorValue = getColorBasedOnIndex(i);
        const intervalAndColor = {
            [intervalName]: intervalValue,
            [colorName]: colorValue,
        };

        classIntervalsAndColor.push(intervalAndColor);
    }
    mapLegendStore.assignClassificationValues({
        indicatorName: indicatorName,
        minMax: classification_result?.value?.minMax,
        classIntervalsAndColor,
        selectedIndicator: indicatorName,
        completeIndicatorName: indicatorName
    });
    function getColorBasedOnIndex(index) {
       
        const colors = indicatorStore.indicatorArray[indicatorName]['colorPalette']
        return colors[index % colors.length];
    }
}

const toggleClickedLayer = (layerName, geomType) => {
    let index = tableMetadata.value.findIndex(obj => obj.name==layerName);
   
    if (!addedDatasetsStore.addedLayers[layerName].value) {
        if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
            
            layout.value = {}
            style.value = {
               'fill-color': polygonStyleParams.value['fill-color'],
                "fill-opacity": polygonStyleParams.value['fill-opacity'],
                "fill-outline-color": polygonStyleParams.value['fill-outline-color'],
            }
            layerType.value = "fill"
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            layout.value = {}
            
            style.value = {
                'line-color':lineStyleParams.value['line-color'],
                "line-opacity": lineStyleParams.value["line-opacity"],
                "line-width": lineStyleParams.value["line-width"],
            }
            layerType.value = "line"
        }
        else if (geomType == "Point") {
            
            style.value = {
                'circle-color':circleStyleParams.value['circle-color'],
                'circle-opacity': circleStyleParams.value['circle-opacity'],
                'circle-radius': circleStyleParams.value['circle-radius'],
                'circle-stroke-color': circleStyleParams.value['circle-stroke-color'],
                'circle-stroke-width': circleStyleParams.value['circle-stroke-width'],
                'circle-blur': circleStyleParams.value['circle-blur']
            }
            layout.value = {}
            layerType.value = "circle"
        }
        else if (geomType == "Raster"){
            style.value = {
                'raster-opacity' : 1
            }
            layerType.value = "raster"
        }
        if (geomType=='Raster'){
            emit("addCoverageLayerToMap", layerName, layerType, style)
        }
        else {
            let layerSpecification = {
                layerNameInDatabase: layerName,
                id: layerName,
                style: style,
                layerType: layerType,
                sourceType: "vector_tile",
                layout: layout
            }
            emit("addLayerToMap", layerSpecification);
        }
    }
    else {
        if (geomType=='Raster'){
            emit("toggleCoverageLayerVisibility", layerName)
        }
        else {
            
            emit("toggleLayerVisibility", layerName)
            if(tableMetadata.value[index]['sublayers']){
                for(let i in (tableMetadata.value[index]['sublayers'])){
                    emit("toggleLayerVisibility", tableMetadata.value[index]['sublayers'][i])
                }
            }
            
        }
    }

}

const setLayerPintProperty = (layerId, styleProperty, fillStyle)=>{
    emit("setLayerPintProperty", layerId, styleProperty, fillStyle)
}
const setLayerLayoutProperty = (layerId, layoutProperty, layoutValue)=>{
    emit("setLayerLayoutProperty",layerId, layoutProperty, layoutValue )
}
const addStyleLayerToMap = (layerSpecifications)=>{
    emit("addLayerToMap",layerSpecifications )
}
const addStyleExpressionByYear =(layerId, styleProperty, fillStyle)=>{
    emit("addStyleExpressionByYear",layerId, styleProperty, fillStyle)
}
const addDeckglLayer = (geojson, style)=>{
    emit("addDeckglLayer", geojson,  style);
}

const updateDeckglLayer = (geojson, style)=>{
    emit("updateDeckglLayer", geojson,  style);
}

const getExternalWMSLayers = async () => {
  const response = await externalLayerFromDB()

  // Only populate externalWMSLayers for use in addExternaWMSLayerToMap()
  // Do NOT merge into tableMetadata — they're already there from get_table_metadata
  response.forEach(newLayer => {
    const index = externalWMSLayers.value.findIndex(l => l.id === newLayer.id)
    if (index !== -1) {
      externalWMSLayers.value[index] = newLayer
    } else {
      externalWMSLayers.value.push(newLayer)
    }
  })

  // Static externalLayers: add to externalWMSLayers lookup AND tableMetadata
  // only if not already present from the DB
  externalLayers.forEach(newLayer => {
    const alreadyExists = externalWMSLayers.value.some(l => l.dct_title === newLayer.dct_title)
    if (!alreadyExists) {
      externalWMSLayers.value.push(newLayer)
      tableMetadata.value.push(newLayer)  // only truly new static layers go in
    }
  })

  tableMetadata.value = deduplicateMetadata(tableMetadata.value)
    .sort((a, b) => a.dct_title.localeCompare(b.dct_title, 'de', { sensitivity: 'base' }))

  datasetSearchStore.setTableMetadata(tableMetadata.value)
}
const deduplicateMetadata = (items) => {
  const seen = new Set()
  return items.filter(item => {
    const key = item.dcatde_politicalgeocodingleveluri
      ? `${item.dct_title}__${item.dcatde_politicalgeocodingleveluri}`  // indicators
      : `${item.dct_title}`                                              // WMS — title alone is enough
    if (seen.has(key)) return false
    seen.add(key)
    return true
  })
}
const addTernaryLayerToMap = (data)=>{
    emit("addTernaryLayerToMap", data)
}
</script>

<style scoped>
.dataset-filter-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 272px;
    bottom: 10px;
    left: 381px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.dataset-metadata-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 272px;
    bottom: 10px;
    left: 1000px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.custom-formula-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 62px;
    bottom: 10px;
    left: 1000px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.header{
    overflow-y: scroll;
    border-radius: 8px;
    position: absolute;
    top: 62px;
    left: 381px;
    z-index: 10;
    background-color: var(--color-background, rgba(0,0,0,1));
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
}

/* Uses the configurable button/button-hover colors (see
   src/services/config.js) to recolor icons/calculate.svg's circular
   background and icons/information.svg's monochrome glyph. */
.icon-button-circle-bg {
  fill: var(--color-button, #000000);
  transition: fill 0.2s ease;
}
.icon-button-circle:hover .icon-button-circle-bg {
  fill: var(--color-button-hover, #444444);
}
.icon-button-mono-fill {
  fill: var(--color-button, #000000);
  stroke: var(--color-button, #000000);
  transition: fill 0.2s ease, stroke 0.2s ease;
}
.icon-button-mono:hover .icon-button-mono-fill {
  fill: var(--color-button-hover, #444444);
  stroke: var(--color-button-hover, #444444);
}

.animated-transform {
  transition: width 0.3s ease, left 0.3s ease;
}
.animated-metadata-transform {
  transition: width 0.3s ease, left 0.3s ease;
}
</style>