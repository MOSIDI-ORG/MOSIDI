<template>
    <div class="legend-container">
        <div :class="['map-navigation-container', { 'mb-12': isMaximized==false }, { 'mb-2': isMaximized }]">
           
            <v-avatar  style="cursor: pointer;" @click="zoomIn"  class="mb-2">
                <IconCirclePlus :size="35" />
            </v-avatar>
            <v-avatar  style="cursor: pointer;" @click="zoomOut">
                <IconCircleMinus :size="35" />
            </v-avatar>
            <v-avatar  style="cursor: pointer;" @click="geocodingToggle=!geocodingToggle">
                <v-img src="icons/search.svg" width="35" height="35" ></v-img>
            </v-avatar>
            <GeocodingUI @addAddressToMap="addLayerToMap" @removeLayerFromMap="removeLayerFromMap"></GeocodingUI>

           
        </div>
        
        <div v-if="isMaximized && (Object.keys(addedLayersLegendSpec).length>0 || activatedExternalWMSMapLegendURL!=null)" style="pointer-events: all;">
            <v-btn
            
                density="compact" 
                variant="text" 
                icon
                class="mr-2"
                @click="minimizeLegend"
            >
                <img src="icons/expand.svg" width="18" height="18" />
            </v-btn>
        </div>
        <div v-if="isMaximized==false" style="position:absolute; right: 10px; bottom: 0px;">
            <v-avatar  style="cursor: pointer;" @click="minimizeLegend">
                <v-img src="icons/mosidi-logo-minimized.svg"  width="35" height="35"></v-img>
            </v-avatar>
        
        </div>
  
        <v-card class="legend-ui" max-width="400">
        
            <v-card-item v-if="isMaximized && Object.keys(addedLayersLegendSpec).length>0">
                <div v-if="classIntervalsAndColorHexagon" >
                    <div
                        class="legend-item font-weight-light"
                        v-for="(intervalAndColor, index) in classIntervalsAndColorHexagon"
                        :key="index"
                    >
            
                        <div 
                            :class="`color-strip-hexagon ml-7 `"
                            :id="'hexagon'+index"
                            :style="{
                                width: '30px',
                                height: `${((index+1) *12)}` + 'px',
                                cursor: 'pointer',
                                backgroundColor: intervalAndColor[`color${index + 1}`],

                            }"
                        
                        ></div>

                    
                        <div class="legend-label" >
                            {{ intervalAndColor[`interval${index+1}`] }}
                        </div>
                    </div>

                </div>
                
                <div class="mb-2 font-weight-regular"  v-if="classIntervalsAndRadius">
                    <div 
                        class="circle-row"
                        
                    >
                        <div 
                            class="circle ml-7 circle-row"
                            v-for="(intervalAndRadius, index) in classIntervalsAndRadius"
                            :key="index"
                            :id="'circle'+index"
                            :style="{
                                width: intervalAndRadius[`radius${index + 1}`] + 'px',
                                height: intervalAndRadius[`radius${index + 1}`] + 'px',
                                cursor: 'pointer'
                            }"
                            @mouseover="setHoverFilter('circle'+index, 'kommunales_gebiet_centroid',  intervalAndRadius[`radius${index + 1}`]/2, 'second')"
                            @mouseleave="resetFilter('circle'+index, 'kommunales_gebiet_centroid', intervalAndRadius[`radius${index + 1}`]/2, 'second')"
                            @click="setClickFilter(intervalAndRadius[`radius${index + 1}`]/2, 'circle'+index, 'second' )"
                        >
                            <div style="width: 40px;">
                                {{ intervalAndRadius[`interval${index+1}`] }}
                            </div>
                        </div>
                    </div>
                    <div> 
                        {{ completeSecondIndicatorName }}
                    </div>
                </div>
                <div  class="legend-item "
                    v-if="indicatorArray[lastLegendItem?.key]?.secondIndicatorName==null && Object.keys(addedLayersLegendSpec).length>0 && lastLegendItem?.value?.classIntervalsAndColor && indicatorArray?.[lastLegendItem?.key]?.ternaryData==null"
                >
                
                        
                    <div 
                        v-for="(inside, index1) in lastLegendItem.value.classIntervalsAndColor"
                        :class="`color-strip` "
                        :key="index1"
                        :id="index1"
                        :style="{ backgroundColor: inside[`color${index1 + 1}`], cursor:'pointer' } "
                        @mouseover="setHoverFilter(index1, 'kommunales_gebiet_dashboard'+lastLegendItem.value.selectedIndicator, inside[`color${index1 + 1}`], 'first')"
                        @mouseleave="resetFilter(index1, 'kommunales_gebiet_dashboard'+lastLegendItem.value.selectedIndicator, inside[`color${index1 + 1}`], 'first')"
                        @click="setClickFilter(inside[`color${index1 + 1}`], index1, 'first'); clickedIndicator=lastLegendItem.value.selectedIndicator"
                    >
                    </div>
                        
                    <div class="label-container">
                        <div 
                            v-for="(inside, index1) in lastLegendItem.value.classIntervalsAndColor" 
                            :key="index1" 
                        >
                            {{ inside[`interval${index1 + 1}`] }}
                        </div>
                    </div>
                        
                    
                    <div>
                        {{ lastLegendItem.value.selectedIndicator }}
                    </div>
                
                        
                </div>
                
                <div class="bivariate-legend-container" v-if="indicatorArray[lastLegendItem?.key]?.bivariate">
                    <!-- Y-axis Labels and Arrow -->
                    <v-tooltip :text=" lastLegendItem.key" location="top">
                
                        <template v-slot:activator="{ props }">
                        
                            <span v-bind="props" style="text-orientation: mixed;  writing-mode: vertical-rl; "> 
                        
                                {{ lastLegendItem.key.length > 25
                                ? lastLegendItem.key.slice(0, 25) + '...' 
                                : lastLegendItem.key }}
                            </span>
                        </template>
                    </v-tooltip>
                    
                    <div class="bivariate-y-axis">
                    <span>High</span>
                    <span style="font-weight: bold; font-size: 1.5rem;">&uarr;</span>
                    <span>Low</span>
                    
                    </div>
                    
                    

                    <!-- Legend Grid -->
                    <div class="bivariate-legend">
                    
                        <div class="bivariate-legend-grid">
                            <div
                                v-for="(color, index) in bivariateColorpalette"
                                :key="index"
                                :id="'bivariate'+index"
                                :style="{ backgroundColor: color }"
                                @mouseover="setHoverFilter('bivariate'+index, 'kommunales_gebiet_dashboard'+lastLegendItem.value.selectedIndicator, color, 'second')"
                                @mouseleave="resetFilter('bivariate'+index, 'kommunales_gebiet_dashboard'+lastLegendItem.value.selectedIndicator, color, 'second')"
                                @click="setClickFilter(color, 'bivariate'+index, 'second');clickedIndicator=lastLegendItem.value.selectedIndicator"
                                class="bivariate-legend-cell"
                            >
                            <!--<span class="bivariate-legend-label">{{ key.replace('_', ' / ') }}</span>-->
                            </div>
                        </div>

                        <!-- X-axis Labels and Arrow -->
                        <div class="bivariate-x-axis">
                            <span>Low</span>
                            
                            <span style="font-weight: bold; font-size: 1.5rem;">&rarr;</span>
                            
                            <span>High</span>
                        </div>
                    
                        <v-tooltip :text=" lastLegendItem.key" location="top">
                    
                            <template v-slot:activator="{ props }">
                            
                                <span v-bind="props" > 
                        
                                    {{ indicatorArray[lastLegendItem.key].secondIndicatorName.length > 25
                                ? indicatorArray[lastLegendItem.key].secondIndicatorName.slice(0, 25) + '...' 
                                : indicatorArray[lastLegendItem.key].secondIndicatorName }}
                                </span>
                            </template>
                        </v-tooltip>
                    </div>
                </div>

                <div  v-if="indicatorArray?.[lastLegendItem?.key]?.ternaryData" class="ternary-legend-container">
                    <div ref="ternaryContainer" class="mb-0"></div>                    
                </div>
                
                
            </v-card-item>
            <v-card-item v-if="isMaximized && activatedExternalWMSMapLegendURL" >
              
               
                <div  class="bivariate-legend-container" style="max-width: 500px; overflow-x: scroll; max-height: 400px; overflow: scroll;">
                    <img :src="activatedExternalWMSMapLegendURL" />
                </div>
                 <div >
                    {{ activatedExternalWMSMapLegendURLTitle}}
                </div>
               
            </v-card-item>
        
        
        </v-card>
   
    </div>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useBivariateStore } from '../stores/bivariate'
