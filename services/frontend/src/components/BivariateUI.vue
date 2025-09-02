<template>
    
    <div v-if="indicatorArray[selectedDataset] && tableMetadataForBivariate!==null" class="bivariate-ui">
        <div class="header">
            <div width="371" class="mb-2 ml-1 mr-1">
                <v-text-field
                    :label="$t('dataset-filter.search')"
                    prepend-inner-icon="mdi-magnify"
                    class="expanding-search"
                    filled
                    outlined
                    density="compact"
                    clearable
                    dense
                    single-line
                    hide-details
                    v-model="layerSearchText"
                >
                </v-text-field>
                    
            </div>
            <div class="ml-1 mr-1 mb-2">
                <v-row no-gutters>
                    <v-col >
                        <v-select
                            :items="datasetTypes"
                            :item-title="'alias'"
                            :item-value="'name'"
                            :label="$t('dataset-filter.filter-label.type')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded  
                            v-model="selectedDatasetType"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=dataSources
                            :label="$t('dataset-filter.filter-label.source')"
                            
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                                
                            v-model="selectedDatasetSource"
                        ></v-select>
                    </v-col>
                    
                
                </v-row>
                <v-row no-gutters class="mt-2">
                    <v-col>
                        <v-select
                            :items=geometryTypes
                            :label="$t('dataset-filter.filter-label.geometry')"
                                variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                            v-model="selectedGeometryTypee"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=availableYearsForIndicatorFilter
                            :label="$t('dataset-filter.filter-label.time')"
                            variant="outlined"
                            density="compact"
                            hide-details
                            rounded
                            v-model="selectedYearIndicatorFilter"
                        ></v-select>
                    </v-col>
                </v-row>
            </div>
            </div>
                   
            <v-card class="dataset-filter-ui mx-auto text-left animated-transform"  width="371">
                <v-list lines="two" style="background-color:transparent; height: 81%;" class="ml-1 mr-1">
                    <span style="font-size: 1rem; font-weight: 500;" class="ml-2">{{filteredItems?.length + ' '+  $t('dataset-filter.results')}}</span>

                    <v-list-item
                        v-for="(metadata, index) in filteredItems"
                        :key="index"
                        :subtitle="metadata.dct_catalog_publisher"
                        :title="metadata.dct_title"
                        v-model="indicatorArray[selectedDataset]['secondIndicatorName']"
                        @click=addSecondIndicator(metadata)
                        @mouseover="hoveredItem = index"
                        @mouseleave="hoveredItem = null"
                        style="border-radius: 5px;"
                    >
                        <template v-slot:prepend>
                            <v-avatar>
                                <v-img 
                                    :src="getIcon(metadata.dct_title, index, metadata.geometry_type)"
                                    max-height="40"
                                    max-width="40"
                                    style="cursor: pointer;"
                                    
                                ></v-img>
                            </v-avatar>
                        </template>
                        <!-- RIGHT SIDE SELECT -->
                    <template  v-slot:append>
                        <div v-if="selectedSecondIndicator == metadata.dct_title && indicatorArray[selectedDataset]['secondIndicator']"  @click.stop @mouseover.stop @mouseleave.stop>
                        <v-select
                            :items="indicatorArray[selectedDataset]['secondIndicator']['availailableYearsForSecondSelectedIndicator']"
                            dense
                            hide-details
                            variant="underlined"
                            style="width: 120px;"
                            v-model="indicatorArray[selectedDataset]['secondIndicator']['secondSelectedYear']"
                            @update:modelValue="filterBySecondYear()"
                        ></v-select>
                        </div>
                    </template>
                        
                        
                
                    </v-list-item>
        

                </v-list>

            </v-card>
                   

    </div>
</template>

<script setup>
import {ref, defineEmits, computed, onMounted} from "vue"
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { storeToRefs } from 'pinia'
import {getIndicatorData, classification} from "@/services/backend.calls";
import { useIndicatorStore } from '@/stores/indicator'
import { useBivariateStore } from '../stores/bivariate'
const emit = defineEmits(["addStyleExpressionByYear"]);


const indicatorStore = useIndicatorStore()


