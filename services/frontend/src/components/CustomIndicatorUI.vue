<template>
    <div style="overflow-x: hidden;" >
        <v-card density="compact" width="371" style="background-color: black; color: white;">
            <div style="padding: 8px;">
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
            <div class="mb-4 ml-2 mr-2"  >
                <v-row no-gutters>
                    <v-col >
                        <v-select
                            :items="datasetTypes"
                            :item-title="'alias'"
                            :item-value="'name'"
                            :label="$t('dataset-filter.filter-label.type')"
                            dense
                            outlined
                            density="compact"
                            single-line
                            hide-details
                            rounded
                            solo                
                            v-model="selectedDatasetType"
                        ></v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=dataSources
                            item-value="value"
                            item-title="label"
                            :label="$t('dataset-filter.filter-label.source')"
                            dense
                            outlined
                            single-line
                            density="compact"
                            hide-details
                            rounded
                            solo 
                            v-model="selectedDatasetSource"
                        >
                            
                        </v-select>
                    </v-col>
                    
                    
                </v-row>
                <v-row no-gutters>
                    <v-col>
                        <v-select
                            :items=geometryTypes
                            item-value="value"
                            item-title="label"
                            :label="$t('dataset-filter.filter-label.geometry')"
                            dense
                            outlined
                            single-line
                            hide-details
                            rounded
                                density="compact"
                            solo 
                            v-model="selectedGeometryTypee"
                        >
                        
                    </v-select>
                    </v-col>
                    <v-col>
                        <v-select
                            :items=availableYearsForIndicatorFilter
                            item-value="value"
                            item-title="label"
                            :label="$t('dataset-filter.filter-label.time')"
                            dense
                            outlined
                            single-line
                            hide-details
                            rounded
                                density="compact"
                            solo 
                            v-model="selectedYearIndicatorFilter"
                        >
                            
                        </v-select>
                    </v-col>
                </v-row>
            </div>

        </v-card>
       

        <div style="background-color:transparent; height: 310px; max-height: 310px;">
        
            <span style="font-size: 1rem; font-weight: 500;" class="ml-3 d-block my-1">
                {{ filteredItems?.length + ' ' + $t('dataset-filter.results') }}
            </span>        

            <v-virtual-scroll
                :items="filteredItems"
                :item-height="88"
                height="calc(100% - 30px)"
                style="background-color: transparent;"
            >
                <template v-slot:default="{ item: metadata }">
                    <v-list-item
                        style="border-radius: 5px;"
                        class="mx-2 my-1"
                        lines="two"
                        @click="handleItemClick(metadata)"
                        
                        @mouseover="hoveredItem = metadata.dct_title"
                        @mouseleave="hoveredItem = null"
                    >
                        <v-list-item-subtitle 
                            v-if="metadata.dct_type === 'indikator'" 
                            class="text-wrap text-caption"
                        >
                            {{ metadata.dcatde_politicalgeocodingleveluri }}, {{ getYear(metadata.dct_temporal_startdata) }}-{{ getYear(metadata.dct_temporal_enddate) }}
                        </v-list-item-subtitle>
                        
                        <v-list-item-title class="text-wrap" v-text="metadata.dct_title"></v-list-item-title>
                        <v-list-item-subtitle class="text-wrap" v-text="metadata.dct_catalog_publisher"></v-list-item-subtitle>
                        
                        <template v-slot:prepend>
                            <v-avatar>
                                <v-img 
                                    :src="getIcon(metadata.dct_title, metadata.dct_title, metadata.geometry_type, metadata.dcatde_politicalgeocodingleveluri)"
                                    max-height="40"
                                    max-width="40"
                                    style="cursor: pointer;"
                                ></v-img>
                            </v-avatar>
                        </template>

                        <template v-slot:append>
                            <v-col style="float: right;">
                                <div 
                                    @click.stop 
                                    @mousedown.stop 
                                    @mouseup.stop
                                    v-if="addedIndicator !== null"
                                >
                                    <v-select
                                        v-show="addedIndicatorTitlesSet.has(`${metadata.dct_title}_${metadata.dcatde_politicalgeocodingleveluri}`)"
                                        :items="metadata.availailableYears"
                                        v-model="metadata.selectedYear"
                                        density="compact"
                                        :label="$t('custom-indicator.select-labels.year')"
                                        variant="outlined"
                                        hide-details
                                        :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                                    ></v-select>
                                </div>
                            </v-col>
                        </template>
                    </v-list-item>
                </template>
            </v-virtual-scroll>
        </div>
       <v-divider class=" mt-1 mb-0"></v-divider>
        <v-container fluid >
            <v-textarea
                style="width: 100%; margin-top: 0;"
                :label="$t('custom-indicator.formula')"
                :model-value="formula? formula: ''"
                rows="2"
                id="formulatext"
                hide-details
            >
           
        </v-textarea>
        </v-container>
        <div style="float:left; margin-left: 15px; margin-bottom:10px; margin-top:10px">
            <v-btn 
                :disabled= "addedIndicator?.['indicator0'] ? false: true" 
                size="small" 
                color="green" 
                @click="calculate()"
                prepend-icon="mdi-calculator-variant"
            >
            {{$t('custom-indicator.add-layer')}}
            </v-btn>
        </div>
        
    </div>
