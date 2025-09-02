import { defineStore } from 'pinia'

export const useaddedDatasetsStore = defineStore ({
    id: 'addedDatasets',
    state: () => ({
        addedLayers: {}
    }),
    actions: {
        addLayer(payload) {
            const { layerName, metadata } = payload;
            if (!layerName || !metadata) {
              console.error('Invalid payload: missing layerName or metadata');
              return;
            }
            this.addedLayers[layerName] = metadata;
            this.addedLayers[layerName]['checked'] = true;

            for(let layername in this.addedLayers){
              if (layername!=layerName){
                
                if(this.addedLayers[layername].dct_type=='indikator'){
                  this.addedLayers[layername]['checked'] = false;
                }
                
              }
              
            }
            
          }
    }
})