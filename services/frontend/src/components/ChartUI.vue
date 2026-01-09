<template>
    <div v-show="selectedFeature"> <!-- // && Object.keys(props.indicatorArray).length" -->
        <v-btn density="compact" icon="mdi-close"
            class="chart-button"
            style="right: 15px;"
            @click="closeChart()"></v-btn>
        <v-btn density="compact" icon="mdi-fullscreen" v-show="!isFullscreen"
            class="chart-button"
            style="right: 55px;"
            @click="enterFullscreen()"></v-btn>
        <v-btn density="compact" icon="mdi-fullscreen-exit" v-show="isFullscreen"
            class="chart-button"
            style="right: 55px;"
            @click="exitFullscreen()"></v-btn>
        <v-select 
            v-show="selectedFeature?.layerId == DatasetTypes.SensorThings"
            :items="TIME_PRESETS"
            item-title="label"
            item-value="label"
            :label="$t('chart.interval')"
            return-object
            dense
            density="compact"
            single-line
            hide-details
            rounded
            solo
            v-model="selectedTimeInterval" 
            class="timeSelector"
        >
        </v-select>
        <svg class="chart-ui" id="indicatorChart" width="550" height="370"></svg>
    </div>
</template>

<script setup>
import { watch, onUnmounted, defineProps, ref } from "vue";
import { storeToRefs } from 'pinia';
import * as d3 from 'd3';
import { useChartStore } from '../stores/chart';
import { useAlertStore } from '@/stores/alert';
import { getObservations } from "@/services/frost.service";
import { DatasetTypes } from "@/utils/datasetTypes";
import { useI18n } from "vue-i18n";

const { t } = useI18n();
const alertStore = useAlertStore();
const props = defineProps(['indicatorArray', 'secondIndicatorArray', 'selectedIndicator', 'selectedSecondIndicator']);
const { selectedFeature } = storeToRefs(useChartStore());
const indicator = ref(null);
const indicatorName = ref(null);
const isFullscreen = ref(false);

const TIME_PRESETS = [
  { label: t('chart.6h'), minutes: 360 },
  { label: t('chart.24h'), minutes: 1440 },
  { label: t('chart.3d'), minutes: 4320 },
  { label: t('chart.7d'), minutes: 10080},
  { label: t('chart.30d'), minutes: 43200},
  { label: t('chart.90d'), minutes: 129600},
]
const selectedTimeInterval = ref(TIME_PRESETS[3]);

const margin = { top: 50, right: 20, bottom: 40, left: 50 };

/**
 * Renders a chart 
 * @param data array of objects containing properties for x and y axis (see parameters below)
 * @param timeAttributeName name of the property that holds the date/ time to map to the x-axis
 * @param valueAttributeName name of the property that holds the values to map to the y-axis
 * @param isTimeScaled Boolean, if true x-axis is timescaled
 * @param xAxisLowerLabel label that is displayed as a legend under the x-axis
 * @param unitOfMeasurement unit of measurement used for y-axis and tooltip
 */
