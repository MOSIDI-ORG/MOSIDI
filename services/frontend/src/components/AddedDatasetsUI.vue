<template>
  
    <v-card
        v-if="Object.keys(addedLayers).length===0 && filterInitiated"
        class="text-start added-datasets-ui"
        density="compact"
        :title="$t('added-datasets.title')"
        variant="text"
        
    >
        <template #subtitle>
            <div style="white-space: normal; overflow: visible; text-overflow: unset;" v-show="isMinimized==false">
                {{ $t('added-datasets.subtitle') }}
            </div>
        </template>
        
    </v-card>
    
    
    <v-list v-show="Object.keys(addedLayers).length>0" lines="two" style="background-color:transparent;" class="ml-1 mr-1 text-left">
           
            <span v-show="isMinimized==false" style="font-size: 1rem; font-weight: 500;" class="ml-2">{{$t('added-datasets.dataset-count')}} ({{ Object.keys(addedLayers).length }})</span>
            <v-divider style="margin-left: 15px; margin-right: 15px;"  class=" mt-1 mb-1"></v-divider>
            <v-list-item
               v-for="(addedLayer, index) in Object.keys(addedLayers).reverse().map(key => addedLayers[key])"
                :key="addedLayer.dct_title"
                style="border-radius: 5px;"
                @click="addDataUI(addedLayer.dct_title, addedLayer.dct_type,addedLayer.geometry_type, addedLayer.dcatde_politicalgeocodingleveluri )"
                @mouseover="hoveredItem = index"
                @mouseleave="hoveredItem = null"
            >
           
            <v-list-item-subtitle v-if="addedLayer.dct_type==='indikator'"  class="text-wrap text-caption">
                {{ addedLayer.dcatde_politicalgeocodingleveluri }}, {{ formatAvailableYears(
                    indicatorStore?.indicatorArray?.[addedLayer?.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]
                        ?.availailableYearsForSelectedIndicator
                    ) }}
            </v-list-item-subtitle>
            <v-list-item-title
                v-show="!isMinimized"
                class="text-wrap"
            >
            {{ addedLayer.dct_title }}
            <span >
                ({{ 
                indicatorStore?.indicatorArray?.[addedLayer?.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]?.selectedYear
                }})
            </span>
            </v-list-item-title>
                <v-list-item-subtitle v-show="isMinimized==false" class="text-wrap text-caption" v-text="addedLayer.dct_catalog_publisher"></v-list-item-subtitle>
                    <template v-slot:prepend>
                        <v-avatar>
                            <v-img 
                                :src="getIcon(addedLayer.checked, addedLayer.geometry_type)"
                                max-height="40"
                                max-width="40"
                                style="cursor: pointer;"
                            ></v-img>
                        </v-avatar>
                    </template>
                <template v-slot:append>
                    <v-menu
                     
                        activator="parent"
                        offset-y
                        close-on-click
                        close-on-content-click
                    >
                        <template v-slot:activator="{ props }">
                            <v-btn 
                                v-show="isMinimized==false"
                                v-bind="props"
                                density="compact" 
                                variant="text" 
                                icon 
                            >
                                <img src="icons/ellipsis-vertical.svg" alt="More Options Icon" width="30" height="30" />
                            </v-btn>
                        </template>

                        <!-- Menu Content -->
                        <v-list style="border-radius:8px;  border: 1px solid rgba(0, 0, 0, 0.2); ">
                            <v-list-item
                                    @click="toggleLayerVisibility(addedLayer)"
                                    v-if="addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]?.dct_type=='table'"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                    >
                                        <img :src="addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]['checked']? 'icons/eye-close.svg':'icons/eye-open.svg'" alt="Information Icon" width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3"> {{addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]['checked']?$t('added-datasets.hide'):$t('added-datasets.show')}}</v-list-item-title>
                                </template>
                               
                            </v-list-item>
                            <v-list-item
                                    @click="showLayerMetadata(addedLayer)"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                    >
                                        <img src="icons/information.svg" alt="Information Icon" width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3">{{ $t('added-datasets.metadata') }}</v-list-item-title>
                                </template>
                               
                            </v-list-item>
                            <v-list-item
                                   
                                @click="getLayerExtentFromDB(addedLayer.dct_title)"
                                v-if="addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]?.dct_type=='table'"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                    >
                                        <img src="icons/search.svg" alt="Information Icon" width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3">{{ $t('added-datasets.zoom') }}</v-list-item-title>
                                </template>
                            </v-list-item>
                            <v-list-item
                                v-show="route?.query?.mode === 'edit'"
                                @click="addedLayer.dct_type==='raster'? removeLayer(addedLayer.dct_title, addedLayer.dct_type): removeLayer(addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri, addedLayer.dct_type)"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                    >
                                        <img src="icons/delete.svg" alt="Information Icon" width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3">{{ $t('added-datasets.remove') }}</v-list-item-title>
                                </template>
                            </v-list-item>
                            <v-menu 
                                open-on-click 
                                location="end" 
                                offset-x
                            >
                                <template v-slot:activator="{ props }">
                                    <v-list-item
                                        v-if="addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]?.dct_type == 'indikator' || addedLayers[addedLayer.dct_title+'_'+addedLayer.dcatde_politicalgeocodingleveluri]?.dct_type == 'custom indikator'"
                                        v-bind="props" 
                                        class="v-list-item-export"
                                    >
                                        <template v-slot:prepend>
                                            <v-btn 
                                                density="compact" 
                                                variant="text" 
                                                icon 
                                                aria-label="Export Menu"
                                            >
                                                <img src="icons/export.svg" alt="Export Icon" width="18" height="18" />
                                            </v-btn> 
                                        </template>
                                        
                                        <v-list-item-title class="ml-3">{{ $t('added-datasets.export') }}</v-list-item-title>

                                        <template v-slot:append>
                                            <v-icon 
                                                size="small"
                                                aria-label="Submenu Indicator"
                                            >
                                                mdi-chevron-right
                                            </v-icon> 
                                        </template>
                                    </v-list-item>
                                </template>

                                <v-list>
                                    <v-list-item 
                                        @click="exportData(addedLayer.dct_title, addedLayer.dct_type, {mode: 'geojson'}, addedLayer.dcatde_politicalgeocodingleveluri)"
                                    >
                                        <v-list-item-title>GeoJSON</v-list-item-title>
                                    </v-list-item>

                                    <v-list-item 
                                        @click="exportData(addedLayer.dct_title, addedLayer.dct_type,{mode: 'csv'})"
                                    >
                                        <v-list-item-title>CSV</v-list-item-title>
                                    </v-list-item>
                                </v-list>
                            </v-menu>
                           
                        </v-list>
                    </v-menu>
                </template>
                
            </v-list-item>

      
    </v-list>

       


   

