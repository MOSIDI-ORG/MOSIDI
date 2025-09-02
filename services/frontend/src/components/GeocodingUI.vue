<template>
    <div class="geocoding-ui" v-if= "activeMenu === 'geocoding'">
        <v-card
                class="mx-auto"
                color="surface-light"
                width="400"
            >

                <v-text-field
                    placeholder= "Suche nach Orten"
                    filled
                    density="compact"
                    variant="solo"
                    prepend-inner-icon="mdi-magnify"
                    class="expanding-search"
                    hide-details
                    v-model="searchtext"
                    @update:modelValue="geocode()"
                    clear-icon="mdi-close"
                    clearable
                    @click:clear="removeGeocodedLayer"               

                >

            </v-text-field>
        </v-card>
            <v-list v-if="geoJson && searchtext" style= "margin-top:5px; width: 400px; border-radius: 5px">
                <div v-for="(item, i) in geoJson?.features" :key="i" >

                    <v-list-item
                        :value="item"
                        @click="addAddressToMap(item)"
                        :prepend-avatar= getIcon(item.geometry.type)
                        size="x-small"    
                    >
                        <v-list-item-title v-text="item.properties.display_name"></v-list-item-title>
                        
                    </v-list-item>
                    <v-divider style="margin-left: 15px; margin-right: 15px;" class="mt-0 mb-0"></v-divider>
                </div>  
            </v-list>
            
        
       
    </div>
    
  </template>
  
  <script setup>
    import { useMenuStore } from '../stores/menu'
    import { storeToRefs } from 'pinia'
    import { ref,  defineEmits, watch } from "vue"
    import { useLayerStyleStore } from '../stores/layerStyle'

    let { styles } = storeToRefs(useLayerStyleStore())
    let style = ref(null)
    let layerType = ref(null)
    const emit = defineEmits(["addAddressToMap", "removeLayerFromMap"]);

    let searchtext = ref(null)
    let geoJson = ref(null)

    let { activeMenu } = storeToRefs(useMenuStore())
    

    const geocode = async ()=>{
        try {
            const request =
            `https://nominatim.openstreetmap.org/search?q=${
                searchtext.value
            }&format=geojson&polygon_geojson=1&addressdetails=1&limit=3`;
            const response = await fetch(request);
            const geojson = await response.json();
           
            geoJson.value= geojson
        }
        catch (e){
            console.error(`Failed to forwardGeocode with error: ${e}`);
        }
       
    }

    const addAddressToMap = (item) =>{
        let geomType = item.geometry.type
        if (geomType == "MultiPolygon" || geomType == "Polygon"){
            layerType.value="fill"
            style.value = styles.value.polygon
        }
        else if (geomType == "MultiLineString" || geomType == "LineString" || geomType == "Line"){
            layerType.value="line"
            style.value = styles.value.line
        }
        else if (geomType == "Point"){
            layerType.value="circle"
            style.value = styles.value.point
        }
   
        let layerSpecification = {
            id: 'geocoded_address',
            style: style,
            layerType: layerType,
            geoGjsonData:item,
            sourceType: "geojson"
        }
        emit("addAddressToMap", layerSpecification);
        searchtext.value = item.properties.display_name
        geoJson.value = null
    }
    const removeGeocodedLayer = () => {
        emit("removeLayerFromMap",  {layerId:  'geocoded_address', sourceId: 'geocoded_address'})
    }


    const getIcon = (value)=> {
        if (value == "MultiPolygon" || value == "Polygon"){
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

    watch(() => activeMenu.value, () =>{
        if (activeMenu!=="geocoding"){
            removeGeocodedLayer()
            searchtext.value = null
        }
    })



  </script>

<style scoped>
.menue-ui .v-btn {
  min-width: 36px;
  width: 36px;
}
.menue-ui .v-btn::before{
  background-color: transparent;
}

.menue-ui  .v-btn i:hover{
  transform: scale(1.15);
}



.v-input__control {
    height: 35px;
    justify-content: center;
}


.geocoding-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;  position: absolute;
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


     /* Center icon and input vertically */
.expanding-search .v-input__control {
  align-items: center;
}


.mdi-magnify::before {
    content: "\F0349";
    margin-bottom: 10px;
}

.v-label .v-field-label {
    margin-bottom: 10px;
}
::v-deep .v-field.v-field--prepended {
    height: 36px;
}



</style>