const renderChart = (data, timeAttributeName, valueAttributeName, isTimeScaled=false, xAxisLowerLabel='', unitOfMeasurement='', showPercentageChange=true) => {
    const svg = d3.select('#indicatorChart');
    svg.selectAll('*').remove();
    // define viewbox for zooming in on chart
    svg.attr('viewBox','0 0 ' + svg.attr('width') + ' ' + svg.attr('height'))
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    let circle_radius = 4;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Either create a time or point scale
    let x = null;
    if (isTimeScaled) {
        // Cast Date String from ISO 8601 to Date object
        data.forEach(element => {
            element[timeAttributeName] = new Date(element[timeAttributeName]);
        });

        x = d3.scaleTime()
                    .domain(d3.extent(data, d => d[timeAttributeName]))
                    .range([ 0, width ]);
    } else {
        let timeLabels = data.map(d => d[timeAttributeName])
        x = d3.scalePoint().domain(timeLabels).range([0, width]);
    }

    const maxValue = d3.max(data, d => d[valueAttributeName]);
    const y = d3.scaleLinear()
            .domain([0, maxValue + (1/10) * maxValue]) // y-axis is 10% larger than max value
            .range([height, 0]);

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
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(xAxisLowerLabel);
    g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top / 2)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(indicatorName.value + ' (' + selectedFeature.value.featureName + ")");
    // Y Axis
    g.append('g')
        .call(d3.axisLeft(y).tickFormat(d => d + unitOfMeasurement));

    if (data.length === 0) {
        g.append("text")
            .attr("x", width / 2)
            .attr("y", height / 2)
            .attr("text-anchor", "middle")
            .text(t('chart.nodata'));

        return;
    }

    // Build Line from array values/ properties
    const line = d3.line()
        .x(d => x(d[timeAttributeName]))
        .y(d => y(d[valueAttributeName]))
        .curve(d3.curveMonotoneX); // Smooth line

    // Draw line
    g.append('path')
        .datum(data)
        .attr('fill', 'none')
        .attr('stroke', 'steelblue')
        .attr('stroke-width', 2)
        .attr('d', line);     


    // Add container for displaying tooltip
    var tooltip = d3.select('body').append('div')
        .style('opacity', 0)
        .style('position', 'absolute')
        .style('text-align', 'center')
        .style('padding', '.5rem')
        .style('background', '#FFFFFF')
        .style('border', '1px solid #313639')
        .style('border-radius', '8px')

    // Hover over event
    var mouseover = function(event, d) {
        // Highlight circle
        d3.select(this).transition()
            .duration('100')
            .attr('r', 7);

        // Show tooltip
        tooltip.transition()
            .duration(100)
            .style('opacity', 1)
            .style('display', 'inline');
        
        let text = '';
        if (isTimeScaled) {
            text = d[timeAttributeName].toUTCString() +
                    ':<br />' + d[valueAttributeName] + unitOfMeasurement
        } else {
            text = d[valueAttributeName] + unitOfMeasurement
        }

        tooltip.html(text)
            .style("left", (event.pageX + 10) + "px")
            .style("top", (event.pageY - 15) + "px");
    }

    // Leave hover over event
    var mouseout = function() {
        // Remove highlight circle
        d3.select(this).transition()
            .duration('200')
            .attr('r', circle_radius);

        // Hide tooltip
        tooltip.transition()
            .duration('200')
            .style('opacity', 0)
            .style('display', 'none');
    }  

    // Add circles at data points
    g.selectAll('.circle')
        .data(data)
        .join('circle')
        .attr('cx', d => x(d[timeAttributeName]))
        .attr('cy', d => y(d[valueAttributeName]))
        .attr('r', circle_radius)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)
        .style("opacity", data.length > 120 ? 0 : 1) // hide circles if more than 120 data points
        .on('mouseover', mouseover)
        .on('mouseout', mouseout);

    // Append labels for each data point with percentage change
    if (showPercentageChange) {
        g.selectAll('.label')
            .data(data)
            .enter().append('text')
            .attr('x', d => x(d[timeAttributeName]))
            .attr('y', d => y(d[valueAttributeName]) - 10)
            .attr('text-anchor', 'middle')
            .attr('font-size', '12px')
            .attr('fill', (d, i) => {
                if (i === 0) return 'black'; // No change for the first point
                const prev = data[i - 1][valueAttributeName];
                return d[valueAttributeName] > prev ? 'green' : 'red';
            })
            .text((d, i) => {
                if (i === 0) return ''; // No change for the first point
                const prev = data[i - 1][valueAttributeName];
                const change = ((d[valueAttributeName] - prev) / prev) * 100;
                return `${change.toFixed(1)}%`;
            });
    }
}

const closeChart = () => {
    selectedFeature.value = null;

    d3.select('#indicatorChart').selectAll('*').remove();
};

/**
 * enter fullscreen for chart by setting width and height to current window size
 */
const enterFullscreen = () => {
    const svg = d3.select('#indicatorChart');
    svg.style("width", window.innerWidth - margin.left);
    svg.style("height", window.innerHeight - margin.top);

    isFullscreen.value = true;
}

/**
 * exit fullscreen by resetting width and height to their default values
 */
const exitFullscreen = () => {
    const svg = d3.select('#indicatorChart');
    // remove width and heigth attribute; returns to default
    svg.style("width", null);
    svg.style("height", null);

    isFullscreen.value = false;
}

watch(() => selectedFeature.value, () => {
    let layerId = selectedFeature.value?.layerId;
    if (layerId) {
        let selectedIndicatorName = layerId?.replace('kommunales_gebiet_dashboard', '');
        if (layerId.includes(DatasetTypes.SensorThings)) {

            const data = selectedFeature.value.observations.value;
            indicatorName.value = selectedFeature.value.indicator;

            renderSensorThingsChart(data);
        } else {
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
                if (labels[0] !== undefined || dataValues[0] !== undefined) {
                    renderChart(filteredArray, "zeitbezug", "wert", false, "Jahre");
                }
                else {
                    closeChart();
                }


            } else {
                alertStore.setAlert({
                    text: 'There is no information for the selected indicator',
                    timeout: 2000
                });
            }
        }
    }

});

onUnmounted(() => {
    d3.select('#indicatorChart').selectAll('*').remove();
});

watch(() => selectedTimeInterval.value, async () => {
    if (selectedFeature.value.layerId == DatasetTypes.SensorThings) {
        const minutes = selectedTimeInterval.value.minutes;
        const date = new Date(Date.now() - minutes * 1000 * 60);
        const datastreamId = selectedFeature.value.datastreamId;
        const observations = await getObservations(datastreamId, date.toISOString(), "now()");
   
        renderSensorThingsChart(observations.value);
    }
})

const renderSensorThingsChart = (data) => {
    const unitOfMeasurement = selectedFeature.value.unitOfMeasurement;

    renderChart(data, "phenomenonTime", "result", true, "Zeitraum", unitOfMeasurement, false);
}
</script>

<style scoped>
.timeSelector {
    position: absolute;
    top: 15px; 
    right: 370px; 
    z-index: 1000; 
    background-color: transparent;
    width: 180px;
}

.chart-button {
    position: absolute; 
    top: 15px; 
    z-index: 1000; 
    background-color: transparent;
}

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
