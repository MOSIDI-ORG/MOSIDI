import { defineStore } from 'pinia'

export const useaddedDatasetsStore = defineStore ({
    id: 'addedDatasets',
    state: () => ({
        addedLayers: {},
        readyForCartography: false
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
            else {
              // TODO: improve handling of granularity in SensorThings
              if (granularity != undefined && granularity != "") {
                compositeKey = `${layerName}_${granularity}`;
              } else {
                compositeKey = layerName;
              }
              
            }
            this.addedLayers[compositeKey] = { ...metadata, checked: true };

            for (const key in this.addedLayers) {
              if (key !== compositeKey && this.addedLayers[key].dct_type === 'indikator') {
                this.addedLayers[key].checked = false;
              }
            }
            
          },
          declareReadyToCartographyDeepLink() {
            this.readyForCartography = true;
          }
    }
})