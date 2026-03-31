<template>
    <v-card class="raster-style-ui mx-auto">
        <v-container >
       
            <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                <v-col cols="12" sm="4" class="">
                    <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.line.parameters') }}</p>
                </v-col>
                
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.raster.opacity') }}</div>
                </v-col>
                <v-col cols="12" sm="8" >
            
                    <v-slider
                        min="0"
                        max="1"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedRasterLayersStyles[rasterLayerSpecification.name]['raster-opacity']"
                        @update:modelValue="changeRasterOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.raster.saturation') }}</div>
                </v-col>
                <v-col cols="12" sm="8" >
            
                    <v-slider
                        min="-1"
                        max="1"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedRasterLayersStyles[rasterLayerSpecification.name]['raster-saturation']"
                        @update:modelValue="changeRasterSaturation"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.raster.contrast') }}</div>
                </v-col>
                <v-col cols="12" sm="8" >
            
                    <v-slider
                        min="-1"
                        max="0.99"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedRasterLayersStyles[rasterLayerSpecification.name]['raster-contrast']"
                        @update:modelValue="changeRasterContrast"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row>
                <v-col cols="12" sm="4" class=" ">
                    <v-btn variant="outlined" prepend-icon="mdi-restart" @click="resetRasterStyle()">reset</v-btn>
                </v-col>
                
            </v-row>
            <div v-if="rasterLayerSpecification.name !== 'raster'">
                <v-divider>
                <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                    <v-col cols="12" sm="4" class="">
                        <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.line.parameters') }}</p>
                    </v-col>
                    
                </v-row>
            </v-divider>
            </div>
            
       
            
        </v-container>

    </v-card>
</template>

<script setup>
import { storeToRefs } from 'pinia'
import { defineEmits } from "vue"

import { useRasterStyleStore } from '../stores/rasterStyle'
//const rasterStyleStore = useRasterStyleStore()
let {  addedRasterLayersStyles, rasterLayerSpecification} = storeToRefs(useRasterStyleStore())
const emit = defineEmits(["setLayerPintProperty"]);

const changeRasterOpacity = (value)=>{
    emit(
        "setLayerPintProperty",
        rasterLayerSpecification.value.name,
        'raster-opacity',
        value
    )
}
const changeRasterSaturation = (value)=>{
    emit(
        "setLayerPintProperty",
        rasterLayerSpecification.value.name,
        'raster-saturation',
        value
    )
}
const changeRasterContrast = (value)=>{
    emit(
        "setLayerPintProperty",
        rasterLayerSpecification.value.name,
        'raster-contrast',
        value
    )
}
const resetRasterStyle=()=>{
    changeRasterContrast(0)
    changeRasterSaturation(0)
    changeRasterOpacity(1)
    addedRasterLayersStyles.value[rasterLayerSpecification.value.name]= {
        'raster-opacity': 1,
        'raster-saturation': 0,
        'raster-contrast': 0
    }


    
}





</script>
<style scoped>
.raster-style-ui{
    overflow-y: scroll;
    background: transparent;    
}

</style>