import { defineEmits, watch, ref, computed, onMounted, nextTick  } from "vue"
import { useMapLegendStore } from '../stores/mapLegend'
import { useaddedDatasetsStore } from '../stores/addedDatasets'
import { useIndicatorStore } from '@/stores/indicator'
import GeocodingUI from './GeocodingUI.vue'
import IconCirclePlus from './icons/IconCirclePlus.vue'
import IconCircleMinus from './icons/IconCircleMinus.vue'
import * as d3 from "d3"
let {indicatorArray} = storeToRefs(useIndicatorStore())

//const addedDatasetsStore = useaddedDatasetsStore()

const emit = defineEmits(["setFilterForLegendInteraction", "resetFilter", "zoomIn" , "zoomOut", "addLayerToMap", "removeLayerFromMap", "fitBoundsToBBOX"]);


let { classIntervalsAndColor, classIntervalsAndRadius, classIntervalsAndColorHexagon, clickedlegendItems, /*completeIndicatorName*/ completeSecondIndicatorName, addedLayersLegendSpec, isMaximized, geocodingToggle, activatedExternalWMSMapLegendURL, activatedExternalWMSMapLegendURLTitle} = storeToRefs(useMapLegendStore())
let { bivariateColorpalette, /*bivariateLegend*/ } = storeToRefs(useBivariateStore())
let clickedIndicator = ref(null)
let {addedLayers}=storeToRefs(useaddedDatasetsStore())


