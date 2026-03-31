<template>
    
    <v-card class="point-style-ui mx-auto">
        
        <div class="text-body-2 font-weight-bold mb-1 mt-4" style="text-align: left;margin-left: 15px;">{{ $t('cartography.point.style') }}</div>
        <v-container >
            <v-row no-gutters style="text-align: left;" >
            
                <v-col cols="12" sm="4" class=" mt-3">
                    <p class="v-label" >{{ $t('cartography.point.type') }}</p>
                </v-col>
                <v-col cols="12"  sm="8" >
                
                    <v-autocomplete
                            :items="pointStyles"
                            label="style"
                            density="compact"
                            variant="solo"
                            hide-details
                            :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                            item-value="name"
                            item-title="name"
                            v-model="addedLayersStyles[layerSpecification.name].selectedPointStyle"
                        > 

                        
                            <template v-slot:item="{ props, item }">
                            
                                <v-list-item
                                    prepend-avatar= 'point.png'
                                    v-bind="props"
                                    @click=addAssociatedLayer(item.title)      
                                >
                                    
                                </v-list-item>
                            </template>
                            </v-autocomplete>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-if="addedLayersStyles[layerSpecification.name].selectedPointStyle=='Hexagon'">
            <v-divider  class="mt-0"></v-divider>
            <div class="text-body-2 font-weight-bold mb-1" style="text-align: left;">Hexagon Parameters</div>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >Color</div>
                </v-col>
                <v-col cols="12" sm="10" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="true"  location="start">
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in addedLayersStyles[layerSpecification.name].hexagonStyleParams['color-palette']"
                                :key="j"
                                v-bind="props"
                                :style="{
                                    backgroundColor: colorItem,
                                    width: '22px',
                                    height: '12px',
                                    display: 'inline-block',
                                    margin: '0px',
                                    cursor: 'pointer'
                                }"
                            ></span>
                        </template>
                        <v-list style="max-height:300px" >
                            <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                    <div @click="assignHexagonColorPalette(item[5])" >
                                        <span
                                            v-for="(colorItem, j) in (item[5])"
                                            :key="j"
                                            :style="{
                                                backgroundColor: colorItem,
                                                width: '30px',
                                                height: '20px',
                                                display: 'inline-block',
                                                margin: '0px',
                                                cursor: 'pointer'
                                            }"
                                        ></span>
                                    </div>
                                    
                            </v-list-item>
                        </v-list>
                    </v-menu>
                
                </v-col>

            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class="">
                    <div class="v-label" >Opacity</div>
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
                        v-model="addedLayersStyles[layerSpecification.name]['hexagonStyleParams']['fill-opacity']"
                        @update:modelValue="changeHexagonOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >outline color</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div 
                                class="color-strip ml-0"
                                v-bind="props"
                                :style="{ backgroundColor: addedLayersStyles[layerSpecification.name].hexagonStyleParams['fill-outline-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                            Hexagon Outline Color
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model=" addedLayersStyles[layerSpecification.name].hexagonStyleParams['fill-outline-color']"
                                @update:modelValue="changeHexagonOutlineColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedLayersStyles[layerSpecification.name].hexagonStyleParams['fill-outline-color'] }}</span>
                
                </v-col>

            </v-row>
        </v-container>
        <v-container v-if="addedLayersStyles[layerSpecification.name].selectedPointStyle=='Heatmap'">
            <v-divider  class="mt-0"></v-divider>
            <div class="text-body-2 font-weight-bold mb-1" style="text-align: left;">Heatmap Parameters</div>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >Color</div>
                </v-col>
                <v-col cols="12" sm="10" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="true"  location="start">
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in addedLayersStyles[layerSpecification.name].heatmapStyleParam['color-palette']"
                                :key="j"
                                v-bind="props"
                                :style="{
                                    backgroundColor: colorItem,
                                    width: '22px',
                                    height: '12px',
                                    display: 'inline-block',
                                    margin: '0px',
                                    cursor: 'pointer'
                                }"
                            ></span>
                        </template>
                        <v-list style="max-height:300px" >
                            <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                    <div @click="assignHeatmapColorPalette(item[6])" >
                                        <span
                                            v-for="(colorItem, j) in (item[6])"
                                            :key="j"
                                            :style="{
                                                backgroundColor: colorItem,
                                                width: '30px',
                                                height: '20px',
                                                display: 'inline-block',
                                                margin: '0px',
                                                cursor: 'pointer'
                                            }"
                                        ></span>
                                    </div>
                                    
                            </v-list-item>
                        </v-list>
                    </v-menu>
                
                </v-col>

            </v-row>
        </v-container>
        <v-container v-if="addedLayersStyles[layerSpecification.name].selectedPointStyle=='Circle' || addedLayersStyles[layerSpecification.name].selectedPointStyle=='Heatmap'">
            <v-divider  class="mt-0"></v-divider>
            <div class="text-body-2 font-weight-bold mb-1" style="text-align: left;">{{ $t('cartography.point.circle-parameters') }}</div>
        
            <v-row no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.point.circle.size') }}</div>
                </v-col>
                <v-col cols="12" sm="8" >
            
                    <v-slider
                        min="0"
                        max="10"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedLayersStyles[layerSpecification.name]['circle-radius']"
                        @update:modelValue="changeSize"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.point.circle.color') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div 
                                class="color-strip ml-0"
                                v-bind="props"
                                :style="{ backgroundColor: addedLayersStyles[layerSpecification.name]['circle-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.point.circle.color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedLayersStyles[layerSpecification.name]['circle-color']"
                                @update:modelValue="changeColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedLayersStyles[layerSpecification.name]['circle-color'] }}</span>
                
                </v-col>

            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class="">
                    <div class="v-label" >{{ $t('cartography.point.circle.opacity') }}</div>
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
                        v-model="addedLayersStyles[layerSpecification.name]['circle-opacity']"
                        @update:modelValue="changeOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class="">
                    <div class="v-label" >{{ $t('cartography.point.circle.stroke') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div 
                                class="color-strip ml-0"
                                v-bind="props"
                                :style="{ backgroundColor: addedLayersStyles[layerSpecification.name]['circle-stroke-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.point.circle.color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedLayersStyles[layerSpecification.name]['circle-stroke-color']"
                                @update:modelValue="changeStrokeColor"
                                :swatches="colorRecommendation"
                                show-swatches
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedLayersStyles[layerSpecification.name]['circle-stroke-color'] }}</span>
                
                </v-col>

            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class="">
                    <div class="v-label" >{{ $t('cartography.point.circle.stroke-width') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
            
                    <v-slider
                        min="0"
                        max="10"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedLayersStyles[layerSpecification.name]['circle-stroke-width']"
                        @update:modelValue="changeStrokeWidth"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class="">
                    <div class="v-label" >{{ $t('cartography.point.circle.blur') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
            
                    <v-slider
                        min="0"
                        max="10"
                        step="0.05"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedLayersStyles[layerSpecification.name]['circle-blur']"
                        @update:modelValue="changeCircleBlur"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            
        </v-container>
       
        <v-container v-if="addedLayersStyles[layerSpecification.name].selectedPointStyle=='Circle' || addedLayersStyles[layerSpecification.name].selectedPointStyle=='Heatmap'">
        <v-divider  class="mt-0"></v-divider>
       
            <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                <v-col cols="12" sm="2" class="">
                    <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.point.label.label') }}</p>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12"  sm="2" style="text-align: right;">
                
                    <v-icon
                        variant="text"
                        density="compact"
                        style="margin-right:-2px"
                        @click="addLabelSection"
                    >
                        {{addedLayersStyles[layerSpecification.name].labelSectionToggle==true? 'mdi-minus': 'mdi-plus'}}
                    </v-icon>
                </v-col>
            </v-row>
       
            <v-row no-gutters style="text-align: left;" v-show="addedLayersStyles[layerSpecification.name].labelSectionToggle==true">
            
                <v-col cols="12" sm="4" class=" mt-3">
                    <div class="v-label" >{{ $t('cartography.point.label.value') }}</div>
                </v-col>
                <v-col cols="12"  sm="8" >
                    <v-select
                        label="Select"
                        :items="addedLayersStyles[layerSpecification.name].columnNames"
                        v-model="addedLayersStyles[layerSpecification.name].selectedLabelColumn"
                        density="compact"
                        variant="solo"
                        hide-details
                        @update:modelValue="addLabelLayer()"
                        prepend-avatar= 'point.png'
                    ></v-select>
                    
                </v-col>
            </v-row>

            <v-row v-if="addedLayersStyles[layerSpecification.name].selectedLabelColumn && addedLayersStyles[layerSpecification.name].labelSectionToggle==true"  no-gutters style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >Size</div>
                </v-col>
                <v-col cols="12" sm="8" >
               
                    <v-slider
                        min="1"
                        max="20"
                        step="1"
                        hide-details
                        tick-size="4"
                        :thumb-size="12"
                        color="#54B8C4"
                        track-color="#000000"
                        thumb-color="black"
                        v-model="addedLayersStyles[layerSpecification.name].labelStyleParams['text-size']"
                        @update:modelValue="changeLabelSize"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row v-if="addedLayersStyles[layerSpecification.name].selectedLabelColumn &&  addedLayersStyles[layerSpecification.name].labelSectionToggle==true" no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >Color</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div 
                                class="color-strip ml-0"
                                v-bind="props"
                                :style="{ backgroundColor: addedLayersStyles[layerSpecification.name].labelStyleParams['text-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                               Color
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedLayersStyles[layerSpecification.name].labelStyleParams['text-color']"
                                @update:modelValue="changeLabelColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedLayersStyles[layerSpecification.name].labelStyleParams['text-color'] }}</span>
                   
                </v-col>

            </v-row>
        </v-container>
       
       

    </v-card>
          
</template>
<script setup>

import { ref } from 'vue'
import { storeToRefs } from 'pinia'
import { usePointStyleStore } from '../stores/pointStyle'
//import { useCartographyStore } from '../stores/cartography'
import { defineEmits } from "vue"
import {
    getLayerColumnNames
} from "../services/backend.calls";
import { useLayerStyleStore } from '../stores/layerStyle'
import * as colorbrewer from 'colorbrewer';


const pointStyleStore = usePointStyleStore()
let { tableNames } = storeToRefs(useLayerStyleStore())

const emit = defineEmits(["setLayerPintProperty", "addLayerToMap", "setLayerLayoutProperty", "removeLayerFromMap", "setLayerZoomrange"]);

//let { catographyUIVisibility } = storeToRefs(useCartographyStore())

let { layerSpecification, pointStyles,addedLayersStyles, colorRecommendation } = storeToRefs(usePointStyleStore())
//let selectedColumn = ref(null)
/*const deactivateCartographyUI=()=>{
    catographyUIVisibility.value=false
}*/

const changeSize = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-radius',
        value
    )
}
const changeColor = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-color',
        value
    )
}
const changeOpacity = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-opacity',
        value
    )
}
const changeStrokeColor = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-stroke-color',
        value
    )
}
const changeStrokeWidth = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-stroke-width',
        value
    )
}
const changeCircleBlur = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name,
        'circle-blur',
        value
    )
}

