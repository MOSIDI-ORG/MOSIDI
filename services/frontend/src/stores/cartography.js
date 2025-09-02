import { defineStore } from 'pinia'

export const useCartographyStore = defineStore ({
    id: 'cartography',
    state: () => ({
        catographyUIVisibility: false,
        geomTtype: null
    }),
    
    
    actions: {
        setVisibility(payload){
            this.catographyUIVisibility=payload.catographyUIVisibility,
            this.geomTtype = payload.geomTtype
        }
    }
})