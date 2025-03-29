<template>
  <div class="symbol-picker">
    <div class="symbol-palette">
      <div 
        v-for="symbolValue in 10" 
        :key="symbolValue - 1"
        class="symbol-preview" 
        :class="[
          'symbol_' + (symbolValue - 1), 
          { 'selected': selectedSymbol === symbolValue - 1 }
        ]"
        @click="selectSymbol(symbolValue - 1)"
      >
        <span v-if="showSymbolNumbers">{{ symbolValue - 1 }}</span>
      </div>
    </div>
  </div>
</template>

<script>
export default {
  name: 'SymbolPicker',
  props: {
    selectedSymbol: {
      type: Number,
      default: 0
    },
    showSymbolNumbers: {
      type: Boolean,
      default: false
    }
  },
  emits: ['symbol-selected'],
  setup(props, { emit }) {
    const selectSymbol = (symbol) => {
      emit('symbol-selected', symbol)
    }

    return {
      selectSymbol
    }
  }
}
</script>

<style lang="scss" scoped>
.symbol-picker {
  background-color: white;
  border-radius: 8px;
  padding: 12px;
  box-shadow: var(--shadow);
}

.symbol-palette {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
  max-width: 300px;
}

.symbol-preview {
  width: 40px;
  height: 40px;
  border: 2px solid #ccc;
  border-radius: 4px;
  display: flex;
  justify-content: center;
  align-items: center;
  cursor: pointer;
  transition: all 0.2s ease;
  font-weight: bold;
  font-size: 18px;
  
  &:hover {
    transform: scale(1.05);
    box-shadow: 0 2px 8px rgba(0, 0, 0, 0.15);
  }
  
  &.selected {
    border: 2px solid #333;
    box-shadow: 0 0 0 2px rgba(0, 0, 0, 0.2);
    transform: scale(1.05);
  }

  span {
    opacity: 0.7;
  }
}
</style> 