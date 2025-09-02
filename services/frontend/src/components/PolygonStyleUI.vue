<template>
 <v-card class="polygon-style-ui mx-auto">
   
    <div class="text-body-2 font-weight-bold mb-1 mt-4" style="text-align: left;margin-left: 15px;">{{ $t('cartography.polygon.style') }}</div>

    <v-container >
        <v-row no-gutters style="text-align: left;" >
        
            <v-col cols="12" sm="4" class=" mt-3">
                <p class="v-label" >{{ $t('cartography.polygon.type') }}</p>
            </v-col>
            <v-col cols="12"  sm="8" >
            
                <v-autocomplete
                        :items="polygonStyles"
                        label="style"
                        density="compact"
                        variant="solo"
                        hide-details
                        :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                        item-value="name"
                        item-title="name"
                        v-model="addedPolygonLayersStyles[polygonLayerSpecification.name].selectedPolygonStyle"
                > 

                    
                    <template v-slot:item="{ props, item }">
                    
                        <v-list-item
                            prepend-avatar= 'polygon.png'
                            v-bind="props"
                            @click=addAssociatedLayer(item.title) 
                        >
                            
                        </v-list-item>
                    </template>
                </v-autocomplete>
            </v-col>
        </v-row>
    </v-container>
    <v-container v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].selectedPolygonStyle=='Simple'">
        <v-divider  class="mt-0"></v-divider>
            <div class="text-body-2 font-weight-bold mb-1" style="text-align: left;">{{ $t('cartography.polygon.fill.fill') }}</div>
        
            <v-row no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.polygon.fill.opacity') }}</div>
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
                        v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-opacity']"
                        @update:modelValue="changePolygonFillOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.polygon.fill.fill-color') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div 
                                class="color-strip ml-0"
                                v-bind="props"
                                :style="{ backgroundColor: addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.polygon.fill.fill-color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-color']"
                                @update:modelValue="changeFillColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-color'] }}</span>
                
                </v-col>

            </v-row>
            <v-row no-gutters style="text-align: left;" >
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.polygon.fill.outline-color') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div
                                class="color-strip ml-2"
                                v-bind="props"
                                :style="{ backgroundColor: addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-outline-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.polygon.fill.outline-color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-outline-color']"
                                @update:modelValue="changeFillOutlineColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedPolygonLayersStyles[polygonLayerSpecification.name]['fill-outline-color'] }}</span>
                
                </v-col>

            </v-row>

            
    </v-container>
    <v-container v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].selectedPolygonStyle=='Categorized'">
        <v-divider  class="mt-0"></v-divider>
        <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
            <v-col cols="12" sm="4" class="">
                <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.polygon.categorized.category') }}</p>
            </v-col>
            
        </v-row>
        <v-row no-gutters style="text-align: left;" >
        
            <v-col cols="12" sm="4" class=" mt-3">
                <div class="v-label" >{{ $t('cartography.polygon.categorized.value') }}</div>
            </v-col>
            <v-col cols="12"  sm="8" >
                <v-select
                    label="Select"
                    :items="addedPolygonLayersStyles[polygonLayerSpecification.name].columnNames"
                    v-model="addedPolygonLayersStyles[polygonLayerSpecification.name].selectedCategoryColumn"
                    @update:modelValue="categorizeLayer()"
                    density="compact"
                    variant="solo"
                    hide-details
                    prepend-avatar= 'point.png'
                ></v-select>
                
            </v-col>
        </v-row>
        <div style="max-height: 200px; overflow-y: scroll;" class="mt-4" v-if="Array.isArray(addedPolygonLayersStyles[polygonLayerSpecification.name]['categorizedStyle']['fill-color'])">

       
            <v-row no-gutters style="text-align: left;" v-for="(item, i) in addedPolygonLayersStyles[polygonLayerSpecification.name]['categorizedStyle']['fill-color']" :key="i">



                <template v-if="i > 1 && i % 2 === 0">
                    <v-col cols="12" sm="6">
                        <div class="v-label" style="text-align: left;">
                            <div class="text-overflow-ellipsis" >{{ item }}</div>
                        </div>
                            
                    </v-col>
                    <v-col cols="12" sm="2" class="d-flex justify-center align-center">
                        <v-menu :close-on-content-click="false"  location="start">
                            <template v-slot:activator="{ props }">
                                <div 
                                    class="color-strip ml-0"
                                    v-bind="props"
                                    :style="{ backgroundColor:addedPolygonLayersStyles[polygonLayerSpecification.name]['categorizedStyle']['fill-color'][i + 1], cursor:'pointer' }"
                                ></div>
                            </template>
                            <v-card>
                                <v-card-title>
                                    {{ $t('cartography.polygon.categorized.color') }}
                                </v-card-title>
                                <v-card-item>
                                
                                <v-color-picker
                                    dot-size="13"
                                    swatches-max-height="100"
                                    :swatches="colorRecommendation"
                                    v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['categorizedStyle']['fill-color'][i + 1]"
                                    @update:modelValue="changeCategoryColorInstance(item, i)"
                                    show-swatches
                                    elevation="0"
                                ></v-color-picker>
                            </v-card-item>
                            </v-card>
                        </v-menu>
                    
                    
                    </v-col>
                    <v-col cols="12" sm="4">
                        <span class="ml-1 mb-1">{{ addedPolygonLayersStyles[polygonLayerSpecification.name]['categorizedStyle']['fill-color'][i + 1] }}</span>

                    </v-col>
                </template>
            </v-row>
        </div>
        
    </v-container>
    <v-container v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].selectedPolygonStyle=='Simple' || addedPolygonLayersStyles[polygonLayerSpecification.name].selectedPolygonStyle=='Categorized'">
        <v-divider  class="mt-0"></v-divider>
       
            <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                <v-col cols="12" sm="4" class="">
                    <p class="text-body-2 font-weight-bold mb-1" > {{ $t('cartography.polygon.outline.outline') }}</p>
                </v-col>
                <v-spacer></v-spacer>
                <v-col cols="12"  sm="2" style="text-align: right;">
                
                    <v-icon
                        variant="text"
                        density="compact"
                        style="margin-right:-2px"
                        @click="addPolygonOutlineSection"
                    >
                        {{addedPolygonLayersStyles[polygonLayerSpecification.name].polygonOutlineSection==true? 'mdi-minus': 'mdi-plus'}}
                    </v-icon>
                </v-col>
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].polygonOutlineSection==true">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.polygon.outline.opacity') }}</div>
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
                        v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-opacity']"
                        @update:modelValue="changeOutlineOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center" v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].polygonOutlineSection==true">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.polygon.outline.width') }}</div>
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
                        v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-width']"
                        @update:modelValue="changeOutlineWidth"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].polygonOutlineSection==true">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.polygon.outline.color') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div
                                class="color-strip ml-2"
                                v-bind="props"
                                :style="{ backgroundColor: addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.polygon.outline.color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-color']"
                                @update:modelValue="changeOutlineColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-color'] }}</span>
                
                </v-col>

            </v-row>
            <v-row no-gutters style="text-align: left;" v-if="addedPolygonLayersStyles[polygonLayerSpecification.name].polygonOutlineSection==true">
            
            <v-col cols="12" sm="4" class=" mt-3">
                <div class="v-label" >{{ $t('cartography.polygon.outline.cap') }}</div>
            </v-col>
            <v-col cols="12"  sm="8" >
                <v-select
                    label="Select"
                    density="compact"
                    variant="solo"
                    hide-details
                    :items="lineJoinOptions"
                    v-model="addedPolygonLayersStyles[polygonLayerSpecification.name]['outlineStyleParams']['line-join']"
                    @update:modelValue="changeLineCap"
                    prepend-avatar= 'point.png'
                ></v-select>
                
            </v-col>
        </v-row>
       
            
    </v-container>
   
 </v-card>
