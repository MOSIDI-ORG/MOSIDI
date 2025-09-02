<template>
    <div>
        <DatasetFilterUI 
            @updateDeckglLayer="updateDeckglLayer" 
            @addDeckglLayer="addDeckglLayer" 
            @toggleLayerVisibility="toggleLayerVisibility"
            @addLayerToMap="addLayerToMap" 
            @addStyleExpressionByYear="addStyleExpressionByYear"
            @removeLayerFromMap="removeLayerFromMap" 
            @setLayerPintProperty="setLayerPintProperty" 
            @setLayerLayoutProperty="setLayerLayoutProperty"
            @addExternaWMSLayerToMap="addExternaWMSLayerToMap">

        </DatasetFilterUI>
    </div>
    <v-card
        class="mx-auto dataset-search-ui animated-width" :width="isMinimized?'80':'371'" height="50" 
        :style="{
            'bottom': searchInitiated ? '10px' : '',
            'height':isMinimized? 'fit-content':''
        }"
    >
        <DatasetSearchLandingUI v-if="searchInitiated==false || filterInitiated==false"/>
        <AddedDatasetsUI 
            @moveLayerToTop="moveLayerToTop" 
            @toggleLayerVisibilityWithValue="toggleLayerVisibilityWithValue" 
            @fitBoundsToBBOX="fitBoundsToBBOX" 
            @toggleLayerVisibility="toggleLayerVisibility" 
            @removeLayerFromMap="removeLayerFromMap" 
            v-if="searchInitiated==true"/>
      
    </v-card>
    
    <ChartUI :indicatorArray="indicatorStore.indicatorArray" ></ChartUI>

</template>

<script setup>
import {defineEmits} from 'vue'
import DatasetSearchLandingUI from './DatasetSearchLandingUI.vue'
import AddedDatasetsUI from './AddedDatasetsUI.vue'
import DatasetFilterUI from './DatasetFilterUI.vue'
import { useDatasetSearchStore } from '../stores/datasetSearch'
import ChartUI from "@/components/ChartUI.vue";
import { useIndicatorStore } from '@/stores/indicator'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'

let { isMinimized } = storeToRefs(useMenuStore())

const indicatorStore = useIndicatorStore()

const emit = defineEmits(["updateDeckglLayer","addDeckglLayer","addStyleLayerToMap", "fitBoundsToBBOX", "toggleLayerVisibility", "removeLayerFromMap", "setLayerPintProperty", "setLayerLayoutProperty", "toggleLayerVisibilityWithValue", "moveLayerToTop"]);

let { searchInitiated, filterInitiated, /*dataUiInitiated*/ } = storeToRefs(useDatasetSearchStore())

const addLayerToMap= (layerSpecification)=>{
    emit("addLayerToMap", layerSpecification);
}

const fitBoundsToBBOX =  (bbox)=>{
    emit("fitBoundsToBBOX", bbox)
}
const toggleLayerVisibility = (layerName)=>{
    emit("toggleLayerVisibility", layerName)
}

const removeLayerFromMap = (payload)=>{
    emit("removeLayerFromMap",  {layerId:  payload.layerId, sourceId: payload.sourceId})
}

const addStyleExpressionByYear =(layerId, styleProperty, fillStyle)=>{
    emit("addStyleExpressionByYear",layerId, styleProperty, fillStyle)
}
const setLayerPintProperty = (layerId, styleProperty, fillStyle)=>{
        emit("setLayerPintProperty", layerId, styleProperty, fillStyle)
}
const setLayerLayoutProperty = (layerId, layoutProperty, layoutValue)=>{
    emit("setLayerLayoutProperty",layerId, layoutProperty, layoutValue )
}
const toggleLayerVisibilityWithValue = (layername, visibility)=>{
    emit("toggleLayerVisibilityWithValue", layername, visibility)
}

const moveLayerToTop = (layername)=>{
    emit("moveLayerToTop", layername)
}

const addDeckglLayer = (geojson, style)=>{
    emit("addDeckglLayer", geojson,  style);
}
const updateDeckglLayer = (geojson, style)=>{
    emit("updateDeckglLayer", geojson,  style);
}
const addExternaWMSLayerToMap = (layerSpecification)=>{
    emit("addExternaWMSLayerToMap", layerSpecification);
}

</script>

<style scoped>
.dataset-search-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
    top: 62px;
    left: 10px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}
.animated-width {
  transition: width 0.3s ease;
}
</style>