let style = ref({})
let layout = ref({})
let layerType = ref('')
const addLabelSection = async()=>{
    if(!addedLayersStyles.value[layerSpecification.value.name].columnNames){
        const columnNames =  await getLayerColumnNames(layerSpecification.value.name)
        pointStyleStore.addLayerColumnNames(layerSpecification.value.name, columnNames)
    }
    //pointStyleStore.addLabelStyle(layerSpecification.value.name)
    pointStyleStore.toggleLabelSection(layerSpecification.value.name)
    
}



const addLabelLayer= ()=>{
    style.value = {
      'text-color': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-color'],
      'text-halo-color': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-halo-color'],
      'text-halo-width': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-halo-width']
    }
    layout.value = {
        'text-field': ['get', addedLayersStyles.value[layerSpecification.value.name].selectedLabelColumn], 
        'text-size': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-size'],               
        'text-anchor': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-anchor'], 
        'text-offset': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-offset'],  
        'text-letter-spacing': addedLayersStyles.value[layerSpecification.value.name].labelStyleParams['text-letter-spacing'], 
        'text-font':  addedLayersStyles.value[layerSpecification.value.name].labelStyleParams[ 'text-font']
    }
    layerType.value = 'symbol'

    let layerSpecifications = {
        layerNameInDatabase: layerSpecification.value.name,
        id: layerSpecification.value.name + ' label',
        layerType: layerType,
        sourceType: "vector_tile",
        layout: layout,
        style:style
    }
    const sublayers = tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'];
    const labelExists = sublayers.some(sublayer => sublayer === layerSpecification.value.name + ' label');
    
    if (labelExists==false) {
        emit("addLayerToMap", layerSpecifications);
        let index = tableNames.value.findIndex(obj => obj.name==layerSpecification.value.name);
        tableNames.value[index]['sublayers'].push(layerSpecification.value.name + ' label')
    } else {
        emit("setLayerLayoutProperty", layerSpecification.value.name + ' label', 'text-field', ['get', addedLayersStyles.value[layerSpecification.value.name].selectedLabelColumn])

    }

    
   
}
const changeLabelSize= (value)=>{
    
    emit(
        "setLayerLayoutProperty",
        layerSpecification.value.name + ' label',
        'text-size',
        value
    )
}
const changeLabelColor = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name + ' label',
        'text-color',
        value
    )
}