</template>

<script setup>

import { ref, defineEmits } from "vue"
import { storeToRefs } from 'pinia'
import { usePolygonStyleStore } from '../stores/polygonStyle'
const polygonStyleStore = usePolygonStyleStore()
import { useLayerStyleStore } from '../stores/layerStyle'
//import { useCartographyStore } from '../stores/cartography'
import {
    getLayerColumnNames, getDistinctValuesPerColumnNameFromDB
} from "../services/backend.calls";
import * as colorbrewer from 'colorbrewer';
import { useProgressStore } from '@/stores/progress'
import { useAlertStore } from '@/stores/alert'
const alertStore = useAlertStore()
const progressStore = useProgressStore()


//let { catographyUIVisibility } = storeToRefs(useCartographyStore())

let { tableNames } = storeToRefs(useLayerStyleStore())

const emit = defineEmits(["setLayerPintProperty", "addLayerToMap", "setLayerLayoutProperty", "removeLayerFromMap", "setLayerZoomrange"]);
let style = ref({})
let layout = ref({})
let layerType = ref('')

let { polygonLayerSpecification, addedPolygonLayersStyles, polygonStyles, colorRecommendation, lineJoinOptions } = storeToRefs(usePolygonStyleStore())
    

const changeFillColor = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name,
        'fill-color',
        value
    )
}
const changePolygonFillOpacity = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name,
        'fill-opacity',
        value
    )
}
const changeFillOutlineColor = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name,
        'fill-outline-color',
        value
    )
}

