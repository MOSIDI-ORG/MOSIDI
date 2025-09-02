import { defineStore } from 'pinia'

export const useIndicatorStore = defineStore ({
    id: 'indicator',
    state: () => ({
        indicatorArray: null,
        classification_result: null,
        selectedColorPalette: null
    }),
    actions: {
       setIndicatordata(data) {
        this.indicatorArray = data.indicator
       },
       setClassificationResult (data) {
        this.classification_result = data.classification_result
       },
       setColorPalette(data){
        this.selectedColorPalette = data.selectedColorPalette
       }
       
    }
})