const setHoverFilter = (index, layername, hoveredValue, legendGroup)=>{
    let tempArray = null
    if (clickedlegendItems.value[legendGroup].indexOf(hoveredValue) === -1) {
        tempArray = clickedlegendItems.value[legendGroup].concat(hoveredValue)
        let payload = {
            selectedColor: tempArray,
            layerId: layername,
            properties: 'nationalco',
            styleParam: "fill-color"
        }
        emit("setFilterForLegendInteraction", payload)
        document.getElementById(index).style.border = "2px solid orange"
    }
    
}

const resetFilter = (index, layername, hoveredValue, legendGroup) => {
    if (clickedlegendItems.value[legendGroup].indexOf(hoveredValue) === -1) {
        document.getElementById(index).style.border = ""
    }

    let payload = {
        selectedColor:clickedlegendItems.value[legendGroup],
        layerId: layername,
        properties: 'nationalco',
        styleParam: "fill-color"
    }
    
    if(clickedlegendItems.value[legendGroup].length>0){
    
        emit("setFilterForLegendInteraction", payload)
    }
    else {
        emit("resetFilter", payload)
        document.getElementById(index).style.border = "";
    }
}

const setClickFilter = (hoveredValue, index, legendGroup) => {
    if (clickedlegendItems.value[legendGroup].indexOf(hoveredValue) === -1) {
        clickedlegendItems.value[legendGroup] = [...clickedlegendItems.value[legendGroup], hoveredValue ];
        document.getElementById(index).style.border = "2px solid grey";
    }
    else{
        clickedlegendItems.value[legendGroup] = clickedlegendItems.value[legendGroup].filter(item => item !==  hoveredValue);
        document.getElementById(index).style.border = "";

    }
};


