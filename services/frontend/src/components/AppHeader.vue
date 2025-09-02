<template>
     <!--<GeocodingUI @addAddressToMap="addLayerToMap" @removeLayerFromMap="removeLayerFromMap"></GeocodingUI>-->
    <v-card class="mx-auto app-header animated-width" :width="isMinimized?'80':'371'" height="50">
 
        <v-row class="d-flex align-center justify-between mt-2" >
            <v-img
                :src="isMinimized?'icons/mosidi-logo-minimized.svg':'icons/mosidi-logo.svg'"
                :height="isMinimized?'20':'15'"
                :width="isMinimized?'20':'15'"
                :style="isMinimized?'margin-left:25px; margin-top: 9px':'margin-left:-10px;margin-top: 5px'"
            >
            </v-img>
       
           
            <v-spacer></v-spacer>
            <v-menu offset-y
                       >
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        density="compact"
                        variant="text"
                        icon
                        class="mr-2 "
                        v-if="isMinimized==false"
                    >
                    {{ locale=='de'?'de':'en'}}
                       
                    </v-btn>
                </template>

                <v-list style="border-radius:8px;  border: 1px solid rgba(0, 0, 0, 0.2); ">
                           
                           <v-list-item
                           @click="toggleLanguage('en')"
                           
                           >
                               <template  v-slot:prepend>
                                  
                                   <v-list-item-title class="ml-3">English</v-list-item-title>
                               </template>
                              
                           </v-list-item>
                           <v-list-item
                                @click="toggleLanguage('de')"
                           >
                               <template v-slot:prepend>
                                  
                                   <v-list-item-title class="ml-3">Deutsch</v-list-item-title>
                               </template>
                           </v-list-item>
                          
                       </v-list>
            </v-menu>
            <v-menu offset-y
                       >
                <template v-slot:activator="{ props }">
                    <v-btn
                        v-bind="props"
                        density="compact"
                        variant="text"
                        icon
                        class="mr-2 "
                        v-if="isMinimized==false"
                    >
                        <img
                            src="icons/ellipsis-vertical.svg"
                            width="30"
                            height="30"
                            style="pointer-events: none;"
                        />
                    </v-btn>
                </template>

                <v-list style="border-radius:8px;  border: 1px solid rgba(0, 0, 0, 0.2); ">
                           
                            <v-list-item
                            @click="exportDialog=true"
                            
                            >
                                <template  v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                        
                                    >
                                        <img src="icons/export.svg"  width="18" height="18" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3">{{ $t('app-header.export') }}</v-list-item-title>
                                </template>
                               
                            </v-list-item>
                            <v-divider style="margin-left: 15px; margin-right: 15px;"  class=" mt-1 mb-1"></v-divider>
                            <v-list-item
                            :to="{ path: '/landing-page' }" target="_blank"
                            >
                                <template v-slot:prepend>
                                    <v-btn 
                                        density="compact" 
                                        variant="text" 
                                        icon 
                                        
                                    >
                                        <img src="icons/rectangle.svg" alt="Information Icon" width="16" height="16" />
                                    </v-btn> 
                                    <v-list-item-title class="ml-3">{{ $t('app-header.about') }}</v-list-item-title>
                                </template>
                            </v-list-item>
                           
                        </v-list>
            </v-menu>

            <v-btn  
             v-if="isMinimized==false"
                density="compact" 
                variant="text" 
                icon
                class="mr-4"
                @click="toggleMinimize"
            >
                <img  src="icons/minimize.svg" width="18" height="18" />
            </v-btn> 
            
        </v-row>
    </v-card>
    <div style="position: absolute; top:10px; left: 90px; z-index: 10;" class="mt-3">
        <v-btn  
             v-if="isMinimized==true"
                density="compact" 
                variant="text" 
                icon
                class="mr-4"
                @click="toggleMinimize"
            >
                <img  src="icons/expand.svg" width="18" height="18" />
            </v-btn> 
    </div>
</template>
<script setup>
import { storeToRefs } from "pinia"
import { useI18n } from 'vue-i18n';
const { locale } = useI18n();
const toggleMinimize = ()=>{
    isMinimized.value=! isMinimized.value
}
import { useMenuStore } from '../stores/menu'


let { isMinimized } = storeToRefs(useMenuStore())
import { useMapExportStore } from '../stores/mapExport'
let { exportDialog } = storeToRefs(useMapExportStore())

const toggleLanguage =(lang) => {
    locale.value = lang;
}

</script>
<style scoped>
  .app-header{
    border-radius: 8px;  
    position: absolute;
    top: 10px;
    left: 10px;
    z-index: 10;
    background-color: rgb(255, 255, 255, 0.6);
    backdrop-filter: blur(5px);
    -webkit-backdrop-filter: blur(5px);
    -moz-backdrop-filter: blur(5px);
    -ms-backdrop-filter: blur(5px);
    border: 1px solid rgba(0, 0, 0, 0.2);   
   
}

.animated-width {
  transition: width 0.3s ease;
}
</style>
