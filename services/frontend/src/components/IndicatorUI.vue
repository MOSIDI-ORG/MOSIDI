<template>
<div>
    <div v-show="activeMenu=='Indikator'">
       
        <v-card
            class="mx-auto indicator-ui"  width="371" max-height="600" v-show="activeMenu=='Indikator'"
        >
            <v-tabs
                v-model="tab"
                align-tabs="center"
                bg-color="blue"
            >
                <v-tab value="bivariate">
                    <v-icon>mdi-map-check-outline</v-icon>
                    Bivariate
                </v-tab>

                <v-tab value="customized">
                    <v-icon>mdi-ab-testing</v-icon>
                    Customized
                </v-tab>

            </v-tabs>
            <div v-show="tab=='bivariate'" style="overflow-x: hidden;">
                <div>
                    
                <v-row>
                   
                    <v-col
                        cols="12"
                        sm="8"
                    >

                        <v-autocomplete
                            :items="indicatorNames"
                            density="compact"
                            label="Indikator auswählen"
                            v-model="selectedIndicator"
                            item-value="indikator"
                            item-title="indikator"
                            variant="solo"
                            :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                            style="margin-left: 15px;  margin-top:15px;"
                        > 

                       
                        <template v-slot:item="{ item, props }">
                          
                            <v-list-item
                                @click="handleItemClick(item)"
                                prepend-avatar= 'polygon.png'
                                v-bind="props"

                               
                            >
                                <v-list-item-subtitle>
                                    {{ item.raw?.source }} -  {{ item.raw?.granularity }}
                                </v-list-item-subtitle>
                            </v-list-item>
                        </template>
                        </v-autocomplete>
                    </v-col>
               
                    <v-col
                        cols="12"
                        sm="3"
                    >                    
                        <v-select
                            v-show="isCommuneLayerAdded==true"
                            :items="availailableYearsForSelectedIndicator"
                            density="compact"
                            label="Jahr auswählen"
                            v-model="targetYear"
                            @update:modelValue="filterByYear()"
                            variant="solo"
                            :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                            style=" margin-left: 0px; margin-top:15px"
                        >
                        </v-select>
                    </v-col>
                
                </v-row>
            </div>
                <div v-show="isCommuneLayerAdded==true" class="form-check form-switch mb-4" style="margin-left: -13px; cursor: pointer; width:fit-content;justify-content: center; align-items: center;display: flex;">
                    
                    <v-icon
                            variant="text"
                            density="compact"
                            @click="toggleClickedLayer('kommunales_gebiet_dashboard'); isCommuneLayerVisible=!isCommuneLayerVisible" 
                            v-show="bivariateActivated==false"
                         
                        >
                        {{isCommuneLayerVisible==true?"mdi-eye-off-outline":"mdi-eye-outline"}}
                        </v-icon>
                        <label v-show="bivariateActivated==false" class="ml-2">Anzeigen</label>
                    <v-icon  
                        @click="showMetadata(metadata, selectedIndicator)"
                        :class="bivariateActivated==false?'ml-2':'ml-0'"
                    >
                        mdi-information-outline
                    </v-icon>
                    
                    <label class="ml-2" >Metadaten</label>
                    <v-menu v-if="bivariateActivated==false">
                        <template v-slot:activator="{ props }">
                           
                            <v-icon  class = "ml-2" v-bind="props">mdi-palette-outline</v-icon>
                            <label class="ml-2" >Farbpalette</label>
                            
                        </template>

                        <v-list style="max-height:300px">
                            <v-list-item  v-for="(item, i) in colorbrewer.default" :key="i">
                                    <div @click="getColorPalette(item[5])" >
                                        <span
                                            v-for="(colorItem, j) in item[5]"
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

                    <v-icon  
                        v-if="availailableYearsForSelectedIndicator.length>1 && bivariateActivated==false"
                        @click="activateTimeSlider()"
                        class="ml-2"
                        :color="visible== true ? 'blue' : ''"
                    >
                        mdi-progress-clock
                    </v-icon>
                    

                </div>
            
                
            
                <div v-show="isCommuneLayerAdded==true">

                    <div class="mb-4" style="margin-left: 16px; cursor: pointer; width:fit-content;justify-content: center; align-items: center;display: flex;">
                            <v-icon
                                @click="bivariateActivated ? removeBivariateSection() : addBivariateSection()"
                               :color="bivariateActivated ? 'red' : 'green'"
                            >
                                {{ bivariateActivated ? 'mdi-minus-circle-outline' : 'mdi-plus-circle-outline' }}
                            </v-icon>
                            <span class="ml-2">{{ bivariateActivated == true? "Indikator entfernen":"Indikator hinzufügen"}}</span>

                    </div>
                    <div class="bivariate-section" v-if="bivariateActivated==true">
                        <v-row>
                            <v-col
                                cols="12"
                                sm="8"
                            >
                                <v-autocomplete
                                    :items="indicatorNames"
                                    density="compact"
                                    label="Indikator auswählen"
                                    item-value="indikator"
                                    item-title="indikator"
                                    variant="solo"                            
                                    v-model="selectedSecondIndicator"
                                    :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                                    style="margin-left: 15px; margin-top: 15px;"
                                >
                                <template v-slot:item="{ props, item }">

                                <v-list-item
                                    @click=addSecondIndicator(item)
                                    :subtitle="item.raw?.source"
                                    :title= "item.raw?.indikator"
                                    prepend-avatar= 'polygon.png'
                                    v-bind="props"
                                    ></v-list-item>
                                </template>
                                </v-autocomplete>
                            </v-col>

                            <v-col
                                cols="12"
                                sm="3"
                            >
                                <v-select
                                    v-show="secondIndicatorArray"
                                    :items="availailableYearsForSecondSelectedIndicator"
                                    density="compact"
                                    label="Jahr auswählen"
                                    v-model="secondTargetYear"
                                    @update:modelValue="filterBySecondYear()"
                                    variant="solo"
                                    :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                                    style="margin-top: 15px;"
                                >
                                </v-select>
                            </v-col>
                           
                            
                        </v-row>
                       
                        <div class="form-check form-switch mb-3" v-show="secondIndicatorArray"  style="margin-left: -13px;  text-align: left;">
                           
                            <v-icon
                                variant="text"
                                density="compact"
                                @click="toggleClickedLayer('kommunales_gebiet_dashboard'); isCommuneLayerVisible=!isCommuneLayerVisible" 
                                v-show="bivariateActivated==true"
                         
                            >
                                {{isCommuneLayerVisible==true?"mdi-eye-off-outline":"mdi-eye-outline"}}
                            </v-icon>
                            <label v-show="bivariateActivated==true" class="ml-2">Anzeigen</label>
                            
                            
                            <v-icon  
                                @click="showMetadata(secondMetadata, selectedSecondIndicator)"
                                class="ml-2"
                            >
                                mdi-information-outline
                            </v-icon>
                    
                            <label class="ml-2" >Metadaten</label>
                        </div>

                    </div>
                    
                    <div class="mb-4" style="margin-left: 16px; cursor: pointer; width:fit-content;justify-content: center; align-items: center;display: flex;">
                       
                        <v-icon
                                @click="toggleAdvancedOptions()"
                               :color="advancedOptionsActivated ? 'red' : 'green'"
                            >
                                {{ advancedOptionsActivated ? 'mdi-minus-circle-outline' : 'mdi-plus-circle-outline' }}
                            </v-icon>
                            <span class="ml-2">Erweiterte Optionen</span>
                    </div>
                    <div class="mb-4" style="margin-left: 15px; margin-right: 15px;" v-show="advancedOptionsActivated==true">

                        <v-select
                            :items="classificationMethods"
                            density="compact"
                            label="Klassifizierungsverfahren"
                            v-model="selectedClassificationMethod"
                            @update:modelValue="classify()"
                            variant="solo"
                            style="width:100%"
                        >
                        </v-select>
                                
                    </div>
                </div>
            </div>

            <div v-if="tab=='customized'">
                <CustomIndicatorUI
                    :indicatorNames="indicatorNames"
                    :selectedColorPalette="selectedColorPalette"
                    @addDeckglLayer="addDeckglLayer"
                    @updateDeckglLayer="updateDeckglLayer"
                ></CustomIndicatorUI>
            </div>
           
        </v-card>
    </div>        
    <ChartUI :indicatorArray="indicatorArray" :secondIndicatorArray="secondIndicatorArray" :selectedIndicator="selectedIndicator" :selectedSecondIndicator="selectedSecondIndicator"></ChartUI>
