<template>
  <div class="toolbar">
    <div class="tool-group">
      <label class="tool-label">Tools:</label>
      <div class="tool-options">
        <div 
          class="tool-option" 
          :class="{ 'active': selectedTool === 'edit' }"
          @click="selectTool('edit')"
        >
          <span class="material-icons">edit</span>
          <span class="tool-name">Edit</span>
        </div>
        
        <div 
          class="tool-option" 
          :class="{ 'active': selectedTool === 'select' }"
          @click="selectTool('select')"
        >
          <span class="material-icons">select_all</span>
          <span class="tool-name">Select</span>
        </div>
        
        <div 
          class="tool-option" 
          :class="{ 'active': selectedTool === 'floodfill' }"
          @click="selectTool('floodfill')"
        >
          <span class="material-icons">format_color_fill</span>
          <span class="tool-name">Flood Fill</span>
        </div>
      </div>
    </div>
    
    <div class="tool-group">
      <label class="tool-label">Grid Size:</label>
      <div class="grid-size-control">
        <input 
          type="text" 
          v-model="gridSizeInput" 
          @keyup.enter="resizeGrid"
          placeholder="3x3"
        >
        <button class="btn btn-small" @click="resizeGrid">Resize</button>
      </div>
    </div>
    
    <div class="tool-group">
      <label class="tool-label">Actions:</label>
      <div class="action-buttons">
        <button class="btn btn-small" @click="$emit('copy-from-input')">
          <span class="material-icons">content_copy</span> Copy from input
        </button>
        <button class="btn btn-small btn-secondary" @click="$emit('reset-grid')">
          <span class="material-icons">restart_alt</span> Reset
        </button>
      </div>
    </div>
    
    <div class="tool-group">
      <div class="options">
        <label class="checkbox-label">
          <input 
            type="checkbox" 
            :checked="showSymbolNumbers" 
            @change="updateShowSymbolNumbers"
          >
          Show symbol numbers
        </label>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, watch } from 'vue'
import { parseSizeTuple } from '@/utils/gridUtils'

export default {
  name: 'AppToolbar',
  props: {
    selectedTool: {
      type: String,
      default: 'edit'
    },
    showSymbolNumbers: {
      type: Boolean,
      default: false
    },
    currentGridSize: {
      type: Object,
      default: () => ({ height: 3, width: 3 })
    }
  },
  emits: [
    'update:selectedTool', 
    'update:showSymbolNumbers',
    'resize-grid',
    'copy-from-input',
    'reset-grid'
  ],
  setup(props, { emit }) {
    const gridSizeInput = ref(`${props.currentGridSize.height}x${props.currentGridSize.width}`)
    
    // Watch for changes in the current grid size
    watch(() => props.currentGridSize, (newSize) => {
      gridSizeInput.value = `${newSize.height}x${newSize.width}`
    })
    
    const selectTool = (tool) => {
      emit('update:selectedTool', tool)
    }
    
    const updateShowSymbolNumbers = () => {
      emit('update:showSymbolNumbers', !props.showSymbolNumbers)
    }
    
    const resizeGrid = () => {
      try {
        const [height, width] = parseSizeTuple(gridSizeInput.value)
        emit('resize-grid', { height, width })
      } catch (error) {
        alert(error.message)
      }
    }
    
    return {
      gridSizeInput,
      selectTool,
      updateShowSymbolNumbers,
      resizeGrid
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbar {
  background-color: white;
  border-radius: 8px;
  padding: 16px;
  display: flex;
  flex-direction: column;
  gap: 16px;
  box-shadow: var(--shadow);
}

.tool-group {
  display: flex;
  flex-direction: column;
  gap: 8px;
}

.tool-label {
  font-weight: 500;
  font-size: 14px;
  color: var(--secondary-color);
}

.tool-options {
  display: flex;
  gap: 8px;
}

.tool-option {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  background-color: #f5f7fa;
  border-radius: 6px;
  padding: 8px;
  cursor: pointer;
  transition: all 0.2s ease;
  
  &:hover {
    background-color: #e9ecef;
  }
  
  &.active {
    background-color: var(--primary-color);
    color: white;
  }
  
  .material-icons {
    font-size: 20px;
    margin-bottom: 4px;
  }
  
  .tool-name {
    font-size: 12px;
  }
}

.grid-size-control {
  display: flex;
  gap: 8px;
  
  input {
    width: 80px;
  }
}

.action-buttons {
  display: flex;
  gap: 8px;
}

.btn-small {
  font-size: 12px;
  padding: 6px 12px;
  display: flex;
  align-items: center;
  gap: 4px;
  
  .material-icons {
    font-size: 16px;
  }
}

.checkbox-label {
  display: flex;
  align-items: center;
  gap: 6px;
  cursor: pointer;
  user-select: none;
}
</style> 