<template>
  <transition name="fade">
    <div 
      v-if="show" 
      class="notification" 
      :class="type"
      @click="close"
    >
      <div class="notification-content">
        <span class="material-icons" v-if="icon">{{ icon }}</span>
        <span class="message">{{ message }}</span>
      </div>
      <span class="material-icons close-icon">close</span>
    </div>
  </transition>
</template>

<script>
import { computed, onMounted, watch } from 'vue'

export default {
  name: 'AppNotification',
  props: {
    show: {
      type: Boolean,
      default: false
    },
    message: {
      type: String,
      required: true
    },
    type: {
      type: String,
      default: 'info',
      validator: (value) => ['success', 'error', 'info'].includes(value)
    },
    duration: {
      type: Number,
      default: 3000
    }
  },
  emits: ['update:show'],
  setup(props, { emit }) {
    let timer = null
    
    const icon = computed(() => {
      switch (props.type) {
        case 'success': return 'check_circle'
        case 'error': return 'error'
        case 'info': return 'info'
        default: return 'info'
      }
    })
    
    const close = () => {
      emit('update:show', false)
      if (timer) {
        clearTimeout(timer)
        timer = null
      }
    }
    
    const startTimer = () => {
      if (props.duration > 0) {
        if (timer) clearTimeout(timer)
        timer = setTimeout(() => {
          close()
        }, props.duration)
      }
    }
    
    onMounted(() => {
      if (props.show) {
        startTimer()
      }
    })
    
    watch(() => props.show, (newVal) => {
      if (newVal) {
        startTimer()
      } else if (timer) {
        clearTimeout(timer)
        timer = null
      }
    })
    
    return {
      icon,
      close
    }
  }
}
</script>

<style lang="scss" scoped>
.notification {
  position: fixed;
  bottom: 20px;
  right: 20px;
  padding: 12px 16px;
  border-radius: 4px;
  color: white;
  max-width: 350px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.2);
  cursor: pointer;
  z-index: 9999;
  display: flex;
  align-items: center;
  justify-content: space-between;
  
  &.success {
    background-color: var(--success-color);
  }
  
  &.error {
    background-color: var(--error-color);
  }
  
  &.info {
    background-color: var(--info-color);
  }
}

.notification-content {
  display: flex;
  align-items: center;
  gap: 8px;
}

.message {
  font-size: 14px;
  word-break: break-word;
}

.close-icon {
  margin-left: 16px;
  opacity: 0.7;
  font-size: 18px;
  
  &:hover {
    opacity: 1;
  }
}

// Transition effects
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s, transform 0.3s;
}
.fade-enter-from,
.fade-leave-to {
  opacity: 0;
  transform: translateY(20px);
}
</style> 