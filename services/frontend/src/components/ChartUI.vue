<template>
    <div v-show="selectedFeature" class="chart-container"> <!-- // && Object.keys(props.indicatorArray).length" id="chart-ui-container"-->
        <div class="chart-toolbar">
            <v-tooltip>
                <template v-slot:activator="{ props }">
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
                        v-bind="props"
                    >
                    </v-select>
                </template>
            </v-tooltip>
            <v-tooltip :text="$t('chart-ui.download')">
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        density="compact"
                        icon="mdi-download"
                        variant="text"
                        @click="downloadChart"
                    />
                </template>
            </v-tooltip>
            <v-tooltip>
                <template v-slot:activator="{ props }" >
                   <v-btn v-show="!isFullscreen"
                    v-bind="props"
                    density="compact"
                    icon="mdi-fullscreen"
                    variant="text"
                    @click="enterFullscreen()"
                />
                </template>
            </v-tooltip>
            <v-tooltip>
                <template v-slot:activator="{ props }" >
                   <v-btn v-show="isFullscreen"
                    v-bind="props"
                    density="compact"
                    icon="mdi-fullscreen-exit"
                    variant="text"
                    @click="exitFullscreen()"
                />
                </template>
            </v-tooltip>
            <v-tooltip :text="$t('chart-ui.close')">
                <template v-slot:activator="{ props }">
                   <v-btn
                    v-bind="props"
                    density="compact"
                    icon="mdi-close"
                    variant="text"
                    @click="closeChart()"
                />
                </template>
            </v-tooltip>
        </div>
        <svg class="chart-ui" id="indicatorChart" width="450" height="370"></svg>
<!--
    <div v-show="selectedFeature && Object.keys(props.indicatorArray).length"
     class="chart-container">

        <div class="chart-toolbar">
            <v-tooltip :text="$t('chart-ui.download')">
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        density="compact"
                        icon="mdi-download"
                        variant="text"
                        @click="downloadChart"
                    />
                </template>
            </v-tooltip>
            <v-tooltip :text="$t('chart-ui.close')">
                <template v-slot:activator="{ props }">
                   <v-btn
                    v-bind="props"
                    density="compact"
                    icon="mdi-close"
                    variant="text"
                    @click="closeChart()"
                />
                </template>
            </v-tooltip>
            
        </div>

        <svg class="chart-ui" id="indicatorChart" width="350" height="370"></svg>
    -->
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
  { label: t('chart.6h'), minutes: 360, format: "%H:%M" },
  { label: t('chart.24h'), minutes: 1440, format: "%H:%M" },
  { label: t('chart.3d'), minutes: 4320, format: "%H:%M" },
  { label: t('chart.7d'), minutes: 10080, format: "%d.%m" },
  { label: t('chart.30d'), minutes: 43200, format: "%d.%m" },
  { label: t('chart.90d'), minutes: 129600, format: "%d.%m" },
]
const selectedTimeInterval = ref(TIME_PRESETS[0]);

