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
        @addLayerbyMapType="addCommuneTileLayer"
    ></DatasetUI>
    <div v-show="filterInitiated==true && dataUiInitiated==false" class="main-container" :style="{ left: isMinimized ? '90px' : '382px' }">
        
        <v-card 
            v-if="!isLoading"
            class="header mx-auto d-flex align-center animated-transform" 
            width="371"    
        >

            <v-card v-show="filterInitiated==true" density="compact" width="371" style="background-color: black; color: white;">
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
                <div v-show="activatedDatasetSearch != DatasetTypes.SensorThings" class="mb-4 ml-2 mr-2"  >
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
            class="header mx-auto d-flex align-center justify-center animated-transform"
            width="371"
            style="background-color: black; color: white; padding: 16px;"
        >
            <v-progress-circular indeterminate color="white" size="24" class="mr-3" />
            <span>Loading datasets...</span>
        </v-card>
        <v-card 
            v-show="filterInitiated==true" 
            height="calc(100% - 250px)"
            class="dataset-filter-ui mx-auto text-left animated-transform d-flex flex-column"  
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
                    style="background-color: transparent; flex: 1"
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
                        <v-avatar>
                        <v-img 
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
                        @click.stop="showLayerMetadata(item.dct_title, item.dcatde_politicalgeocodingleveluri), customIndicatorUI = false"
                        >
                        <img src="icons/information.svg" alt="Information Icon" width="18" height="18" />
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
                <v-avatar style="cursor: pointer;">
                    <v-img 
                    src="icons/calculate.svg" 
                    
                    />
                </v-avatar>
                </template>
            </v-list-item>
            </v-card>
        
    </div>
    <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="filterInitiated==true && customIndicatorUI==true" class="custom-formula-ui mx-auto text-left animated-metadata-transform"  width="371">
        <v-card  density="compact" width="371" style="background-color: black; color: white;position: sticky; top: 0; z-index: 100;">
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
    <v-card 
        :style="cardLeftPosition"
        v-show="(metadataUI || dialog)" 
        class="dataset-metadata-ui mx-auto text-left animated-metadata-transform"  width="371"
    >
        <v-card  density="compact" width="371" style="background-color: black; color: white;position: sticky; top: 0; z-index: 100;">
            <div class="d-flex align-center" style="padding: 8px;">
                <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">{{ $t('dataset-filter.metadata.title') }}
                   
                        
                   {{
                    (metadataUI ? selectedLayerName : tablename)?.length > 15
                        ? (metadataUI ? selectedLayerName : tablename).substring(0, 15) + '...'
                        : (metadataUI ? selectedLayerName : tablename)
                    }}
                </span>
                <v-spacer></v-spacer>
                <v-img 
                    src="icons/close.svg"
                    max-height="40"
                    max-width="40"
                    style="cursor: pointer;"
                    @click="metadataUI=false; dialog = false"
                ></v-img>
            </div>
            
                
        </v-card>
       <MetadataUI
            :metadata="metadataUI ? selectedLayerMetadata : metadataa"
            :layer-name="metadataUI ? selectedLayerName : tablename"
            v-if="dialog || metadataUI"
        />
    </v-card>
</div>

</template>

<script setup>
import { onMounted, ref, computed, defineEmits, watch, nextTick } from 'vue';
import {getTableMetadata, getIndicatorData, classification, externalLayerFromDB} from "../services/backend.calls";
import { getObservedProperties } from '@/services/frost.service';
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { useMetadataDialogStore } from '../stores/metadataDialog'
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
import { DatasetTypes } from '@/utils/datasetTypes';
import { useMenuStore } from '../stores/menu'
import CustomIndicatorUI from "@/components/CustomIndicatorUI.vue";
//import { isValidURL } from '../utils/isValidURL';
import { externalLayers } from '../assets/externalLayers'; 
import { useIndicatorDeepLink } from "@/utils/useIndicatorDeepLink"
import { convertToMetadata } from '@/utils/MetadataConverter';

let { isMinimized } = storeToRefs(useMenuStore())
const emit = defineEmits(["updateDeckglLayer","addDeckglLayer","addStyleExpressionByYear","addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility", "fitBoundsToBBOX", "removeLayerFromMap", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleLayerToMap", "addExternaWMSLayerToMap","addTernaryLayerToMap", "addSensorThingsLayerToMap"]);

let { filterInitiated, dataUiInitiated, activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())

let externalWMSLayers = ref([])
let { circleStyleParams } = storeToRefs(usePointStyleStore())
let { polygonStyleParams } = storeToRefs(usePolygonStyleStore())
let {  lineStyleParams } = storeToRefs(useLineStyleStore())
const { metadataa, tablename, dialog } = storeToRefs(useMetadataDialogStore())


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
    // Internal Request
    loadIndicatorData();
    // External Requests/ APIs
    observedPropertiesRequest()
})