</template>

<script setup>
import {ref, defineEmits} from 'vue'
import { storeToRefs } from 'pinia'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { useMetadataDialogStore } from '../stores/metadataDialog'
import { useMapLegendStore } from '@/stores/mapLegend'
import { useIndicatorStore } from '@/stores/indicator'
import { createHistogram } from '../utils/histogram';


import { useCartographyStore } from '../stores/cartography'
import { usePointStyleStore } from '../stores/pointStyle'
import { usePolygonStyleStore } from '../stores/polygonStyle'
import { useLineStyleStore } from '../stores/lineStyle'
import { useRasterStyleStore } from '../stores/rasterStyle'
import { useAlertStore } from '@/stores/alert'
import { useMenuStore } from '../stores/menu'
import { useProgressStore } from '@/stores/progress'
import { useRoute } from "vue-router"

const route = useRoute()

const progressStore = useProgressStore()
const alertStore = useAlertStore()

let { isMinimized } = storeToRefs(useMenuStore())
const cartographyStore = useCartographyStore()
const pointStyleStore = usePointStyleStore()
const polygonStyleStore = usePolygonStyleStore()
const lineStyleStore = useLineStyleStore()
const rasterStyleStore = useRasterStyleStore()
let { layerSpecification } = storeToRefs(usePointStyleStore())
let { polygonLayerSpecification } = storeToRefs(usePolygonStyleStore())
let { lineLayerSpecification } = storeToRefs(useLineStyleStore())
let { rasterLayerSpecification } = storeToRefs(useRasterStyleStore())