// innerMargins used for chart in svg
const margin = { top: 60, right: 20, bottom: 40, left: 50 };
var chart_timeAttributeName = null;
var chart_valueAttributeName = null;

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
    chart_timeAttributeName = timeAttributeName;
    chart_valueAttributeName = valueAttributeName;
    const svg = d3.select('#indicatorChart');
    svg.selectAll('*').remove();
    
    // Reset tooltip
    d3.selectAll('.chart-ui-tooltip').remove();
    
    // define viewbox for zooming in on chart
    svg.attr('viewBox','0 0 ' + svg.attr('width') + ' ' + svg.attr('height'))
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;
    let circle_radius = 4;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    // Either create a time or point scale
    let x = null;
    let timeLabels = [];
    if (isTimeScaled) {
        // Cast Date String from ISO 8601 to Date object
        data.forEach(element => {
            element[timeAttributeName] = new Date(element[timeAttributeName]);
        });

        x = d3.scaleTime()
                    .domain(d3.extent(data, d => d[timeAttributeName]))
                    .range([ 0, width ]);
    } else {
        timeLabels = data.map(d => d[timeAttributeName])
        x = d3.scalePoint().domain(timeLabels).range([0, width]);
    }

    const maxValue = d3.max(data, d => d[valueAttributeName]);
    const y = d3.scaleLinear()
            .domain([0, maxValue + (1/10) * maxValue]) // y-axis is 10% larger than max value
            .range([height, 0]);

    const getTickStep = (count) => {
        if (count > 40) return 5;
        if (count > 25) return 3;
        if (count > 15) return 2;
        return 1;
    };

    const tickStep = getTickStep(timeLabels.length);

    const displayedTicks = timeLabels.filter((_, index) => index % tickStep === 0);

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

    // X Axis (use TickFormat if Chart is time scaled)
    g.append('g')
        .attr('transform', `translate(0,${height})`)
        .call(isTimeScaled?
            d3.axisBottom(x).tickFormat(d3.timeFormat(selectedTimeInterval.value.format)) :
            d3.axisBottom(x).tickValues(displayedTicks)
        );
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom - 10)
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(xAxisLowerLabel);
    g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top +40)
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
    const tooltip = d3.select('body')
        .selectAll('.chart-tooltip')
        .data([null])
        .join('div')
        .attr('class', 'chart-tooltip')
        .style('position', 'absolute')
        .style('background', 'rgba(0,0,0,0.6)')
        .style('color', 'white')
        .style('padding', '6px 10px')
        .style('border-radius', '5px')
        .style('font-size', '12px')
        .style('pointer-events', 'none')
        .style('opacity', 0);

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
            text = `<strong>Year:</strong> ${d[timeAttributeName].toUTCString()}<br><strong>Value:</strong> ${Number(d[valueAttributeName]).toFixed(2)} ${unitOfMeasurement}`
        } else {
            text = `<strong>Year:</strong> ${d[timeAttributeName]}<br><strong>Value:</strong> ${d[valueAttributeName]}`
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
    
    var mousemove = function(event) {
        tooltip
            .style('left', (event.pageX + 12) + 'px')
            .style('top', (event.pageY - 28) + 'px');
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
        .style("opacity", data.length > 50 ? 0 : 1) // hide circles if more than 50 data points
        .on('mouseover', mouseover)
        .on('mouseout', mouseout)
        .on('mousemove', mousemove);

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
                // Skip labels that shouldn't be displayed
                if (i % tickStep !== 0 && i !== data.length - 1) return '';
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
    svg.style("width", window.innerWidth - margin.left - margin.right);
    svg.style("height", window.innerHeight - margin.top - margin.bottom);

    const container = d3.select('#chart-ui-container');
    container.style("width", window.innerWidth - margin.left - margin.right + "px");
    container.style("height", window.innerHeight - margin.top - margin.bottom + "px");

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

    const container = d3.select('#chart-ui-container');
    container.style("width", null);
    container.style("height", null);

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
const downloadChart = () => {
    const svg = document.getElementById("indicatorChart");

    const serializer = new XMLSerializer();
    const svgString = serializer.serializeToString(svg);

    const svgBlob = new Blob([svgString], {
        type: "image/svg+xml;charset=utf-8"
    });

    const url = URL.createObjectURL(svgBlob);

    const img = new Image();

    img.onload = () => {
        const scale = 4; // 4x resolution

        const canvas = document.createElement("canvas");
        canvas.width = svg.width.baseVal.value * scale;
        canvas.height = svg.height.baseVal.value * scale;

        const ctx = canvas.getContext("2d");

        // white background
        ctx.fillStyle = "white";
        ctx.fillRect(0, 0, canvas.width, canvas.height);

        // scale drawing
        ctx.scale(scale, scale);

        ctx.drawImage(
            img,
            0,
            0,
            svg.width.baseVal.value,
            svg.height.baseVal.value
        );

        URL.revokeObjectURL(url);

        const link = document.createElement("a");
        link.download = `${indicatorName.value}_${selectedFeature.value.featureName}.png`;
        link.href = canvas.toDataURL("image/png", 1.0);
        link.click();
    };

    img.src = url;
};
onUnmounted(() => {
    d3.select('#indicatorChart').selectAll('*').remove();
});

watch(() => selectedTimeInterval.value, async () => {
    if (selectedFeature.value.layerId == DatasetTypes.SensorThings) {
        const minutes = selectedTimeInterval.value.minutes;
        const date = new Date(Date.now() - minutes * 1000 * 60);

        const datastreamId = selectedFeature.value.datastreamId;
        const observations = await getObservations(datastreamId, date.toISOString(), "now()");

        if (minutes > 10000) {
            const hourlyAverage = compressData(observations.value)
            renderSensorThingsChart(hourlyAverage);
            
        } else {
            renderSensorThingsChart(observations.value);
        }
    }
})

/**
 * Compress data to get hourly average
 * @param data array of objects containing properties for x and y axis
 */
const compressData = (data) => {
    const map = new Map();

    for (const observation of data) {
        const time = new Date(observation[chart_timeAttributeName])
        time.setMinutes(0) // clear minutes to group dates by their exact hour

        const hourlyResults = map.get(time.getTime()) || { sum: 0, size: 0};
        hourlyResults.sum += observation[chart_valueAttributeName];
        hourlyResults.size += 1;
        map.set(time.getTime(), hourlyResults)
    }
            
    const hourlyAverage = [...map.entries()].map(([time, value]) => ({
        [chart_timeAttributeName]: time,
        [chart_valueAttributeName]: value.sum / value.size
    }));
    return hourlyAverage;
}

const renderSensorThingsChart = (data) => {
    const unitOfMeasurement = selectedFeature.value.unitOfMeasurement;

    renderChart(data, "phenomenonTime", "result", true, "Zeitraum", unitOfMeasurement, false);
}
</script>

<style scoped>
.timeSelector {
    position: absolute;
    top: 7px;
    left: 5px;
    z-index: 1000; 
    background-color: transparent;
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


.chart-toolbar {
    position: absolute;
    top: 10px;
    right: 15px;
    z-index: 1000;
    display: flex;
    gap: 4px;
}

</style>
