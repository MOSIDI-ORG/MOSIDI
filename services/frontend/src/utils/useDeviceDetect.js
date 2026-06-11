import { ref, onMounted, onUnmounted } from 'vue'

export function useDeviceDetect() {
  const isNotDesktop = ref(false)

  const checkDevice = () => {
    // 1. Check window width (e.g., less than 1024px is usually tablet/mobile)
    const isSmallScreen = window.innerWidth < 1024

    isNotDesktop.value = isSmallScreen 
  }

  onMounted(() => {
    checkDevice()
    window.addEventListener('resize', checkDevice)
  })

  onUnmounted(() => {
    window.removeEventListener('resize', checkDevice)
  })

  return { isNotDesktop }
}