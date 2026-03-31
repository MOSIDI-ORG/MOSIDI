<template>
    <v-card class="line-style-ui mx-auto">
      
        <div class="text-body-2 font-weight-bold mb-1 mt-4" style="text-align: left;margin-left: 15px;">{{ $t('cartography.line.style') }}</div>
        <v-container >
            <v-row no-gutters style="text-align: left;" >
            
                <v-col cols="12" sm="4" class=" mt-3">
                    <p class="v-label" >{{ $t('cartography.line.type') }}</p>
                </v-col>
                <v-col cols="12" sm="8" >
                
                    <v-autocomplete
                            :items="lineStyles"
                            label="style"
                            density="compact"
                            variant="solo"
                            hide-details
                            :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                            item-value="name"
                            item-title="name"
                            v-model="addedLineLayersStyles[lineLayerSpecification.name].selectedLineStyle"
                    > 

                        
                        <template v-slot:item="{ props, item }">
                        
                            <v-list-item
                                prepend-avatar= 'line.png'
                                v-bind="props"
                                @click=addAssociatedLayer(item.title) 
                            >
                                
                            </v-list-item>
                        </template>
                    </v-autocomplete>
                </v-col>
            </v-row>
        </v-container>
        <v-container v-if="addedLineLayersStyles[lineLayerSpecification.name].selectedLineStyle=='Simple'">
            <v-divider  class="mt-0"></v-divider>
       
            <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                <v-col cols="12" sm="4" class="">
                    <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.line.parameters') }}</p>
                </v-col>
                
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.line.simple.opacity') }}</div>
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
                        v-model="addedLineLayersStyles[lineLayerSpecification.name]['line-opacity']"
                        @update:modelValue="changeLineOpacity"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row  no-gutters  style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class=" " >
                    <div class="v-label" >{{ $t('cartography.line.simple.width') }}</div>
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
                        v-model="addedLineLayersStyles[lineLayerSpecification.name]['line-width']"
                        @update:modelValue="changeLineWidth"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center">
                <v-col cols="12" sm="4" class="">
                    <div class="v-label" >{{ $t('cartography.line.simple.blur') }}</div>
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
                        v-model="addedLineLayersStyles[lineLayerSpecification.name]['line-blur']"
                        @update:modelValue="changeLineBlur"
                        thumb-label
                    >
                    </v-slider>

                </v-col>
            </v-row>
            
            <v-row no-gutters style="text-align: left;">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.line.simple.color') }}</div>
                </v-col>
                <v-col cols="12" sm="8" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="false"  location="start">
                        <template v-slot:activator="{ props }">
                            <div
                                class="color-strip ml-2"
                                v-bind="props"
                                :style="{ backgroundColor: addedLineLayersStyles[lineLayerSpecification.name]['line-color'], cursor:'pointer' }"
                            ></div>
                        </template>
                        <v-card>
                            <v-card-title>
                                {{ $t('cartography.line.simple.color') }}
                            </v-card-title>
                            <v-card-item>
                            
                            <v-color-picker
                                dot-size="13"
                                swatches-max-height="100"
                                v-model="addedLineLayersStyles[lineLayerSpecification.name]['line-color']"
                                @update:modelValue="changeLineColor"
                                :swatches="colorRecommendation"
                                show-swatches
                                elevation="0"
                            ></v-color-picker>
                        </v-card-item>
                        </v-card>
                    </v-menu>
                    <span class="ml-1 mb-1">{{ addedLineLayersStyles[lineLayerSpecification.name]['line-color'] }}</span>
                
                </v-col>

            </v-row>
            
            <v-row no-gutters style="text-align: left;"  class="mt-2">
            
                <v-col cols="12" sm="4" class=" mt-3">
                    <div class="v-label" >{{ $t('cartography.line.simple.cap') }}</div>
                </v-col>
                <v-col cols="12"  sm="8" >
                    <v-select
                        label="Select"
                        density="compact"
                        variant="solo"
                        hide-details
                        :items="lineCapOptions"
                        v-model="addedLineLayersStyles[lineLayerSpecification.name]['line-cap']"
                        @update:modelValue="changeLineCap"
                    ></v-select>
                    
                </v-col>
            </v-row>
       
            
        </v-container>
        <v-container v-if="addedLineLayersStyles[lineLayerSpecification.name].selectedLineStyle=='Graduated'">
            <v-divider  class="mt-0"></v-divider>
            <v-row no-gutters class="text-body-2 font-weight-bold mb-1" style="text-align: left">
                <v-col cols="12" sm="4" class="">
                    <p class="text-body-2 font-weight-bold mb-1" >{{ $t('cartography.line.graduated.category') }}</p>
                </v-col>
                
            </v-row>
            
            <v-row no-gutters style="text-align: left;" >
            
                <v-col cols="12" sm="4" class=" mt-3">
                    <div class="v-label" >{{ $t('cartography.line.graduated.value') }}</div>
                </v-col>
                <v-col cols="12"  sm="8" >
                    <v-select
                        label="Select"
                        :items="addedLineLayersStyles[lineLayerSpecification.name].columnNames"
                        v-model="addedLineLayersStyles[lineLayerSpecification.name].selectedCategoryColumn"
                        @update:modelValue="classifyLayer()"
                        density="compact"
                        variant="solo"
                        hide-details
                        prepend-avatar= 'line.png'
                    ></v-select>
                    
                </v-col>
            </v-row>
            <v-row no-gutters style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{ $t('cartography.line.graduated.color-palette') }}</div>
                </v-col>
                <v-col cols="12" sm="10" class="d-flex justify-center align-center">
                    <v-menu :close-on-content-click="true"  location="start">
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in addedLineLayersStyles[lineLayerSpecification.name]['color-palette']"
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
                                    <div @click="assignClassifiedPalette(item[5])" >
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
            <div v-if="addedLineLayersStyles[lineLayerSpecification.name]['classInformation']" class="mt-2">

                <v-row no-gutters style="text-align: left;" v-for="( item, i) in addedLineLayersStyles[lineLayerSpecification.name]['classInformation'].intervals" :key="i">
                    <v-col cols="12" sm="2">
                        <div class="v-label" style="text-align: left;" v-if="i<addedLineLayersStyles[lineLayerSpecification.name]['classInformation'].intervals.length-1">
                            <div class="text-overflow-ellipsis" >  {{ addedLineLayersStyles[lineLayerSpecification.name]['classInformation'].intervals[i]  }} - {{ addedLineLayersStyles[lineLayerSpecification.name]['classInformation'].intervals[i+1]  }} </div>
                        </div>
                    </v-col>
                    <v-col cols="12" sm="2" class="d-flex justify-center align-center">
                        <div 
                            class="line-color-strip ml-0"
