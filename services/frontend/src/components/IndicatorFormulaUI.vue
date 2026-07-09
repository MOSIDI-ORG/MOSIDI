<template>
    <div>
        <v-list-item
                subtitle="Create your own indicator"
                title="Custom data"
            >
            <template v-slot:prepend>
                <v-avatar style="cursor: pointer;" class="icon-button-circle">
                    <v-menu offset-x top >
                        <template v-slot:activator="{ props }">
                            <svg v-bind="props" width="100%" height="100%" viewBox="0 0 56 56" fill="none" xmlns="http://www.w3.org/2000/svg">
                                <path d="M0 28C0 12.536 12.536 0 28 0C43.464 0 56 12.536 56 28C56 43.464 43.464 56 28 56C12.536 56 0 43.464 0 28Z" class="icon-button-circle-bg"/>
                                <path d="M19 33.508H24.6875M21.8438 36.3517V30.6642M31.0859 20L35.3516 24.2656M31.0859 24.2656L35.3516 20M19 22.1329H24.6875M30.375 32.0861H36.0625M30.375 36.3517H36.0625" stroke="#F7F8F9" stroke-width="2" stroke-linecap="square" stroke-linejoin="round"/>
                            </svg>
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

/* Uses the configurable button/button-hover colors (see
   src/services/config.js) to recolor icons/calculate.svg's circular
   background. */
.icon-button-circle-bg {
  fill: var(--color-button, #000000);
  transition: fill 0.2s ease;
}
.icon-button-circle:hover .icon-button-circle-bg {
  fill: var(--color-button-hover, #444444);
}

</style>