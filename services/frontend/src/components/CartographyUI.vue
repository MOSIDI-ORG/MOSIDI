<template>
    
    <v-card class="mx-auto cartography-ui"  width="100%">
      
        <PointStyleUI v-if="geomTtype==='Point'" @setLayerPintProperty="setLayerPintProperty" @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></PointStyleUI>
        <PolygonStyleUI v-if="geomTtype == 'MultiPolygon' || geomTtype == 'Polygon' || geomTtype == 'Geometry'" @setLayerPintProperty="setLayerPintProperty" @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></PolygonStyleUI>
        <LineStyleUI v-if="geomTtype == 'MultiLineString' || geomTtype == 'LineString' || geomTtype == 'Line'" @setLayerPintProperty="setLayerPintProperty" @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></LineStyleUI>
        <RasterStyleUI  v-if="geomTtype == 'raster'" @setLayerPintProperty="setLayerPintProperty"></RasterStyleUI>
    
    </v-card>    
    
          
    </template>
    <script setup>
    import PointStyleUI from './PointStyleUI.vue'
    import PolygonStyleUI from './PolygonStyleUI.vue'
    import LineStyleUI from './LineStyleUI.vue'
    import RasterStyleUI from './RasterStyleUI.vue'
    import { defineEmits } from "vue"
    import { storeToRefs } from 'pinia'

    import { useCartographyStore } from '../stores/cartography'
    let { geomTtype } = storeToRefs(useCartographyStore())
    const emit = defineEmits(["setLayerPintProperty", "addLayerToMap", "setLayerLayoutProperty", "removeLayerFromMap"]); 

    const setLayerPintProperty = (layerId, styleProperty, fillStyle)=>{
        emit("setLayerPintProperty", layerId, styleProperty, fillStyle)
    }
    const addLayerToMap = (layerSpecifications)=>{
        emit("addLayerToMap",layerSpecifications )
    }
    const setLayerLayoutProperty = (layerId, layoutProperty, layoutValue)=>{
        emit("setLayerLayoutProperty",layerId, layoutProperty, layoutValue )
    }
    const removeLayerFromMap = (payload)=>{
        emit("removeLayerFromMap",payload)
    }
    const setLayerZoomrange = (layerId, minZoom, maxZoom)=>{
        emit("setLayerZoomrange",layerId, minZoom, maxZoom)
    }
    </script>
    
    <style scoped>
    .cartography-ui{
        overflow-y: scroll;
        background: transparent;
        border-radius: 8px;
        position: relative;
        background-color: rgba(255,255,255,0.6);
        backdrop-filter: blur(5px);
        -webkit-backdrop-filter: blur(5px);
        -moz-backdrop-filter: blur(5px);
        -ms-backdrop-filter: blur(5px);
        border: 1px solid rgba(0, 0, 0, 0.2); 
  
        
    }
    
    
    
    </style>