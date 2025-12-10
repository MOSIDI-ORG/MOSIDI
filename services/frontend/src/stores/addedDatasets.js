import { convertToMetadata } from '@/utils/SensorThingsConverter';
import { defineStore } from 'pinia'

export const useaddedDatasetsStore = defineStore ({
    id: 'addedDatasets',
    state: () => ({
        addedLayers: {}
    }),
    actions: {
        addLayer(payload, isSensorThings=false) {
            const { layerName, metadata } = payload;
            if (!layerName || !metadata) {
              console.error('Invalid payload: missing layerName or metadata');
              return;
            }

            if (isSensorThings) {
              this.addedLayers[layerName] = convertToMetadata(metadata);
              console.log(convertToMetadata(metadata));
            } else {
              this.addedLayers[layerName] = metadata;
            }
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