watch(() => clickedlegendItems.value.first, () => {
    let payload = {
        selectedColor: clickedlegendItems.value.first,
        layerId: 'kommunales_gebiet_dashboard'+clickedIndicator.value,
        properties: 'nationalco',
        styleParam: "fill-color"
    }

    if(clickedlegendItems.value.first.length>0 ){
        
        emit("setFilterForLegendInteraction", payload)
    }
    else {
        emit("resetFilter", {layerId:'kommunales_gebiet_dashboard'})
        for (let i=0; i<classIntervalsAndColor?.value?.length; i++){
            if(document.getElementById(i)){
                document.getElementById(i).style.border = "";
            }
            
            
        }
    }
    
})
watch(() => clickedlegendItems.value.second, () => {
    let payload = {
        selectedColor: clickedlegendItems.value.second,
        layerId: 'kommunales_gebiet_dashboard'+clickedIndicator.value,
        properties: 'nationalco',
        styleParam: "fill-color"
    }
    if(clickedlegendItems.value.second.length>0 ){
        
        emit("setFilterForLegendInteraction", payload)
    }
    else {
        emit("resetFilter", {layerId:'kommunales_gebiet_dashboard'+clickedIndicator.value})
        for (let i=0; i<bivariateColorpalette?.value?.length; i++){
            document.getElementById(i).style.border = "";
            
        }
    }
    
})


const lastLegendItem = computed(() => {
  const keyWithCheckedTrue = Object.entries(addedLayers.value).find(
    (entry) => entry[1]?.checked === true && (entry[1]?.dct_type === 'indikator' || entry[1]?.dct_type === 'custom indikator') // Ensure safe navigation
  )?.[0];
  
  if (!keyWithCheckedTrue) {
    console.warn("No layer with checked = true found."); // Optional debugging
    return null; // Handle the case where no matching key is found
  }
  // Safely access the value associated with the key
  const legendSpecForCheckedKey = addedLayersLegendSpec.value[keyWithCheckedTrue];

  if (!legendSpecForCheckedKey) {
    console.warn(`No legend spec found for key: ${keyWithCheckedTrue}`); // Optional debugging
    return null;
  }
  return {
    
    key: keyWithCheckedTrue,
    value: legendSpecForCheckedKey,
  };
});

const minimizeLegend = ()=>{
    isMaximized.value=! isMaximized.value
}

const zoomIn = ()=>{
   emit("zoomIn")
}
const zoomOut = ()=>{
   emit("zoomOut")
}
const addLayerToMap= (item)=>{
    emit("removeLayerFromMap",  {layerId:  item.id, sourceId: item.id})
    emit("addLayerToMap", item)
    emit("fitBoundsToBBOX", item.geoGjsonData.bbox)
}
const removeLayerFromMap = (layerSpecification)=>{
    emit("removeLayerFromMap",  layerSpecification)

}

const ternaryContainer = ref(null)
let ternaryBase = null
const ternaryData = computed(() => {
  const key = lastLegendItem.value?.key
  if (!key) return []
  return indicatorArray.value?.[key]?.ternaryData?.ternaryData ?? []
})

onMounted(async () => {
   await nextTick()

  if (!ternaryContainer.value) {
    console.error("Container not found")
    return
  }

  ternaryBase = drawTernaryBase(260)
})


function ternaryToXY(P, F, S, size) {
  const height = Math.sqrt(3) / 2 * size
  return {
    x: size * (0.5 * (2 * S + P)),
    y: height * (1 - P)
  }
}

