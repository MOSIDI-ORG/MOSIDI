<template>
  
    <v-card
        v-if="Object.keys(addedLayers).length===0 && filterInitiated"
        class="text-start added-datasets-ui"
        density="compact"
        :title="$t('added-datasets.title')"
        variant="text"
        
    >
        <template #subtitle>
            <div style="white-space: normal; overflow: visible; text-overflow: unset;">
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
                :subtitle="addedLayer.dct_catalog_publisher"
                :title="addedLayer.dct_title"
                style="border-radius: 5px;"
                @click="addDataUI(addedLayer.dct_title, addedLayer.dct_type,addedLayer.geometry_type )"
                @mouseover="hoveredItem = index"
                @mouseleave="hoveredItem = null"
            >
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
                                    v-if="addedLayers[addedLayer.dct_title]['dct_type']=='table'"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                    >
                                        <img :src="addedLayers[addedLayer.dct_title]['checked']? 'icons/eye-close.svg':'icons/eye-open.svg'" alt="Information Icon" width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3"> {{addedLayers[addedLayer.dct_title]['checked']?$t('added-datasets.hide'):$t('added-datasets.show')}}</v-list-item-title>
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
                                v-if="addedLayers[addedLayer.dct_title]['dct_type']=='table'"
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
                                @click="removeLayer(addedLayer.dct_title, addedLayer.dct_type)"
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

import { useMenuStore } from '../stores/menu'
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
    getLayerExtent
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

const addDataUI = (datasetName, datasetType, geomType)=>{
    
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
            selectedDataset: datasetName
        })
        if(datasetType=='indikator'){
            createHistogramForSelectedLayer(datasetName)
            for(let layer in addedDatasetsStore.addedLayers){
                if (layer!=datasetName){
                    emit("toggleLayerVisibilityWithValue", 'kommunales_gebiet_dashboard' + layer, 'none')
                    if(addedDatasetsStore.addedLayers[layer]['dct_type']=='indikator'){
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


        }
        else if (datasetType=='table'){
            activateStylePanel(datasetName,geomType)
            emit("moveLayerToTop", datasetName)
        }
        else if(datasetType=='raster'){
            activateStylePanel(datasetName,geomType)
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
        rasterLayerSpecification.value=layerSpec
        rasterStyleStore.addLayerStyle(datasetName)
        mapLegendStore.setActivatedWMSLegendItem({
            legend_url: addedDatasetsStore.addedLayers[datasetName].legend_url
        })

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