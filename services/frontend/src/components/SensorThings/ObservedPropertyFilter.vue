<template>
    <!-- gte actual value to show/ hide this component-->
    <div hidden class="container">
        <v-card>
            <v-list style="height: 81%;">
                <v-list-item 
                    v-for="observedProperty in observedProperties" 
                    :key="observedProperty['@iot.id']"
                    @click="addSensorThingsLayerToMap(observedProperty['@iot.id'])"
                    style="border-radius: 5px;" 
                    one-line
                >
                    <v-list-item-title class="text-wrap">{{ observedProperty.name }}</v-list-item-title>
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
import { useSensorThingsSearchStore } from '@/stores/observedPropertiesSearch';
import { storeToRefs } from 'pinia'

const emit = defineEmits(["addSensorThingsLayerToMap"]);

let { activatedDatasetSearch } = storeToRefs(useSensorThingsSearchStore());

const observedProperties = ref([]);
let selectedObservedProperty = null;

onMounted(() => {
    retrieveObservedProperties();
})

// Use to watch selected ObservedProperty?
watch(activatedDatasetSearch, () => {

})

const addSensorThingsLayerToMap = (observedPropertyId) => {
    emit("addSensorThingsLayerToMap", observedPropertyId);
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
}
</style>