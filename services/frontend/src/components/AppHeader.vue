<template>
     <GeocodingUI @addAddressToMap="addLayerToMap" @removeLayerFromMap="removeLayerFromMap"></GeocodingUI>
    <v-card class="mx-auto app-header" width="400" height="50">
        <v-row class="d-flex align-center justify-between" >
        <v-img
            src="icons/mosidi-logo.svg"
            contain
            max-height="80"
            max-width="80"
            class="ml-7"
        >
        </v-img>
       
        <v-spacer></v-spacer>


        <div class="mr-2">
            <v-tooltip text="geocoding" location="top">
        
                <template v-slot:activator="{ props }">
                
                    <v-btn
                        class="mr-2" 
                        v-bind="props"
                        density="compact"
                        variant="text"
                        icon="mdi-magnify"
                        @click="setActiveButton('geocoding')"
                        :style="{ color: activeMenu === 'geocoding' ? 'blue' : '' }"
                    ></v-btn>
                </template>
            </v-tooltip>

            <v-tooltip text="geodata" location="top">
                <template v-slot:activator="{ props }">
                    
                    
                    <v-btn
                        class="mr-2" 
                        v-bind="props"
                        density="compact"
                        variant="text"
                        icon="mdi-layers-outline"
                        @click="setActiveButton('geodata')"
                        :style="{ color: activeMenu === 'geodata' ? 'blue' : '' }"
                    ></v-btn>
                </template>
            
            </v-tooltip>

            <v-tooltip text="INKAR" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn 
                        class="mr-2"
                        v-bind="props"
                        density="compact" 
                        variant="text" 
                        icon="mdi-chart-line" 
                        @click="setActiveButton('INKAR')"
                        :style="{ color: activeMenu === 'INKAR' ? 'blue' : '' }"
                        ></v-btn>
                </template>
            </v-tooltip>
            <v-tooltip text="Drucken" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn
                    class="mr-2" 
                    v-bind="props" 
                    density="compact" 
                    variant="text" 
                    icon="mdi-printer-outline"
                    @click="setActiveButton('Drucken'), exportDialog=true"
                   :style="{ color: exportDialog === true ? 'blue' : '' }"
                    ></v-btn>
                </template>
            </v-tooltip>
        </div>
        
        <v-divider vertical ></v-divider>
        
        <div class="mr-4">
            <v-tooltip text="landing page" location="top">
                <template v-slot:activator="{ props }">
                    <v-btn  v-bind="props"  density="compact" variant="text" icon :to="{ path: '/landing-page' }" target="_blank">
                <img src="icons/information.svg" alt="Information Icon" width="18" height="18" />
            </v-btn> 
                </template>
            </v-tooltip>
            
      
        </div>
      
    </v-row>
    </v-card>
</template>
<script setup>
import { useMenuStore } from '../stores/menu'
import { storeToRefs } from 'pinia'
import GeocodingUI from './GeocodingUI.vue'
import { defineEmits } from "vue"
const emit = defineEmits(["addLayerToMap", "removeLayerFromMap", "fitBoundsToBBOX"]);


let { activeMenu } = storeToRefs(useMenuStore())
import { useMapExportStore } from '../stores/mapExport'
let { exportDialog } = storeToRefs(useMapExportStore())

function setActiveButton(button) {
    if(activeMenu.value==button){
        activeMenu.value = null
    }
    else {
        activeMenu.value = button;
    }
}
const addLayerToMap = (layerSpecification)=>  {
    emit("removeLayerFromMap",  {layerId:  layerSpecification.id, sourceId: layerSpecification.id})
    emit("addLayerToMap", layerSpecification)
    emit("fitBoundsToBBOX", layerSpecification.geoGjsonData.bbox)
}

const removeLayerFromMap = (layerSpecification)=>{
    emit("removeLayerFromMap",  layerSpecification)

}
</script>
<style scoped>
  .app-header{
    border-radius: 8px;  
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: rgb(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}
.v-divider {
  height: 40px; /* Adjust the height to match the icon size */
}
</style>
