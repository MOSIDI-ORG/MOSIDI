<template>
    
    <v-card class="mx-auto time-slider-ui" max-width="600" elevation="0" v-if="visible">
      <v-slider
        :min="0"
        :max="max"
        :ticks="time"
        show-ticks="always"
        step="1"
        tick-size="4"
        v-model="selectedTime"
        :thumb-size="12"
        color="blue"
        track-color="grey"
        thumb-color="black"
      >
      <template v-slot:tick-label="{ tick, index }">
       <span 
          v-if="index % (indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator?.length > 25 ? 5 : indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset]?.availailableYearsForSelectedIndicator?.length > 15 ? 2 : 1) === 0" 
          class="tick-text"
        >
       
         {{ typeof tick === 'object' ? tick.label : tick }}
        </span>
      </template>
   
        <template v-slot:append>
          <v-btn
            :icon="isPlaying ? 'mdi-play' : 'mdi-pause'"
            size="small"
            variant="text"
            @click="increment"
          ></v-btn>
        </template>

        
    </v-slider>
    </v-card>
  </template>
  
<script setup>
import { ref, onUnmounted, defineEmits } from "vue";
import { storeToRefs } from 'pinia'
import { useTimeSliderStore } from '../stores/timeSlider'
import { useIndicatorStore } from '../stores/indicator'
import { useDatasetSearchStore } from '../stores/datasetSearch'
const timeSliderStore = useTimeSliderStore()

const indicatorStore = useIndicatorStore()
const datasetSearchStore = useDatasetSearchStore()

let { time, isPlaying, visible, max } = storeToRefs(useTimeSliderStore())
let { selectedColorPalette } = storeToRefs(useIndicatorStore())

let intervalId = null;
let selectedTime = ref(0); 
let selectedYear = ref(null)
let matchExpression = [];
const emit = defineEmits(["performTimeSlider"]);


const increment = () => {
    isPlaying.value = !isPlaying.value;
    
    if (isPlaying.value ==false) {
        applySliderValueOnMapLayer(time.value[selectedTime.value]) // applies the process for the first time index
        intervalId = setInterval(() => {
            if (selectedTime.value < max.value) {
                applySliderValueOnMapLayer(time.value[selectedTime.value +1]) // applies for the rest of the available times
                selectedTime.value++;
                
            } else {
                clearInterval(intervalId); 
                isPlaying.value = true;
                selectedTime.value=0

                timeSliderStore.deactivateSlider({
                    vis: false
                });
            }
        }, 2000); 
    } else {
        
        clearInterval(intervalId);
        
       
    }
}
const applySliderValueOnMapLayer = (time)=> {
    selectedYear.value = []
    matchExpression = null
    indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset].forEach(innerArray => {
        innerArray.forEach(subArray => {
        selectedYear.value.push(...subArray.filter(item => item.zeitbezug === time));
        });
    });
    matchExpression = ['match', ['get', 'nationalco']];
    let classification_results= indicatorStore.indicatorArray[datasetSearchStore?.selectedDataset].classification_result
    // conditions for each communale gebiete code
    for (const row of selectedYear.value) {
        const value = row['wert'];
        let color;

        if (value <= classification_results.intervals[0]) {
            //color = '#feebe2'; // Class 1
            color = selectedColorPalette.value[0]
            //color = colorbrewer.default.selectedColorPalette.value.title
        } else if (value <= classification_results.intervals[1]) {
            //color = '#fbb4b9'; // Class 2
            color = selectedColorPalette.value[1]
        } else if (value <= classification_results.intervals[2]) {
            //color = '#f768a1'; // Class 3
            color = selectedColorPalette.value[2]
        } else if (value <= classification_results.intervals[3]) {
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
    emit("performTimeSlider",{'layer':"kommunales_gebiet_dashboard"+datasetSearchStore.selectedDataset, 'paint_property':'fill-color', 'expression':matchExpression})
}
onUnmounted(() => {
    clearInterval(intervalId);
});

</script>
  
  <style scoped>
  .time-slider-ui {
    position: absolute; 
    bottom: 10px;
    left: 50%;
    transform: translateX(-50%);
    height:30;
    width: 550px;
    z-index: 10; /* Higher than the map to prevent click-through */
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);    
    border: 1px solid rgba(0, 0, 0, 0.2);
    border-radius: 8px;
    padding-top: 10px;
    padding-left: 10px;
}

.v-slider.v-input--horizontal {
    font-size: 0.7rem;
}
  </style>
  