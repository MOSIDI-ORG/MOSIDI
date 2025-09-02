<template >
    <div v-show="selectedFeature">

    <v-select
            :items="chartType"
            v-model="selectedChartType"
            @update:modelValue="toggleChartType()"
            density="compact"
            label="chart type"
            style="position: absolute; right: 10px; top: 10px; z-index: 999;"
        ></v-select>
    <canvas  class="chart-ui" id="indicatorChart" width="400" height="400" ></canvas>
</div>
</template>
<script setup>
import { watch, onUnmounted, defineProps, ref } from "vue"
import { storeToRefs } from 'pinia'
import Chart from 'chart.js/auto';
import { onMounted } from "vue";
import { useChartStore } from '../stores/chart'
import { generateColors } from '../utils/generateColors';
import { useAlertStore } from '@/stores/alert'

const alertStore = useAlertStore()

let chartInstance = null;
const props = defineProps(['indicatorArray', 'secondIndicatorArray', 'selectedIndicator', 'selectedSecondIndicator'])
let { selectedFeature } = storeToRefs(useChartStore())
let chartType = ref(['line', 'bar'])
let selectedChartType = ref('line')
let indicator = ref(null)
let indicatorName = ref(null)


onMounted(async () =>{
    
    renderChart()
       
})
const renderChart = () =>{
   
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }   
    const canvas = document.getElementById('indicatorChart')

    if (canvas) {
        const ctx = canvas.getContext('2d');
        chartInstance = new Chart(ctx, {
            type: 'line',
            data: {
                labels: [
                   
                ],
                datasets: [{
                    label: 'Wert: ',
                    data: [],
                    backgroundColor: [
                       
                    ],
                    hoverOffset: 4
                }]
            },
            options: {
                responsive: false,
                plugins: {
                    title: {
                        display: true,
                        text: ""
                    }
                },
            }
        });
    }
    else {
        console.error('Canvas element not found.');
    }
}


watch(() => selectedFeature.value, () => {
    chartInstance.config.type=selectedChartType.value
    
    if (selectedFeature.value.layerId=='kommunales_gebiet_dashboard') {
        indicator.value = props.indicatorArray
        indicatorName.value = props.selectedIndicator
    }
    else {
        indicator.value =  props.secondIndicatorArray
        indicatorName.value = props.selectedSecondIndicator
    }
   const filteredArray = indicator.value[0][0]
    .filter(item => item.kennziffer === selectedFeature.value.featureId)
    .sort((a, b) => a.zeitbezug - b.zeitbezug);

    if (filteredArray.length>0){
        const labels = filteredArray?.map(item => item.zeitbezug);
        const dataValues = filteredArray?.map(item => item.wert);

        const colors = generateColors(labels.length, 1);
        
        const chartData = {
            labels: labels,
            datasets: [{
                label: 'value: ',
                data: dataValues,
                backgroundColor: colors,
                hoverOffset: 2
            }]
        };
        if (chartInstance) {
            chartInstance.data = chartData;

            chartInstance.options.plugins.title = {
                display: true,
                text: indicatorName.value + ' (' +selectedFeature.value.featureName + ')',
                position: 'top'
            }
            toggleChartType()
            //chartInstance.update();
        }
    }
    else {
        
        alertStore.setAlert({
            text: 'There is no information for the selected indicator',
            timeout: 2000
        })
    }
    

    
    
  
});

const toggleChartType = () => {
    
   
    if (selectedChartType.value=='bar'){
        chartInstance.config.type = 'bar'
        chartInstance.options = {
            responsive: false,
            scales: {
                x: {
                    title: {
                        display: true,
                        text: 'Year',
                    }
                },
                y: {
                    beginAtZero: true
                }
            },
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: indicatorName.value + ' (' +selectedFeature.value.featureName + ')',
                    position: 'top'
                }
            }
        }
        const backgroundColor = generateColors(chartInstance.data.labels.length, 0.6);
        const borderColor = generateColors(chartInstance.data.labels.length, 1);
        chartInstance.data.datasets[0].backgroundColor=backgroundColor
        chartInstance.data.datasets[0].borderColor=borderColor
        chartInstance.data.datasets[0].borderWidth = 2
        chartInstance.data.datasets[0].borderRadius =2
        chartInstance.update();

    }
    else if (selectedChartType.value=='line'){
        chartInstance.config.type = 'line'
        chartInstance.options = {
            responsive: false,
            plugins: {
                legend: {
                    display: false
                },
                title: {
                    display: true,
                    text: indicatorName.value + ' (' +selectedFeature.value.featureName + ')',
                    position: 'top'
                }
            },
            scales: {
                x: {
                    type: 'category', 
                    title: {
                        display: true,
                        text: 'Year',
                    }
                },
                y: {
                    beginAtZero: true
                }
            }
        }
        const colors = generateColors(chartInstance.data.labels.length, 1);
        chartInstance.data.datasets[0].borderColor=colors
        chartInstance.update();
        
    }



}



onUnmounted(() => {
    if (chartInstance) {
        chartInstance.destroy();
        chartInstance = null;
    }
    
});


</script>
    
<style scoped>

.chart-ui {
    position: absolute;
    top: 10px;
    right: 10px;
    bottom: 100px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    border-radius: 8px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);    
}


</style>