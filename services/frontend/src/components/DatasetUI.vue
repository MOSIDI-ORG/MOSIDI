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
             <v-row no-gutters style="" class="d-flex mt-6 mb-0">
                <v-col cols="12" sm="4" class=" ">
                    <div class="v-label" >Map type</div>
                </v-col>
                <v-col cols="12" sm="6" class="ml-8 d-flex justify-end align-center" v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]">
                    <v-select
                        :items="visualizationTypes"
                        item-title="title"
                        item-value="value"
                        density="compact"
                        label="Visualization"
                        v-model="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].visualizationType"
                        @update:modelValue="changeVisualizationtype(datasetSearchStore?.selectedDataset)"
                        variant="solo"
                        dense
                        outlined
                        single-line
                        hide-details
                    >
                    </v-select>
                </v-col>
            </v-row>
            <v-divider style="margin-left: 15px; margin-right: 15px;"></v-divider>
            <v-row no-gutters style="" class="d-flex mt-4">
                <v-col cols="12" sm="3" class=" ">
                    <div class="v-label" >{{$t('dataset.histogram.title')}}</div>
                </v-col>
                <!-- Changed height from 230px to 150px -->
                <div id="histogram" ref="histogram" style="width: 100%; height: 150px;"></div>
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
                            <v-avatar>
                                <v-img src="icons/combine.svg" />
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
            <BivariateUI ref="bivariateRef" @addStyleExpressionByYear="addStyleExpressionByYear" @backtoUnivariateMap="backtoUnivariateMap" class="mb-2"></BivariateUI>
            
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
            <TrivariateUI ref="trivariateRef"  @addTernaryLayerToMap="addTernaryLayerToMap" @backtoUnivariateMap="backtoUnivariateMap" style="flex: 1; min-height: 0; overflow: hidden;"></TrivariateUI>

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
const emit = defineEmits(["filterByYear", "mapLegend", "mapStylization", "customMapStylization", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleExpressionByYear", "addLayerToMap", "addTernaryLayerToMap", "addLayerbyMapType"]);


const datasetSearchStore = useDatasetSearchStore()
const indicatorStore = useIndicatorStore()
const addedDatasetsStore = useaddedDatasetsStore()
const timeSliderStore = useTimeSliderStore()

onMounted(async () => {
  const { attach } = useCartographyDeepLink({
    mapStylizationFromDeepLink,
    changeLayerOpacityFromDyyplink,
    setLayerPintProperty
  })
   await nextTick()
  attach() 
})

const bivariateRef = ref(null)
const trivariateRef = ref (null)

let userSelectedYear = ref(null)
const toggleDataUI = ()=>{
    datasetSearchStore.toggleDataUI({
        dataUiInitiated : false,
    })
    
}
const visualizationTypes = [
  {
    title: 'Polygon',
    value: 'polygon'
  },
  {
    title: 'Circle Glyph',
    value: 'glyph'
  }
]

const filterByYear = (indicatorName)=>{
    emit('filterByYear', indicatorName, userSelectedYear.value, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod)

}
const changeVisualizationtype = (indicatorName)=>{
        emit('addLayerbyMapType', indicatorName, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].granularity)
        emit('filterByYear', indicatorName, userSelectedYear.value, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod)

    
    if (indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].bivariate==true){

        bivariateRef.value?.getSecondIndicator( 
            indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['secondIndicator']?.secondIndicatorName,
            indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]['granularity'])
    }
    else if(indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].ternaryData!=null){
        trivariateRef.value?.applyIndicators()
    }
    

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
    let visType = indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.visualizationType
    let styleProperty = visType === 'polygon' ? 'fill-opacity' : 'circle-opacity';
   indicatorStore.setIndicatorOpacity(
      {
        opacity: value,
        indicatorName: dsname
      }
    )
     emit(
        "setLayerPintProperty",
        "kommunales_gebiet_dashboard"+dsname,
        styleProperty,
        value
    )
}
const changeLayerOpacityFromDyyplink = (value, dsname, styleProperty)=>{
    //let visType = indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.visualizationType
    //let styleProperty = visType === 'polygon' ? 'fill-opacity' : 'circle-opacity';
   indicatorStore.setIndicatorOpacity(
      {
        opacity: value,
        indicatorName: dsname
      }
    )
     emit(
        "setLayerPintProperty",
        "kommunales_gebiet_dashboard"+dsname,
        styleProperty,
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