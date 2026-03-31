import { defineStore } from 'pinia'

export const useRasterStyleStore = defineStore ({
    id: 'rasterStyle',
    state: () => ({
        rasterLayerSpecification: {},
        addedRasterLayersStyles: {
        },
        rasterStyleParams:{
            'raster-opacity': 1,
           'raster-fade-duration': 1000,
           'raster-saturation': 0,
           'raster-contrast': 0
        }

            
    }),
    actions: {
        addLayerStyle(name) {
            if(this.addedRasterLayersStyles[name]==null){
                this.addedRasterLayersStyles[name] = JSON.parse(JSON.stringify(this.rasterStyleParams));
            }
        }
    }
})