import { Popup } from 'maplibre-gl';
import { useChartStore } from '../stores/chart'
import { getObservations } from '@/services/frost.service';

import { createHTMLAttributeTable } from './createHTMLAttributeTable';
let popup = null
let hoverpopup = null

/**
 * Add Popup on Map for SensorThings Objects
 * @param {*} map maplibre instance to add Popup to
 * @param {*} coordinates coordinates of the clicked object on the map
 * @param {*} popupData data to display in popup (object with key-value-pairs)
 */
export function addSensorThingsPopupToMap(map, coordinates, popupData) {
  popup?.remove();
  popup = new Popup({ closeOnClick: true });

  popup.setLngLat(coordinates);
  popup.setDOMContent(createHTMLAttributeTable(
    coordinates[0],
    coordinates[1],
    popupData
  ));
  popup.addTo(map);
}

export function addPopupToMap(map, layerId, vectorSourceLayer, selectedFeatureId, e) {

    popup?.remove();
    popup = new Popup({ closeOnClick: true });

    const coordinates = [e.lngLat.lng, e.lngLat.lat];
    popup.setLngLat(coordinates);
    const chartStore = useChartStore()
    e.features[0].properties = {
        indikator: chartStore?.selectedFeature?.indikator,
        ...(chartStore?.selectedFeature?.year != null ? { year: chartStore.selectedFeature.year } : {}),
        value: chartStore?.selectedFeature?.value,
        ...(chartStore?.selectedFeature?.indikator2 != null ? { indikator2: chartStore.selectedFeature.indikator2 } : {}),
        ...(chartStore?.selectedFeature?.value2 != null ? { value2: chartStore.selectedFeature.value2 } : {}),
        ...(chartStore?.selectedFeature?.year2 != null ? { year2: chartStore.selectedFeature.year2 } : {}),
        ...e.features[0].properties,
    }
    popup.setDOMContent(
    createHTMLAttributeTable(
        e.lngLat.lng,
        e.lngLat.lat,
        e.features[0].properties
    )
    );
    popup.addTo(map);
    

    popup.on("close", () => {
        if (selectedFeatureId) {
            map.removeFeatureState({
                source: layerId,
                sourceLayer: vectorSourceLayer,
                id: selectedFeatureId
            });
        }
    })
}

export function addHoverPopup (map, e) {
    if (hoverpopup == null){
        hoverpopup = new Popup({ closeOnClick: false, closeButton: false });
    }
    
    const coordinates = [e.lngLat.lng, e.lngLat.lat];
    const description = e.features[0].properties.name;
    hoverpopup.setLngLat(coordinates).setHTML(description).addTo(map);
}

export function removeHoverPopup (map) {
    map.getCanvas().style.cursor = '';
    hoverpopup?.remove();
}

export function addWMSLayerToMap (map, clickedLayerName, layerType, style) {
    let geoserver_base_url= process.env.VUE_APP_GEOSERVER_URL
    map.addSource(clickedLayerName, {
        'type': layerType.value,
        'tiles': [
        geoserver_base_url+'/brandenburg/wms?BBOX={bbox-epsg-3857}&SERVICE=WMS&REQUEST=GetMap&CRS=EPSG:3857&WIDTH=256&HEIGHT=256&LAYERS=brandenburg:'+clickedLayerName+'&FORMAT=image/PNG&transparent=true'
        ],
        'tileSize': 256
    });
    map.addLayer({
        'id': clickedLayerName,
        'type': layerType.value,
        'source': clickedLayerName,
        'paint': style.value
        }
    );

    let layer = map.getLayer('road_major');

    if(typeof layer !== 'undefined') {

        map.moveLayer(clickedLayerName, 'road_major');
    }
}

