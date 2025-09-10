<template>

<div v-if="activatedDatasetSearch?.value!==null">
    <DatasetUI @addStyleExpressionByYear="addStyleExpressionByYear" @filterByYear="filterByYear" @mapLegend="mapLegend" @mapStylization="mapStylization" @setLayerPintProperty="setLayerPintProperty" @setLayerLayoutProperty="setLayerLayoutProperty" @addStyleLayerToMap="addStyleLayerToMap" v-show="dataUiInitiated==true"></DatasetUI>
    <div v-show="filterInitiated==true && dataUiInitiated==false">

        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" class="header mx-auto d-flex align-center animated-transform" width="371">

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
                <div class="mb-4 ml-2 mr-2"  >
                    <v-row no-gutters>
                        <v-col >
                            <v-select
                                :items="datasetTypes"
                                :item-title="'alias'"
                                :item-value="'name'"
                                :label="$t('dataset-filter.filter-label.type')"
                                dense
                                outlined
                                density="compact"
                                single-line
                                hide-details
                                rounded
                                solo                
                                v-model="selectedDatasetType"
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
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" v-show="filterInitiated==true" class="dataset-filter-ui mx-auto text-left animated-transform"  width="371">
            <v-list lines="two" style="background-color:transparent; height: 81%;" class="ml-1 mr-1">
                <span style="font-size: 1rem; font-weight: 500;" class="ml-2">{{filteredItems?.length + ' '+  $t('dataset-filter.results')}}</span>

                <v-list-item
                    v-for="(metadata, index) in filteredItems"
                    :key="index"
                    :subtitle="metadata.dct_catalog_publisher"
                    :title="metadata.dct_title"
                    @click="addLayerToMap(metadata.dct_title, metadata.geometry_type)"
                    style="border-radius: 5px;"
                    @mouseover="hoveredItem = index"
                    @mouseleave="hoveredItem = null"
                >
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

                    <template v-slot:append>
                        <v-btn 
                            v-if="hoveredItem === index"
                            density="compact" 
                            variant="text" 
                            icon 
                            @click.stop="showLayerMetadata(metadata.dct_title)"
                        >
                            <img src="icons/information.svg" alt="Information Icon" width="18" height="18" />
                        </v-btn> 
                    </template>
                </v-list-item>
                
        
            </v-list>
            <v-divider ></v-divider>
           
           
            <v-list-item
                :subtitle="$t('dataset-filter.custom.subtitle')"
                :title="$t('dataset-filter.custom.title')"
            >
                <template v-slot:prepend>
                    <v-avatar style="cursor: pointer;">
                                <v-img src="icons/calculate.svg" @click="customIndicatorUI=true"  />
                            
                    </v-avatar>
                </template>
            </v-list-item>
                

        </v-card>
        
    </div>
    <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="filterInitiated==true && customIndicatorUI==true" class="dataset-metadata-ui mx-auto text-left animated-metadata-transform"  width="371">
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
                :indicatorNames="tableMetadata.filter(item => item.dct_type === 'indikator')"
                :selectedColorPalette="selectedColorPalette"
                @addDeckglLayer="addDeckglLayer"
                @updateDeckglLayer="updateDeckglLayer"
        ></CustomIndicatorUI>
    </v-card>
    <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="filterInitiated==true && metadataUI==true" class="dataset-metadata-ui mx-auto text-left animated-metadata-transform"  width="371">
        <v-card  density="compact" width="371" style="background-color: black; color: white;position: sticky; top: 0; z-index: 100;">
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
        <v-card style="background-color: transparent;">
            <div v-if="selectedLayerMetadata">
                <div v-for="(item,index) in selectedLayerMetadata" :key="index">
                    <v-card-text v-if="item">
                        <span  v-if="isValidURL(item)">
                            {{index}}: <a :href="selectedLayerMetadata.source" target="_blank">{{ item }}</a> 
                        </span>
                        <span v-else>
                            <b>{{index}}</b>: {{ item }}
                        </span>
                    
                    </v-card-text>
                
                </div>
            </div>
            <template v-else>
                <v-card-text>
                    {{ $t('dataset-filter.metadata.empty-msg') }} {{ selectedLayerName }}
                </v-card-text>
            </template>
        

        </v-card>
    </v-card>
</div>

</template>

