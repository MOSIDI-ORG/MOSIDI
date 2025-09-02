<template>
    
<div class="menue-ui">
  

        
    
    <GeocodingUI @addAddressToMap="addLayerToMap" @removeLayerFromMap="removeLayerFromMap"></GeocodingUI>
   
    <v-tooltip text="geodata" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2" 
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('geodata')"
                :style="{ color: activeMenu === 'geodata' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'layer-group']" />
                </v-icon>
            </v-btn>
        </template>
    </v-tooltip>

    <v-tooltip text="INKAR" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2"
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('INKAR')"
                :style="{ color: activeMenu === 'INKAR' ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'chart-column']" />
                </v-icon>
               
               
            </v-btn> 
        </template>
    </v-tooltip>
    <v-tooltip text="Drucken" location="top">
        <template v-slot:activator="{ props }">
            <v-btn 
                v-bind="props"
                class="ml-2"
                v-ripple="{ class: 'primary--text' }"
                @click="setActiveButton('Drucken'),exportDialog=true"
                :style="{ color: exportDialog === true ? 'blue' : '' }"
            >
                <v-icon size="small">
                    <font-awesome-icon :icon="['fas', 'print']" />
                </v-icon>               
            </v-btn> 
        </template>
    </v-tooltip>

</div>    

      
</template>
<script setup>
import GeocodingUI from './GeocodingUI.vue'
import { useMenuStore } from '../stores/menu'
import { storeToRefs } from 'pinia'
import { defineEmits } from "vue"


let { activeMenu } = storeToRefs(useMenuStore())
import { useMapExportStore } from '../stores/mapExport'
let { exportDialog } = storeToRefs(useMapExportStore())
const emit = defineEmits(["addLayerToMap", "removeLayerFromMap", "fitBoundsToBBOX"]);


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
.menue-ui{
    position: absolute;
  justify-content: space-between;
  position: absolute;
  z-index: 10;
  bottom: 10px;
  left: 50%;
  transform: translateX(-50%); /* Horizontally center the div */
    
}
.menue-ui .v-btn {
  min-width: 36px;
  width: 36px;
}
.menue-ui .v-btn::before{
  background-color: transparent;
}

.menue-ui  .v-btn i:hover{
  transform: scale(1.15);
}



</style>