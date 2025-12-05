import { defineStore } from 'pinia'
export const useSensorThingsSearchStore = defineStore ({
    id: 'sensorThingsSearch',
    state: () => ({
        searchInitiated: false,
        filterInitiated: false,
        dataUiInitiated: false,
        selectedObservedProperty: null,
        // tableMetadata: null,
        uiToggled: false,
        activatedDatasetSearch: ''
    }),
    actions: {
        activateDatasetSearch(data) {
            this.searchInitiated=data.searchInitiated
        },
        toggleFilter(data) {
            this.filterInitiated=data.filterInitiated
        },
        toggleDataUI(data) {
            this.dataUiInitiated=data.dataUiInitiated
            
        },
        setSelectedObservedPropertyId(id){
            this.selectedObservedProperty=id;
        },
        /*setTableMetadata(payload){
            this.tableMetadata=payload
        },*/
        setActivatedDatasetSearch(payload) {
            console.log(payload.activatedDatasetSearch, "store")
            this.activatedDatasetSearch = payload.activatedDatasetSearch
        }
        
    }
})