</div>
</template>
<script setup>
import { onMounted, ref, defineEmits} from "vue"
import {getIndicatorNames, getIndicatorData, classification} from "@/services/backend.calls";
import { useMapLegendStore } from '@/stores/mapLegend'
import { useMenuStore } from '@/stores/menu'
import { useAlertStore } from '@/stores/alert'
import { useTimeSliderStore } from '@/stores/timeSlider'
import { useIndicatorStore } from '@/stores/indicator'
import { storeToRefs } from 'pinia'
import * as colorbrewer from 'colorbrewer';
import ChartUI from "@/components/ChartUI.vue";
import { useMetadataDialogStore } from '@/stores/metadataDialog'
import CustomIndicatorUI from "@/components/CustomIndicatorUI.vue";
const metadataDialogStore = useMetadataDialogStore();
import { useProgressStore } from '@/stores/progress'

const progressStore = useProgressStore()

const emit = defineEmits(["addStyleExpressionByYear", "addLayerToMap", "toggleLayerVisibility", "removeLayerFromMap", "addDeckglLayer", "updateDeckglLayer"]);

const mapLegendStore = useMapLegendStore();

const alertStore = useAlertStore()
const timeSliderStore = useTimeSliderStore()
const indicatorStore = useIndicatorStore()
const bivariateStore = useBivariateStore()

