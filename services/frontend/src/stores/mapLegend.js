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
        activatedExternalWMSMapLegendURL: null,
        activatedExternalWMSMapLegendURLTitle: null


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
            let url = payload.legend_url;

            // Check if URL looks like a WMS GetLegendGraphic request
            const isWMSLegend = url?.toLowerCase().includes("request=getlegendgraphic");

            if (isWMSLegend) {
                const legendOptions = "fontAntiAliasing:true;";

                // Add LEGEND_OPTIONS if not present
                if (!url.includes("LEGEND_OPTIONS")) {
                url += `&LEGEND_OPTIONS=${legendOptions}`;
                }

                // Add transparency if not present
                if (!url.includes("TRANSPARENT")) {
                url += "&TRANSPARENT=TRUE";
                }
            }

            // Store URL as-is for static PNGs or modified for WMS
            this.activatedExternalWMSMapLegendURL = url;
            this.activatedExternalWMSMapLegendURLTitle =  payload.legend_title;
           
        },
        removeWMSLegendItem(payload){
            if(payload.layername === this.activatedExternalWMSMapLegendURLTitle) {
                this.activatedExternalWMSMapLegendURL = null;
                this.activatedExternalWMSMapLegendURLTitle = null;
            }
        }
     
       
    }
})