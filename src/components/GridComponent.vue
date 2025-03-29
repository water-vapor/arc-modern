<template>
  <div class="grid-component" :style="{ width: containerWidth + 'px', height: containerHeight + 'px' }">
    <div class="grid">
      <div 
        v-for="(row, rowIndex) in gridData" 
        :key="'row-' + rowIndex" 
        class="grid-row"
      >
        <div 
          v-for="(cell, colIndex) in row" 
          :key="'cell-' + rowIndex + '-' + colIndex" 
          class="grid-cell"
          :class="[
            'symbol_' + cell, 
            { 'selectable': editable }, 
            { 'selected': isSelected(rowIndex, colIndex) }
          ]"
          :style="{ 
            width: cellSize + 'px', 
            height: cellSize + 'px',
            fontSize: showSymbolNumbers ? cellSize * 0.6 + 'px' : '0'
          }"
          :data-row="rowIndex" 
          :data-col="colIndex"
          :data-symbol="cell"
          @click="handleCellClick(rowIndex, colIndex)"
          @mousedown="handleMouseDown(rowIndex, colIndex)"
          @mouseenter="handleMouseEnter(rowIndex, colIndex)"
        >
          {{ showSymbolNumbers ? cell : '' }}
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, computed, watch } from 'vue'
import { calculateCellSize, floodFillFromLocation } from '@/utils/gridUtils'

export default {
  name: 'GridComponent',
  props: {
    gridData: {
      type: Array,
      required: true
    },
    editable: {
      type: Boolean,
      default: false
    },
    containerWidth: {
      type: Number,
      default: 400
    },
    containerHeight: {
      type: Number,
      default: 400
    },
    selectedSymbol: {
      type: Number,
      default: 0
    },
    toolMode: {
      type: String,
      default: 'edit' // edit, select, floodfill
    },
    showSymbolNumbers: {
      type: Boolean,
      default: false
    }
  },
  emits: ['update:gridData', 'cell-changed'],
  setup(props, { emit }) {
    const isMouseDown = ref(false)
    const selectedCells = ref([])
    
    // Calculate cell size based on grid dimensions and container size
    const cellSize = computed(() => {
      if (!props.gridData || !props.gridData.length) return 40
      
      const height = props.gridData.length
      const width = props.gridData[0].length
      
      // Adjust formula with proper margins and max size
      const maxCellWidth = (props.containerWidth - 10) / width
      const maxCellHeight = (props.containerHeight - 10) / height
      
      // Use higher max cell size on larger screens
      const maxSize = window.innerWidth >= 1600 ? 70 : 50
      
      return Math.max(10, Math.min(maxCellWidth, maxCellHeight, maxSize))
    })
    
    // Check if a cell is selected
    const isSelected = (row, col) => {
      return selectedCells.value.some(cell => cell.row === row && cell.col === col)
    }
    
    // Handle cell click event
    const handleCellClick = (row, col) => {
      if (!props.editable) return
      
      if (props.toolMode === 'floodfill') {
        const newGrid = JSON.parse(JSON.stringify(props.gridData))
        floodFillFromLocation(newGrid, row, col, props.selectedSymbol)
        emit('update:gridData', newGrid)
      } else if (props.toolMode === 'edit') {
        updateCell(row, col, props.selectedSymbol)
      }
    }
    
    // Handle mouse down event for selection
    const handleMouseDown = (row, col) => {
      if (!props.editable) return
      
      isMouseDown.value = true
      
      if (props.toolMode === 'select') {
        selectedCells.value = [{ row, col }]
      }
    }
    
    // Handle mouse enter event for drag selection
    const handleMouseEnter = (row, col) => {
      if (!props.editable || !isMouseDown.value) return
      
      if (props.toolMode === 'select') {
        if (!isSelected(row, col)) {
          selectedCells.value.push({ row, col })
        }
      } else if (props.toolMode === 'edit') {
        updateCell(row, col, props.selectedSymbol)
      }
    }
    
    // Update a specific cell value
    const updateCell = (row, col, symbol) => {
      if (props.gridData[row][col] === symbol) return
      
      const newGrid = JSON.parse(JSON.stringify(props.gridData))
      newGrid[row][col] = symbol
      
      emit('update:gridData', newGrid)
      emit('cell-changed', { row, col, value: symbol })
    }
    
    // Fill all selected cells with the current symbol
    const fillSelectedCells = () => {
      if (selectedCells.value.length === 0) return
      
      const newGrid = JSON.parse(JSON.stringify(props.gridData))
      
      selectedCells.value.forEach(cell => {
        newGrid[cell.row][cell.col] = props.selectedSymbol
      })
      
      emit('update:gridData', newGrid)
    }
    
    // Reset selection when tool changes
    watch(() => props.toolMode, () => {
      selectedCells.value = []
    })
    
    // Watch for symbol changes to fill selected cells
    watch(() => props.selectedSymbol, () => {
      if (props.toolMode === 'select' && selectedCells.value.length > 0) {
        fillSelectedCells()
      }
    })
    
    // Add document event listeners for mouse up
    const handleMouseUp = () => {
      isMouseDown.value = false
    }
    
    // Setup global event listeners
    if (typeof window !== 'undefined') {
      window.addEventListener('mouseup', handleMouseUp)
      window.addEventListener('mouseleave', handleMouseUp)
    }
    
    return {
      cellSize,
      isSelected,
      handleCellClick,
      handleMouseDown,
      handleMouseEnter
    }
  }
}
</script>

<style lang="scss" scoped>
.grid-component {
  display: flex;
  justify-content: center;
  align-items: center;
  margin: 0 auto;
  overflow: auto;
  max-width: 100%;
}

.grid {
  border: 2px solid #333;
  background-color: #eee;
  display: inline-flex;
  flex-direction: column;
}

.grid-row {
  display: flex;
}

.grid-cell {
  border: 1px solid #ccc;
  display: flex;
  justify-content: center;
  align-items: center;
  font-weight: bold;
  transition: all 0.1s ease;
  
  &.selectable {
    cursor: pointer;
    
    &:hover {
      opacity: 0.8;
    }
  }
  
  &.selected {
    box-shadow: inset 0 0 0 3px rgba(0, 0, 0, 0.5);
  }
}
</style> 