const addPolygonOutlineSection = ()=>{
    polygonStyleStore.togglePolygonOutlineSection(polygonLayerSpecification.value.name)
    addPolygonOutlineLayer()
}
const addPolygonOutlineLayer = ()=>{
    style.value = {
            'line-width':1,
            'line-color': "#FFFFFF",
            'line-opacity': 1,
        }
        layout.value = {}
        layerType.value = "line"
        let layerSpecifications = {
            layerNameInDatabase: polygonLayerSpecification.value.name,
            id: polygonLayerSpecification.value.name + " line",
            layerType: layerType,
            sourceType: "vector_tile",
            layout: layout,
            style: style
        };
        const sublayers = tableNames.value[tableNames.value.findIndex(obj => obj.name == polygonLayerSpecification.value.name)]['sublayers'];
        const labelExists = sublayers.some(sublayer => sublayer === polygonLayerSpecification.value.name + " line");
        if (labelExists==false) {
            emit("addLayerToMap", layerSpecifications);
            let index = tableNames.value.findIndex(obj => obj.name==polygonLayerSpecification.value.name);
            tableNames.value[index]['sublayers'].push(polygonLayerSpecification.value.name + " line")
        } 
}

const changeOutlineOpacity = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name + ' line',
        'line-opacity',
        value
    )
}
const changeOutlineWidth = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name + ' line',
        'line-width',
        value
    )
}
const changeOutlineColor = (value)=>{
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name + ' line',
        'line-color',
        value
    )
}
const changeLineCap = ()=>{
    emit(
        "setLayerLayoutProperty",
        polygonLayerSpecification.value.name + ' line',
        'line-join',
        addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['outlineStyleParams']['line-join']
    )
}


/*const deactivateCartographyUI=()=>{
    catographyUIVisibility.value=false
}*/
const addAssociatedLayer = async (item)=>{
    if (item==="Categorized"){
        if(!addedPolygonLayersStyles.value[polygonLayerSpecification.value.name].columnNames){
            const columnNames =  await getLayerColumnNames(polygonLayerSpecification.value.name)
            polygonStyleStore.addLayerColumnNames(polygonLayerSpecification.value.name, columnNames)
        }
        emit(
            "setLayerPintProperty",
            polygonLayerSpecification.value.name,
            'fill-color',
            addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['categorizedStyle']['fill-color']
        )
    }
    else if(item==="Simple"){
        emit(
            "setLayerPintProperty",
            polygonLayerSpecification.value.name,
            'fill-color',
            addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['fill-color']
        )
        emit(
            "setLayerPintProperty",
            polygonLayerSpecification.value.name,
            'fill-opacity',
            addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['fill-opacity']
        )
        emit(
            "setLayerPintProperty",
            polygonLayerSpecification.value.name,
            'fill-outline-color',
            addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['fill-outline-color']
        )
    }
}

const categorizeLayer = async ()=>{
    progressStore.setProgressBar({
        text: "Kategorisierung",
        progress: true
    })
    const distinctValues =  await getDistinctValuesPerColumnNameFromDB(
        {
            columnName: addedPolygonLayersStyles.value[polygonLayerSpecification.value.name].selectedCategoryColumn,
            tableName: polygonLayerSpecification.value.name
        }
    )
    if(Array.isArray(distinctValues)){

        const numQuantiles = distinctValues.length;
        const colorScheme = colorbrewer.default.Spectral[numQuantiles] || colorbrewer.default.Spectral[6]; // Fallback to 6 colors if too many or too few

        // Step 3: Build the match expression dynamically
        const matchExpression = ['match', ['get',  addedPolygonLayersStyles.value[polygonLayerSpecification.value.name].selectedCategoryColumn]];

        distinctValues.forEach((value, index) => {
            if (value !== null) {
            matchExpression.push(value, colorScheme[index % colorScheme.length]);
            }
        });

        // Default color if no match is found
        matchExpression.push('white');
        emit(
            "setLayerPintProperty",
            polygonLayerSpecification.value.name,
            'fill-color',
            matchExpression
        )
        
        polygonStyleStore.addCategorizedStyle(polygonLayerSpecification.value.name,matchExpression)
    }
    else {
        alertStore.setAlert({
            text: distinctValues,
            timeout: 3000
        })

    }
    progressStore.setProgressBar({
            progress: false
    })
}

const changeCategoryColorInstance = ()=>{
    
    emit(
        "setLayerPintProperty",
        polygonLayerSpecification.value.name,
        'fill-color',
        addedPolygonLayersStyles.value[polygonLayerSpecification.value.name]['categorizedStyle']['fill-color']
    )
}

</script>

<style scoped>
.polygon-style-ui{
    overflow-y: scroll;
    background: transparent;        
}
.color-strip {
  width: 18px; 
  height: 18px; 
  display: inline-block; 
  transition: border 0.2s ease;
  border-radius: 4px;
}
.text-overflow-ellipsis {
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
  max-width: 120px;
}
</style>