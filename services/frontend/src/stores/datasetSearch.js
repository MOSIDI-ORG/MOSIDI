import { defineStore } from 'pinia'
export const useDatasetSearchStore = defineStore ({
    id: 'datasetSearch',
    state: () => ({
        searchInitiated: false,
        filterInitiated: false,
        dataUiInitiated: false,
        selectedDataset: null,
        tableMetadata: null,
        activatedDatasetSearch: 'indicator'
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
        setTableMetadata(payload){
            this.tableMetadata=payload
        },
        setActivatedDatasetSearch(payload) {
            console.log(payload.activatedDatasetSearch, "store")
            this.activatedDatasetSearch = payload.activatedDatasetSearch
        }
        
    }
})