/* ==============================
   Draw base trianglee
============================== */
function drawTernaryBase(size = 260) {
  if (!ternaryContainer.value) return;

  const container = d3.select(ternaryContainer.value);
  container.selectAll("*").remove();

  const margin = { top: 30, right: 30, bottom: 40, left: 30 }
    const height = Math.sqrt(3) / 2 * size;
    const totalWidth = size + margin.left + margin.right
    const totalHeight = height + margin.top + margin.bottom

    const svg = container
    .append("svg")
    .attr("width", totalWidth)
    .attr("height", totalHeight)
    .append("g")
    .attr("transform", `translate(${margin.left},${margin.top})`)
    

  // === Outer triangle
  svg.append("polygon")
    .attr("points", `0,${height} ${size},${height} ${size / 2},0`)
    .attr("fill", "none")
    .attr("stroke", "#444")
    .attr("stroke-width", 1);

  // === Internal grid (10 steps)
  const steps = d3.range(0.1, 1.0, 0.1);
  steps.forEach(t => {
    // Bottom-left → right
    const p1 = ternaryToXY(t, 1 - t, 0, size);
    const p2 = ternaryToXY(t, 0, 1 - t, size);
    svg.append("line")
      .attr("x1", p1.x).attr("y1", p1.y)
      .attr("x2", p2.x).attr("y2", p2.y)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    // Right-bottom → top
    const f1 = ternaryToXY(1 - t, t, 0, size);
    const f2 = ternaryToXY(0, t, 1 - t, size);
    svg.append("line")
      .attr("x1", f1.x).attr("y1", f1.y)
      .attr("x2", f2.x).attr("y2", f2.y)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);

    // Top → left-bottom
    const s1 = ternaryToXY(1 - t, 0, t, size);
    const s2 = ternaryToXY(0, 1 - t, t, size);
    svg.append("line")
      .attr("x1", s1.x).attr("y1", s1.y)
      .attr("x2", s2.x).attr("y2", s2.y)
      .attr("stroke", "#ddd")
      .attr("stroke-width", 1);
  });

  // === Axis ticks & labels
  const tickValues = d3.range(0, 1.01, 0.1);
  tickValues.forEach(t => {
    const label = (t * 100).toFixed(0);

    // Feature axis (green) - bottom-left → right
    const pF = ternaryToXY(0, t, 1 - t, size);
    svg.append("text")
      .attr("x", pF.x)
      .attr("y", pF.y + 14)
      .attr("text-anchor", "middle")
      .style("font-size", "10px")
      .attr("fill", "green")
      .text(label);

    // SHAP axis (blue) - right → top
    const pS = ternaryToXY(1 - t, 0, t, size);
    svg.append("text")
      .attr("x", pS.x + 12)
      .attr("y", pS.y + 4)
      .style("font-size", "10px")
      .attr("fill", "blue")
      .text(label);

    // Prediction axis (red) - top → left
    const pP = ternaryToXY(t, 1 - t, 0, size);
    svg.append("text")
      .attr("x", pP.x - 12)
      .attr("y", pP.y + 4)
      .attr("text-anchor", "end")
      .style("font-size", "10px")
      .attr("fill", "red")
      .text(label);
  });

  // === Axis titles
  svg.append("text")
    .attr("x", size / 2).attr("y", -15)
    .attr("text-anchor", "middle")
    .style("font-size", "12px")
    .attr("fill", "red")
    .text(indicatorArray.value?.[lastLegendItem.value.key]?.ternaryData.indicatorsInfo?.[0]?.indicatorname + "(%)" || "(%)");

  svg.append("text")
    .attr("x", -20).attr("y", height + 30)
    .attr("text-anchor", "start")
    .style("font-size", "12px")
    .attr("fill", "green")
    .text(indicatorArray.value?.[lastLegendItem.value.key]?.ternaryData.indicatorsInfo?.[1]?.indicatorname + "(%)" || "(%)");

  svg.append("text")
    .attr("x", size + 20).attr("y", height + 30)
    .attr("text-anchor", "end")
    .style("font-size", "12px")
    .attr("fill", "blue")
   .text(indicatorArray.value?.[lastLegendItem.value.key]?.ternaryData.indicatorsInfo?.[2]?.indicatorname + "(%)" || "(%)");

  return { svg, size };
}

