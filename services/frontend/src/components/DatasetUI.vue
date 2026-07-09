<template>
    <div >
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" class="header-ui mx-auto d-flex align-center animated-transform" width="371">
            <v-card density="compact" width="371" style="background-color: black; color: white;">
                <div class="d-flex align-center" style="padding: 0px;" >
                    <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2 white--text">
                        
                        {{ datasetSearchStore?.selectedDataset?.length > 25 
                            ? datasetSearchStore?.selectedDataset?.slice(0, 25) + '...' 
                            : datasetSearchStore?.selectedDataset }}
                    </span>
                   
                
                   
                    <v-spacer></v-spacer>
                    <v-img 
                        src="icons/close.svg"
                        max-height="40"
                        max-width="40"
                        style="cursor: pointer;"
                        @click="toggleDataUI"
                    ></v-img>
                </div>
                <div class="d-flex align-center"  v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset] && addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='indikator'">
                    <span style="font-size: 1rem; font-weight: 500;" class="ml-2 white--text">
                        {{ formatYears(indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator) }}

                    </span>
                </div>
                   
                <div  v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset] && addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='indikator'">
                    <v-row >
                        <v-col cols="12" sm="7" class="ml-3 mt-3">
                            <v-select
                                :items="indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator"
                                density="compact"
                                :label="$t('dataset.year-filter-title')"
                                v-model="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].selectedYear"
                                @update:modelValue="filterByYear(datasetSearchStore?.selectedDataset);"
                                variant="solo"
                                :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                                hide-details
                            >
                            </v-select>
                    </v-col>
                    <v-col cols="12" sm="4" class="ml-2 mt-3 mb-5" >
                        <v-btn
                                color="#54B8C4"
                                variant="outlined"
                                @click="timeSliderStore.visible === true ? deActivateTimeSlider() : activateTimeSlider()"
                                :disabled="indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator?.length<=1"
                            >
                           {{ timeSliderStore.visible === true ? $t('time-slider.hide') : $t('time-slider.animate') }}
                        </v-btn>
                    </v-col>
                    </v-row>
                    
                </div>
            </v-card>
        </v-card>
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" v-show="addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='indikator'"  class="added-indikator-ui mx-auto animated-transform"  width="371">
            <v-row no-gutters style="" class="d-flex mt-4">
                <v-col cols="12" sm="3" class=" ">
                    <div class="v-label" >{{$t('dataset.histogram.title')}}</div>
                </v-col>
                <div id="histogram" ref="histogram" style="width: 100%; height: 230px;"></div>

            </v-row>

            <v-divider style="margin-left: 15px; margin-right: 15px;" class=" mt-10"></v-divider>
            <v-row no-gutters style="" class="d-flex mt-6 mb-0">
                <v-col cols="12" sm="4" class=" ">
                    <div class="v-label" >{{$t('dataset.classification')}}</div>
                </v-col>
                <v-col cols="12" sm="6" class="ml-8 d-flex justify-end align-center" v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]">
                    <v-select
                            :items="classificationMethods"
                            density="compact"
                            label="Method"
                            v-model="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod"
                            @update:modelValue="filterByYear(datasetSearchStore?.selectedDataset)"
                            variant="solo"
                            dense
                            outlined
                            single-line
                            hide-details
                        >
                        </v-select>
                </v-col>
            </v-row>
            <v-divider style="margin-left: 15px; margin-right: 15px;" class=" mt-6"></v-divider>
            <v-row no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4">
                <v-col cols="12" sm="4" >
                    <div class="v-label" >{{$t('dataset.color')}}</div>
                </v-col>
                <v-col cols="12" sm="7" class="d-flex justify-end align-center">
                    <v-menu :close-on-content-click="true"  location="start"
                        :disabled="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.bivariate === true"

                    >
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.colorPalette"
                                :key="j"
                                v-bind="props"
                                :style="{
                                    backgroundColor: colorItem,
                                    width: '41px',
                                    height: '12px',
                                    display: 'inline-block',
                                    margin: '0px',
                                    cursor: indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.bivariate ? 'not-allowed' : 'pointer',
                                    opacity: indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.bivariate ? 0.5 : 1,
                                    pointerEvents: indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.bivariate ? 'none' : 'auto',
                                }"
                            ></span>
                        </template>
                        <v-list style="max-height:300px" >
                            <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                    <div @click="assignColorPalette(item[5], addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type, datasetSearchStore?.selectedDataset)" >
                                        <span
                                            v-for="(colorItem, j) in (item[5])"
                                            :key="j"
                                            :style="{
                                                backgroundColor: colorItem,
                                                width: '30px',
                                                height: '20px',
                                                display: 'inline-block',
                                                margin: '0px',
                                                cursor: 'pointer',
                                            }"
                                        ></span>
                                    </div>
                                    
                            </v-list-item>
                        </v-list>
                    </v-menu>
                
                </v-col>

            </v-row>
            <v-row v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]"  no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4">
                    <div class="v-label" >{{ $t('cartography.raster.opacity') }}</div>
                </v-col>
                 
                <v-col  cols="12" sm="7" style="float: left;" >
                   
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
                        thumb-label
                        v-model="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['fill-opacity']"
                        @update:modelValue="changeLayerOpacity(indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['fill-opacity'], datasetSearchStore?.selectedDataset)"
                       
                    >
                    </v-slider>

                </v-col>
            </v-row>
            <v-divider style="margin-left: 15px; margin-right: 15px;" class="mt-2"></v-divider>
            <v-menu>
                <template v-slot:activator="{ props }">
                    <v-list-item
                        v-bind="props"
                        :subtitle="$t('bivariate.subtitle')"
                        :title="$t('bivariate.title')"
                        class="text-left mb-2"
                        link
                    >
                        <template v-slot:prepend>
                            <v-avatar class="icon-button-circle">
                                <svg width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    <path d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z" class="icon-button-circle-bg"/>
                                    <path d="M22.0001 19.6C21.3636 19.6 20.7531 19.8528 20.303 20.3029C19.853 20.753 19.6001 21.3635 19.6001 22V24.4C19.6001 25.0365 19.853 25.6469 20.303 26.097C20.7531 26.5471 21.3636 26.8 22.0001 26.8H24.4001C25.0366 26.8 25.6471 26.5471 26.0972 26.097C26.5472 25.6469 26.8001 25.0365 26.8001 24.4V22C26.8001 21.3635 26.5472 20.753 26.0972 20.3029C25.6471 19.8528 25.0366 19.6 24.4001 19.6H22.0001ZM22.0001 29.2C21.3636 29.2 20.7531 29.4528 20.303 29.9029C19.853 30.353 19.6001 30.9635 19.6001 31.6V34C19.6001 34.6365 19.853 35.2469 20.303 35.697C20.7531 36.1471 21.3636 36.4 22.0001 36.4H24.4001C25.0366 36.4 25.6471 36.1471 26.0972 35.697C26.5472 35.2469 26.8001 34.6365 26.8001 34V31.6C26.8001 30.9635 26.5472 30.353 26.0972 29.9029C25.6471 29.4528 25.0366 29.2 24.4001 29.2H22.0001ZM29.2001 22C29.2001 21.3635 29.453 20.753 29.903 20.3029C30.3531 19.8528 30.9636 19.6 31.6001 19.6H34.0001C34.6366 19.6 35.2471 19.8528 35.6972 20.3029C36.1472 20.753 36.4001 21.3635 36.4001 22V24.4C36.4001 25.0365 36.1472 25.6469 35.6972 26.097C35.2471 26.5471 34.6366 26.8 34.0001 26.8H31.6001C30.9636 26.8 30.3531 26.5471 29.903 26.097C29.453 25.6469 29.2001 25.0365 29.2001 24.4V22ZM32.8001 29.2C33.1184 29.2 33.4236 29.3264 33.6486 29.5514C33.8737 29.7765 34.0001 30.0817 34.0001 30.4V31.6H35.2001C35.5184 31.6 35.8236 31.7264 36.0486 31.9514C36.2737 32.1765 36.4001 32.4817 36.4001 32.8C36.4001 33.1182 36.2737 33.4235 36.0486 33.6485C35.8236 33.8735 35.5184 34 35.2001 34H34.0001V35.2C34.0001 35.5182 33.8737 35.8235 33.6486 36.0485C33.4236 36.2735 33.1184 36.4 32.8001 36.4C32.4818 36.4 32.1766 36.2735 31.9516 36.0485C31.7265 35.8235 31.6001 35.5182 31.6001 35.2V34H30.4001C30.0818 34 29.7766 33.8735 29.5516 33.6485C29.3265 33.4235 29.2001 33.1182 29.2001 32.8C29.2001 32.4817 29.3265 32.1765 29.5516 31.9514C29.7766 31.7264 30.0818 31.6 30.4001 31.6H31.6001V30.4C31.6001 30.0817 31.7265 29.7765 31.9516 29.5514C32.1766 29.3264 32.4818 29.2 32.8001 29.2Z" fill="white"/>
                                </svg>
                            </v-avatar>
                        </template>
                    </v-list-item>
                </template>

                <v-list>
                    <v-list-item
                        @click="bivariateUI = true; trivariateUI = false"
                        prepend-icon="mdi-chart-scatter-plot"
                        title="Bivariate"
                    />
                    <v-list-item
                        @click="trivariateUI = true; bivariateUI = false"
                        prepend-icon="mdi-chart-bubble"
                        title="Trivariate"
                    />
                </v-list>
            </v-menu>
        </v-card>
        <v-card v-show="addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='custom indikator'" :style="{ left: isMinimized ? '90px' : '382px'}" class="added-custom-indikator-ui mx-auto animated-transform"  width="371">
            <v-row no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4" >
                <v-col cols="12" sm="4" >
                    <div class="v-label" >{{$t('dataset.color')}}</div>
                </v-col>
                <v-col cols="12" sm="7" class="d-flex justify-end align-center">
                    <v-menu :close-on-content-click="true"  location="start">
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.colorPalette"
                                :key="j"
                                v-bind="props"
                                :style="{
                                    backgroundColor: colorItem,
                                    width: '41px',
                                    height: '12px',
                                    display: 'inline-block',
                                    margin: '0px',
                                    cursor: 'pointer'
                                }"
                            ></span>
                        </template>
                        <v-list style="max-height:300px" >
                            <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                    <div @click="assignColorPalette(item[5], addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type, datasetSearchStore?.selectedDataset)" >
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
            <v-row v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]" no-gutters  style="text-align: left;" class="d-flex justify-center align-center mt-4 mb-2" >
                
                <v-col cols="12" sm="4">
                    <div class="v-label" >{{ $t('cartography.raster.opacity') }}</div>
                </v-col>
                <v-col  cols="12" sm="7" >
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
                        thumb-label
                        v-model="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['fill-opacity']"
                        @update:modelValue="changeLayerOpacity(indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['fill-opacity'], datasetSearchStore.selectedDataset)"
                       
                    >
                    </v-slider>

                </v-col>
            </v-row>
        </v-card>
        <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="bivariateUI==true" class="dataset-bivariate-ui mx-auto text-left animated-transform"  width="371">
            <v-card  density="compact" width="371" style="background-color: black; color: white;position: sticky; top: 0; z-index: 100;">
                <div class="d-flex align-center" style="padding: 8px;">
                    <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">
                        {{ $t('bivariate.title') }}
                    </span>
                    <v-spacer></v-spacer>
                    <v-img 
                        src="icons/close.svg"
                        max-height="40"
                        max-width="40"
                        style="cursor: pointer;"
                        @click="bivariateUI=false"
                    ></v-img>
                </div>
               
                    
            </v-card>
            <BivariateUI @addStyleExpressionByYear="addStyleExpressionByYear" @backtoUnivariateMap="backtoUnivariateMap" class="mb-2"></BivariateUI>
            
        </v-card>
        <v-card :style="{ left: isMinimized ? '461px' : '753px' }" v-show="trivariateUI==true" class="dataset-trivariate-ui mx-auto text-left animated-transform"  width="371">
            <v-card  density="compact" width="371" style="background-color: black; color: white;position: sticky; top: 0; z-index: 100;">
                <div class="d-flex align-center" style="padding: 8px;">
                    <span style="font-size: 1.25rem; font-weight: 500;" class="ml-2">
                        {{ $t('bivariate.title') }}
                    </span>
                    <v-spacer></v-spacer>
                    <v-img 
                        src="icons/close.svg"
                        max-height="40"
                        max-width="40"
                        style="cursor: pointer;"
                        @click="trivariateUI=false"
                    ></v-img>
                </div>
               
                    
            </v-card>
            <TrivariateUI @addTernaryLayerToMap="addTernaryLayerToMap" @backtoUnivariateMap="backtoUnivariateMap" style="flex: 1; min-height: 0; overflow: hidden;"></TrivariateUI>

        </v-card>
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" v-show="addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='table' || addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='raster'" class="added-table-ui mx-auto animated-transform"  width="371">
            <CartographyUI  @setLayerPintProperty="setLayerPintProperty"  @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></CartographyUI>
        </v-card>
    </div>
