import { defineStore } from 'pinia'
export const useTimeSliderStore = defineStore ({
    id: 'timeSlider',
    state: () => ({
        visible: false,
        time: {},
        isPlaying: true,
        max: 4
    }),
    actions: {
        setSlider(data) {
           this.visible = !this.visible
           this.time = {};
           Object.keys(data.time).forEach((key, index) => {
            this.time[index] = data.time[key]; // Maintain reactivity
          });
           this.max =  Object.keys( data.time ).length -1
        },
        deactivateSlider(data){
            this.visible = data.vis
        } 
       
    }
})