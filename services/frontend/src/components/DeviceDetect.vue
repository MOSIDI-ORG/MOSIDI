<template>
  <div>
    <Transition name="fade" appear>
      <div v-if="isNotDesktop && !isDismissed" class="modal-overlay">
        <div class="modal-card">
          <h2>💻 Desktop Only</h2>
          <p>This application is highly optimized for desktop experiences. Please switch to a computer or expand your browser window for the best experience.</p>
          
          <button @click="isDismissed = true" class="close-btn">
            Proceed Anyway
          </button>
        </div>
      </div>
    </Transition>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useDeviceDetect } from '../utils/useDeviceDetect'

const { isNotDesktop } = useDeviceDetect()

// Create a reactive variable to track if the user closed it
const isDismissed = ref(false)
</script>

<style scoped>
.modal-overlay {
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  background-color: rgba(0, 0, 0, 0.85);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 9999;
  padding: 20px;
}

.modal-card {
  background: white;
  padding: 30px;
  border-radius: 12px;
  max-width: 400px;
  text-align: center;
  box-shadow: 0 10px 25px rgba(0, 0, 0, 0.3);
}

.modal-card h2 {
  color: #1a1a1a;
  margin-bottom: 15px;
}

.modal-card p {
  color: #666;
  line-height: 1.6;
  margin-bottom: 20px; /* Added spacing above the button */
}

/* Added style for the button */
.close-btn {
  background-color: #1a1a1a;
  color: white;
  border: none;
  padding: 10px 20px;
  font-size: 1rem;
  border-radius: 6px;
  cursor: pointer;
  transition: background-color 0.2s ease;
}

.close-btn:hover {
  background-color: #444;
}

/* Smooth fade transition */
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>