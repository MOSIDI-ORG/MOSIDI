<template>
    <v-card
        class="mx-auto layer-ui"  width="371" max-height="400" v-show="activeMenu=='geodata'"
    >
        <v-toolbar class="sticky">
   
            <v-card-text>
                <v-text-field
                    :placeholder="'Datensätze durchsuchen (' +  tableNames?.length + ')'"
                    prepend-inner-icon="mdi-magnify"
                    class="expanding-search"
                    filled
                    density="compact"
                    clearable
                    style="float:right; width: 100%;"
                    variant="solo"
                    single-line
                    hide-details
                    @click:clear="clearSearch"
                    v-model="layerSearchText"
                >
                </v-text-field>
            </v-card-text>
               
        </v-toolbar>
        <v-list lines="one" style="overflow-y: scroll; background: transparent;">
            <div v-for="(item,index) in filteredItems" :key="index">
                <v-list-item
                    :prepend-avatar= getIcon(item.type)
                    size="x-small"
                >
                    <div class="ml-0" style="width:fit-content;  display: flex; box-shadow:none !important; ">
                    {{ item.name }}
                    </div>
               
                   
                    <template v-slot:append >
                        <v-icon
                            variant="text"
                            density="compact"
                            @click="toggleClickedLayer(item.name,item.type)" 
                            style="margin-right:-15px"
                        >
                        {{item.checked?"mdi-eye-off-outline":"mdi-eye-outline"}}
                        </v-icon>
                       
                       
                        <v-menu >
                            <template v-slot:activator="{ props }">
                                <v-icon
                                    v-bind="props"
                                    variant="text"
                                    density="compact"
                                >
                                mdi-dots-vertical
                                </v-icon>
                            </template>

                            <v-list style="border-radius:8px;  border: 1px solid rgba(0, 0, 0, 0.2); ">
                                <v-list-item
                                    @click="showMetadata(item.metadata, item.name)"
                                >
                                    <template v-slot:prepend>
                                        <v-icon size="small" icon="mdi-information-outline"></v-icon>
                                        <v-list-item-title >Metadaten</v-list-item-title>
                                    </template>
                               
                                </v-list-item>
                                <v-list-item
                                    v-if="item.checked && item.type!=='Raster'"
                                    @click="getLayerExtentFromDB(item.name)"
                                >
                                    <template v-slot:prepend>
                                        <v-icon size="small" icon="mdi-magnify"></v-icon>
                                        <v-list-item-title>Zoom to Extent</v-list-item-title>
                                    </template>
                                </v-list-item>
                                <v-list-item
                                    v-if="item.checked"
                                    @click="activateStylePanel(item)"
                                >
                                    <template v-slot:prepend>
                                        <v-icon size="small" icon="mdi-palette-outline"></v-icon>
                                        <v-list-item-title>Style</v-list-item-title>
                                    </template>
                                </v-list-item>
                            </v-list>
                        </v-menu>
                        
                        
                        
                        
                    </template>

                </v-list-item>
                <v-divider class="mt-2 mb-2"></v-divider>
               
            </div>
           
        </v-list>
  
    </v-card>
</template>
<script setup>
import { ref, onMounted, defineEmits, computed} from "vue"
import {
    getTableNames, getGeoserverCoverageSources, getLayerExtent, /*createhexagonFunction*/
} from "../services/backend.calls";
import { useMetadataDialogStore } from '../stores/metadataDialog'
import { storeToRefs } from 'pinia'
import { useMenuStore } from '../stores/menu'
import { useLayerStyleStore } from '../stores/layerStyle'
import { useCartographyStore } from '../stores/cartography'
import { usePointStyleStore } from '../stores/pointStyle'
import { usePolygonStyleStore } from '../stores/polygonStyle'
import { useLineStyleStore } from '../stores/lineStyle'


let { activeMenu } = storeToRefs(useMenuStore())
let { tableNames } = storeToRefs(useLayerStyleStore())
let { circleStyleParams } = storeToRefs(usePointStyleStore())
let { polygonStyleParams } = storeToRefs(usePolygonStyleStore())
let { lineLayerSpecification, lineStyleParams } = storeToRefs(useLineStyleStore())

const cartographyStore = useCartographyStore()
const pointStyleStore = usePointStyleStore()
const polygonStyleStore = usePolygonStyleStore()
const lineStyleStore = useLineStyleStore()


let { layerSpecification } = storeToRefs(usePointStyleStore())
let { polygonLayerSpecification } = storeToRefs(usePolygonStyleStore())

const metadataDialogStore = useMetadataDialogStore();

let selectedItems = ref([]);
let layerType = ref(null)
let layerSearchText= ref("")
let style = ref(null)
let layout = ref(null)

const emit = defineEmits(["addLayerToMap", "toggleLayerVisibility",  "addCoverageLayerToMap", "toggleCoverageLayerVisibility", "fitBoundsToBBOX"]);



