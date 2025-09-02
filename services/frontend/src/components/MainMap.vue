<template>
  <v-app>

    <div ref="mapContainer" style="height: 100dvh; z-index: 0;" id="mainmap">
      <AppLogo> </AppLogo>
      <LayerUI @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @addCoverageLayerToMap="addCoverageLayerToMap" @toggleCoverageLayerVisibility="toggleCoverageLayerVisibility" @fitBoundsToBBOX="fitBoundsToBBOX" > </LayerUI>
      <!--<IndicatorUI @addStyleExpressionByYear="addStyleExpressionByYear"  @addLayerToMap="addLayerToMap" @toggleLayerVisibility="toggleLayerVisibility" @removeLayerFromMap="removeLayerFromMap" @addDeckglLayer="addDeckglLayer" @updateDeckglLayer="updateDeckglLayer" > </IndicatorUI>-->
      <LegendUI @setFilterForLegendInteraction="setFilterForLegendInteraction" @resetFilter="resetFilter" @zoomIn="zoomIn" @zoomOut="zoomOut" @addLayerToMap="addLayerToMap" @removeLayerFromMap="removeLayerFromMap" @fitBoundsToBBOX="fitBoundsToBBOX"></LegendUI>
      <!--<MenuUI @addLayerToMap="addLayerToMap"  @removeLayerFromMap="removeLayerFromMap" @fitBoundsToBBOX="fitBoundsToBBOX"></MenuUI>-->
      <!--<TimeSliderUI @performTimeSlider="performTimeSlider"></TimeSliderUI>-->
      <AppHeader @addLayerToMap="addLayerToMap"  @removeLayerFromMap="removeLayerFromMap" @fitBoundsToBBOX="fitBoundsToBBOX"></AppHeader>
       <!--<CartographyUI v-if="catographyUIVisibility==true" @setLayerPintProperty="setLayerPintProperty"  @addLayerToMap="addLayerToMap" @setLayerLayoutProperty="setLayerLayoutProperty" @removeLayerFromMap="removeLayerFromMap" @setLayerZoomrange="setLayerZoomrange"></CartographyUI>-->
      <DatasetSearchUI @updateDeckglLayer="updateDeckglLayer" @addDeckglLayer="addDeckglLayer" @moveLayerToTop="moveLayerToTop" @toggleLayerVisibilityWithValue="toggleLayerVisibilityWithValue" @setLayerPintProperty="setLayerPintProperty" @setLayerLayoutProperty="setLayerLayoutProperty"  @addLayerToMap="addLayerToMap" @fitBoundsToBBOX="fitBoundsToBBOX" @toggleLayerVisibility="toggleLayerVisibility" @removeLayerFromMap="removeLayerFromMap" @addStyleExpressionByYear="addStyleExpressionByYear" @addExternaWMSLayerToMap="addExternaWMSLayerToMap"></DatasetSearchUI>
    </div>
  </v-app>
  <MetadataDialog> </MetadataDialog>
  <AlertUI> </AlertUI>
  <MapExport> </MapExport>
  <ProgressUI> </ProgressUI>
  
</template>

<script setup>
import { Map,/*Popup*/ AttributionControl} from 'maplibre-gl';
import { ref, onMounted, onUnmounted } from "vue";
import { storeToRefs } from 'pinia'
import { useMapStore } from '../stores/map'
import AppLogo from "@/components/AppLogo.vue";
import LayerUI from "@/components/LayerUI.vue";
//import IndicatorUI from "@/components/IndicatorUI.vue";
import LegendUI from "@/components/LegendUI.vue";
//import MenuUI from "@/components/MenuUI.vue";
import MetadataDialog from "@/components/MetadataDialog.vue";
import AlertUI from "@/components/AlertUI.vue";
import MapExport from "@/components/MapExport.vue";
import ProgressUI from "@/components/ProgressUI.vue";
//import TimeSliderUI from "@/components/TimeSliderUI.vue";
import AppHeader from "@/components/AppHeader.vue";
//import CartographyUI from "@/components/CartographyUI.vue";
import DatasetSearchUI from "@/components/DatasetSearchUI.vue";

import { addPopupToMap, addHoverPopup, removeHoverPopup, addWMSLayerFromExternalProvider/*addWMSLayerToMap, toggleWMSLayerVisibility*/ } from '../utils/mapUtils';
import { useChartStore } from '../stores/chart'
//import { useCartographyStore } from '../stores/cartography'

import { setMapFilterForLegendInteraction } from '../utils/setMapFilterForLegendInteraction';
import { MapboxOverlay } from '@deck.gl/mapbox';
import { ColumnLayer } from '@deck.gl/layers'

const { center, zoom, style, pitch } = storeToRefs(useMapStore())
let { selectedFeature } = storeToRefs(useChartStore())
//let { catographyUIVisibility } = storeToRefs(useCartographyStore())
const mapContainer = ref(null);

let vectorServer = process.env.VUE_APP_GEOSERVER_URL+'/';
let map = null;
let selectedFeatureId = null;
let mapboxOverlayLayer = ref(null)