let tab = ref(null)
let indicatorNames = ref([null])
let indicatorArray = ref(null)
let secondIndicatorArray = ref(null)
let metadata = ref(null)
let secondMetadata = ref(null)
let selectedYear = [];
let selectedSecondYear = []
let matchExpression = [];

let style = ref(null)
let layout = ref(null)
let layerType=ref(null)
let selectedIndicator = ref(null)
let selectedSecondIndicator = ref(null)
let availailableYearsForSelectedIndicator = ref([])
let availailableYearsForSecondSelectedIndicator = ref([])
let targetYear = ref(null)
let secondTargetYear = ref(null)
let isCommuneLayerAdded = ref(false)
let isCommuneLayerVisible = ref(false)
let selectedClassificationMethod = ref("NaturalBreaks")
let classification_result = ref({})
let secondClassification_result = ref({})
let classificationMethods = ref(["Quantiles", "EqualInterval", "NaturalBreaks","HeadTailBreaks", "FisherJenks", "BoxPlot", "StdMean"])
let advancedOptionsActivated = ref(false)
let selectedColorPalette = ref(colorbrewer.default.RdPu[5])

let { activeMenu } = storeToRefs(useMenuStore())
let { visible } = storeToRefs(useTimeSliderStore())
import { useBivariateStore } from '../stores/bivariate'
let { bivariateLegend, firstVariableClasses, secondVariableClasses, bivariateColorpalette, bivariateActivated } = storeToRefs(useBivariateStore())

onMounted(() => {
    sendIndicarorRequest();
})

const sendIndicarorRequest = async () => {
  const indicatornamesfromDB =  await getIndicatorNames()
  indicatorNames.value = indicatornamesfromDB
}



const handleItemClick = async (indicator) => {
    selectedIndicator.value = indicator.raw?.indikator
    if(isCommuneLayerAdded.value==false){
        await addCommuneTileLayer();
    }
  
  getIndicator(selectedIndicator.value);
  
  mapLegendStore.resetClickedLegendItem();

  emit("removeLayerFromMap",  {layerId: "highlight", sourceId: "highlight"})
  deActivateTimeSlider()

};
const addSecondIndicator =  async (indicator) => {
    selectedSecondIndicator.value = indicator.raw?.indikator
    getSecondIndicator(selectedSecondIndicator.value)
    mapLegendStore.resetSecondClickedLegendItem();
}
const addCommuneTileLayer = async () => {
    style.value= {
        'fill-color': '#0080ff',
        'fill-opacity': 1,
        'fill-outline-color': 'grey'
    }
    layout.value = {}
    layerType.value="fill"
    let layerSpecification = {
        layerNameInDatabase: 'Kommunale Gebiete Deutschland',
        id: 'kommunales_gebiet_dashboard',
        style: style,
        layout: layout,
        layerType: layerType,
        sourceType: "vector_tile"
    }
    emit("addLayerToMap", layerSpecification);
    isCommuneLayerAdded.value=true
};


const getIndicator = async (indicatorName) => {
    progressStore.setProgressBar({
        text: `Abrufen des ${indicatorName} ...`,
        progress: true
    })
    const indocatorData =  await getIndicatorData(indicatorName)
    indicatorStore.setIndicatordata({
        indicator: indocatorData.indicator
    })
    
    indicatorArray.value = indocatorData.indicator
    if (indocatorData.metadata){
        metadata.value = indocatorData.metadata[0]
    }
    else {
        metadata.value = null
    }
    
    // detect available years for the selected in dicator
    availailableYearsForSelectedIndicator.value = indocatorData.availabeYears[0][0]
    //availailableYearsForSelectedIndicator.value = [...new Set(indicatorArray.value[0][0].map(item => item["zeitbezug"]))].sort();
    targetYear.value = availailableYearsForSelectedIndicator.value[availailableYearsForSelectedIndicator.value.length - 1];
    filterByYear()
        
}
const getSecondIndicator = async (indicatorName) => {
    progressStore.setProgressBar({
        text: `Abrufen des ${indicatorName} ...`,
        progress: true
    })
    const indocatorData =  await getIndicatorData(indicatorName)
    secondIndicatorArray.value = indocatorData.indicator
    secondMetadata.value = indocatorData.metadata[0]

    // detect available years for the selected in dicator
    availailableYearsForSecondSelectedIndicator.value =  indocatorData.availabeYears[0][0]
    //[...new Set(secondIndicatorArray.value[0][0].map(item => item["zeitbezug"]))].sort();
    secondTargetYear.value = availailableYearsForSecondSelectedIndicator.value[availailableYearsForSecondSelectedIndicator.value.length - 1];
    
    filterBySecondYear()
        
}

