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
                <div class="d-flex align-center"  v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]">
                    <span style="font-size: 1rem; font-weight: 500;" class="ml-2 white--text">
                        {{ formatYears(indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator) }}

                    </span>
                </div>
                   
                <div  v-if="indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]">
                    <v-col >
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
            <v-row no-gutters style="" class="d-flex mt-4 mb-4">
                <v-col cols="12" sm="2" class=" ">
                    <div class="v-label" >{{$t('dataset.color')}}</div>
                </v-col>
                <v-col cols="12" sm="9" class="d-flex justify-end align-center">
                    <v-menu :close-on-content-click="true"  location="start">
                        <template v-slot:activator="{ props }">
                            <span
                                v-for="(colorItem, j) in indicatorStore.indicatorArray[datasetSearchStore.selectedDataset]?.colorPalette"
                                :key="j"
                                v-bind="props"
                                :style="{
                                    backgroundColor: colorItem,
                                    width: '36px',
                                    height: '12px',
                                    display: 'inline-block',
                                    margin: '0px',
                                    cursor: 'pointer'
                                }"
                            ></span>
                        </template>
                        <v-list style="max-height:300px" >
                            <v-list-item  v-for="([, item], i) in Object.entries(colorbrewer.default).filter(([key]) => key !== 'schemeGroups')"  :key="i" >
                                    <div @click="assignColorPalette(item[5])" >
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
            <v-divider style="margin-left: 15px; margin-right: 15px;" class="mt-2"></v-divider>
            <v-list-item
                :subtitle="$t('bivariate.subtitle')"
                :title="$t('bivariate.title')"
                class="text-left mb-2"
            >
                <template v-slot:prepend>
                    <v-avatar style="cursor: pointer;">
                                <v-img src="icons/combine.svg" @click="bivariateUI=true"  />
                            
                    </v-avatar>
                </template>
            </v-list-item>
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
            <BivariateUI @addStyleExpressionByYear="addStyleExpressionByYear" class="mb-2"></BivariateUI>
            
        </v-card>
        <v-card :style="{ left: isMinimized ? '90px' : '382px' }" v-show="addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='table' || addedDatasetsStore?.addedLayers[datasetSearchStore?.selectedDataset]?.dct_type=='raster'" class="added-table-ui mx-auto animated-transform"  width="371">
            <CartographyUI  @setLayerPintProperty="setLayerPintProperty"  @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></CartographyUI>
        </v-card>
    </div>
</template>

<script setup>
import { defineEmits, ref } from "vue"
import { storeToRefs } from "pinia";
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { useIndicatorStore } from '@/stores/indicator'
import * as colorbrewer from 'colorbrewer';
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import CartographyUI from "@/components/CartographyUI.vue";
import BivariateUI from "@/components/BivariateUI.vue";
import { useMenuStore } from '../stores/menu'
let { isMinimized } = storeToRefs(useMenuStore())
let classificationMethods = ref([ "NaturalBreaks", "Quantiles", "EqualInterval"])
//let selectedClassificationMethod = ref("NaturalBreaks")
let bivariateUI = ref(false)
const emit = defineEmits(["filterByYear", "mapLegend", "mapStylization", "setLayerPintProperty", "setLayerLayoutProperty", "addStyleExpressionByYear", "addLayerToMap"]);


const datasetSearchStore = useDatasetSearchStore()
const indicatorStore = useIndicatorStore()
const addedDatasetsStore = useaddedDatasetsStore()

let userSelectedYear = ref(null)
const toggleDataUI = ()=>{
    datasetSearchStore.toggleDataUI({
        dataUiInitiated : false,
    })
    
}

const filterByYear = (indicatorName)=>{
    emit('filterByYear', indicatorName, userSelectedYear.value, indicatorStore.indicatorArray[datasetSearchStore.selectedDataset].classificationMethod)

}

const assignColorPalette =  (colorPalette)=> {
    indicatorStore.setIndicatorColorPalette(
      {
        colorPalette: colorPalette,
        indicatorName: datasetSearchStore.selectedDataset
      }
    )
    emit('mapLegend', datasetSearchStore.selectedDataset)
    emit('mapStylization', datasetSearchStore.selectedDataset)
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
    top: 190px;
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
    bottom: 60px;
    left: 1000px;
    z-index: 100;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}
</style>