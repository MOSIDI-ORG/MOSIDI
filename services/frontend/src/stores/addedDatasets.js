import { DatasetTypes } from '@/utils/datasetTypes';
import { defineStore } from 'pinia'

export const useaddedDatasetsStore = defineStore ({
    id: 'addedDatasets',
    state: () => ({
        addedLayers: {},
        readyForCartography: false,
        addedExternallayers: {},
    }),
    actions: {
        addLayer(payload) {
            const { layerName, metadata } = payload;
            if (!layerName || !metadata) {
              console.error('Invalid payload: missing layerName or metadata');
              return;
            }
            const granularity = metadata.dcatde_politicalgeocodingleveluri ?? '';
            let compositeKey
            if (metadata.dct_type=='raster'){
              compositeKey = `${layerName}`;
            }
            else if(metadata.dct_type=='custom indikator'){
              compositeKey = `${layerName}`;
            }
            else if(metadata.dct_type==DatasetTypes.SensorThings){
              compositeKey = `${layerName}`;
            }
            else {

              compositeKey = `${layerName}_${granularity}`;
            }
            this.addedLayers[compositeKey] = { ...metadata, checked: true };

            for (const key in this.addedLayers) {
              if (key !== compositeKey && this.addedLayers[key].dct_type === 'indikator') {
                this.addedLayers[key].checked = false;
              }
            }
            
          },
          removeLayer(layerName) {
            if (!layerName) return;

            if (this.addedLayers[layerName]) {
              delete this.addedLayers[layerName];
            }
          },
          removeExternallayer(layerName){
            if (!layerName) return;

            if (this.addedExternallayers[layerName]) {
              delete this.addedExternallayers[layerName];
            }
          },
          declareReadyToCartographyDeepLink() {
            this.readyForCartography = true;
          },
          addExternalLayer (payload){
            const { layerName, metadata } = payload;
            if (!layerName || !metadata) {
              console.error('Invalid payload: missing layerName or metadata');
              return;
            }
            let compositeKey
            if (metadata.dct_type=='raster'){
              compositeKey = `${layerName}`;
            }
            
            else {

              compositeKey = `${layerName}`;
            }
            this.addedExternallayers[compositeKey] = { ...metadata, checked: true };

            /*for (const key in this.addedExternallayers) {
              if (key !== compositeKey && this.addedExternallayers[key].dct_type === 'geojson') {
                this.addedExternallayers[key].checked = false;
              }
            }*/
          }
    }
})