export function toggleWMSLayerVisibility (map, clickedLayerName) {
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

export function addWMSLayerFromExternalProvider (map, item) {
    map.addSource(item.dct_title, {
        'type':item.dct_type,
        tiles: [item.url+
            '?SERVICE=WMS' +
            '&VERSION=1.1.1' +
            '&REQUEST=GetMap' +
            '&FORMAT=image/png' +
            '&TRANSPARENT=true' +
            '&STYLES=' +
            `&LAYERS=${item.layer}` +
            '&SRS=EPSG:3857' +
            '&WIDTH=256' +
            '&HEIGHT=256' +
            '&BBOX={bbox-epsg-3857}'

        ],
        'tileSize': 256
    });
    map.addLayer({
        'id': item.dct_title,
        'type': item.dct_type,
        'source': item.dct_title,
        'paint':{
            'raster-fade-duration': 1000,
            'raster-opacity': 1,
            'raster-saturation': 0,
            'raster-contrast':0
        }
        }
    );

    let layer = map.getLayer('road_major');

    if(typeof layer !== 'undefined') {

        map.moveLayer(item.dct_title, 'road_major');
    }
}
export function getSelectedFeatureInfo(e, layerSpecification, indicatorArray) {
  const selectedIndicatorName = layerSpecification.id.replace('kommunales_gebiet_dashboard', '');
  let iteValue, itemYear, secondIndicatorName, secondItemValue, secondItemYear;

  const indicatorData = indicatorArray.value[selectedIndicatorName];

  if (indicatorData.secondIndicatorName != null) {
    // --- Main indicator ---
    iteValue = indicatorData[0][0]
      .filter(item =>
        item.kennziffer === e.features[0].properties.nationalco &&
        item.zeitbezug == indicatorData.selectedYear
      )[0]?.wert;
    itemYear = indicatorData.selectedYear;

    // --- Second indicator ---
    secondItemValue = indicatorData.secondIndicator.secondIndicator[0][0]
      .filter(item =>
        item.kennziffer === e.features[0].properties.nationalco &&
        item.zeitbezug == indicatorData.secondIndicator.secondSelectedYear
      )[0]?.wert;

    secondIndicatorName = indicatorData.secondIndicatorName;
    secondItemYear = indicatorData.secondIndicator.secondSelectedYear;


    return {
      layerId: layerSpecification.id,
      featureId: e.features[0].properties.nationalco,
      featureName: e.features[0].properties.gen,
      indikator: selectedIndicatorName,
      year: itemYear,
      value: iteValue,
      indikator2: secondIndicatorName,
      year2: secondItemYear,
      value2: secondItemValue
    };
  }

  // --- Single indicator ---
  if (indicatorData.type === 'indikator') {
    iteValue = indicatorData[0][0]
      .filter(item =>
        item.kennziffer === e.features[0].properties.nationalco &&
        item.zeitbezug == indicatorData.selectedYear
      )[0]?.wert;

    itemYear = indicatorData.selectedYear;
  } else if (indicatorData.type === 'custom indikator') {
    iteValue = indicatorData[0][0]
      .filter(item => item.kennziffer === e.features[0].properties.nationalco)[0]
      ?.calculatedWert;

    itemYear = null;
  }

  return {
    layerId: layerSpecification.id,
    featureId: e.features[0].properties.nationalco,
    featureName: e.features[0].properties.gen,
    indikator: selectedIndicatorName,
    year: itemYear,
    value: iteValue
  };
}

/**
 * Adds zoom event to a clustering layer
 * @param {*} map mapLibre instance
 * @param {*} layerName name of the (clustering) layer to zoom in on
 * @param {*} sourceName name of the source the layer is assigned to
 */
export function addZoomOnClusterLayer(map, layerName, sourceName) {
  map.on('click', layerName, async (e) => {
    const features = map.queryRenderedFeatures(e.point, {
        layers: [layerName]
    });
    const clusterId = features[0].properties.cluster_id;
    const source = await map.getSource(sourceName);
    source.getClusterExpansionZoom(clusterId, (err, zoom) => {
      if (err || zoom === undefined) {
        console.error('Zoom error', err, zoom);
        return;
      }

      map.easeTo({
        center: features[0].geometry.coordinates,
        zoom: zoom
      });
    });
  });
}

/**
 * Adds on click event to layer to show popup info and trigger display of chart
 * @param {*} map mapLibre instance
 * @param {*} layerName name of the layer to add onClick event to
 * @param {*} selectedFeature reference to selectedFeature from chartStore (to trigger display of chart)
 */
export function addOnClickSensorThingsLayer(map, layerName, selectedFeature) {
  map.on('click', layerName, async (e) => {
    const coordinates = e.features[0].geometry.coordinates.slice();

    // Use Bracket Notation to access the Id
    const datastreamId = e.features[0].properties['Datastreams/0/@iot.id'];
    const datastreamName = e.features[0].properties['Datastreams/0/name'];
    const unitOfMeasurement = e.features[0].properties['Datastreams/0/unitOfMeasurement/symbol'];
    const description = e.features[0].properties['description'];
    const lastResult = e.features[0].properties['Datastreams/0/Observations/0/result'];
    const lastResultTimestamp = e.features[0].properties['Datastreams/0/Observations/0/phenomenonTime'];
    const locationName = e.features[0].properties.name;

    const observations = await getObservations(datastreamId);

    selectedFeature.value = {
      featureName: locationName,
      indicator: datastreamName,
      layerId: 'SensorThings',
      datastreamId: datastreamId,
      observations: observations,
      unitOfMeasurement: unitOfMeasurement
    }

    const popupData = {
      Ort: locationName, 
      Datastream: datastreamName, 
      Beschreibung: description,
      'Letzte Messung': lastResult + unitOfMeasurement, 
      'Gemessen am': lastResultTimestamp
    };
    
    addSensorThingsPopupToMap(map, coordinates, popupData);
  });
}

/**
 * Adds cursor style for mouse enter and leave event when hovering over a layer on a map
 * @param {*} map mapLibre instance
 * @param {*} layerName name of the layer to add the events to
 */
export function addCursorStyleHovering(map, layerName) {
  map.on('mouseenter', layerName, function() {
    map.getCanvas().style.cursor = 'pointer';
  });

  map.on('mouseleave', layerName, function() {
    map.getCanvas().style.cursor = '';
  });
}