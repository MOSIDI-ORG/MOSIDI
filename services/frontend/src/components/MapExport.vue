<template>
        <v-row justify="center">
        <v-dialog
            v-model="exportDialog"
            max-width="500"
            max-height="500"
            persistent

        >
        
            <v-card class="dialog-ui">
                <v-card-title>
                    <span class="text-h6">Karte drucken</span>
                </v-card-title>
                <v-divider></v-divider>

                <div >
                    <div >
                        <v-card-text>
                            <v-row dense>
                                <v-col
                                    cols="12"
                                    sm="4"
                                    >
                                        <v-select
                                            :items=formats
                                            v-model="selectedFormat"
                                            label="Format"
                                            density="compact"
                                            variant="solo"
                                        ></v-select>
                                        
                                </v-col>                            
                                
                            </v-row>
                            <v-row>
                                <v-textarea
                                    v-if="selectedFormat==='pdf'"
                                    label="Bericht schreiben"
                                    row-height="25"
                                    rows="3"
                                    variant="outlined"
                                    auto-grow
                                    shaped
                                    v-model="report"
                                    >
                                </v-textarea>
                            </v-row>
                        </v-card-text>
                    
                    </div>
                </div>
            
                <v-card-actions>
                    <v-spacer></v-spacer>
                    
                    <v-btn
                        color="blue-darken-1"
                        variant="outlined"
                        @click="exportDialog = false, exportMap()"
                    >
                        drucken
                    </v-btn>
                    <v-btn
                        color="red-darken-1"
                        variant="outlined"
                        @click="exportDialog = false"
                    >
                        schließen
                    </v-btn>
                    
                </v-card-actions>
            </v-card>
        </v-dialog>
    </v-row>
    
  </template>

<script setup>

import { onMounted, ref } from 'vue'
import { useMapExportStore } from '../stores/mapExport'
import { storeToRefs } from 'pinia'
import html2canvas from 'html2canvas';
import { jsPDF } from "jspdf";
let { exportDialog, formats, report } = storeToRefs(useMapExportStore())
let selectedFormat = ref('png')

onMounted(()=>{
})
const exportMap = () => {
    let config = {
        backgroundColor: null,
        logging: true,
        ignoreElements: function( element ) {
            if( element.classList.contains( 'app-header' ) ) {
                return true;
            }
        }
    }
    html2canvas(document.getElementById('mainmap'), config).then(canvas => {
        const mapCanvasDataURL = canvas.toDataURL('image/'+selectedFormat.value);

        if (selectedFormat.value !='pdf'){
            const downloadLink = document.createElement('a');
            downloadLink.href = mapCanvasDataURL;
            downloadLink.download = 'map.'+selectedFormat.value; 
            document.body.appendChild(downloadLink);
            downloadLink.click();
            document.body.removeChild(downloadLink);
        }
        
        else {
            
            let w = document.getElementById("mainmap").offsetWidth;
            let h = document.getElementById("mainmap").offsetHeight;
            let doc = new jsPDF('L', 'px', [w, h], true);
            doc.addImage(mapCanvasDataURL,'JPEG', 0, 0, w, h);
            
            if (report.value){
                doc.addPage('a4', 'portrait');

                doc.setFont('helvetica', 'bold');
                doc.setFontSize(16);
                doc.text(20, 30, "Bericht");

                doc.setFont('helvetica', 'normal');
                doc.setFontSize(12);
                doc.text(20, 60, report.value);
            }
            
            doc.save('map.pdf');
        }
        
    });    
}
</script>

<style scoped>
.v-dialog > .v-overlay__content > .v-card {
    display: flex;
    flex-direction: column;
    background-color: rgba(255,255,255,0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border-radius: 8px;
}
</style>