import {
    getLayerExtent,
    getGeojsonDataFromDB
} from "../services/backend.calls";

const emit = defineEmits(["addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility", "fitBoundsToBBOX", "removeLayerFromMap", "toggleLayerVisibilityWithValue", "moveLayerToTop"]);

const metadataDialogStore = useMetadataDialogStore();
const mapLegendStore = useMapLegendStore();

const indicatorStore = useIndicatorStore()

const datasetSearchStore = useDatasetSearchStore()

const addedDatasetsStore = useaddedDatasetsStore()

let { addedLayers} = storeToRefs(useaddedDatasetsStore())
let { filterInitiated} = storeToRefs(useDatasetSearchStore())


let hoveredItem = ref(null)

const formatAvailableYears = (years) => {
  if (!Array.isArray(years) || years.length === 0) return ''

  if (years.length === 1) return years[0]

  if (years.length === 2) return `${years[0]}, ${years[1]}`

  return `${years[0]}–${years[years.length - 1]}`
}
const addDataUI = (datasettitle, datasetType, geomType, granularity)=>{
    let datasetName = datasettitle+'_'+granularity
    if (datasetSearchStore.selectedDataset==datasetName && filterInitiated==false){
        removeLayer(datasetName, datasetType)
    }
    else {
        datasetSearchStore.toggleDataUI({
            dataUiInitiated : true
       
        })
        datasetSearchStore.toggleFilter({
            filterInitiated : false
        })
        datasetSearchStore.setSelecteddatasetName({
            selectedDataset: datasetType=='indikator'? datasetName: datasettitle
        })
        if(datasetType=='indikator'){
            createHistogramForSelectedLayer(datasetName)
            for(let layer in addedDatasetsStore.addedLayers){
                if (layer!=datasetName){
                    emit("toggleLayerVisibilityWithValue", 'kommunales_gebiet_dashboard' + layer, 'none')
                    if(addedDatasetsStore.addedLayers[layer]['dct_type']=='indikator' || addedDatasetsStore.addedLayers[layer]['dct_type']=='custom indikator' ){
                        addedDatasetsStore.addedLayers[layer]['checked'] = false;
                    }
                }
                else {
                    emit("toggleLayerVisibilityWithValue", 'kommunales_gebiet_dashboard' + layer, 'visible')
                    if(addedDatasetsStore.addedLayers[layer]['dct_type']=='indikator'){
                        addedDatasetsStore.addedLayers[layer]['checked'] = true;
                    }
                    
                }
                
            }
            datasetSearchStore.setSelecteddatasetType({
                selectedDatasetType: "indikator"
            })

        }
        else if (datasetType=='table'){
            activateStylePanel(datasetName,geomType)
            emit("moveLayerToTop", datasetName)
        }
        else if(datasetType=='raster'){
            activateStylePanel(datasettitle,geomType)
            datasetSearchStore.setSelecteddatasetType({
            selectedDatasetType: "raster"
    })
        }
        else if(datasetType=='custom indikator'){
            for(let layer in addedDatasetsStore.addedLayers){
                if (layer!=datasetName){
                    emit("toggleLayerVisibilityWithValue", 'kommunales_gebiet_dashboard' + layer, 'none')
                    if(addedDatasetsStore.addedLayers[layer]['dct_type']=='custom indikator' || addedDatasetsStore.addedLayers[layer]['dct_type']=='indikator'){
                        addedDatasetsStore.addedLayers[layer]['checked'] = false;
                    }
                }
                else {
                    emit("toggleLayerVisibilityWithValue", 'kommunales_gebiet_dashboard' + layer, 'visible')
                    if(addedDatasetsStore.addedLayers[layer]['dct_type']=='custom indikator'){
                        addedDatasetsStore.addedLayers[layer]['checked'] = true;
                    }
                    
                }
                
            }
        }
    }
    
    
}

