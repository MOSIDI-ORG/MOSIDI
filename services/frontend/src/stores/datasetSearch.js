import { defineStore } from 'pinia'
export const useDatasetSearchStore = defineStore ({
    id: 'datasetSearch',
    state: () => ({
        searchInitiated: false,
        filterInitiated: false, // Boolean indicating if FilterUI is active or not
        dataUiInitiated: false,
        selectedDataset: null,
        tableMetadata: new Array({}), // Init array with one empty object
        activatedDatasetSearch: 'indicator',
        selectedDatasetType: null
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
        setSelecteddatasetName(data){
            this.selectedDataset=data.selectedDataset
        },
        setSelecteddatasetType(data){
            this.selectedDatasetType=data.selectedDatasetType
        },
        addTableMetadata(payload) {
            this.tableMetadata.push(payload);
        },
        setActivatedDatasetSearch(payload) {
            this.activatedDatasetSearch = payload.activatedDatasetSearch
        }
        
    }
})