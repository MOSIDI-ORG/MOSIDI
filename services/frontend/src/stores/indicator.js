import { defineStore } from 'pinia'

export const useIndicatorStore = defineStore ({
    id: 'indicator',
    state: () => ({
        indicatorArray: {},
        classification_result: null,
        selectedColorPalette: null
    }),
    actions: {
       setIndicatordata(data) {
        this.indicatorArray[data.indicatorName] = data.indicator
        this.indicatorArray[data.indicatorName]['availailableYearsForSelectedIndicator'] = data.availailableYearsForSelectedIndicator
        this.indicatorArray[data.indicatorName]['selectedYear']=data.selectedYear,
        this.indicatorArray[data.indicatorName]['colorPalette']=data.colorPalette,
        this.indicatorArray[data.indicatorName]['secondIndicatorName']=null
        
       },
       setIndicatorClassificationResults(payload){
        this.indicatorArray[payload.indicatorName]['classification_result']=payload.classification_result
        this.indicatorArray[payload.indicatorName]['classification_result_3_intervals']=payload.classification_result_3_intervals
        this.indicatorArray[payload.indicatorName]['classificationMethod'] = payload.classificationMethod
       },
       setIndicatorColorPalette(payload){
        this.indicatorArray[payload.indicatorName].colorPalette=payload.colorPalette
       },
       setClassificationResult (data) {
        this.classification_result = data.classification_result
       },
       setColorPalette(data){
        this.selectedColorPalette = data.selectedColorPalette
       },
       removeIndicator(data){
            delete this.indicatorArray[data];
       },
       setSecondIndicatordata(payload){
        this.indicatorArray[payload.parentIndicator]['bivariate']= payload.bivariate
        this.indicatorArray[payload.parentIndicator]['secondIndicatorName']=payload.secondIndicatorName
        this.indicatorArray[payload.parentIndicator]['secondIndicator']=payload
       },
       setSecondIndicatorClassificationResults(payload){
        this.indicatorArray[payload.parentIndicator]['secondIndicator']['classification_result'] = payload.classification_result

       }
       
    }
})