let {  tableMetadata, selectedDataset } = storeToRefs(useDatasetSearchStore())
let {indicatorArray} = storeToRefs(useIndicatorStore())
let selectedSecondYear = []
let selectedFirstYear = []
let matchExpression = [];

let selectedClassificationMethod = ref("NaturalBreaks")
let { bivariateColorpalette } = storeToRefs(useBivariateStore())
let selectedDatasetType = ref('');
let selectedDatasetSource = ref('');
let selectedGeometryTypee = ref('');
let selectedYearIndicatorFilter = ref('');
let layerSearchText = ref('');
let {  activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())
let hoveredItem = ref(null)
let dataSources = ref(null)
let geometryTypes = ref(null)
let availableYearsForIndicatorFilter =ref(null)
let selectedSecondIndicator = ref(null)
const datasetTypes = computed(() => {
  if (activatedDatasetSearch.value === 'indicator') {
    return [{ alias: 'Indicator', name: 'indikator' }];
  } else if (activatedDatasetSearch.value === 'geodata') {
    return [{ alias: 'WMS', name: 'raster' }];
  } else {
    return [
      { alias: 'Indicator', name: 'indikator' },
      { alias: 'WMS', name: 'raster' },
      { alias: 'All', name: 'all' },
    ];
  }
});
onMounted(()=>{
    tableMetadataRequest()
})
import {getTableMetadata} from "../services/backend.calls";
let tableMetadataForBivariate = ref(null)
const tableMetadataRequest= async ()=>{
    const response =  await getTableMetadata()
    console.log(response, "tableMetadataForBivariate")
    tableMetadataForBivariate.value= response
    dataSources.value = [ ...new Set(tableMetadataForBivariate?.value?.map(item => item.dct_catalog_publisher)), "All"];
    geometryTypes.value = [ ...new Set(tableMetadataForBivariate?.value?.map(item => item.geometry_type)), "All"];
    availableYearsForIndicatorFilter.value = [
    ...new Set(tableMetadataForBivariate?.value?.map(item => new Date(item.dct_temporal_enddate).getFullYear()).sort()),
    "All"
    ];
}


const filteredItems = computed(() => {
    return tableMetadata.value.filter(item => {
        const matchesSearchText = layerSearchText.value
            ? item.dct_title.toLowerCase().includes(layerSearchText.value.toLowerCase())
            : true;
        const matchesDatasetType = selectedDatasetType.value && selectedDatasetType.value !== 'all'
            ? item.dct_type === selectedDatasetType.value
            : true;
       const preFilterDatasetType = (() => {
            if (activatedDatasetSearch.value === 'indicator') {
                return item.dct_type === 'indikator';
            } else if (activatedDatasetSearch.value === 'geodata') {
                return item.dct_type === 'raster';
            } else {
                return true; 
            }
        })();

        const matchesDatasetSource = selectedDatasetSource.value && selectedDatasetSource.value !== 'All'
            ? item.dct_catalog_publisher === selectedDatasetSource.value
            : true;
        
        const matchesGeometryType = selectedGeometryTypee.value && selectedGeometryTypee.value !== 'All'
            ? item.geometry_type === selectedGeometryTypee.value
            : true;

        const matchesDatasetYear = selectedYearIndicatorFilter.value && selectedYearIndicatorFilter.value !== 'All'
            ? new Date(item.dct_temporal_enddate).getFullYear() >= parseInt(selectedYearIndicatorFilter.value)
            : true;
        return matchesSearchText && matchesDatasetType &&  preFilterDatasetType && matchesDatasetSource && matchesGeometryType && matchesDatasetYear;
    });
});
const getIcon = (layerName, index, geomType)=> {
    if (selectedSecondIndicator.value === layerName) {
        return 'icons/check.svg'; 
      } else if (hoveredItem.value === index) {
        return 'icons/plus.svg'; 
      } else {
        if (geomType=='Point'){
            return 'icons/point-blue.svg';
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            return 'icons/line-blue.svg';
        }
        else if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
            return 'icons/polygon-blue.svg';
      }
      else {
            return 'icons/raster.svg';
        }
      }
    
  }
