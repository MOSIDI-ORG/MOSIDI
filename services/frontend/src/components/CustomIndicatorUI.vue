<template>
    <div style="overflow-x: hidden;" >
        <v-row dense  v-for="(item, i) in addedIndicator" :key="i">
            <v-col
                cols="12"
                sm="6"
               
            >
                <v-autocomplete
                    :items="indicatorNames"
                    v-model="item.selectedIndicator"
                    item-value="indikator"
                    item-title="indikator"
                    density="compact"
                    label="Indikator auswählen"
                    variant="solo"
                    :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                    style="margin-left: 15px; margin-top:15px"
                >
                <template v-slot:item="{ props, item }">

                <v-list-item
                    @click=handleItemClick(item)
                    v-bind="props"
                    :title= "item.raw.indikator"
                    prepend-avatar= 'polygon.png'
                >
                    <v-list-item-subtitle >
                        {{ item.raw.source }} -  {{ item.raw.granularity }}
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
                    v-show="item.indicatorArray"
                    :items="item.availailableYears"
                    v-model="item.selectedYear"
                    density="compact"
                    label="Jahr auswählen"
                    variant="solo"
                    :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                    style=" margin-left: 0px; margin-top:15px; "
                >
                </v-select>
            </v-col>
            <v-col
                cols="12"
                sm="3"
            >
                <v-select
                    v-show="item.indicatorArray"
                    :items="['+', '-', '/', '*']"
                    v-model="item.selectedOperator"
                    density="compact"
                    label="operation"
                    variant="solo"
                    :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                    style=" margin-left: 0px; margin-top:15px;margin-right: 15px;"
                >
                </v-select>
            </v-col>
        </v-row>
        
        <div 
            style="float:left; margin-left: 15px; margin-bottom:15px" 
            v-if="addedIndicator[`indicator${Object.keys(addedIndicator)?.length-1}`]?.selectedIndicator!==null"
        >
           

            <v-icon
                @click="addIndicatorRow()"
                color="green"
            >
                mdi-plus-circle-outline
            </v-icon>
            <span class="ml-2">Indikator entfernen</span>


        </div>
        <v-container fluid >
            <v-textarea
            style="width: 100%;"
            label="Formula"
            :model-value="formula? formula: ''"
            rows="2"
            id="formulatext"
            ></v-textarea>
            
        </v-container>
        <div style="float:left; margin-left: 15px; margin-bottom:15px">
            <v-btn 
                :disabled= "addedIndicator.indicator0.indicatorArray!== null ? false: true" 
                size="small" 
                color="green" 
                @click="calculate()"
            >
                calculate
            </v-btn>
        </div>
        
    </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, defineEmits } from 'vue'
import {getIndicatorData, getGeojsonDataFromDB, classification} from "../services/backend.calls";
import { useAlertStore } from '@/stores/alert'
import { hexToRgb } from '@/utils/generateColors';
import { useMapLegendStore } from '@/stores/mapLegend'

const alertStore = useAlertStore()
const mapLegendStore = useMapLegendStore();
const emit = defineEmits(["addDeckglLayer", "updateDeckglLayer"]);

let kommunales_gebiet_geojson = ref(null)
let hexagonLayerAdded = ref(false)
let classification_result = ref(null)



onMounted(()=>{
   
    getKommunalesGebietCentroidGeojson()

})
    


const getKommunalesGebietCentroidGeojson = async () => {
    if(kommunales_gebiet_geojson.value == null ){
        const data =  await getGeojsonDataFromDB("Kommunale Gebiete Deutschland Mittelpunkt")
        kommunales_gebiet_geojson.value = data
    }
    
}
const props = defineProps(['indicatorNames', 'selectedColorPalette'])


let addedIndicator = ref({
    indicator0: {
        selectedIndicator: null,
        indicatorArray: null,
        availailableYears: null,
        selectedYear: null,
        selectedOperator: null
    }
})


const handleItemClick = async (item) => {
    item.selectedIndicator = item.raw.indikator
    const indocatorData =  await getIndicatorData(item.raw.indikator)
    item.indicatorArray = indocatorData.indicator
    item.availailableYears = indocatorData.availabeYears[0][0]
    //[...new Set(item.indicatorArray[0][0].map(item => item["zeitbezug"]))].sort();
    item.selectedYear = item.availailableYears[item.availailableYears.length - 1];
    //item.selectedOperator = '+' //default operator
    const Index = Object.keys(addedIndicator.value).length;
    addedIndicator.value[`indicator${Index-1}`] = {
        selectedIndicator: item.selectedIndicator,
        indicatorArray: item.indicatorArray,
        availailableYears: item.availailableYears,
        selectedYear: item.selectedYear,
        selectedOperator: null
    };
}

const addIndicatorRow = () => {
    const newIndex = Object.keys(addedIndicator.value).length;
    
    addedIndicator.value[`indicator${newIndex}`] = {
        selectedIndicator: null,
        indicatorArray: null,
        availailableYears: null,
        selectedYear: null,
        selectedOperator: null
    };
    
}