const createHistogramForSelectedLayer = (datasetName)=>{
    let wertValues = indicatorStore.indicatorArray[datasetName][0][0]
    .filter(item => item.zeitbezug === indicatorStore.indicatorArray[datasetName].selectedYear)
    .map(item => item.wert);
    createHistogram(wertValues, "histogram");
}

const showLayerMetadata = (addedLayer)=>{ 

    metadataDialogStore.assignMetadata( addedLayer,addedLayer.dct_title)
}
const getLayerExtentFromDB = async (layerName)=>{
    const layerExtent =  await getLayerExtent(layerName)
    emit("fitBoundsToBBOX", [layerExtent['x-min'], layerExtent['y-min'], layerExtent['x-max'], layerExtent['y-max']])
}
const toggleLayerVisibility = (layerName)=>{
    
    if (layerName.dct_type=='table'){
        emit("toggleLayerVisibility", layerName.dct_title)
        if(addedLayers.value[layerName.dct_title]['sublayers']){
            for(let sublayer in (addedLayers.value[layerName.dct_title]['sublayers'])){
                emit("toggleLayerVisibility", sublayer)
            }
        }
    }
    else if (layerName.dct_type=='indikator'){
        emit("toggleLayerVisibility", 'kommunales_gebiet_dashboard' + layerName.dct_title)
    }
    

    
   addedLayers.value[layerName.dct_title]['checked'] =! addedLayers.value[layerName.dct_title]['checked']
    
}

const removeLayer = (layerName, layerType)=>{
    console.log(datasetSearchStore.selectedDataset, "datasetSearchStore.selectedDataset")
    if (layerName===datasetSearchStore.selectedDataset){
        datasetSearchStore.toggleDataUI({
            dataUiInitiated : false
        })
    }
    /*datasetSearchStore.toggleDataUI({
        dataUiInitiated : false
       
    })*/
    if (layerType=='table'){
        emit("removeLayerFromMap",  {layerId:  layerName, sourceId: layerName})
        if(addedDatasetsStore.addedLayers[layerName]['sublayers']){
            for (let sublayerId in addedDatasetsStore.addedLayers[layerName]['sublayers']){
                emit("removeLayerFromMap",  {layerId:  sublayerId, sourceId: sublayerId})
            }
       
        }
    }
    else if (layerType=='indikator'){
        emit("removeLayerFromMap",  {layerId:  'kommunales_gebiet_dashboard' + layerName, sourceId: 'kommunales_gebiet_dashboard' + layerName})
        emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
        mapLegendStore.removeLegendItem(layerName);
        indicatorStore.removeIndicator(layerName)
    }
    else if(layerType=='raster'){
        
        emit("removeLayerFromMap",  {layerId:  layerName, sourceId: layerName})
        mapLegendStore.removeWMSLegendItem({
            legend_url: addedDatasetsStore.addedLayers[layerName].legend_url,
            layername: layerName
        })

       
    }
    else if (layerType=='custom indikator'){
        console.log("custom indikator removed")
        emit("removeLayerFromMap",  {layerId:  'kommunales_gebiet_dashboard' + layerName, sourceId: 'kommunales_gebiet_dashboard' + layerName})
        emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
        mapLegendStore.removeLegendItem(layerName);
        indicatorStore.removeIndicator(layerName)
    }
   
    delete addedLayers.value[layerName]

}
const activateStylePanel = (datasetName,geomType)=>{
   cartographyStore.setVisibility({catographyUIVisibility:true, geomTtype: geomType})
   let layerSpec= {
        "name": datasetName,
        "type": geomType,
        "metadata": null,
        "checked": true,
        "sublayers": []
    }
   if(geomType==='Point'){
       layerSpecification.value=layerSpec
       pointStyleStore.addLayerStyle(datasetName)
   }
   else if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
       polygonLayerSpecification.value=layerSpec
       polygonStyleStore.addLayerStyle(datasetName)
   }
   else if(geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
       lineLayerSpecification.value=layerSpec
       lineStyleStore.addLayerStyle(datasetName)
   }
   else if (geomType == "raster"){
   console.log(addedDatasetsStore.addedLayers, "addedDatasetsStore.addedLayers")
   console.log(datasetName, "datasetName")
        rasterLayerSpecification.value=layerSpec
        rasterStyleStore.addLayerStyle(datasetName)
        mapLegendStore.setActivatedWMSLegendItem({
            legend_url: addedDatasetsStore.addedLayers[datasetName].legend_url,
            legend_title: datasetName
        })
        if (addedDatasetsStore.addedLayers[datasetName].legend_url== undefined){
        alertStore.setAlert({
                text: `There is no legend for ${addedDatasetsStore.addedLayers[datasetName].dct_title}`,
                timeout: 2000
            });
        }

   }
   
  
  

}
const getIcon = (checked, geomType)=> {
   
    if (geomType=='Point'){
        if (checked){
            return 'icons/point.svg';
        }
        else {
            return 'icons/point-blue.svg';
        }
    }
    else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
        if (checked){
            return 'icons/line.svg';
        }
        else {
            return 'icons/line-blue.svg';
        }
    }
    else if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
        if(checked){
            return 'icons/polygon.svg';
        }
        else {
            return 'icons/polygon-blue.svg';
        }
    }
    else {
        return 'icons/raster.svg';
    }
  }
