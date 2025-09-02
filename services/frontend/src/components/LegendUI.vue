<template>
    <v-card class="legend-ui" >
        
        <v-card-item v-if="classIntervalsAndColor || classIntervalsAndColorHexagon">
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
                        @click="setClickFilter(intervalAndRadius[`radius${index + 1}`]/2, 'circle'+index, 'second')"
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
          
           <div class="font-weight-regular">
                <div
                    class="legend-item"
                    v-for="(intervalAndColor, index) in classIntervalsAndColor"
                    :key="index"
                >
            
                    <div 
                        :class="`color-strip` "
                        :id="index"
                        :style="{ backgroundColor: intervalAndColor[`color${index + 1}`], cursor:'pointer' } "
                        @mouseover="setHoverFilter(index, 'kommunales_gebiet_dashboard', intervalAndColor[`color${index + 1}`], 'first')"
                        @mouseleave="resetFilter(index, 'kommunales_gebiet_dashboard', intervalAndColor[`color${index + 1}`], 'first')"
                        @click="setClickFilter(intervalAndColor[`color${index + 1}`], index, 'first')"
                    ></div>

                
                    <div class="legend-label" >
                        {{ intervalAndColor[`interval${index+1}`] }}
                    </div>
                </div>
               
                <div>
                    {{ completeIndicatorName }}
                </div>
           </div>
            
        </v-card-item>
        
    </v-card>
</template>
<script setup>
import { storeToRefs } from 'pinia'
import { useMapLegendStore } from '../stores/mapLegend'
import { defineEmits, watch  } from "vue"

const emit = defineEmits(["setFilterForLegendInteraction", "resetFilter"]);


let { classIntervalsAndColor, classIntervalsAndRadius, classIntervalsAndColorHexagon, clickedlegendItems, completeIndicatorName, completeSecondIndicatorName} = storeToRefs(useMapLegendStore())

const setHoverFilter = (index, layername, hoveredValue, legendGroup)=>{
    let tempArray = null
    if (clickedlegendItems.value[legendGroup].indexOf(hoveredValue) === -1) {
        tempArray = clickedlegendItems.value[legendGroup].concat(hoveredValue)
        let payload = {
            selectedColor: tempArray,
            layerId: layername,
            properties: 'nationalco',
            styleParam: legendGroup == 'first'? "fill-color":'circle-radius'
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
        styleParam: legendGroup == 'first'? "fill-color":'circle-radius'
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
        layerId: 'kommunales_gebiet_dashboard',
        properties: 'nationalco',
        styleParam: "fill-color"
    }

    if(clickedlegendItems.value.first.length>0 ){
        
        emit("setFilterForLegendInteraction", payload)
    }
    else {
        emit("resetFilter", {layerId:'kommunales_gebiet_dashboard'})
        
        for (let i=0; i<classIntervalsAndColor?.value?.length; i++){
            document.getElementById(i).style.border = "";
            
        }
    }
    
})
watch(() => clickedlegendItems.value.second, () => {
    let payload = {
        selectedColor: clickedlegendItems.value.second,
        layerId: 'kommunales_gebiet_centroid',
        properties: 'nationalco',
        styleParam: 'circle-radius'
    }

    if(clickedlegendItems.value.second.length>0 ){
        
        emit("setFilterForLegendInteraction", payload)
    }
    else {
        emit("resetFilter", {layerId:'kommunales_gebiet_centroid'})
        
        for (let i=0; i<classIntervalsAndRadius?.value?.length; i++){
            document.getElementById('circle'+i).style.border = "";
            
        }
    }
    
})

</script>

<style scoped>

.legend-ui {
    position: absolute;
    right: 10px;
    bottom: 10px;
    z-index:10;
    background: white;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    width: auto;
    min-width: 200px; 
    border-radius: 8px;
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
   

</style>