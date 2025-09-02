<template>
    
    <v-card
        class=" text-start"
        density="compact"
        :title="$t('dataset-search-landing.indicator.title')"
        variant="text"
        
    >
        
        <template #subtitle >
            <div   style="white-space: normal; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; line-clamp: 2; -webkit-box-orient: vertical;"
            >
                {{ $t('dataset-search-landing.indicator.subtitle') }}
            </div>
            
        </template>
        <template #prepend>
        <v-avatar @click="addDatasets(),toggleFilterUI(),toggleDataUI(), activatedDatasetSearchComponent('indicator')" style="cursor: pointer;">
                <v-img width="20" src="icons/plus.svg" ></v-img>
            </v-avatar>
        

        </template>
        
    </v-card>
    <v-card
        class=" text-start"
        density="compact"
        :title="$t('dataset-search-landing.geo.title')"
        variant="text"
        
    >
        
        <template #subtitle >
            <div   style="white-space: normal; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; line-clamp: 2; -webkit-box-orient: vertical;"
            >
                {{ $t('dataset-search-landing.geo.subtitle') }}
            </div>
            
        </template>
        <template #prepend>
        <v-avatar @click="addDatasets(),toggleFilterUI(),toggleDataUI(), activatedDatasetSearchComponent('geodata')" style="cursor: pointer;">
                <v-img width="20" src="icons/plus.svg" ></v-img>
            </v-avatar>
        

        </template>
        
    </v-card>

          

</template>

<script setup>
import { useDatasetSearchStore } from '../stores/datasetSearch'
const datasetSearchStore = useDatasetSearchStore()


const toggleDataUI = ()=>{
    datasetSearchStore.toggleDataUI({
            dataUiInitiated : false
       
    })
}
const addDatasets = ()=>{
    datasetSearchStore.activateDatasetSearch({
        searchInitiated: true,
    })
   
}
const toggleFilterUI = ()=>{
    datasetSearchStore.toggleFilter({
        filterInitiated : true
    })
}

const activatedDatasetSearchComponent=(value)=>{
     datasetSearchStore.setActivatedDatasetSearch({
        activatedDatasetSearch : value
    })
}
</script>

<style scoped>
.dataset-search-ui{
    overflow-y: scroll;
    background: transparent;
    border-radius: 8px;
    position: absolute;
    top: 62px;
    left: 10px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}
</style>