const exportData = async(layerName, type, exportType, granularity)=>{
    progressStore.setProgressBar({
        text: `Exporting ${layerName} to ${exportType.mode}...`,
        progress: true
    })
    let indicatorArray = indicatorStore.indicatorArray[layerName+'_'+granularity][0][0]
    
    let selectedYear = indicatorStore.indicatorArray[layerName+'_'+granularity].selectedYear
    let filteredArray
    if (type =="indikator"){
        filteredArray = indicatorArray.filter(item => item.zeitbezug === selectedYear);
    }
    else if (type =="custom indikator"){
        filteredArray = indicatorArray
    }

    const data =  await getGeojsonDataFromDB(granularity)
    const valueMap = new Map(
    filteredArray.map(item => [String(item.kennziffer), item])
    );

    // 2️⃣ Merge attributes into the GeoJSON
    data.features = data.features.map(feature => {
        const nationalco = String(feature.properties.nationalco);
        const match = valueMap.get(nationalco);

        if (match) {
            feature.properties = {
            ...feature.properties,
            ...match, // adds wert, zeitbezug, etc.
            };
        } else {
            // If no match, you can assign default/null values
            feature.properties = {
            ...feature.properties,
            wert: null
            };
        }

        return feature;
    });
    if (exportType.mode === "geojson"){
        const geojsonStr = JSON.stringify(data, null, 2);
        const blob = new Blob([geojsonStr], { type: "application/geo+json" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${layerName}_${selectedYear}.geojson`;
        a.click();
        URL.revokeObjectURL(url);
    }
    else if (exportType.mode === "csv") {
        const csvRows = [];
        const headers = Object.keys(data.features[0].properties);
        csvRows.push(headers.join(",")); // header row

        data.features.forEach(f => {
        const row = headers.map(h => {
            let val = f.properties[h];
            if (val === null || val === undefined) return "";
            if (typeof val === "string" && val.includes(",")) {
            // Escape commas and quotes
            return `"${val.replace(/"/g, '""')}"`;
            }
            return val;
        });
        csvRows.push(row.join(","));
        });

        const csvStr = csvRows.join("\n");
        const blob = new Blob([csvStr], { type: "text/csv;charset=utf-8;" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `${layerName}_${selectedYear}.csv`;
        a.click();
        URL.revokeObjectURL(url);
    }
    
    progressStore.setProgressBar({
        progress: false
    })
   
}
</script>

<style scoped>

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
</style>