const toggleClickedLayer = (layerName, geomType) => {
    let index = tableNames.value.findIndex(obj => obj.name==layerName);
    tableNames.value[index].checked=!tableNames.value[index].checked
    // Trigger reactivity
    tableNames.value = [...tableNames.value];
    if (!selectedItems.value.includes(layerName)) {
    
        if (geomType == "MultiPolygon" || geomType == "Polygon" || geomType == "Geometry"){
            layout.value = {}
            style.value = {
               'fill-color': polygonStyleParams.value['fill-color'],
                "fill-opacity": polygonStyleParams.value['fill-opacity'],
                "fill-outline-color": polygonStyleParams.value['fill-outline-color'],
            }
            layerType.value = "fill"
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            layout.value = {}
            
            style.value = {
                'line-color':lineStyleParams.value['line-color'],
                "line-opacity": lineStyleParams.value["line-opacity"],
                "line-width": lineStyleParams.value["line-width"],
            }
            layerType.value = "line"
        }
        else if (geomType == "Point") {
            
            style.value = {
                'circle-color':circleStyleParams.value['circle-color'],
                'circle-opacity': circleStyleParams.value['circle-opacity'],
                'circle-radius': circleStyleParams.value['circle-radius'],
                'circle-stroke-color': circleStyleParams.value['circle-stroke-color'],
                'circle-stroke-width': circleStyleParams.value['circle-stroke-width'],
                'circle-blur': circleStyleParams.value['circle-blur']
            }
            layout.value = {}
            layerType.value = "circle"
        }
        else if (geomType == "Raster"){
            style.value = {
                'raster-opacity' : 1
            }
            layerType.value = "raster"
        }
        if (geomType=='Raster'){
            emit("addCoverageLayerToMap", layerName, layerType, style)
        }
        else {
            let layerSpecification = {
                layerNameInDatabase: layerName,
                id: layerName,
                style: style,
                layerType: layerType,
                sourceType: "vector_tile",
                layout: layout
            }
            emit("addLayerToMap", layerSpecification);
        }
        selectedItems.value.push(layerName);
    } 
    else {
        if (geomType=='Raster'){
            emit("toggleCoverageLayerVisibility", layerName)
        }
        else {
            emit("toggleLayerVisibility", layerName)
            if(tableNames.value[index]['sublayers']){
                for(let i in (tableNames.value[index]['sublayers'])){
                    emit("toggleLayerVisibility", tableNames.value[index]['sublayers'][i])
                }
            }
            
        }
    }

}
const sendQuestRequest = async () => {
    const tablenamesfromDB =  await getTableNames()
    
    for (let i in tablenamesfromDB) {
        tableNames.value.push(tablenamesfromDB[i]);

        // add new key and value per table name to track the checked status of each layer
        tableNames.value[i]["checked"]=false
        tableNames.value[i]["sublayers"]=[]
       
    }

}

const getIcon = (value)=> {
    if (value == "MultiPolygon" || value == "Polygon" || value == "Geometry"){
        return "polygon.png"
    }
    else if (value == "MultiLineString" || value == "LineString" || value == "Line") {
        return "line.png"
    }
    else if (value == "Point"){
        return "point.png"
    }
    else if (value == "Raster") {
        return "raster.png" 
    }
    else {
        return "raster.png" 
    }
}

const clearSearch =()=>{
    layerSearchText.value = "";
}

const showMetadata = (metadata, tablename) => {
    metadataDialogStore.assignMetadata(metadata, tablename)
}
const filteredItems = computed(() => {
    if (!layerSearchText.value) {
        return tableNames.value;
    }

    return tableNames.value.filter(item =>
        item.name.toLowerCase().includes(layerSearchText.value.toLowerCase())
    )
  
});

const readGeoserverCoverageSources = async ()=> {
    const response =  await getGeoserverCoverageSources()
    for (let i in response.coverageStores.coverageStore) {
        tableNames.value.push({"name": response.coverageStores.coverageStore[i].name,
        "type": "Raster",
        "checked": false
        });
    }
}

const getLayerExtentFromDB = async(layerName) =>{
    const layerExtent =  await getLayerExtent(layerName)
    emit("fitBoundsToBBOX", [layerExtent['x-min'], layerExtent['y-min'], layerExtent['x-max'], layerExtent['y-max']])
}

const activateStylePanel = async (item)=>{
    cartographyStore.setVisibility({catographyUIVisibility:true, geomTtype: item.type})
    if(item.type==='Point'){
        layerSpecification.value=item
        pointStyleStore.addLayerStyle(item.name)
        
    }
    else if (item.type == "MultiPolygon" || item.type == "Polygon" || item.type == "Geometry"){
        polygonLayerSpecification.value=item
        polygonStyleStore.addLayerStyle(item.name)
    }
    else if(item.type == "MultiLineString" || item.type == "LineString" || item.type == "Line"){
        lineLayerSpecification.value=item
        lineStyleStore.addLayerStyle(item.name)
    }
   
   

}
onMounted(() => {
  sendQuestRequest();
  readGeoserverCoverageSources()
})

</script>

<style scoped>
.layer-ui{
    overflow-y: scroll; background: transparent; border-radius: 8px;  position: absolute;
    top: 62px;
    left: 10px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}
.sticky{
    position: sticky;
    top: 0;
    z-index: 1;
}
.form-switch .form-check-input {width: 4em; height: 2em;}

</style>