</template>

<script setup>
import { ref, computed, defineEmits, onMounted } from 'vue'
import {getIndicatorData, classification, getTableMetadata} from "../services/backend.calls";
import { useAlertStore } from '@/stores/alert'
import { useDatasetSearchStore } from '../stores/datasetSearch'
import { storeToRefs } from 'pinia'

const alertStore = useAlertStore()
let {  activatedDatasetSearch } = storeToRefs(useDatasetSearchStore())

const emit = defineEmits(["addDeckglLayer", "updateDeckglLayer", "customMapStylization", "addCustomLayer"]);

let classification_result = ref(null)
let hoveredItem = ref(null)
let layerSearchText= ref("")
let selectedGeometryTypee = ref(null)
let selectedDatasetSource = ref(null)
let selectedYearIndicatorFilter = ref(null)
let selectedDatasetType = ref(null)
let tableMetadata = ref([])


onMounted(async()=>{
   
    tableMetadataRequest()
})
const tableMetadataRequest = async () => {
  const response = await getTableMetadata()
  
  tableMetadata.value = response
  tableMetadata.value.sort((a, b) =>
        a.dct_title.localeCompare(b.dct_title, 'de', { sensitivity: 'base' })
    );
  // --- filter based on activatedDatasetSearch ---
}

const getYear = (dateString) => {
  if (!dateString) return '';
  return new Date(dateString).getFullYear();
};
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
            ? item.dcatde_politicalgeocodingleveluri === selectedGeometryTypee.value
            : true;

        const matchesDatasetYear = selectedYearIndicatorFilter.value && selectedYearIndicatorFilter.value !== 'All'
            ? new Date(item.dct_temporal_enddate).getFullYear() >= parseInt(selectedYearIndicatorFilter.value)
            : true;
        return matchesSearchText && matchesDatasetType &&  preFilterDatasetType && matchesDatasetSource && matchesGeometryType && matchesDatasetYear;
    });
});
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
const filteredMeta = computed(() => {
  if (!tableMetadata.value) return []

  const typeFilter = activatedDatasetSearch.value?.toLowerCase()

  return tableMetadata.value.filter(item => {
    if (!item.dct_type) return false
    const itemType = item.dct_type.trim().toLowerCase()

    if (typeFilter === 'indicator') return itemType === 'indikator'
    if (typeFilter === 'geodata') return itemType === 'raster'
    return true
  })
})
// reactive dataSources with counts
const dataSources = computed(() => {
  const counts = filteredMeta.value.reduce((acc, item) => {
    const key = item.dct_catalog_publisher
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return [
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      label: `${value} (${count})`
    }))
    .sort((a, b) =>
      a.value.localeCompare(b.value, 'de', { sensitivity: 'base' }) // handles German chars
    ),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})

