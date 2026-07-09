<template>
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
    </div>
</template>

<script setup>
import { watch, onUnmounted, defineProps, ref } from "vue";
import { storeToRefs } from 'pinia';
import * as d3 from 'd3';
import { useChartStore } from '../stores/chart';
import { useAlertStore } from '@/stores/alert';
import { useI18n } from 'vue-i18n';
const { t } = useI18n();

const alertStore = useAlertStore();
const props = defineProps(['indicatorArray', 'secondIndicatorArray', 'selectedIndicator', 'selectedSecondIndicator']);
let { selectedFeature } = storeToRefs(useChartStore());
let indicator = ref(null);
let indicatorName = ref(null);

const renderChart = (labels, dataValues) => {
    const svg = d3.select('#indicatorChart');
    svg.selectAll('*').remove();
    const margin = { top: 60, right: 20, bottom: 40, left: 50 };
    const width = +svg.attr('width') - margin.left - margin.right;
    const height = +svg.attr('height') - margin.top - margin.bottom;

    const g = svg.append('g').attr('transform', `translate(${margin.left},${margin.top})`);

    const x = d3.scalePoint().domain(labels).range([0, width]);
    const y = d3.scaleLinear().domain([0, d3.max(dataValues)]).range([height, 0]);

    const getTickStep = (count) => {
        if (count > 40) return 5;
        if (count > 25) return 3;
        if (count > 15) return 2;
        return 1;
    };

    const tickStep = getTickStep(labels.length);

    const displayedTicks = labels.filter((_, index) => index % tickStep === 0);

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
    .call(
        d3.axisBottom(x)
            .tickValues(displayedTicks)
    );
    g.append('text')
        .attr('x', width / 2)
        .attr('y', height + margin.bottom-10 )
        .attr('text-anchor', 'middle')
        .attr('font-size', '12px')
        .attr('fill', 'black')
        .text(t('chart-ui.years'));
    g.append('text')
        .attr('x', width / 2)
        .attr('y', -margin.top +40)
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
    g.selectAll('.circle')
        .data(dataValues)
        .enter()
        .append('circle')
        .attr('cx', (d, i) => x(labels[i]))
        .attr('cy', d => y(d))
        .attr('r', 4)
        .attr('fill', 'steelblue')
        .attr('stroke', 'white')
        .attr('stroke-width', 1)

        .on('mouseover', function(event, d) {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 7);

            const i = dataValues.indexOf(d);

            tooltip
                .style('opacity', 1)
                .html(`
                    <strong>Year:</strong> ${labels[i]}<br>
                    <strong>Value:</strong> ${d}
                `);
        })

        .on('mousemove', function(event) {
            tooltip
                .style('left', (event.pageX + 12) + 'px')
                .style('top', (event.pageY - 28) + 'px');
        })

        .on('mouseout', function() {
            d3.select(this)
                .transition()
                .duration(100)
                .attr('r', 4);

            tooltip.style('opacity', 0);
    });
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
        // Skip labels that shouldn't be displayed
        if (i % tickStep !== 0 && i !== dataValues.length - 1) return '';
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
            if (labels[0] !== undefined || dataValues[0] !== undefined) {
                renderChart(labels, dataValues, selectedIndicatorName);
            }
            else{
                closeChart();
            }
           
            
        } else {
            alertStore.setAlert({
                text: 'There is no information for the selected indicator',
                timeout: 2000
            });
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


.chart-toolbar {
    position: absolute;
    top: 10px;
    right: 15px;
    z-index: 1000;
    display: flex;
    gap: 4px;
}

</style>