const addAssociatedLayer = (item)=>{
    
    if(item=="Heatmap"){
        emit("setLayerZoomrange",layerSpecification.value.name, 16, 22)

        style.value = {
            'heatmap-intensity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0, 0.7,  // Increased intensity for low zoom levels
                12, 0.3
            ],
            'heatmap-color': [
                'interpolate',
                ['linear'],
                ['heatmap-density'],
                0, 'rgba(0,0,0,0)',
                0.1, addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][0],
                0.2,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][1],
                0.35,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][2],
                0.55,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][3],
                0.75,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][4], // Add intermediate stops
                1,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][5]
            ],
            'heatmap-radius': [
                'interpolate',
                ['linear'],
                ['zoom'],
                0,
                5,
                9,
                21
            ],
            'heatmap-opacity': [
                'interpolate',
                ['linear'],
                ['zoom'],
                10,
                1,
                21,
                0
            ]
        }
        layout.value = {}
        layerType.value = "heatmap"
        let layerSpecifications = {
            layerNameInDatabase: layerSpecification.value.name,
            id: layerSpecification.value.name + ' heatmap',
            layerType: layerType,
            sourceType: "vector_tile",
            layout: layout,
            style:style
        }
        
        const sublayers = tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'];
        const labelExists = sublayers.some(sublayer => sublayer === layerSpecification.value.name + ' heatmap');
        if (labelExists==false) {
            emit("addLayerToMap", layerSpecifications);
            emit("setLayerZoomrange",layerSpecification.value.name + ' heatmap', 0, 16)
            let index = tableNames.value.findIndex(obj => obj.name==layerSpecification.value.name);
            tableNames.value[index]['sublayers'].push(layerSpecification.value.name + ' heatmap')
        } 

        const hexagonLayerExists = sublayers.some(sublayer => sublayer === layerSpecification.value.name + " hexagon");
        if (hexagonLayerExists==true) {
            emit("removeLayerFromMap",{layerId: layerSpecification.value.name + " hexagon", sourceId:layerSpecification.value.name + " hexagon"})
            const index = sublayers.indexOf(layerSpecification.value.name + " hexagon");
            tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'].splice(index, 1);
        } 
    }
    else if(item=="Circle"){
        emit("setLayerZoomrange",layerSpecification.value.name, 0, 22)
        const sublayers = tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'];
        
        for (let i in sublayers){
            emit("removeLayerFromMap",{layerId:  sublayers[i], sourceId: sublayers[i]})
            tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'] = []
        }
       
    }
    else if (item=="Hexagon"){
        emit("setLayerZoomrange",layerSpecification.value.name, 16, 22)
        style.value = {
            'fill-color': 
                ['match', ['get', 'quantile'],
                1, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][0],
                2, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][1],
                3, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][2],
                4, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][3],
                5, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][4],
                'white'],
            'fill-opacity':  addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['fill-opacity'],
            'fill-outline-color': addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['fill-outline-color'],
        }
        layout.value = {}
        layerType.value = "fill"
        let layerSpecifications = {
            layerNameInDatabase: layerSpecification.value.name + " hexagon",
            id: layerSpecification.value.name + " hexagon",
            layerType: layerType,
            sourceType: "vector_tile",
            sourceLayer: 'default',
            layout: layout,
            style: style
        };

        const sublayers = tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'];
        const labelExists = sublayers.some(sublayer => sublayer === layerSpecification.value.name + " hexagon");
        if (labelExists==false) {
            emit("addLayerToMap", layerSpecifications);
            emit("setLayerZoomrange",layerSpecification.value.name + " hexagon", 0, 16)
            let index = tableNames.value.findIndex(obj => obj.name==layerSpecification.value.name);
            tableNames.value[index]['sublayers'].push(layerSpecification.value.name + " hexagon")
        } 
        const heatmapLayerExists = sublayers.some(sublayer => sublayer === layerSpecification.value.name + ' heatmap');
        if (heatmapLayerExists==true) {
            
            emit("removeLayerFromMap",{layerId: layerSpecification.value.name + ' heatmap', sourceId:layerSpecification.value.name + ' heatmap'})
            const index = sublayers.indexOf(layerSpecification.value.name + ' heatmap');
            tableNames.value[tableNames.value.findIndex(obj => obj.name == layerSpecification.value.name)]['sublayers'].splice(index, 1);
        } 
       
    }
}

