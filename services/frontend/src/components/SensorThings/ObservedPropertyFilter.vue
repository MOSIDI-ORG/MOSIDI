<template>
    <!-- gte actual value to show/ hide this component-->
    <div v-show="filterInitiated==true && activatedDatasetSearch == 'SensorThings'" class="container">
        <v-card>
            <v-list style="height: 81%;">
                <v-list-item 
                    v-for="observedProperty in observedProperties" 
                    :key="observedProperty['@iot.id']"
                    @click="addSensorThingsLayerToMap(observedProperty)"
                    style="border-radius: 5px;" 
                    one-line
                >
                    <v-list-item-title class="text-wrap">{{ observedProperty.name }}</v-list-item-title>
                    <v-list-item-subtitle class="text-wrap" v-text="observedProperty.description"></v-list-item-subtitle>
                </v-list-item>

                <v-list-item v-if="!observedProperties.length">
                    <v-list-item-content>
                        <v-list-item-title>No users found.</v-list-item-title>
                    </v-list-item-content>
                </v-list-item>
            </v-list>
        </v-card>
    </div>

</template>

<script setup>
// TODO: Remove this
/* eslint-disable */

import { onMounted, watch, ref, defineEmits/*, computed, , */ } from 'vue';
import { getObservedProperties } from '@/services/frost.service';
import { storeToRefs } from 'pinia'
import { useDatasetSearchStore } from '@/stores/datasetSearch';
import { useaddedDatasetsStore } from '@/stores/addedDatasets';

const emit = defineEmits(["addSensorThingsLayerToMap"]);

let { filterInitiated , dataUiInitiated, activatedDatasetSearch } = storeToRefs(useDatasetSearchStore());

const addedDatasetsStore = useaddedDatasetsStore();

const observedProperties = ref([]);

onMounted(() => {
    retrieveObservedProperties();
})

// Use to watch selected ObservedProperty?
watch(activatedDatasetSearch, () => {
    console.log(dataUiInitiated);
})

const addSensorThingsLayerToMap = (observedProperty) => {
    emit("addSensorThingsLayerToMap", observedProperty);
    addedDatasetsStore.addLayer({layerName: 'STA'+observedProperty.name, metadata: observedProperty}, true)       
}

/*
On Selected emit back to MainMap to show/ add layer
*/

/*
On Remove Selection emit back to MainMap to remove layer
*/

const retrieveObservedProperties = async () => {
    observedProperties.value = await getObservedProperties();
}
</script>

<style scoped>
.container {
    overflow-y: scroll;
    background: black;
    border-radius: 8px;
    position: absolute;
    top: 62px;
    left: 381px;
    z-index: 10;
    background-color: rgba(0, 0, 0, 1);
    color: white;
    border: 1px solid rgba(0, 0, 0, 0.2);
    height: 200px;
}

.dataset-filter-ui{
    overflow-y: scroll; 
    background: transparent; 
    border-radius: 8px;
    position: absolute;
    top: 272px;
    bottom: 10px;
    left: 381px;
    z-index: 10;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2); 
    
   
}

.animated-transform {
  transition: width 0.3s ease, left 0.3s ease;
}
</style>