const loadIndicatorData = async () => {
    const deepLink = useIndicatorDeepLink(addLayerToMap)

    await Promise.all([
        tableMetadataRequest(),
        getExternalWMSLayers(),
    ]);

    // Sort metadata after request is done
    tableMetadata.value.sort((a, b) =>
        a.dct_title.localeCompare(b.dct_title, 'de', { sensitivity: 'base' })
    );
    
    await nextTick()
    deepLink.attach()
    isLoading.value = false
}
const cardLeftPosition = computed(() => {
  // 1. Check your most specific condition first
  if (isMinimized.value && !filterInitiated.value) {
    return { left: '100px' };
  }

  // 2. Check the next condition
  if (isMinimized.value) {
    return { left: '461px' };
  }
  if (dialog.value == true && filterInitiated.value ==false && dataUiInitiated.value ==false) {
    return { left: '382px' };
  }
if (dialog.value == true && dataUiInitiated.value ==true) {
    return { left: '753px' };
  }


  // 3. Default fallback
  return { left: '753px' };
});

watch(dialog, (newDialogValue) => {
  if (newDialogValue && metadataUI.value) {
    metadataUI.value = false;
  }
});

// 2. When metadataUI opens, close dialog
watch(metadataUI, (newMetadataValue) => {
  if (newMetadataValue && dialog.value) {
    dialog.value = false;
  }
});

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
                return item.dct_type === DatasetTypes.Indicator;
            } else if (activatedDatasetSearch.value === 'geodata') {
                return item.dct_type === DatasetTypes.Raster;
            } else if (activatedDatasetSearch.value === DatasetTypes.SensorThings) {
                return item.dct_type === DatasetTypes.SensorThings
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


/**
 * Hides this component on clicking close
 */
const toggleFilterUI = ()=>{
    datasetSearchStore.toggleFilter({
        filterInitiated : false
    })
    metadataUI.value= false
}
const tableMetadataRequest = async () => {
  const response = await getTableMetadata()

  tableMetadata.value.push(...deduplicateMetadata(response).sort((a, b) =>
    a.dct_title.localeCompare(b.dct_title, 'de', { sensitivity: 'base' })
  ));
}

const observedPropertiesRequest = async () => {
    const response = await getObservedProperties();
    let observedProperties = [];
    response.forEach(item => {
        observedProperties.push(convertToMetadata(item))
    })
    tableMetadata.value.push( ...observedProperties);
    datasetSearchStore.addTableMetadata(response);
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


const showLayerMetadata= (layerName, granularity)=> {
    
    selectedLayerMetadata.value = tableMetadata.value.find(item => item['dct_title'] === layerName && item['dcatde_politicalgeocodingleveluri']===granularity)
    selectedLayerName.value = layerName
    //metadataDialogStore.assignMetadata(selectedLayerMetadata.value,layerName)
    metadataUI.value= true
}
const addLayerToMap = async (layerName,geomType, granularity, mapType)=>{    

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
        await getIndicator(selectedIndicator.value, selectedLayerMetadata.dcatde_politicalgeocodingleveluri, mapType);
        await addCommuneTileLayer(layerName+'_'+granularity, selectedLayerMetadata.dcatde_politicalgeocodingleveluri);
        emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
        
        for(let layer in  addedDatasetsStore.addedLayers){
            
            if (layer!=layerName){
                toggleClickedLayer(layer, "Polygon")
            }
              
        }
        //addedDatasetsStore.addLayer({layerName:layerName, metadata:selectedLayerMetadata})             
    } else if (selectedLayerMetadata?.dct_type == DatasetTypes.SensorThings) {
        emit("addSensorThingsLayerToMap", selectedLayerMetadata);
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
    const visualizationType = indicatorStore?.indicatorArray[datasetSearchStore?.selectedDataset]?.visualizationType
    let layernameInDatabase = layerNameInDatabase
    if (visualizationType === "polygon") {

        style.value = {
            'fill-color': '#0080ff',
            'fill-opacity': 1,
            'fill-outline-color': 'grey'
        };

        layerType.value = "fill";
        layout.value = {};
        layernameInDatabase = layerNameInDatabase

    } else if (visualizationType === "glyph") {
        style.value = {
            'circle-color': '#0080ff',
            'circle-radius': 6,
            'circle-opacity': 1,
            'circle-stroke-color': '#ffffff',
            'circle-stroke-width': 1
        };

        layerType.value = "circle";
        layout.value = {};
        layernameInDatabase = layerNameInDatabase+'_centroid'

    }

    let layerSpecification = {
        layerNameInDatabase: layernameInDatabase,
        id: 'kommunales_gebiet_dashboard' + layerName,
        style: style,
        layout: layout,
        layerType: layerType,
        sourceType: "vector_tile"
    }
    emit("addLayerToMap", layerSpecification);
    isCommuneLayerAdded.value=true
};
const getIndicator = async (indicatorName, granularity, mapType) => {
    let visualizationType = mapType? mapType : 'polygon'
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
        visualizationType: visualizationType,
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
const mapStylization =  (indicatorName) => {
    selectedYear.value = []
    indicatorStore.indicatorArray[indicatorName].forEach(innerArray => {
        innerArray.forEach(subArray => {
            selectedYear.value.push(...subArray.filter(item => item.zeitbezug === indicatorStore.indicatorArray[indicatorName].selectedYear));
        });
    });

    ////////////////////// ** stylization ** /////////////////
    // 1. Initialize two distinct match expressions
    const colorMatchExpression = ['match', ['get', 'nationalco']];
    const radiusMatchExpression = ['match', ['get', 'nationalco']];

    classification_result.value = indicatorStore.indicatorArray[indicatorName].classification_result
    selectedColorPalette.value = indicatorStore.indicatorArray[indicatorName]['colorPalette']

    // Define pixel sizes for your circle radius based on classification intervals (Class 1 to Class 5)
    const radiusSteps = [2, 3, 5, 8, 13]; 

    // conditions for each communale gebiete code
    for (const row of selectedYear.value) {
        const value = row['wert'];
       
        let color;
        let radius;

        if (value <= classification_result.value?.intervals[0]) {
            color = selectedColorPalette.value[0];
            radius = radiusSteps[0];
        } else if (value <= classification_result.value?.intervals[1]) {
            color = selectedColorPalette.value[1];
            radius = radiusSteps[1];
        } else if (value <= classification_result.value?.intervals[2]) {
            color = selectedColorPalette.value[2];
            radius = radiusSteps[2];
        } else if (value <= classification_result.value?.intervals[3]) {
            color = selectedColorPalette.value[3];
            radius = radiusSteps[3];
        } else {
            color = selectedColorPalette.value[4];
            radius = radiusSteps[4];
        }

        // Push the identifier and the respective value to each stack
        colorMatchExpression.push(row['kennziffer'].toString(), color);
        radiusMatchExpression.push(row['kennziffer'].toString(), radius);
    }

    // Default values if no matching data is found
    colorMatchExpression.push('rgba(169,169,169, 1)'); // Gray color fallback
    radiusMatchExpression.push(2);                     // Small fallback size for missing data

    const centroidLayerId = 'kommunales_gebiet_dashboard' + indicatorName;
    const polygonLayerId = 'kommunales_gebiet_dashboard' + indicatorName;

    


    // 3. EMIT GLYPH STYLES (Circles - both color and radius)
    if (indicatorStore.indicatorArray[indicatorName].visualizationType === "glyph") {
        emit("addStyleExpressionByYear", centroidLayerId, 'circle-radius', radiusMatchExpression);
        emit("addStyleExpressionByYear", centroidLayerId, 'circle-color', colorMatchExpression);

    }
    else {    
        emit("addStyleExpressionByYear", polygonLayerId, 'fill-color', colorMatchExpression);

    }

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
        type: "custom indikator",
        visualizationType: "polygon"
    })
    indicatorStore.setIndicatorClassificationResults({
            indicatorName: formula.value,
            classification_result: classes,
            classification_result_3_intervals: classes,
            classificationMethod: selectedClassificationMethod.value
        })
        datasetSearchStore.setSelecteddatasetName({
            selectedDataset: formula.value
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
            let layerSpecification;
            if (addedDatasetsStore.addedLayers[layerName].dct_type == DatasetTypes.SensorThings) {
                layerSpecification = {
                    layerNameInDatabase: layerName,
                    id: layerName,
                    style: style,
                    layerType: layerType,
                    sourceType: "SensorThings",
                    layout: layout
                }
            } else {
                layerSpecification = {
                    layerNameInDatabase: layerName,
                    id: layerName,
                    style: style,
                    layerType: layerType,
                    sourceType: "vector_tile",
                    layout: layout
                }
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

.main-container {
    position: absolute;
    top: 62px;
    bottom: 10px;
}

.dataset-filter-ui{
    overflow-y: auto; 
    background: transparent; 
    border-radius: 8px;
    position: relative;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
}

.dataset-metadata-ui{
    overflow-y: auto; 
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
    overflow-y: auto; 
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
    overflow-y: auto; 
    background: black; 
    border-radius: 8px;
    position: relative;
    min-height: 210px;
    z-index: 10;
    background-color: rgba(0,0,0,1);
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2); 
}

.animated-transform {
  transition: width 0.3s ease, left 0.3s ease;
}

.animated-metadata-transform {
  transition: width 0.3s ease, left 0.3s ease;
}

.fill-height {
  flex: 1;
}

</style>