<script setup>
import { onMounted, ref, computed, defineEmits, watch } from 'vue';
import {getTableMetadata, getIndicatorData, classification, externalLayerFromDB} from "../services/backend.calls";
import { useDatasetSearchStore } from '../stores/datasetSearch'
//import { useMetadataDialogStore } from '../stores/metadataDialog'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useLineStyleStore } from '../stores/lineStyle'
import { useAlertStore } from '@/stores/alert'
import { useProgressStore } from '@/stores/progress'
import { useMapLegendStore } from '@/stores/mapLegend'
import DatasetUI from "@/components/DatasetUI.vue";
import * as colorbrewer from 'colorbrewer';
import { storeToRefs } from 'pinia'

import { usePointStyleStore } from '../stores/pointStyle'
import { usePolygonStyleStore } from '../stores/polygonStyle'
import { useIndicatorStore } from '@/stores/indicator'
import { createHistogram } from '../utils/histogram';
import { useMenuStore } from '../stores/menu'
import CustomIndicatorUI from "@/components/CustomIndicatorUI.vue";
import { isValidURL } from '../utils/isValidURL';
import { externalLayers } from '../assets/externalLayers'; 


let { isMinimized } = storeToRefs(useMenuStore())
const emit = defineEmits(["updateDeckglLayer","addDeckglLayer","addStyleExpressionByYear","addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility", "fitBoundsToBBOX", "removeLayerFromMap", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleLayerToMap", "addExternaWMSLayerToMap"]);

let {  filterInitiated, dataUiInitiated, activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())



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



//let dataSources = ref(null)
//let geometryTypes = ref(null)
let selectedGeometryTypee = ref(null)
let selectedDatasetSource = ref(null)
let selectedLayerMetadata = ref(null)
let selectedLayerName= ref(null)
let selectedYearIndicatorFilter = ref(null)
//let availableYearsForIndicatorFilter =ref(null)
onMounted(()=>{
    tableMetadataRequest()
    getExternalWMSLayers()
})

// reset the selected filter when toggling the activatedDatasetSearch (geodata and indicator)
watch(activatedDatasetSearch, () => {
  // Reset dependent filters
  selectedGeometryTypee.value = null
  selectedDatasetSource.value = null
  selectedLayerMetadata.value = null
})
const filteredItems = computed(() => {
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
        const matchesDatasetSource = selectedDatasetSource.value && selectedDatasetSource.value !== 'All'
            ? item.dct_catalog_publisher === selectedDatasetSource.value
            : true;
        
        const matchesGeometryType = selectedGeometryTypee.value && selectedGeometryTypee.value !== 'All'
            ? item.geometry_type === selectedGeometryTypee.value
            : true;

        const matchesDatasetYear = selectedYearIndicatorFilter.value && selectedYearIndicatorFilter.value !== 'All'
            ? new Date(item.dct_temporal_enddate).getFullYear() >= parseInt(selectedYearIndicatorFilter.value)
            : true;
        return matchesSearchText && matchesDatasetType &&  preFilterDatasetType && matchesDatasetSource && matchesGeometryType && matchesDatasetYear;
    });
});
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
const getIcon = (layerName, index, geomType)=> {
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
}
const tableMetadataRequest = async () => {
  const response = await getTableMetadata()
  tableMetadata.value = response
  datasetSearchStore.setTableMetadata(response)
  // --- filter based on activatedDatasetSearch ---
  
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
    })),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})

// reactive geometryTypes with counts
const geometryTypes = computed(() => {
  const counts = filteredMeta.value.reduce((acc, item) => {
    const key = item.geometry_type
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
      return { value: year, count, label: `>=${year} (${count})` }
    }),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})