const filterByYear = () => {
    selectedYear.value = []

    matchExpression = null
    
    indicatorArray.value.forEach(innerArray => {
        innerArray.forEach(subArray => {
        selectedYear.value.push(...subArray.filter(item => item.zeitbezug === targetYear.value));
        });
    });
    classify()
}

const filterBySecondYear = () => {
    selectedSecondYear.value = []
    
    secondIndicatorArray.value.forEach(innerArray => {
        innerArray.forEach(subArray => {
            selectedSecondYear.value.push(...subArray.filter(item => item.zeitbezug === secondTargetYear.value));
        });
    });
    secondClassify()
}

const toggleClickedLayer = (layerid) => {
    emit("toggleLayerVisibility", layerid)
    emit("toggleLayerVisibility", 'highlight')
    
}

const classify = async() => {
    //const AttributeArray = selectedYear.value.map(item => item.wert);
   
    let allattributes = indicatorArray.value[0][0].map(item => item.wert);

    if( classification_result?.value?.selectedIndicator !== selectedIndicator.value){
        classification_result.value.selectedIndicator = selectedIndicator.value;

        const response = await classification(allattributes, selectedClassificationMethod.value);
        classification_result.value = {
            ...classification_result.value,  
            ...response.intervals_5_classes                      
        };

        if (classification_result.value.warnings) {
            alertStore.setAlert({
                text: classification_result.value.warnings,
                timeout: 2000
            });
        }
        indicatorStore.setClassificationResult({
            classification_result: classification_result.value
        })

        bivariateStore.setFirstVariableClasses({
            classification_result: response
        })

       
    }    
    mapLegend()
    if (bivariateActivated.value==true){
        bivariateStylization()
    }
    else {
        mapStylization()
    }
    
    progressStore.setProgressBar({
        progress: false
    })

}

const mapStylization = () => {
    ////////////////////// ** stylization ** /////////////////

    // Build a GL expression that defines the color for every pg_tileserve (vector tile) feature
    matchExpression = ['match', ['get', 'nationalco']];

    // conditions for each communale gebiete code
    for (const row of selectedYear.value) {
        const value = row['wert'];
       
        let color;

        if (value <= classification_result.value.intervals[0]) {
            //color = '#feebe2'; // Class 1
            color = selectedColorPalette.value[0]
            //color = colorbrewer.default.selectedColorPalette.value.title
        } else if (value <= classification_result.value.intervals[1]) {
            //color = '#fbb4b9'; // Class 2
            color = selectedColorPalette.value[1]
        } else if (value <= classification_result.value.intervals[2]) {
            //color = '#f768a1'; // Class 3
            color = selectedColorPalette.value[2]
        } else if (value <= classification_result.value.intervals[3]) {
            //color = '#c51b8a'; // Class 4
            color = selectedColorPalette.value[3]
        } else {
            //color = '#7a0177'; // Class 5 (Default color)
            color = selectedColorPalette.value[4]
        }
        matchExpression.push(row['kennziffer'].toString(), color);
    }

    // Last value is the default color, used where there is no data
    matchExpression.push('rgba(0, 0, 0, 0)');
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard', 'fill-color', matchExpression)
    indicatorStore.setColorPalette({
            selectedColorPalette: selectedColorPalette.value
    })
}



const mapLegend = () => {
    const classIntervalsAndColor = [];
    for (let i = 0; i < classification_result.value.intervals.length; i++) {
        const intervalName = `interval${i + 1}`;
        const colorName = `color${i + 1}`;
        const intervalValue = classification_result.value.intervals[i].toFixed(2);
        const colorValue = getColorBasedOnIndex(i);
        const intervalAndColor = {
            [intervalName]: intervalValue,
            [colorName]: colorValue,
        };

        classIntervalsAndColor.push(intervalAndColor);
    }
    mapLegendStore.assignClassificationValues({
        minMax: classification_result.value.minMax,
        classIntervalsAndColor,
        selectedIndicator: selectedIndicator.value,
        completeIndicatorName: metadata.value.name
    });
    function getColorBasedOnIndex(index) {
       
        const colors = selectedColorPalette.value
        return colors[index % colors.length];
    }
}