onMounted(() => {

  map = new Map({
    container: mapContainer.value,
    style: style.value,
    center: center.value,
    zoom: zoom.value,
    pitch: pitch.value,
    preserveDrawingBuffer: true,
    attributionControl: false
  });
  map.addControl(new AttributionControl({
    customAttribution: '<a href="https://www.fh-potsdam.de/impressum" target="_blank">© Legal Note</a> <a href="https://www.fh-potsdam.de/datenschutz" target="_blank">© Privacy statement</a>',
    compact: true,

  }), 'bottom-left');
  console.log("Map initialized!!")
})

const addLayerToMap = (layerSpecification)=>{
  let vectorSourceLayer = layerSpecification.layerNameInDatabase;
  let vectorUrl = vectorServer + 'gwc/service/tms/1.0.0/brandenburg:' + vectorSourceLayer + '@EPSG%3A900913@pbf/{z}/{x}/{y}.pbf';
  if(map.getSource(layerSpecification.id)==undefined){
    if(layerSpecification.sourceType== "vector_tile"){
      map.addSource(layerSpecification.id, {
          "type": "vector",
          "scheme": 'tms',
          "tiles": [vectorUrl],
          "promoteId":'id',
          "minzoom": 0,
          "maxzoom": 22
      });
      let layer = {
          "id": layerSpecification.id,
          "source": layerSpecification.id,
          "source-layer": vectorSourceLayer,
          "type": layerSpecification.layerType.value,
          "paint":  layerSpecification.style.value,
          "layout":layerSpecification.layout.value
      };
      map.addLayer(layer)
    }
    else if (layerSpecification.sourceType== "geojson") {
      map.addSource(layerSpecification.id, {
        'type': 'geojson',
        'data': layerSpecification.geoGjsonData
       
      });
      let layer = {
          "id": layerSpecification.id,
          "source": layerSpecification.id,
         
          "type": layerSpecification.layerType.value,
          "paint":  layerSpecification.style.value,
          'layout': {}
      };
      map.addLayer(layer)  
    }
 
      
   
  }
  map.on('click', layerSpecification.id, function(e) {
    if (layerSpecification.id.includes('kommunales_gebiet_dashboard') || layerSpecification.id == 'kommunales_gebiet_centroid'){
      selectedFeature.value = {
        layerId:  layerSpecification.id,
        featureId: e.features[0].properties.nationalco,
        featureName: e.features[0].properties.gen
      }
      removeLayerFromMap( {layerId: "highlight", sourceId: "highlight"})
      map.addSource( "highlight",{"type": "geojson", data: e.features[0]} )
      map.addLayer({
        'id': 'highlight',
        'type': layerSpecification.id.includes('kommunales_gebiet_dashboard') ? 'line': 'circle',
        'source': 'highlight',
        'paint': layerSpecification.id.includes('kommunales_gebiet_dashboard')? {
          'line-color': '#888',
          'line-width': 3,
          "line-dasharray": [0.5, 2],
        }: {
          'circle-color': '#00FF00',
          'circle-stroke-color':  '#888',
          'circle-stroke-width': 3,
          'circle-opacity': 1,
          'circle-radius':e.features[0].layer.paint['circle-radius']

        },
        'layout': layerSpecification.id.includes('kommunales_gebiet_dashboard')? {
          'line-cap': 'round',
         
        }: {
          

        },
      });
      
    }
    
    else {
      addPopupToMap(map, layerSpecification.id, vectorSourceLayer, selectedFeatureId, e)
    }
    
  });

  map.on('mouseenter', layerSpecification.id, function() {
    map.getCanvas().style.cursor = 'pointer';
  });
  map.on('mouseleave', layerSpecification.id, function() {
    map.getCanvas().style.cursor = '';
  });

  map.on('mousemove', 'kommunales_gebiet_dashboard', (e) =>{
    addHoverPopup(map, e)
  })
  map.on('mouseleave', 'kommunales_gebiet_dashboard', () => {
    removeHoverPopup(map)
  });
 
}

const addStyleExpressionByYear = (layerId, styleProperty, fillStyle)=>{   
  map.setPaintProperty(
    layerId,
    styleProperty,
    fillStyle
  );
  
}
const setLayerPintProperty = (layerId, styleProperty, fillStyle)=>{
  map.setPaintProperty(
    layerId,
    styleProperty,
    fillStyle
  );
}
const setLayerLayoutProperty = (layerId, layoutProperty, layoutValue)=>{
  map.setLayoutProperty(
    layerId,
    layoutProperty,
    layoutValue
  );
}
/*const setLayerZoomrange = (layerId, minZoom, maxZoom)=>{
  map.setLayerZoomRange(layerId, minZoom, maxZoom);
}*/

