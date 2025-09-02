import { defineStore } from 'pinia'

export const useMapLegendStore = defineStore ({
    id: 'mapLegend',
    state: () => ({
        addedLayersLegendSpec: {},
        minMax: null,
        secondMinMax: null,
        classIntervalsAndColor: null,
        classIntervalsAndRadius: null,
        classIntervalsAndColorHexagon: null,
        thirdMinMax: null,
        clickedlegendItems: {
            first: [],
            second: []
        },
        selectedIndicator: null,
        selectedSecondIndicator: null,
        completeIndicatorName: null,
        completeSecondIndicatorName: null,
        isMaximized: true,
        geocodingToggle:false,
        activatedExternalWMSMapLegendURL: null

    }),
    actions: {
        assignClassificationValues(data) {
            this.minMax= data.minMax
            this.classIntervalsAndColor = data.classIntervalsAndColor,
            this.selectedIndicator = data.selectedIndicator,
            this.completeIndicatorName = data.completeIndicatorName
            this.addedLayersLegendSpec[data.indicatorName] = data;
            
           
        },
        assignSecondClassificationValues(data) {
            this.secondMinMax= data.minMax
            this.classIntervalsAndRadius = data.classIntervalsAndRadius,
            this.selectedSecondIndicator = data.selectedSecondIndicator,
            this.completeSecondIndicatorName = data.completeSecondIndicatorName
        },
        assignThirdClassificationValues (data) {
            this.thirdMinMax= data.minMax,
            this.classIntervalsAndColorHexagon = data.classIntervalsAndColorHexagon
        },
        resetClickedLegendItem() {
            this.clickedlegendItems.first = []
        },
        resetSecondClickedLegendItem() {
            this.clickedlegendItems.second = []
        },
        resetClassIntervalsAndRadius(){
            this.classIntervalsAndRadius= null
        },
        removeLegendItem(payload){
            if (Object.prototype.hasOwnProperty.call(this.addedLayersLegendSpec, payload)) {
                delete this.addedLayersLegendSpec[payload];
            } else {
                console.log(`${payload} does not exist in addedLayersLegendSpec.`);
            }
        },
        setActivatedWMSLegendItem(payload) {
            this.activatedExternalWMSMapLegendURL = payload.legend_url;
           
        },
        removeWMSLegendItem(payload){
            if(payload.legend_url === this.activatedExternalWMSMapLegendURL) {
                this.activatedExternalWMSMapLegendURL = null;
            }
        }
     
       
    }
})