const getColorPalette = (item) =>{
    selectedColorPalette.value = item
    mapLegend()
    mapStylization()
}

const showMetadata = (selectedMetadata, selectedIndicator) => {
    metadataDialogStore.assignMetadata(selectedMetadata, selectedIndicator)
}

const bivariateMapLegend = () => {
    bivariateLegend.value=true

}
const addBivariateSection = ()=>{
    bivariateActivated.value= true
}
const secondClassify = async() => {
    
    let allattributes = secondIndicatorArray.value[0][0].map(item => item.wert);
    if( secondClassification_result?.value?.selectedSecondIndicator !== selectedSecondIndicator.value){
        secondClassification_result.value.selectedSecondIndicator = selectedSecondIndicator.value;

        const response = await classification(allattributes, selectedClassificationMethod.value);
       
        secondClassification_result.value = {
            ...secondClassification_result.value,  
            ...response.intervals_5_classes                      
        };

        if (secondClassification_result.value.warnings) {
            alertStore.setAlert({
                text: secondClassification_result.value.warnings,
                timeout: 2000
            });
        }
        bivariateStore.setSecondvariableClasses({
            classification_result: response  
        })
       
    }    
    

    
    bivariateMapLegend()
    bivariateStylization()
    progressStore.setProgressBar({
        progress: false
    })
    mapLegendStore.assignSecondClassificationValues({
        minMax: secondClassification_result.value.minMax,
        classIntervals: secondClassification_result.value.intervals,
        selectedSecondIndicator: selectedSecondIndicator.value,
        completeSecondIndicatorName: secondMetadata.value.name
    });

}
const bivariateStylization = ()=>{
    const secondYearMap = new Map(
        selectedSecondYear.value.map(row => [row['kennziffer'], row['wert']])
);
    matchExpression = ['match', ['get', 'nationalco']];
    for (const row of selectedYear.value) {
        const value1 = row['wert']; // First dataset
        const value2  = secondYearMap.get(row['kennziffer']);
        let color;
        
        // Determine class for the first dataset (X-axis)
        let class1;
        if (value1 <= firstVariableClasses.value.intervals_3_classes.intervals[0]) {
            class1 = 'low';
        } else if (value1 <= firstVariableClasses.value.intervals_3_classes.intervals[1]) {
            class1 = 'medium';
        } else {
            class1 = 'high';
        }

        // Determine class for the second dataset (Y-axis)
        let class2;

        if (value2 <= secondVariableClasses.value.intervals_3_classes.intervals[0]) {
            class2 = 'low';
        } else if (value2 <= secondVariableClasses.value.intervals_3_classes.intervals[1]) {
            class2 = 'medium';
        } else {
            class2 = 'high';
        }

        // Combine the two classes (e.g., 'low_low', 'high_medium')
        const colorKey = `${class1}_${class2}`;
        
        // Assign the color based on the bivariate color palette
        color = bivariateColorpalette.value[colorKey]; 

        // Push the result to the match expression
        matchExpression.push(row['kennziffer'].toString(), color);
    }
    matchExpression.push('rgba(0, 0, 0, 0)');
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard', 'fill-color', matchExpression)
}

const removeBivariateSection = () => {
    bivariateActivated.value= false
    secondIndicatorArray.value = null
    selectedSecondIndicator.value = null
    bivariateLegend.value=false
    classify()
}

const toggleAdvancedOptions = () => {
    advancedOptionsActivated.value = !advancedOptionsActivated.value
}

const addDeckglLayer = (data,style) => {
    emit("addDeckglLayer", data, style);
}

const updateDeckglLayer = (data, style) => {
    emit("updateDeckglLayer", data, style)
}

const activateTimeSlider = ()=>{
    timeSliderStore.setSlider({
        vis: true,
        time: availailableYearsForSelectedIndicator.value
    });
   
}
const deActivateTimeSlider = ()=>{
    timeSliderStore.deactivateSlider({
        vis: false
    });
    
}




</script>

<style scoped>
.indicator-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
    overflow-x: scroll; 
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
.sticky{
    position: sticky;
    top: 0;
    z-index: 1;
}
.form-switch .form-check-input {width: 3em; height: 1.5em;}

</style>