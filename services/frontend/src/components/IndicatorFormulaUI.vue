<template>
    <div>
        <v-list-item
                subtitle="Create your own indicator"
                title="Custom data"
            >
            <template v-slot:prepend>
                <v-avatar style="cursor: pointer;">
                    <v-menu offset-x top >
                        <template v-slot:activator="{ props }">
                            <v-img src="icons/calculate.svg" v-bind="props" />
                        </template>
                        <v-card width="350" style="border-radius:8px;  border: 1px solid rgba(0, 0, 0, 0.2); ">
                            <v-container @click.stop>
                            <CustomIndicatorUI
                                :indicatorNames="tableMetadata.filter(item => item.dct_type === 'indikator')"
                                :selectedColorPalette="selectedColorPalette"
                                @addDeckglLayer="addDeckglLayer"
                                @updateDeckglLayer="updateDeckglLayer"
                        ></CustomIndicatorUI>
                    </v-container>
                   </v-card>
                    </v-menu>
                </v-avatar>
            </template>
        </v-list-item>
    </div>
</template>

<script setup >
import {ref, defineEmits} from "vue"
import { storeToRefs } from "pinia";
import CustomIndicatorUI from "@/components/CustomIndicatorUI.vue";
import { useDatasetSearchStore } from '../stores/datasetSearch'
import * as colorbrewer from 'colorbrewer';
const emit = defineEmits(["addDeckglLayer", "updateDeckglLayer"]);

let {  tableMetadata } = storeToRefs(useDatasetSearchStore())
let selectedColorPalette = ref(colorbrewer.default.RdPu[5])
const addDeckglLayer = (geojson, style)=>{
    emit("addDeckglLayer", geojson,  style);
}
const updateDeckglLayer = (geojson, style)=>{
    emit("updateDeckglLayer", geojson,  style);
}

</script>

<style scoped>

</style>