const addSecondIndicator =  async (indicator) => {
    getSecondIndicator(indicator.dct_title)
    selectedSecondIndicator.value = indicator.dct_title
}
const getSecondIndicator = async (indicatorName) => {
    const indocatorData =  await getIndicatorData(indicatorName)
    indicatorStore.setSecondIndicatordata({
        parentIndicator:selectedDataset.value,
        secondIndicator: indocatorData.indicator,
        secondIndicatorName: indicatorName,
        availailableYearsForSecondSelectedIndicator: indocatorData.availabeYears[0][0],
        secondSelectedYear: indocatorData.availabeYears[0][0].at(-1),
        bivariate: true
    })
    
    filterBySecondYear()
        
}
const filterBySecondYear = () => {
    selectedSecondYear.value = []
    indicatorArray.value[selectedDataset.value]['secondIndicator']['secondIndicator'].forEach(innerArray => {
        innerArray.forEach(subArray => {
            selectedSecondYear.value.push(...subArray.filter(item => item.zeitbezug === indicatorArray.value[selectedDataset.value]['secondIndicator']['secondSelectedYear']));
        });
    });
    secondClassify()
}
const secondClassify = async()=>{
    let allattributes = indicatorArray.value[selectedDataset.value]['secondIndicator']['secondIndicator'][0][0].map(item => item.wert);
    if(indicatorArray.value[selectedDataset.value]['secondIndicator']['classification_result']){
        console.log("already exists")
    }
    else{
        const response = await classification(allattributes, selectedClassificationMethod.value);
        indicatorStore.setSecondIndicatorClassificationResults({
            parentIndicator: selectedDataset.value,
            secondIndicator: indicatorArray.value[selectedDataset.value]['secondIndicator']['secondIndicatorName'],
            classification_result: response.intervals_3_classes
        })
        /*if (response.intervals_5_classes.warnings) {
            alertStore.setAlert({
                text: response.intervals_5_classes.warnings,
                timeout: 2000
            });
        }*/
    }
    bivariateStylization()
}

const bivariateStylization=()=>{
    selectedFirstYear.value = []
    const secondYearMap = new Map(
        selectedSecondYear.value.map(row => [row['kennziffer'], row['wert']])
    );
    indicatorStore.indicatorArray[selectedDataset.value].forEach(innerArray => {
        innerArray.forEach(subArray => {
            selectedFirstYear.value.push(...subArray.filter(item => item.zeitbezug === indicatorStore.indicatorArray[selectedDataset.value].selectedYear));
        });
    });
    matchExpression = ['match', ['get', 'nationalco']];
    for (const row of selectedFirstYear.value) {
        const value1 = row['wert']; // First dataset
        const value2  = secondYearMap.get(row['kennziffer']);
        let color;
        
        // Determine class for the first dataset (X-axis)
        let class1;
        if (value1 <= indicatorStore.indicatorArray[selectedDataset.value]['classification_result_3_intervals'].intervals[0]) {
            class1 = 'low';
        } else if (value1 <= indicatorStore.indicatorArray[selectedDataset.value]['classification_result_3_intervals'].intervals[1]) {
            class1 = 'medium';
        } else {
            class1 = 'high';
        }

        // Determine class for the second dataset (Y-axis)
        let class2;

        if (value2 <= indicatorArray.value[selectedDataset.value]['secondIndicator']['classification_result'].intervals[0]) {
            class2 = 'low';
        } else if (value2 <= indicatorArray.value[selectedDataset.value]['secondIndicator']['classification_result'].intervals[1]) {
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
    emit("addStyleExpressionByYear",'kommunales_gebiet_dashboard' + selectedDataset.value , 'fill-color', matchExpression)
    
    
}
</script>

<style scoped>
.dataset-filter-ui{
    overflow-y: scroll; 
    background: transparent; 
    z-index: 10;
}
.bivariate-ui{
     overflow-y: scroll; 
     bottom: 100px;
}
.header{
    background: black; 
    position: sticky;
    z-index: 10;
    background-color: rgba(0,0,0,1);
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2); 
}
</style>