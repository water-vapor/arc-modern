<template>
  <div 
    class="task-pair-preview" 
    :class="{ 
      'active': isActive,
      'magnified': isMagnified 
    }"
    @click="toggleMagnify"
  >
    <div class="pair-container" :class="{ 'magnified-container': isMagnified }">
      <div class="grid-preview">
        <h3 class="preview-label">Input</h3>
        <grid-component
          :grid-data="pairData.input"
          :container-width="isMagnified ? magnifiedSize : containerSize"
          :container-height="isMagnified ? magnifiedSize : containerSize"
          :show-symbol-numbers="showSymbolNumbers"
        />
      </div>
      
      <div class="arrow">
        <span class="material-icons">arrow_forward</span>
      </div>
      
      <div class="grid-preview">
        <h3 class="preview-label">Output</h3>
        <grid-component
          :grid-data="pairData.output"
          :container-width="isMagnified ? magnifiedSize : containerSize"
          :container-height="isMagnified ? magnifiedSize : containerSize"
          :show-symbol-numbers="showSymbolNumbers"
        />
      </div>
    </div>
    
    <div class="magnify-hint" v-if="!isMagnified">
      <span class="material-icons">zoom_in</span>
      <span class="hint-text">Click to enlarge</span>
    </div>
    
    <div class="magnify-hint" v-if="isMagnified">
      <span class="material-icons">zoom_out</span>
      <span class="hint-text">Click to shrink</span>
    </div>
  </div>
</template>

<script>
import { ref, onMounted, onUnmounted } from 'vue'
import GridComponent from './GridComponent.vue'

export default {
  name: 'TaskPairPreview',
  components: {
    GridComponent
  },
  props: {
    pairData: {
      type: Object,
      required: true
    },
    index: {
      type: Number,
      required: true
    },
    isActive: {
      type: Boolean,
      default: false
    },
    showSymbolNumbers: {
      type: Boolean,
      default: false
    }
  },
  setup(props, { emit }) {
    const containerSize = ref(180)
    const magnifiedSize = ref(300) // Size when magnified
    const isMagnified = ref(false)
    
    // Update container sizes based on screen width
    const updateContainerSize = () => {
      // Responsive sizing based on screen width
      if (window.innerWidth >= 1600) {
        containerSize.value = 250
        magnifiedSize.value = 450
      } else if (window.innerWidth >= 1200) {
        containerSize.value = 200
        magnifiedSize.value = 350
      } else {
        containerSize.value = 180
        magnifiedSize.value = 300
      }
    }
    
    // Toggle magnification when clicked
    const toggleMagnify = (event) => {
      isMagnified.value = !isMagnified.value
      
      // Emit event so parent can handle single magnified view
      emit('magnify', {
        index: props.index,
        magnified: isMagnified.value
      })
      
      // If magnified, scroll to make it visible
      if (isMagnified.value) {
        event.target.scrollIntoView({ behavior: 'smooth', block: 'center' })
      }
    }
    
    onMounted(() => {
      updateContainerSize()
      window.addEventListener('resize', updateContainerSize)
    })
    
    onUnmounted(() => {
      window.removeEventListener('resize', updateContainerSize)
    })
    
    return {
      containerSize,
      magnifiedSize,
      isMagnified,
      toggleMagnify
    }
  }
}
</script>

<style lang="scss" scoped>
.task-pair-preview {
  background-color: white;
  border-radius: 8px;
  box-shadow: var(--shadow);
  padding: 16px;
  margin-bottom: 16px;
  transition: all 0.3s ease;
  border: 2px solid transparent;
  position: relative;
  cursor: pointer;
  
  &.active {
    border-color: var(--primary-color);
    transform: scale(1.02);
  }
  
  &:hover {
    box-shadow: var(--hover-shadow);
    
    .magnify-hint {
      opacity: 1;
    }
  }
  
  &.magnified {
    width: 100%;
    z-index: 10;
    box-shadow: 0 8px 24px rgba(0, 0, 0, 0.2);
    border-color: var(--primary-color);
    
    .magnify-hint {
      opacity: 1;
    }
  }
}

.magnify-hint {
  position: absolute;
  top: 8px;
  right: 8px;
  background-color: rgba(255, 255, 255, 0.8);
  border-radius: 4px;
  padding: 4px 8px;
  display: flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  opacity: 0;
  transition: opacity 0.2s ease;
  color: var(--secondary-color);
  
  .material-icons {
    font-size: 16px;
  }
}

.pair-container {
  display: flex;
  align-items: center;
  justify-content: center;
  flex-wrap: wrap;
  gap: 20px;
  
  &.magnified-container {
    max-width: 100%;
    justify-content: space-around;
  }
}

.grid-preview {
  display: flex;
  flex-direction: column;
  align-items: center;
}

.preview-label {
  margin: 0 0 8px 0;
  font-size: 14px;
  color: var(--secondary-color);
}

.arrow {
  display: flex;
  align-items: center;
  justify-content: center;
  
  .material-icons {
    font-size: 24px;
    color: var(--primary-color);
  }
}

@media (max-width: 768px) {
  .pair-container {
    flex-direction: column;
  }
  
  .arrow {
    transform: rotate(90deg);
    margin: 10px 0;
  }
}
</style> 