x                            :style="{ backgroundColor:addedLineLayersStyles[lineLayerSpecification.name]['color-palette'][i], cursor:'pointer', align: 'left' }"
                        ></div>
                    
                    </v-col>
                </v-row>
                
            </div>
            
        
        
    </v-container>
    </v-card>
</template>

<script setup>
import { defineEmits } from "vue"

import { storeToRefs } from 'pinia'
import { useLineStyleStore } from '../stores/lineStyle'
import {
    /*getLayerColumnNames, */classifyData, getNumericalColumnNamesForClassification
} from "../services/backend.calls";
import { useAlertStore } from '@/stores/alert'
import * as colorbrewer from 'colorbrewer';

const alertStore = useAlertStore()

const emit = defineEmits(["setLayerPintProperty", "addLayerToMap", "setLayerLayoutProperty", "removeLayerFromMap", "setLayerZoomrange"]);
const lineStyleStore = useLineStyleStore()
let { lineLayerSpecification, lineStyles, addedLineLayersStyles, colorRecommendation, lineCapOptions } = storeToRefs(useLineStyleStore())


const addAssociatedLayer = async(item)=> {
    if(item=='Graduated'){
       
        if(!addedLineLayersStyles.value[lineLayerSpecification.value.name].columnNames){
            const numericalCulumnNames = await getNumericalColumnNamesForClassification(lineLayerSpecification.value.name)
            lineStyleStore.addLayerColumnNames(lineLayerSpecification.value.name, numericalCulumnNames)
            
        }
    }
}
const changeLineOpacity = (value)=>{
    emit(
        "setLayerPintProperty",
        lineLayerSpecification.value.name,
        'line-opacity',
        value
    )
}
const changeLineWidth = (value)=>{
    emit(
        "setLayerPintProperty",
        lineLayerSpecification.value.name,
        'line-width',
        value
    )
}
const changeLineColor = (value)=>{
    emit(
        "setLayerPintProperty",
        lineLayerSpecification.value.name,
        'line-color',
        value
    )
}
const changeLineCap = (value)=>{
    emit(
        "setLayerLayoutProperty",
        lineLayerSpecification.value.name,
        'line-cap',
        value
    )
}
const changeLineBlur = (value)=>{
    emit(
        "setLayerPintProperty",
        lineLayerSpecification.value.name,
        'line-blur',
        value
    )
}

const classifyLayer = async()=>{
    const response = await classifyData(
        addedLineLayersStyles.value[lineLayerSpecification.value.name].selectedCategoryColumn,
        lineLayerSpecification.value.name,
        "NaturalBreaks"
    );
    const colorScheme = colorbrewer.default.OrRd[5] || colorbrewer.default.Spectral[6]; // Fallback to 6 colors if too many or too few
    const matchExpression = ['step', ['get',  addedLineLayersStyles.value[lineLayerSpecification.value.name].selectedCategoryColumn], 'white'];
    if (response.intervals_5_classes){
        response.intervals_5_classes.intervals.forEach((value, index) => {
            if (value !== null) {
                // Set the color for the interval step
                matchExpression.push(value, colorScheme[index % colorScheme.length]);
            }
        });

        emit(
            "setLayerPintProperty",
            lineLayerSpecification.value.name,
            'line-color',
            matchExpression
        )
        lineStyleStore.addClassifiedStyle(lineLayerSpecification.value.name,matchExpression)
        lineStyleStore.addClassInformation(lineLayerSpecification.value.name, response)
        if (response.intervals_5_classes.warnings) {
            alertStore.setAlert({
                text: response.intervals_5_classes.warnings,
                timeout: 2000
            });
        }
        
    }
    else {
        alertStore.setAlert({
                text: response.error,
                timeout: 2000
        });
    }
    

}
const assignClassifiedPalette =  (item)=>{
    addedLineLayersStyles.value[lineLayerSpecification.value.name]['color-palette']=item
    const colorScheme = addedLineLayersStyles.value[lineLayerSpecification.value.name]['color-palette']

    const matchExpression = ['step', ['get',  addedLineLayersStyles.value[lineLayerSpecification.value.name].selectedCategoryColumn], 'white'];
    
    addedLineLayersStyles.value[lineLayerSpecification.value.name]['classInformation'].intervals.forEach((value, index) => {
        if (value !== null) {
            // Set the color for the interval step
            matchExpression.push(value, colorScheme[index % colorScheme.length]);
        }
    });
    emit(
        "setLayerPintProperty",
        lineLayerSpecification.value.name,
        'line-color',
        matchExpression
    )
    

}



</script>
<style scoped>
.line-style-ui{
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
.line-color-strip{
    width: 38px; 
    height: 8px; 
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