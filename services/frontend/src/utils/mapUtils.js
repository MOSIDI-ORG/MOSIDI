import { Popup } from 'maplibre-gl';
import { createHTMLAttributeTable } from './createHTMLAttributeTable';
let popup = null
let hoverpopup = null

export function addPopupToMap(map, layerId, vectorSourceLayer, selectedFeatureId, e) {

    popup?.remove();
    popup = new Popup({ closeOnClick: true });

    const coordinates = [e.lngLat.lng, e.lngLat.lat];
    popup.setLngLat(coordinates);
    popup.setDOMContent(
    createHTMLAttributeTable(
        e.lngLat.lng,
        e.lngLat.lat,
        e.features[0].properties
    )
    );
    popup.addTo(map);
    if (e.features.length > 0) {
        if (selectedFeatureId) {
            map.removeFeatureState({
            source: layerId,
            sourceLayer: vectorSourceLayer,
            id: selectedFeatureId
            });
        }

        selectedFeatureId = e.features[0].id;

        map.setFeatureState({
            source: layerId,
            sourceLayer: vectorSourceLayer,
            id: selectedFeatureId,
        }, {
            clicked: true
        });
    }

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