const showLayerMetadata= (layerName)=>{
    
    selectedLayerMetadata.value = tableMetadata.value.find(item => item['dct_title'] === layerName)
    selectedLayerName.value = layerName
    //metadataDialogStore.assignMetadata(selectedLayerMetadata.value,layerName)
    metadataUI.value= true
}
const addLayerToMap = async (layerName,geomType)=>{
    
    if (geomType=='raster'){
        let item = externalLayers.find(item => item.dct_title === layerName)
        addExternaWMSLayerToMap(item)
    }
    let selectedLayerMetadata = tableMetadata.value.find(item => item['dct_title'] === layerName)
   
    addedDatasetsStore.addLayer({layerName:layerName, metadata:selectedLayerMetadata})
    if (selectedLayerMetadata.dct_type==='table'){
        toggleClickedLayer (layerName, geomType)
    }
    else if(selectedLayerMetadata.dct_type==='indikator'){
        selectedIndicator.value = layerName
        
        await addCommuneTileLayer(layerName);
        emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
        getIndicator(selectedIndicator.value);
        for(let layer in  addedDatasetsStore.addedLayers){
            
            if (layer!=layerName){
                toggleClickedLayer(layer, "Polygon")
            }
              
        }
        addedDatasetsStore.addLayer({layerName:layerName, metadata:selectedLayerMetadata})
      
       
    }
   

}
const addExternaWMSLayerToMap=(item)=>{
    
    //console.log(addedDatasetsStore.addedLayers, "added layers")
  
    if(addedDatasetsStore.addedLayers[item.dct_title]== undefined){
        emit("addExternaWMSLayerToMap", item)

        addedDatasetsStore.addLayer({layerName:item.dct_title, metadata:item})
        mapLegendStore.setActivatedWMSLegendItem({
            legend_url: item.legend_url,
        })
        
       
    }
    
    
    

}
const addCommuneTileLayer = async (layerName) => {
    style.value= {
        'fill-color': '#0080ff',
        'fill-opacity': 1,
        'fill-outline-color': 'grey'
    }
    layout.value = {}
    layerType.value="fill"
    let layerSpecification = {
        layerNameInDatabase: 'Kommunale Gebiete Deutschland',
        id: 'kommunales_gebiet_dashboard' + layerName,
        style: style,
        layout: layout,
        layerType: layerType,
        sourceType: "vector_tile"
    }
    emit("addLayerToMap", layerSpecification);
    isCommuneLayerAdded.value=true
};
const getIndicator = async (indicatorName) => {
    progressStore.setProgressBar({
        text: `Abrufen des ${indicatorName} ...`,
        progress: true
    })
    const indocatorData =  await getIndicatorData(indicatorName)

    indicatorStore.setIndicatordata({
        indicator: indocatorData.indicator,
        indicatorName: indicatorName,
        availailableYearsForSelectedIndicator: indocatorData.availabeYears[0][0],
        selectedYear: indocatorData.availabeYears[0][0].at(-1),
        colorPalette: colorbrewer.default.RdPu[5]
    })
    
    //indicatorArray.value[indicatorName] = (indocatorData.indicator)

    
    if (indocatorData.metadata){
        metadata.value = indocatorData.metadata[0]
    }
    else {
        metadata.value = null
    }
    
    // detect available years for the selected in dicator
    availailableYearsForSelectedIndicator.value = indocatorData.availabeYears[0][0]
    targetYear.value = availailableYearsForSelectedIndicator.value[availailableYearsForSelectedIndicator.value.length - 1];
    filterByYear(indicatorName)
        
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
    
    mapLegend(indicatorName)
   
    mapStylization(indicatorName)
    
    progressStore.setProgressBar({
        progress: false
    })

}
const mapStylization = (indicatorName) => {
    ////////////////////// ** stylization ** /////////////////

    // Build a GL expression that defines the color for every pg_tileserve (vector tile) feature
    matchExpression = ['match', ['get', 'nationalco']];
    classification_result.value = indicatorStore.indicatorArray[indicatorName]['classification_result']
    selectedColorPalette.value = indicatorStore.indicatorArray[indicatorName]['colorPalette']

    // conditions for each communale gebiete code
    for (const row of selectedYear.value) {
        const value = row['wert'];
       
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
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard' + indicatorName , 'fill-color', matchExpression)
    indicatorStore.setColorPalette({
            selectedColorPalette: selectedColorPalette.value
    })
}
const mapLegend = (indicatorName) => {

    classification_result.value = indicatorStore.indicatorArray[indicatorName]['classification_result']
    const classIntervalsAndColor = [];
    for (let i = 0; i < classification_result.value.intervals.length; i++) {
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
        minMax: classification_result.value.minMax,
        classIntervalsAndColor,
        selectedIndicator: indicatorName,
        completeIndicatorName: metadata.value.name
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
const getExternalWMSLayers = async ()=>{
    const response = await externalLayerFromDB()
    response.forEach(newLayer => {
        const index = externalLayers.findIndex(l => l.id === newLayer.id);
        if (index !== -1) {
            // Replace existing layer
            externalLayers[index] = newLayer;
        } else {
            // Add new layer
            externalLayers.push(newLayer);
        }
    });

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
.header{
    overflow-y: scroll; 
    background: black; 
    border-radius: 8px;
    position: absolute;
    top: 62px;
    left: 381px;
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
</style>