<template>
    
    <v-card
        class=" text-start"
        density="compact"
        :title="$t('dataset-search-landing.indicator.title')"
        variant="text"
        @click="addDatasets(),toggleFilterUI(),toggleDataUI(), activatedDatasetSearchComponent('indicator')" style="cursor: pointer;"
    >
        
        <template #subtitle >
            <div   style="white-space: normal; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; line-clamp: 2; -webkit-box-orient: vertical;"
            >
                {{ $t('dataset-search-landing.indicator.subtitle') }}
            </div>
            
        </template>
        <template #prepend>
        <v-avatar class="icon-button-circle">
                <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 40px; height: 40px; display: block;">
                    <path d="M0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40Z" class="icon-button-circle-bg"/>
                    <path d="M29.6291 39.7042H50.3709M40 29.3333V50.0751" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                </svg>
            </v-avatar>
        

        </template>
        
    </v-card>
    <v-card
        class=" text-start"
        density="compact"
        :title="$t('dataset-search-landing.geo.title')"
        variant="text"
        @click="addDatasets(),toggleFilterUI(),toggleDataUI(), activatedDatasetSearchComponent('geodata')" style="cursor: pointer;"
        
    >
        
        <template #subtitle >
            <div   style="white-space: normal; overflow: hidden; text-overflow: ellipsis; display: -webkit-box; line-clamp: 2; -webkit-box-orient: vertical;"
            >
                {{ $t('dataset-search-landing.geo.subtitle') }}
            </div>
            
        </template>
        <template #prepend>
        <v-avatar class="icon-button-circle">
                <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" style="width: 40px; height: 40px; display: block;">
                    <path d="M0 40C0 17.9086 17.9086 0 40 0C62.0914 0 80 17.9086 80 40C80 62.0914 62.0914 80 40 80C17.9086 80 0 62.0914 0 40Z" class="icon-button-circle-bg"/>
                    <path d="M29.6291 39.7042H50.3709M40 29.3333V50.0751" stroke="white" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                </svg>
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

/* Uses the configurable button/button-hover colors (see
   src/services/config.js) to recolor icons/plus.svg's circular
   background. */
.icon-button-circle-bg {
  fill: var(--color-button, #000000);
  transition: fill 0.2s ease;
}
.icon-button-circle:hover .icon-button-circle-bg {
  fill: var(--color-button-hover, #444444);
}

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