const toggleLayerVisibility = (clickedLayerName)=>{
  if(map.getSource(clickedLayerName)!=undefined){
      let visibility = map.getLayoutProperty(
        clickedLayerName,
        'visibility'
        );

      if (visibility == 'visible'){
        map.setLayoutProperty(clickedLayerName,'visibility', 'none')
      }
      else if (visibility == undefined){
        map.setLayoutProperty(clickedLayerName,'visibility', 'none')
      }
      else {
        map.setLayoutProperty(clickedLayerName,'visibility', 'visible')
      }

  }
   
}
const toggleLayerVisibilityWithValue = (clickedLayerName, visValue)=>{
  if(map.getSource(clickedLayerName)!=undefined){
     
        map.setLayoutProperty(clickedLayerName,'visibility', visValue)
     
  }
}
/*const addCoverageLayerToMap = (clickedLayerName, layerType, style) =>{
  addWMSLayerToMap(map, clickedLayerName, layerType, style)
}*/
/*const toggleCoverageLayerVisibility = (clickedLayerName)=>{
  toggleWMSLayerVisibility(map, clickedLayerName)
}*/

const addExternaWMSLayerToMap = (layerSpecification)=>{
  addWMSLayerFromExternalProvider(map, layerSpecification)
}
const setFilterForLegendInteraction = (payload) => {
  setMapFilterForLegendInteraction(map, payload)
}

const resetFilter = (payload) => {
  let mapLayer = map.getLayer(payload.layerId);
  if(typeof mapLayer !== 'undefined') {
    map.setFilter(payload.layerId, null);
  }
 
}

const removeLayerFromMap = (payload) => {
  
  let mapLayer = map.getLayer(payload.layerId);
  if(typeof mapLayer !== 'undefined') {
    map.removeLayer(payload.layerId).removeSource(payload.sourceId);
  }
}



const fitBoundsToBBOX = (bbox)=>{
  map.fitBounds([
    [bbox[0], bbox[1]], // [lng, lat] - southwestern corner of the bounds
    [bbox[2], bbox[3]] // [lng, lat] - northeastern corner of the bounds
  ]);
}
function convertRange( value, r1, r2 ) { 
    return ( value - r1[0] ) * (r2[1] - r2[0]) / (r1[1] - r1[0]) + r2[0];
}
const addDeckglLayer = (data, style) => {
  

  const values = data.features.map(f => f.properties.calculatedWert);
  // Filter out non-numeric values
  const numericValues = values.filter(value => typeof value === 'number' && !isNaN(value) && value !== Infinity && value !== undefined);

  let min
  let max
  if (numericValues.length > 0) {
     min = Math.min(...numericValues);
     max = Math.max(...numericValues);
  }
  
  mapboxOverlayLayer.value = new MapboxOverlay({
    interleaved: true,
    layers: [
      new ColumnLayer({
        id: "custom-indicator-layer",
        data: data.features,
        getPosition: f => f.geometry.coordinates,
        pickable: false,
        visible: true,
        radius: 1000,
        extruded: true,
        coverage: 1,
        upperPercentile: 100,
        autoHighlight: true,
        elevationRange: [0, 3000],
        getFillColor: f => style(f.properties.calculatedWert),
        elevationScale: 100,
        getElevation: d => convertRange(d.properties.calculatedWert, [ min, max ], [ 0, 2000 ]),
        transitions: {
          getElevation: {duration: 1000, enter: () => [0]},
        }        
      })
    ]
  });
  map.addControl(mapboxOverlayLayer.value);
  let current_pitch = map.getPitch()
  if (current_pitch==0){
    map.easeTo({
      speed: 0.4,
      curve: 1,
      duration: 1000,
      pitch: 40,
      easing(t) {
          return t;
      }
    });
  }
  
}

const updateDeckglLayer = (data, style) =>{
  if (mapboxOverlayLayer.value ) {
    map.removeControl(mapboxOverlayLayer.value);
    addDeckglLayer(data, style);
  }

}
/*const performTimeSlider = (data)=>{
  addStyleExpressionByYear(data.layer, data.paint_property, data.expression)
}*/

const moveLayerToTop = (layerId)=>{
  if (map.getLayer(layerId)) {
        // Move the layer to the top
        map.moveLayer(layerId);
    } else {
        console.error(`Layer with ID '${layerId}' does not exist.`);
    }
}

onUnmounted(() => {
  if (map) {
    map.remove();
  }
});
const zoomIn = ()=>{
  const currentZoom = map.getZoom();
  map.zoomTo(currentZoom + 0.5);
}
const zoomOut = ()=>{
  const currentZoom = map.getZoom();
  map.zoomTo(currentZoom - 0.5);
}

</script>

<style scoped>
  ::v-deep .maplibregl-popup-content {
    border-radius:10px;
    background: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    animation: easeOutElastic 0.5s;
    border: 1px solid rgba(0, 0, 0, 0.2);   
  }
  @keyframes easeOutElastic {
  0% {
    transform: scale(0.98);
  }
  20% {
    transform: scale(1);
  }
  40% {
    transform: scale(0.99);
  }
  60% {
    transform: scale(1);
  }
  80% {
    transform: scale(0.999);
  }
  100% {
    transform: scale(1);
  }
}



</style>