<template>
    <div v-show="selectedFeature && Object.keys(props.indicatorArray).length">
       <v-btn 
        density="compact" 
        icon="mdi-close" 
        style="position: absolute; top: 10px; right: 10px; z-index: 1000; background-color: transparent;"
        @click="closeChart()"
        ></v-btn>
        <svg class="chart-ui" id="indicatorChart" width="350" height="350"></svg>
    </div>
</template>

<script setup>
import { watch, onUnmounted, defineProps, ref } from "vue";
import { storeToRefs } from 'pinia';
import * as d3 from 'd3';
import { useChartStore } from '../stores/chart';
import { useAlertStore } from '@/stores/alert';

const alertStore = useAlertStore();
const props = defineProps(['indicatorArray', 'secondIndicatorArray', 'selectedIndicator', 'selectedSecondIndicator']);
let { selectedFeature } = storeToRefs(useChartStore());
let indicator = ref(null);
let indicatorName = ref(null);

const renderChart = (labels, dataValues) => {
    const svg = d3.select('#indicatorChart');
    svg.selectAll('*').remove();
    const margin = { top: 30, right: 20, bottom: 40, left: 50 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(labels).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(dataValues)]).range([height, 0]);

    // Grid lines for X axis
g.append('g')
    .attr('class', 'grid')
    .attr('transform', `translate(0,${height})`)
    .call(d3.axisBottom(x).tickSize(-height).tickFormat(''))
    .selectAll('line')
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 0.5);

// Grid lines for Y axis
g.append('g')
    .attr('class', 'grid')
    .call(d3.axisLeft(y).tickSize(-width).tickFormat(''))
    .selectAll('line')
    .attr('stroke', 'lightgray')
    .attr('stroke-opacity', 0.5);
    
    // X Axis
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(d3.axisBottom(x));
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom-10 )
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text('Jahre');
    g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(indicatorName.value + ' (' + selectedFeature.value.featureName + ")");
    // Y Axis
    g.append('g')
        .call(d3.axisLeft(y));

    const line = d3.line()
        .x((d, i) => x(labels[i]))
        .y(d => y(d))
        .curve(d3.curveMonotoneX); // Smooth line

    // Draw line
    g.append('path')
        .datum(dataValues)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);

    // Add circles at data points
    g.selectAll('.circle')
        .data(dataValues)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => x(labels[i]))
        .attr('cy', d => y(d))
        .attr('r', 4)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1);
    // Append labels for each data point with percentage change
    g.selectAll('.label')
        .data(dataValues)
        .enter().append('text')
        .attr('x', (d, i) => x(labels[i]))
        .attr('y', d => y(d) - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', (d, i) => {
            if (i === 0) return 'black'; // No change for the first point
            const prev = dataValues[i - 1];
            return d > prev ? 'green' : 'red';
        })
    .text((d, i) => {
        if (i === 0) return ''; // No change for the first point
        const prev = dataValues[i - 1];
        const change = ((d - prev) / prev) * 100;
        return `${change.toFixed(1)}%`;
    });
};

const closeChart = () => {
    selectedFeature.value = null;
   
    d3.select('#indicatorChart').selectAll('*').remove();
};


watch(() => selectedFeature.value, () => {
    let layerId = selectedFeature.value?.layerId;
    if(layerId){
        let selectedIndicatorName = layerId?.replace('kommunales_gebiet_dashboard', '');
        if (selectedFeature.value?.layerId?.includes('kommunales_gebiet_dashboard')) {
            indicator.value = props.indicatorArray[selectedIndicatorName];
            indicatorName.value = selectedIndicatorName;
        } else {
            indicator.value = props.secondIndicatorArray;
            indicatorName.value = props.selectedSecondIndicator;
        }

        const filteredArray = indicator.value[0][0]
            .filter(item => item.kennziffer === selectedFeature.value?.featureId)
            .sort((a, b) => a.zeitbezug - b.zeitbezug);

        if (filteredArray.length > 0) {
            const labels = filteredArray?.map(item => item.zeitbezug);
            const dataValues = filteredArray?.map(item => item.wert);
            renderChart(labels, dataValues, selectedIndicatorName);
        } else {
            alertStore.setAlert({
                text: 'There is no information for the selected indicator',
                timeout: 2000
            });
        }
    }
    
});

onUnmounted(() => {
    d3.select('#indicatorChart').selectAll('*').remove();
});
</script>

<style scoped>
.chart-ui {
    position: absolute;
    top: 10px;
    right: 10px;
    bottom: 100px;
    z-index: 10;
    background-color: rgba(255, 255, 255, 0.6);
    border-radius: 8px;
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);
}
.grid line {
    stroke: rgb(215, 16, 16);
    stroke-opacity: 0.4;
    shape-rendering: crispEdges;
}

.grid path {
    stroke-width: 0;
}
</style>
