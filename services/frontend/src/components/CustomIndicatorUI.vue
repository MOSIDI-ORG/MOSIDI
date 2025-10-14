<template>
    <div style="overflow-x: hidden;" >
        <div style="background-color:transparent; overflow-y: scroll; max-height: 300px;">
            
            <v-list lines="two" style="background-color:transparent; height: 81%;" class="ml-1 mr-1">           
                <v-list-item
                    v-for="(metadata, index) in indicatorNames"
                    :key="index"
                    style="border-radius: 5px;"
                    @click=handleItemClick(metadata)
                    @mouseover="hoveredItem = index"
                    @mouseleave="hoveredItem = null"
                >
                    <v-list-item-title class="text-wrap" v-text="metadata.dct_title"></v-list-item-title>
                    <v-list-item-subtitle class="text-wrap" v-text="metadata.dct_catalog_publisher"></v-list-item-subtitle>
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
                    <template v-slot:append>
                        <v-col
                        style="float: right;"
                        >
                    
                        <div 
                            @click.stop 
                            @mousedown.stop 
                            @mouseup.stop 
                            @touchstart.stop 
                            @touchend.stop
                            v-if="addedIndicator!==null"
                            >
                           
                           
                        <v-select
                            v-show="Object.values(addedIndicator).some(innerItem => innerItem.selectedIndicator === metadata.dct_title)"
                            :items="metadata.availailableYears"
                            v-model="metadata.selectedYear"
                            density="compact"
                            :label="$t('custom-indicator.select-labels.year')"
                            variant="outlined"
                            hide-details
                            :menu-props="{ 'max-height': '200', 'max-width': '300'}"
                           
                            
                        >
                        </v-select>
                        </div>
                        </v-col>
                    </template>
                    
                </v-list-item>
                
        
            </v-list>
            
           
           
            
                

        </div>
       <v-divider></v-divider>
        <v-container fluid >
            <v-textarea
                style="width: 100%;"
                :label="$t('custom-indicator.formula')"
                :model-value="formula? formula: ''"
                rows="2"
                id="formulatext"
            >
           
        </v-textarea>
        </v-container>
        <div style="float:left; margin-left: 15px; margin-bottom:15px">
            <v-btn 
                :disabled= "addedIndicator.indicator0?.indicatorArray!== null ? false: true" 
                size="small" 
                color="green" 
                @click="calculate()"
            >
            {{$t('custom-indicator.calculate')}}
            </v-btn>
        </div>
        
    </div>
</template>

<script setup>
import { defineProps, ref, computed, onMounted, defineEmits } from 'vue'
import {getIndicatorData, getGeojsonDataFromDB, classification} from "../services/backend.calls";
import { useAlertStore } from '@/stores/alert'

const alertStore = useAlertStore()
const emit = defineEmits(["addDeckglLayer", "updateDeckglLayer", "customMapStylization", "addCustomLayer"]);

let kommunales_gebiet_geojson = ref(null)
let classification_result = ref(null)
let hoveredItem = ref(null)


onMounted(()=>{
   
    getKommunalesGebietCentroidGeojson()

})
    


const getKommunalesGebietCentroidGeojson = async () => {
    if(kommunales_gebiet_geojson.value == null ){
        const data =  await getGeojsonDataFromDB("Kommunale Gebiete Deutschland Mittelpunkt")
        kommunales_gebiet_geojson.value = data
    }
    
}
const props = defineProps(['indicatorNames', 'selectedColorPalette', "isMinimized"])


let addedIndicator = ref({})


const handleItemClick = async (item) => {
    const existingKey = Object.keys(addedIndicator.value).find(
        key => addedIndicator.value[key].selectedIndicator === item.dct_title
    );
     const alreadyAdded = Object.values(addedIndicator.value).some(
        innerItem => innerItem.selectedIndicator === item.dct_title
    );
    
    if (alreadyAdded==true ) {
      delete addedIndicator.value[existingKey];
    }
    
    else {
        addIndicatorRow()
        item.selectedIndicator = item.dct_title
        const indocatorData =  await getIndicatorData(item.dct_title)
        item.indicatorArray = indocatorData.indicator
        item.availailableYears = indocatorData.availabeYears[0][0]
        item.selectedYear = item.availailableYears[item.availailableYears.length - 1];
        const Index = Object.keys(addedIndicator.value).length;
        addedIndicator.value[`indicator${Index-1}`] = {
            selectedIndicator: item.selectedIndicator,
            indicatorArray: item.indicatorArray,
            availailableYears: item.availailableYears,
            selectedYear: item.selectedYear,
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
        selectedOperator: null
    };
    
}


const calculate = () => {
    
   console.log(addedIndicator.value, "addedIndicator.value")
    let filteredarrayByYear = []
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
    // Function to normalize kennziffer
    function normalizeKennziffer(kennziffer) {
        return kennziffer.trim(); // Ensure consistent formatting
    }

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
      console.log(text, "text")
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
    classification_result.value = response.intervals_5_classes
    console.log(props)
    /*const stylization = (x) => {
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
    }*/
    
    if(classification_result.value.warnings){
        alertStore.setAlert({
            text: classification_result.value.warnings,
            timeout: 2000
        })
    }
    
    //mapLegend()
    emit("addCustomLayer", filteredArray, classification_result.value, ref(document.getElementById("formulatext").value))
    
}
const getIcon = (layerName, index, geomType)=> {
    const alreadyAdded = Object.values(addedIndicator.value).some(
    item => item.selectedIndicator === layerName
  );

    if (alreadyAdded && hoveredItem.value === index) {
        return 'icons/minus.svg';
    }

    if (alreadyAdded) {
        return 'icons/check.svg';
    }

    if (hoveredItem.value === index) {
        return 'icons/plus.svg';
    }
   
    else {
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