const assignHeatmapColorPalette =  (item)=>{
    addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette']=item
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name + ' heatmap',
        'heatmap-color',
        [
            'interpolate',
            ['linear'],
            ['heatmap-density'],
            0, 'rgba(0,0,0,0)',
            0.1, addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][0],
            0.3,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][1],
            0.5,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][2],
            0.7,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][3],
            0.9,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][4], // Add intermediate stops
            1,  addedLayersStyles.value[layerSpecification.value.name].heatmapStyleParam['color-palette'][5]
        ]
    )

}
const assignHexagonColorPalette =  (item)=>{
    addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette']=item
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name + " hexagon",
        'fill-color',
        ['match', ['get', 'quantile'],
            1, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][0],
            2, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][1],
            3, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][2],
            4, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][3],
            5, addedLayersStyles.value[layerSpecification.value.name].hexagonStyleParams['color-palette'][4],
            'white'
        ]
    )

}
const changeHexagonOpacity =(value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name + " hexagon",
        'fill-opacity',
        value
    )
}
const changeHexagonOutlineColor = (value)=>{
    emit(
        "setLayerPintProperty",
        layerSpecification.value.name + " hexagon",
        'fill-outline-color',
        value
    )
}

</script>

<style scoped>
.point-style-ui{
    overflow-y: scroll;
    background: transparent;        
}
.color-strip {
  width: 15px; 
  height: 15px; 
  display: inline-block; 
  transition: border 0.2s ease;
  border-radius: 4px;
}



</style>