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
            const granularity = metadata.dcatde_politicalgeocodingleveluri ?? 'unknown';
            const compositeKey = `${layerName}_${granularity}`;
            this.addedLayers[compositeKey] = { ...metadata, checked: true };

            for (const key in this.addedLayers) {
              if (key !== compositeKey && this.addedLayers[key].dct_type === 'indikator') {
                this.addedLayers[key].checked = false;
              }
            }
            console.log(this.addedLayers, "addedLayers")
          },
          declareReadyToCartographyDeepLink() {
            this.readyForCartography = true;
          }
    }
})