const calculate = () => {
    
   
    let filteredarrayByYear = []
    for (let i = 0; i < Object.keys(addedIndicator.value).length; i++){
        let obj = {};
        obj[`indicator${i}`] = [];
        filteredarrayByYear.push(obj);
    }

    for (let i=0; i<Object.keys(addedIndicator.value).length; i++){
        addedIndicator.value[`indicator${i}`].indicatorArray.forEach(element => {
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
    // Function to normalize kennziffer
    function normalizeKennziffer(kennziffer) {
        return kennziffer.trim(); // Ensure consistent formatting
    }

    // Create a map to store aggregated data
    const aggregatedMap = new Map();

    // Process each indicator array
    filteredarrayByYear.forEach((indicatorObj, index) => {
        // Get the indicator array (e.g., indicator0, indicator1, etc.)
        const indicatorKey = Object.keys(indicatorObj)[0];
        const indicatorArray = indicatorObj[indicatorKey];
        
        // Determine the column name for this indicator's wert
        const wertColumn = `wert${index + 1}`;

        // Add values to the map
        indicatorArray.forEach(item => {
            const normalizedKennziffer = normalizeKennziffer(item.kennziffer);
            
            if (!aggregatedMap.has(normalizedKennziffer)) {
                aggregatedMap.set(normalizedKennziffer, { kennziffer: normalizedKennziffer });
            }
            
            const currentEntry = aggregatedMap.get(normalizedKennziffer);
            currentEntry[wertColumn] = item.wert;
        });
    });

    // Convert the map to an array of objects
    const finalArray = Array.from(aggregatedMap.values());


    try {
        for (let i=0; i<Object.keys(addedIndicator.value).length; i++){
            let name = addedIndicator.value[`indicator${i}`].selectedIndicator
            formula = formula.replace(name, `filteredarrayByYear[${i}].indicator${i}[i].wert`)
        }
        const dynamicFormula = formula
            .replace(/filteredarrayByYear\[(\d+)\]\.indicator(\d+)\[i\]\.wert/g, (match, p1, p2) => `entry.wert${parseInt(p2) + 1} || 0`);
    
        // Step 3: Evaluate the formula 
        const calculationArray = finalArray.map(entry => {
            try {
                // Use Function constructor to evaluate dynamic formula
                const calculate = new Function('entry', `return ${dynamicFormula};`);
                const calculatedWert = calculate(entry);

                return {
                    calculatedWert,
                    kennziffer: entry.kennziffer
                };
            } catch (error) {
                console.error("Error evaluating formula:", error);
                return {
                    calculatedWert: NaN,
                    kennziffer: entry.kennziffer
                };
            }
        });


        const geojsonLookup = new Map();
            kommunales_gebiet_geojson.value.features.forEach(item2 => {
                geojsonLookup.set(item2.properties.nationalco, item2);
        });

        calculationArray.forEach(item => {
            // Find the corresponding object in the second array based on the condition
            const correspondingObject = geojsonLookup.get(item.kennziffer);

            if (correspondingObject) {
                correspondingObject.properties.calculatedWert = item.calculatedWert;
         }
        });
       
        const filteredArray = calculationArray.filter(item => 
            item.calculatedWert !== null && 
            item.calculatedWert !== undefined && 
            item.calculatedWert !== Infinity && 
            !isNaN(item.calculatedWert)
        );
        
        classifyAndStylize (filteredArray)
        
    }
    catch(error){
        alertStore.setAlert({
            text: 'Error while evaluating the formula: ' + error,
            timeout: 2000
        })
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
    
    /*let filteredArray = array.filter(item => 
        item.calculatedWert !== null && 
        item.calculatedWert !== undefined && 
        item.calculatedWert !== Infinity && 
        !isNaN(item.calculatedWert)
    );*/
    

    const AttributeArray = filteredArray.map(item => item.calculatedWert);

    const response =  await classification(AttributeArray, 'NaturalBreaks')
    classification_result.value = response
    const stylization = (x) => {
        if (x <= classification_result.value.intervals[0]) {
            return hexToRgb(props.selectedColorPalette[0])
        } else if (x <= classification_result.value.intervals[1]) {
            return hexToRgb(props.selectedColorPalette[1])
        } else if (x <= classification_result.value.intervals[2]) {
            return hexToRgb(props.selectedColorPalette[2])
        } else if (x <= classification_result.value.intervals[3]) {
            return hexToRgb(props.selectedColorPalette[3])
        } else if (x>classification_result.value.intervals[3]){
            return hexToRgb(props.selectedColorPalette[4])
        }
        else {
            console.log(x)
        }
    }
    
    if(classification_result.value.warnings){
        alertStore.setAlert({
            text: classification_result.value.warnings,
            timeout: 2000
        })
    }
    if (hexagonLayerAdded.value==false){
        emit("addDeckglLayer", kommunales_gebiet_geojson.value,  stylization);
        hexagonLayerAdded.value =true
    }
    else {
        emit("updateDeckglLayer", kommunales_gebiet_geojson.value, stylization)
    }
    mapLegend()
    
}

const mapLegend = () => {
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
}

</script>

<style scoped>

</style>