</template>

<script setup>
import { defineEmits, ref, onMounted, nextTick } from "vue"
import { storeToRefs } from "pinia";
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { useIndicatorStore } from '@/stores/indicator'
import * as colorbrewer from 'colorbrewer';
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import CartographyUI from "@/components/CartographyUI.vue";
import BivariateUI from "@/components/BivariateUI.vue";
import { useMenuStore } from '../stores/menu'
import { useTimeSliderStore } from '@/stores/timeSlider'
import { useCartographyDeepLink } from "@/utils/useCartographyDeepLink"
import TrivariateUI from "@/components/TrivariateUI.vue";

let { isMinimized } = storeToRefs(useMenuStore())
let classificationMethods = ref([ "NaturalBreaks", "Quantiles", "EqualInterval"])
//let selectedClassificationMethod = ref("NaturalBreaks")
let bivariateUI = ref(false)
let trivariateUI = ref(false)
const emit = defineEmits(["filterByYear", "mapLegend", "mapStylization", "customMapStylization", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleExpressionByYear", "addLayerToMap", "addTernaryLayerToMap"]);


const datasetSearchStore = useDatasetSearchStore()
const indicatorStore = useIndicatorStore()
const addedDatasetsStore = useaddedDatasetsStore()
const timeSliderStore = useTimeSliderStore()


onMounted(async () => {
  const { attach } = useCartographyDeepLink({
    mapStylizationFromDeepLink,
    changeLayerOpacity,
    setLayerPintProperty
  })
   await nextTick()
  attach() 
})



let userSelectedYear = ref(null)
const toggleDataUI = ()=>{
    datasetSearchStore.toggleDataUI({
        dataUiInitiated : false,
    })
    
}

const filterByYear = (indicatorName)=>{
    emit('filterByYear', indicatorName, userSelectedYear.value, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod)

}
const backtoUnivariateMap = (indicatorName)=>{
    emit('filterByYear', indicatorName, userSelectedYear.value, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod)

}
const mapStylizationFromDeepLink = (colorPalette, datatype, indicatorName)=>{
    indicatorStore.setIndicatorColorPalette(
      {
        colorPalette: colorPalette,
        indicatorName: indicatorName
      }
    )
    emit('mapStylization', indicatorName)
}   
const assignColorPalette =  (colorPalette, datatype, indicatorName) => {
    indicatorStore.setIndicatorColorPalette(
      {
        colorPalette: colorPalette,
        indicatorName: indicatorName
      }
    )
    emit('mapLegend', indicatorName)
    if (datatype === 'indikator') {
             emit(
            'filterByYear',
            indicatorName,
            userSelectedYear.value,
            indicatorStore.indicatorArray[indicatorName].classificationMethod
            )
    }
    else if (datatype=='custom indikator'){
        console.log( indicatorStore.indicatorArray[indicatorName], "custom indikator")
        emit('customMapStylization',
        indicatorStore.indicatorArray[indicatorName][0][0],
        indicatorStore.indicatorArray[indicatorName]['classification_result'],
        ref(indicatorName)
    )
    }
    
}

const formatYears = (years)=> {
    if (years.length === 1) {
      return years[0];
    } else if (years.length === 2) {
      return `${years[0]}, ${years[1]}`;
    } else if (years.length > 2) {
      return `${years[0]}-${years[years.length - 1]}`;
    }
    return '';
}

const setLayerPintProperty = (layerId, styleProperty, fillStyle)=>{
    emit("setLayerPintProperty", layerId, styleProperty, fillStyle)
}

const setLayerLayoutProperty = (layerId, layoutProperty, layoutValue)=>{
    emit("setLayerLayoutProperty",layerId, layoutProperty, layoutValue )
}
const addStyleExpressionByYear =(layerId, styleProperty, fillStyle)=>{
    emit("addStyleExpressionByYear",layerId, styleProperty, fillStyle)
    updateIndicatoreStore({mode:"bivariate"})
}
const addLayerToMap = (layerSpecifications)=>{
    const layerName = layerSpecifications.layerNameInDatabase;
    const layerId = layerSpecifications.id
    if (!addedDatasetsStore.addedLayers[layerName]['sublayers']) {
        addedDatasetsStore.addedLayers[layerName]['sublayers'] = {};
    }

    addedDatasetsStore.addedLayers[layerName]['sublayers'] = {
        ...addedDatasetsStore.addedLayers[layerName]['sublayers'], 
        [layerId]: layerId
    };
   
    emit("addStyleLayerToMap",layerSpecifications )
}

const changeLayerOpacity = (value, dsname)=>{
   indicatorStore.setIndicatorOpacity(
      {
        opacity: value,
        indicatorName: dsname
      }
    )
     emit(
        "setLayerPintProperty",
        "kommunales_gebiet_dashboard"+dsname,
        'fill-opacity',
        value
    )
}
const activateTimeSlider = ()=>{
    timeSliderStore.setSlider({
        vis: true,
        time: indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator
    });
   
}
const deActivateTimeSlider = ()=>{
    timeSliderStore.deactivateSlider({
        vis: false
    });
    
}

const addTernaryLayerToMap = (data)=>{
    emit("addTernaryLayerToMap", data)
    updateIndicatoreStore({mode:"ternary"})
}

const updateIndicatoreStore = (data)=>{
    if (data.mode=="bivariate"){
        console.log("remove trivariate")
        indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].ternaryData = null

    }
    else if (data.mode=="ternary"){
        indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].secondIndicator = null
        indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].secondIndicatorName = null
        indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].bivariate = false
    }
}
</script>

<style scoped>

/* Uses the configurable button/button-hover colors (see
   src/services/config.js) to recolor icons/combine.svg's circular
   background. */
.icon-button-circle-bg {
  fill: var(--color-button, #000000);
  transition: fill 0.2s ease;
}
.icon-button-circle:hover .icon-button-circle-bg {
  fill: var(--color-button-hover, #444444);
}

.header-ui{
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
.added-indikator-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 192px;
    bottom: 10px;
    left: 381px;
    z-index: 10;
    height: fit-content;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.added-custom-indikator-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 104px;
    bottom: 10px;
    left: 381px;
    z-index: 10;
    height: fit-content;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.added-table-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 104px;
    bottom: 10px;
    left: 381px;
    z-index: 10;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    height: fit-content;
    max-height: calc(100vh - 114px);
    


}
.animated-transform {
  transition: width 0.3s ease, left 0.3s ease;
}
.dataset-bivariate-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 190px;
    bottom: 10px;
    left: 1000px;
    z-index: 100;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
.dataset-trivariate-ui {
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 62px;
    bottom: 10px;
    left: 1000px;
    z-index: 100;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);

    display: flex;
    flex-direction: column;
    overflow: hidden;   /* ← remove overflow-y: scroll from here */
}
</style>