function drawPoints(base, data) {
  const { svg, size } = base

  svg.selectAll(".ternary-point")
    .data(data, d => d.kennziffer)
    .join(
      enter => enter.append("circle")
        .attr("class", "ternary-point")
        .attr("r", 0)
        .attr("cx", d => ternaryToXY(d.share1, d.share2, d.share3, size).x)
        .attr("cy", d => ternaryToXY(d.share1, d.share2, d.share3, size).y)
        .attr("fill", d =>
          `rgb(${255*d.share1},${255*d.share2},${255*d.share3})`
        )
        .attr("stroke", "grey")       // <-- grey outline
        .attr("stroke-width", 0.5)    // <-- thin outline
        .attr("opacity", 1)
        .transition()
        .duration(400)
        .attr("r", 3),

      update => update
        .transition()
        .duration(400)
        .attr("cx", d => ternaryToXY(d.share1, d.share2, d.share3, size).x)
        .attr("cy", d => ternaryToXY(d.share1, d.share2, d.share3, size).y),

      exit => exit
        .transition()
        .duration(300)
        .attr("r", 0)
        .remove()
    )
}
/* ==============================
   Watch Store Changes
============================== */
function drawTernary() {
  if (!ternaryContainer.value) return
  ternaryBase = drawTernaryBase(260)

  if (ternaryData.value.length) {
    drawPoints(ternaryBase, ternaryData.value)
  }
}

// Watch for data changes AND container being ready
watch(
  [ternaryData, ternaryContainer],
  async ([data, container]) => {
    if (!container || !data.length) return
    await nextTick()
    drawTernary()
  },
  { immediate: true }
)
</script>

<style scoped>
.legend-container {
    position: absolute;
    right: 10px;
    bottom: 10px;
    display: flex;
    align-items: center;
    z-index: 100;
  
}
.legend-ui {
    background: white;
    background-color: rgba(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    width: auto;
    min-width: 200px;
    border-radius: 8px;
    margin-right: 8px; /* Space between legend and arrow */
}
.color-strip {
  width: 60px; 
  height: 12px; 
  display: inline-block; 
  transition: border 0.2s ease;
}
.color-strip-hexagon {
    border-radius: 5px;
    background-color: rgba(255,255,255,0);
}


.legend-item {
    display: inline-block; 
  
}

.legend-label {
  text-align: right;
  font-size: 0.7rem;
}
.legend-label-max {
    position: absolute;
    top:30px;
    left: 300px;
    white-space: normal;
    justify-content: center;
    font-size: 0.7rem;
}
.circle-row {
        display: flex;
        justify-content: flex-end;
        align-items: center;
}

.circle {
    
    border-radius: 50%;
    border: 1px solid black;
    background-color: rgba(255,255,255,0);
}
.bivariate-legend-container {
  display: flex;
  align-items: center;
  justify-content: center;
}

.bivariate-legend {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.bivariate-legend-grid {
  display: grid;
  grid-template-columns: repeat(3, 50px); /* 3 columns */
  grid-template-rows: repeat(3, 50px); /* 3 rows */
  gap: 0px;
}

.bivariate-legend-cell {
  width: 50px;
  height: 50px;
  display: flex;
  justify-content: center;
  align-items: center;
}

.bivariate-legend-label {
  font-size: 0.8rem;
  color: #333;
  text-align: center;
}

/* X-axis Labels and Arrow */
.bivariate-x-axis {
  display: flex;
  justify-content: space-between;
  width: 150px; /* To match the width of the grid */
  margin-top: 5px;
  font-size: 0.7rem;
  text-align: center;
}

/* Y-axis Labels and Arrow */
.bivariate-y-axis {
  display: flex;
  flex-direction: column;
  justify-content: space-between;
  height: 150px; /* To match the height of the grid */
  margin-right: 5px;
  margin-bottom: 15px;
  font-size: 0.7rem;
  text-align: center;
}

.label-container {
    display: flex;
    flex-direction: columnrow; /* Horizontal layout */
    gap: 30px; /* Optional: space between items */
    align-items: center; /* Align items vertically in the center */
    font-size: 0.7rem;
    margin-left: 55px;
}
.map-navigation-container {
  position: absolute;
  bottom: 100%;
  right: -10px;
  transform: translateX(-50%);
  z-index: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
}


</style>