// reactive geometryTypes with counts
const geometryTypes = computed(() => {
  const counts = filteredMeta.value.reduce((acc, item) => {
    const key = item.dcatde_politicalgeocodingleveluri
    acc[key] = (acc[key] || 0) + 1
    return acc
  }, {})

  return [
    ...Object.entries(counts).map(([value, count]) => ({
      value,
      count,
      label: `${value} (${count})`
    })),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})


// reactive availableYears with counts
const availableYearsForIndicatorFilter = computed(() => {
  const years = filteredMeta.value.map(item => new Date(item.dct_temporal_enddate).getFullYear())
  const uniqueYears = Array.from(new Set(years)).sort((a,b)=>a-b)

  return [
    ...uniqueYears.map(year => {
      const count = years.filter(y => y >= year).length
      return { value: year, count, label: `${year} (${count})` }
    }),
    { value: 'All', count: filteredMeta.value.length, label: `All (${filteredMeta.value.length})` }
  ]
})




let addedIndicator = ref({})


const handleItemClick = async (item) => {
    const existingKey = Object.keys(addedIndicator.value).find(
        key => addedIndicator.value[key].selectedIndicator === item.dct_title &&
               addedIndicator.value[key].granularity === item.dcatde_politicalgeocodingleveluri
    );
     const alreadyAdded = Object.values(addedIndicator.value).some(
        innerItem => innerItem.selectedIndicator === item.dct_title &&
                    innerItem.granularity === item.dcatde_politicalgeocodingleveluri
    );
    if (alreadyAdded==true ) {
      delete addedIndicator.value[existingKey];
    }
    
    else {
        addIndicatorRow()
        item.selectedIndicator = item.dct_title
        item.granularity = item.dcatde_politicalgeocodingleveluri
        const indocatorData =  await getIndicatorData(item.dct_title, item.dcatde_politicalgeocodingleveluri)
        item.indicatorArray = indocatorData.indicator
        item.availailableYears = indocatorData.availabeYears[0][0]
        item.selectedYear = item.availailableYears[item.availailableYears.length - 1];
        const Index = Object.keys(addedIndicator.value).length;
        addedIndicator.value[`indicator${Index-1}`] = {
            selectedIndicator: item.selectedIndicator,
            indicatorArray: item.indicatorArray,
            availailableYears: item.availailableYears,
            selectedYear: item.selectedYear,
            granularity: item.granularity,
            selectedOperator: null
        };
    }
    
}

const addIndicatorRow = () => {
    const newIndex = Object.keys(addedIndicator.value).length;
    
    addedIndicator.value[`indicator${newIndex}`] = {
        selectedIndicator: null,
        indicatorArray: null,
        availailableYears: null,
        selectedYear: null,
        granularity: null,
        selectedOperator: null
    };
    
}


const calculate = () => {
    let filteredarrayByYear = [];
    for (let i = 0; i < Object.keys(addedIndicator.value).length; i++){
        let obj = {};
        obj[`indicator${i}`] = [];
        filteredarrayByYear.push(obj);
    }

    for (let i=0; i<Object.keys(addedIndicator.value).length; i++){
        addedIndicator.value[`indicator${i}`]?.indicatorArray?.forEach(element => {
            element.forEach(array => {
                filteredarrayByYear[i][`indicator${i}`].push(
                    ...array.filter(
                        item => item.zeitbezug === addedIndicator.value[`indicator${i}`].selectedYear
                    )
                );
            });
        });
    }
   
    let formula = document.getElementById("formulatext").value
    function normalizeKennziffer(kennziffer) {
        return kennziffer.trim();
    }

    const aggregatedMap = new Map();

    filteredarrayByYear.forEach((indicatorObj, index) => {
        const indicatorKey = Object.keys(indicatorObj)[0];
        const indicatorArray = indicatorObj[indicatorKey];
        const wertColumn = `wert${index + 1}`;

        indicatorArray.forEach(item => {
            const normalizedKennziffer = normalizeKennziffer(item.kennziffer);
            if (!aggregatedMap.has(normalizedKennziffer)) {
                aggregatedMap.set(normalizedKennziffer, { kennziffer: normalizedKennziffer });
            }
            const currentEntry = aggregatedMap.get(normalizedKennziffer);
            currentEntry[wertColumn] = item.wert;
        });
    });

    const finalArray = Array.from(aggregatedMap.values());

    try {
        for (let i=0; i<Object.keys(addedIndicator.value).length; i++){
            let name = addedIndicator.value[`indicator${i}`].selectedIndicator;
            formula = formula.replace(name, `filteredarrayByYear[${i}].indicator${i}[i].wert`);
        }
        const dynamicFormula = formula
            .replace(/filteredarrayByYear\[(\d+)\]\.indicator(\d+)\[i\]\.wert/g, (match, p1, p2) => `entry.wert${parseInt(p2) + 1} || 0`);
    
        // Create a lean key-value dictionary of calculations
        const calculationArray = [];

        finalArray.forEach(entry => {
            try {
                const calculateVal = new Function('entry', `return ${dynamicFormula};`);
                const val = calculateVal(entry);

                // Filter invalid calculations out immediately
                if (val !== null && val !== undefined && val !== Infinity && !isNaN(val)) {
                    calculationArray.push({
                        kennziffer: entry.kennziffer,
                        calculatedWert: val
                    });
                }
            } catch (error) {
                console.error("Error evaluating formula for key:", entry.kennziffer, error);
            }
        });
        // Pass the clean array to the classification function
        classifyAndStylize(calculationArray);
        
        return calculationArray;
        
    } catch(error){
        alertStore.setAlert({
            text: 'Error while evaluating the formula: ' + error,
            timeout: 2000
        });
    }
}

const formula = computed(() => {
  let text = '';
  for (const key in addedIndicator.value) {
    const indicator = addedIndicator.value[key];
    if (indicator.selectedIndicator) {
      text += '( '+indicator.selectedIndicator+' )' + ( ` ${indicator.selectedOperator?indicator.selectedOperator:''} `) ;
    }
  }
  return text;
});

const classifyAndStylize = async (filteredArray) => {
    
    // Extract just the numerical werts from the array structure for the breaks calculation
    const AttributeArray = filteredArray.map(item => item.calculatedWert);

    if (AttributeArray.length === 0) {
        console.warn("No valid calculation values found to classify.");
        return;
    }

    // Fetch the classification intervals
    const response = await classification(AttributeArray, 'NaturalBreaks');
    classification_result.value = response.intervals_5_classes;
    
    if(classification_result.value.warnings){
        alertStore.setAlert({
            text: classification_result.value.warnings,
            timeout: 2000
        });
    }
    // 1. Convert the object values into a clean array
    const indicatorsList = Object.values(addedIndicator.value);

    // 2. Extract the granularity of the very first indicator as a baseline reference
    const firstGranularity = indicatorsList[0]?.granularity;

    // 3. Check if every single added indicator matches that baseline
    const allHaveSameGranularity = indicatorsList.every(
        item => item.granularity === firstGranularity
    );

    // 4. Assign the result: use the shared granularity if they match, otherwise handle the mismatch
    const sharedGranularity = allHaveSameGranularity ? firstGranularity : 'Mixed / Mismatch';

    // Optional: Warn your user via the alert store if they are trying to compute mismatched levels
    if (!allHaveSameGranularity) {
        alertStore.setAlert({
            text: 'Warning: Selected indicators have different geographic granularities!',
            timeout: 3000
        });
    }

    // 5. Emit everything to your map layer, including the validated granularity string
    emit(
        "addCustomLayer", 
        filteredArray, 
        classification_result.value, 
        ref(document.getElementById("formulatext").value),
        sharedGranularity // Pass granularity as the 4th argument
    );
    addedIndicator.value = {}

}
// Add granularity as the 4th parameter
const getIcon = (layerName, index, geomType, granularity) => {
    // Generate the matching unique validation key
    const compoundKey = `${layerName}_${granularity}`;
    
    const alreadyAdded = addedIndicatorTitlesSet.value 
        ? addedIndicatorTitlesSet.value.has(compoundKey) 
        : false;

    if (alreadyAdded && hoveredItem.value === index) {
        return 'icons/minus.svg';
    }
    if (alreadyAdded) {
        return 'icons/check.svg';
    }
    if (hoveredItem.value === index) {
        return 'icons/plus.svg';
    }
    
    if (geomType === 'Point') return 'icons/point-blue.svg';
    if (['MultiLineString', 'LineString', 'Line'].includes(geomType)) return 'icons/line-blue.svg';
    if (['MultiPolygon', 'Polygon', 'Geometry'].includes(geomType)) return 'icons/polygon-blue.svg';
    
    return 'icons/raster.svg';
};
const addedIndicatorTitlesSet = computed(() => {
  if (!addedIndicator.value) return new Set();
  return new Set(
    Object.values(addedIndicator.value)
      .filter(item => item && item.selectedIndicator && item.granularity)
      // Create a unique compound key: "Title_Granularity"
      .map(item => `${item.selectedIndicator}_${item.granularity}`)
  );
});

/*const mapLegend = () => {
    const classIntervalsAndColorHexagon = []
    for (let i = 0; i < classification_result.value.intervals.length; i++) {
        const intervalName = `interval${i + 1}`;
        const colorName = `color${i + 1}`;
        const intervalValue = classification_result.value.intervals[i].toFixed(2);
        const colorValue = getColorBasedOnIndex(i);
        const intervalAndColor = {
            [intervalName]: intervalValue,
            [colorName]: colorValue,
        };

        classIntervalsAndColorHexagon.push(intervalAndColor);
    }

    mapLegendStore.assignThirdClassificationValues({
        thirdMinMax: classification_result.value.minMax,
        classIntervalsAndColorHexagon,
    });
    function getColorBasedOnIndex(index) {
       
       const colors = props.selectedColorPalette
       return colors[index % colors.length];
    }
}*/

</script>

<style scoped>

</style>