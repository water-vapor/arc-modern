<template>
  <div class="puzzle-view">
    <div class="welcome-overlay" v-if="!taskLoaded">
      <div class="welcome-card">
        <h1>Welcome to ARC</h1>
        <p>Abstract Reasoning Challenge</p>
        
        <div class="welcome-actions">
          <div class="arc-version-selector">
            <label for="welcome-arc-version">Challenge Version:</label>
            <select id="welcome-arc-version" v-model="selectedArcVersion" class="select-dropdown">
              <option :value="1">ARC-AGI 1</option>
              <option :value="2">ARC-AGI 2</option>
            </select>
          </div>
          
          <button class="btn" @click="loadRandomTask">
            <span class="material-icons">shuffle</span> Load Random Task
          </button>
          
          <div class="or-divider"><span>OR</span></div>
          
          <label for="welcome-file-upload" class="btn btn-secondary">
            <span class="material-icons">upload_file</span> Upload Task JSON
          </label>
          <input 
            type="file" 
            id="welcome-file-upload" 
            @change="handleFileUpload" 
            accept=".json"
            style="display: none"
          >
          
          <div class="or-divider"><span>OR</span></div>
          
          <div class="manual-selection">
            <div class="selection-row">
              <select v-model="initialSubset" class="select-dropdown">
                <option value="training">Training</option>
                <option value="evaluation">Evaluation</option>
              </select>
              
              <input 
                type="text" 
                v-model="initialTaskIndex" 
                class="task-number-input"
                placeholder="Task # or Hash (e.g. 52df9849)"
              >
            </div>
            
            <button class="btn btn-secondary load-specific-btn" @click="loadInitialTask">
              <span class="material-icons">play_arrow</span> Load Task
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="main-container" v-else>
      <div class="sidebar">
        <TaskControls 
          :task-name="taskName"
          :current-task-index="currentTaskIndex"
          :current-subset="currentSubset"
          :current-test-index="currentTestPairIndex"
          :total-test-count="testPairs.length"
          :total-task-count="totalTaskCount"
          :arc-version="arcVersionName"
          @previous-task="loadPreviousTask"
          @next-task="loadNextTask"
          @random-task="loadRandomTask"
          @load-task="loadSpecificTask"
          @load-file="handleFileUpload"
          @previous-test="previousTestInput"
          @next-test="nextTestInput"
          @validate-solution="validateSolution"
          @show-solution="showSolution"
        />
      </div>
      
      <div class="main-content">
        <div class="task-examples">
          <h2>Task Examples</h2>
          <div class="examples-container" :class="{ 'has-magnified': hasMagnifiedExample }">
            <task-pair-preview
              v-for="(pair, index) in trainExamples"
              :key="'train-' + index"
              :pair-data="pair"
              :index="index"
              :show-symbol-numbers="showSymbolNumbers"
              @magnify="handleExampleMagnify"
            />
          </div>
        </div>
        
        <div class="puzzle-workspace">
          <div class="puzzle-input">
            <h2>Test Input</h2>
            <grid-component
              :grid-data="currentInputGrid || []"
              :container-width="gridContainerSize"
              :container-height="gridContainerSize"
              :show-symbol-numbers="showSymbolNumbers"
            />
          </div>
          
          <div class="puzzle-output">
            <h2>Your Solution</h2>
            <div class="output-grid-container">
              <grid-component
                v-if="currentOutputGrid"
                :grid-data="currentOutputGrid"
                :container-width="gridContainerSize"
                :container-height="gridContainerSize"
                :editable="true"
                :selected-symbol="selectedSymbol"
                :tool-mode="selectedTool"
                :show-symbol-numbers="showSymbolNumbers"
                @update:grid-data="updateOutputGrid"
              />
            </div>
            
            <div class="output-tools">
              <div class="toolbar-container">
                <toolbar
                  :selected-tool="selectedTool"
                  :show-symbol-numbers="showSymbolNumbers"
                  :current-grid-size="{ 
                    height: currentOutputGrid?.length || 3, 
                    width: currentOutputGrid?.[0]?.length || 3 
                  }"
                  @update:selected-tool="selectedTool = $event"
                  @update:show-symbol-numbers="showSymbolNumbers = $event"
                  @resize-grid="resizeOutputGrid"
                  @copy-from-input="copyFromInput"
                  @reset-grid="resetOutputGrid"
                />
              </div>
              
              <div class="symbol-picker-container">
                <symbol-picker
                  :selected-symbol="selectedSymbol"
                  :show-symbol-numbers="showSymbolNumbers"
                  @symbol-selected="selectSymbol"
                />
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
    
    <notification
      :show="notification.show"
      :message="notification.message"
      :type="notification.type"
      :duration="notification.duration"
      @update:show="notification.show = $event"
    />
  </div>
</template>

<script>
import { ref, computed, onMounted, watch } from 'vue'
import { useStore } from 'vuex'
import GridComponent from '@/components/GridComponent.vue'
import SymbolPicker from '@/components/SymbolPicker.vue'
import Toolbar from '@/components/Toolbar.vue'
import TaskPairPreview from '@/components/TaskPairPreview.vue'
import TaskControls from '@/components/TaskControls.vue'
import Notification from '@/components/Notification.vue'

export default {
  name: 'PuzzleView',
  components: {
    GridComponent,
    SymbolPicker,
    Toolbar,
    TaskPairPreview,
    TaskControls,
    Notification
  },
  setup() {
    const store = useStore()
    
    // Local state
    const selectedTool = ref('edit')
    const selectedSymbol = ref(0)
    const showSymbolNumbers = ref(false)
    const taskLoaded = ref(false)
    const notification = ref({
      show: false,
      message: '',
      type: 'info',
      duration: 3000
    })
    
    // Additional state for ARC version
    const selectedArcVersion = ref(store.state.arcVersion)
    
    // Computed properties
    const trainExamples = computed(() => store.state.trainExamples)
    const testPairs = computed(() => store.state.testPairs)
    const currentTestPairIndex = computed(() => store.state.currentTestPairIndex)
    const currentInputGrid = computed(() => store.state.currentInputGrid)
    const currentOutputGrid = computed(() => store.state.currentOutputGrid)
    const taskName = computed(() => store.state.taskName)
    const currentTaskIndex = computed(() => store.state.currentTaskIndex)
    const displayTaskIndex = computed(() => currentTaskIndex.value + 1) // 1-indexed for display
    const currentSubset = computed(() => store.state.currentSubset)
    const totalTaskCount = computed(() => store.state.totalTaskCount)
    
    // Update ARC version in store when local state changes
    watch(selectedArcVersion, async (newVersion) => {
      await store.dispatch('setArcVersion', newVersion)
    })
    
    // Additional state
    const initialTaskIndex = ref('1') // Start at 1 for 1-indexed UI
    const initialSubset = ref('training')
    
    // Add a computed property for grid container size
    const gridContainerSize = ref(400)
    
    // Add state to track magnified examples
    const magnifiedExampleIndex = ref(-1)
    const hasMagnifiedExample = computed(() => magnifiedExampleIndex.value >= 0)
    
    // Add computed property for ARC version
    const arcVersionName = computed(() => store.getters.arcVersionName)
    
    // Methods
    const showNotification = (message, type = 'info', duration = 3000) => {
      notification.value = {
        show: true,
        message,
        type,
        duration
      }
    }
    
    const loadRandomTask = async () => {
      const result = await store.dispatch('loadRandomTask')
      
      if (result.success) {
        taskLoaded.value = true
        showNotification('Random task loaded successfully', 'success')
      } else {
        showNotification('Failed to load random task', 'error')
      }
    }
    
    const loadSpecificTask = async (params) => {
      let result
      
      if (params.isHash) {
        // Load by hash
        result = await store.dispatch('loadTaskByHash', { 
          hash: params.hash, 
          subset: params.subset 
        })
        if (result.success) {
          taskLoaded.value = true
          showNotification('Task loaded successfully', 'success')
        } else {
          showNotification(result.error || 'Failed to load task', 'error')
        }
      } else {
        // Convert 1-indexed input to 0-indexed for store
        if (params.taskIndex) {
          params.taskIndex = params.taskIndex - 1
        }
        
        result = await store.dispatch('loadTask', params)
        
        if (result.success) {
          taskLoaded.value = true
          showNotification(`Task ${params.taskIndex + 1} loaded successfully`, 'success')
        } else {
          if (result.isNavigation) {
            showNotification(result.error, 'info')
          } else {
            showNotification('Failed to load task: ' + result.error, 'error')
          }
        }
      }
    }
    
    const handleFileUpload = async (file) => {
      try {
        const result = await store.dispatch('loadTaskFromFile', file)
        
        if (result.success) {
          taskLoaded.value = true
          showNotification('Task loaded from file successfully', 'success')
        } else {
          showNotification('Failed to load task from file', 'error')
        }
      } catch (error) {
        showNotification(error.error || 'Failed to load task from file', 'error')
      }
    }
    
    const loadNextTask = () => {
      loadSpecificTask({
        taskIndex: currentTaskIndex.value + 1 + 1, // +1 to go to next, +1 for 1-indexed UI
        subset: currentSubset.value
      })
    }
    
    const loadPreviousTask = () => {
      if (currentTaskIndex.value <= 0) return
      
      loadSpecificTask({
        taskIndex: currentTaskIndex.value + 1 - 1, // +1 for 1-indexed UI, -1 to go to previous
        subset: currentSubset.value
      })
    }
    
    const nextTestInput = () => {
      store.commit('nextTestInput')
    }
    
    const previousTestInput = () => {
      store.commit('previousTestInput')
    }
    
    const updateOutputGrid = (grid) => {
      store.commit('setOutputGrid', grid)
    }
    
    const selectSymbol = (symbol) => {
      selectedSymbol.value = symbol
      store.commit('setSelectedSymbol', symbol)
    }
    
    const resizeOutputGrid = ({ height, width }) => {
      store.commit('resizeOutputGrid', { height, width })
    }
    
    const copyFromInput = () => {
      store.commit('copyFromInput')
      showNotification('Copied from input', 'info')
    }
    
    const resetOutputGrid = () => {
      store.commit('resetOutputGrid')
      showNotification('Output grid reset', 'info')
    }
    
    const validateSolution = () => {
      if (!currentOutputGrid.value || !store.getters.currentTestOutput) {
        showNotification('No solution to validate', 'error')
        return
      }
      
      const submitted = currentOutputGrid.value
      const expected = store.getters.currentTestOutput
      
      if (submitted.length !== expected.length) {
        showNotification('Wrong solution. Grid dimensions do not match.', 'error')
        return
      }
      
      for (let i = 0; i < expected.length; i++) {
        if (submitted[i].length !== expected[i].length) {
          showNotification('Wrong solution. Grid dimensions do not match.', 'error')
          return
        }
        
        for (let j = 0; j < expected[i].length; j++) {
          if (submitted[i][j] !== expected[i][j]) {
            showNotification('Wrong solution. Try again!', 'error')
            return
          }
        }
      }
      
      showNotification('Correct solution! Great job!', 'success', 5000)
    }
    
    const showSolution = () => {
      if (!store.getters.currentTestOutput) {
        showNotification('No solution available', 'error')
        return
      }
      
      store.commit('setOutputGrid', JSON.parse(JSON.stringify(store.getters.currentTestOutput)))
      showNotification('Solution displayed', 'info')
    }
    
    const loadInitialTask = async () => {
      const metadataResult = await store.dispatch('loadTasksMetadata', initialSubset.value)
      if (!metadataResult.success) {
        showNotification('Failed to load tasks data', 'error')
        return
      }

      // Check if input is a hash (8-character hex string) or a number
      const isHash = /^[a-fA-F0-9]{8}$/.test(initialTaskIndex.value.toString().trim())
      
      if (isHash) {
        // Load by hash
        const result = await store.dispatch('loadTaskByHash', { 
          hash: initialTaskIndex.value.toString().trim(), 
          subset: initialSubset.value 
        })
        if (result.success) {
          taskLoaded.value = true
          showNotification('Task loaded successfully', 'success')
        } else {
          showNotification(result.error || 'Failed to load task', 'error')
        }
      } else {
        // Load by index
        const taskIndex = parseInt(initialTaskIndex.value.toString().trim(), 10)
        if (isNaN(taskIndex) || taskIndex < 1) {
          showNotification('Please enter a valid task number or 8-character hash', 'error')
          return
        }
        
        loadSpecificTask({
          taskIndex: taskIndex, // Will be converted to 0-indexed in loadSpecificTask
          subset: initialSubset.value
        })
      }
    }
    
    // Update grid container size based on screen width
    const updateGridContainerSize = () => {
      if (window.innerWidth >= 1600) {
        gridContainerSize.value = 550
      } else if (window.innerWidth >= 1200) {
        gridContainerSize.value = 450
      } else {
        gridContainerSize.value = 400
      }
    }
    
    // Handle example magnification
    const handleExampleMagnify = ({ index, magnified }) => {
      if (magnified) {
        magnifiedExampleIndex.value = index
      } else if (magnifiedExampleIndex.value === index) {
        magnifiedExampleIndex.value = -1
      }
    }
    
    // Setup resize listener
    onMounted(() => {
      // Preload metadata for both splits
      store.dispatch('loadTasksMetadata', 'training')
      store.dispatch('loadTasksMetadata', 'evaluation')
      updateGridContainerSize()
      window.addEventListener('resize', updateGridContainerSize)
    })
    
    return {
      // State
      selectedTool,
      selectedSymbol,
      showSymbolNumbers,
      taskLoaded,
      notification,
      
      // Computed
      trainExamples,
      testPairs,
      currentTestPairIndex,
      currentInputGrid,
      currentOutputGrid,
      taskName,
      currentTaskIndex,
      currentSubset,
      totalTaskCount,
      
      // Additional state
      initialTaskIndex,
      initialSubset,
      
      // Computed
      gridContainerSize,
      
      // Computed
      magnifiedExampleIndex,
      hasMagnifiedExample,
      
      // Computed
      arcVersionName,
      
      // Additional state
      selectedArcVersion,
      displayTaskIndex,
      
      // Methods
      loadRandomTask,
      loadSpecificTask,
      handleFileUpload,
      loadNextTask,
      loadPreviousTask,
      nextTestInput,
      previousTestInput,
      updateOutputGrid,
      selectSymbol,
      resizeOutputGrid,
      copyFromInput,
      resetOutputGrid,
      validateSolution,
      showSolution,
      loadInitialTask,
      handleExampleMagnify
    }
  }
}
</script>

<style lang="scss" scoped>
.puzzle-view {
  width: 100%;
  height: 100%;
}

.welcome-overlay {
  position: fixed;
  top: 0;
  left: 0;
  right: 0;
  bottom: 0;
  background-color: rgba(0, 0, 0, 0.8);
  display: flex;
  justify-content: center;
  align-items: center;
  z-index: 1000;
}

.welcome-card {
  background-color: white;
  border-radius: 8px;
  padding: 32px;
  max-width: 500px;
  text-align: center;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.2);
  
  h1 {
    color: var(--primary-color);
    margin: 0 0 8px 0;
  }
  
  p {
    margin: 0 0 24px 0;
    color: var(--secondary-color);
  }
}

.welcome-actions {
  display: flex;
  flex-direction: column;
  gap: 16px;
  
  button, label {
    width: 100%;
  }
}

.or-divider {
  display: flex;
  align-items: center;
  font-size: 12px;
  color: #888;
  
  &::before, &::after {
    content: "";
    flex: 1;
    height: 1px;
    background-color: #ddd;
    margin: 0 12px;
  }
}

.main-container {
  display: flex;
  height: calc(100vh - 60px); // Subtract header height
  width: 100%;
}

.sidebar {
  width: 300px;
  padding: 16px;
  overflow-y: auto;
  background-color: var(--background-color);
}

.main-content {
  flex: 1;
  padding: 16px;
  overflow-y: auto;
  display: flex;
  flex-direction: column;
  gap: 24px;
}

.task-examples {
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
  }
}

.examples-container {
  display: flex;
  flex-wrap: wrap;
  gap: 24px;
  justify-content: center;
  transition: all 0.3s ease;
  
  &.has-magnified {
    display: block;
  }
}

.puzzle-workspace {
  display: flex;
  flex-wrap: wrap;
  gap: 32px;
  justify-content: center;
  align-items: flex-start;
  
  h2 {
    margin-top: 0;
    margin-bottom: 16px;
    text-align: center;
    width: 100%;
  }
}

.puzzle-input, .puzzle-output {
  display: flex;
  flex-direction: column;
  align-items: center;
  margin-bottom: 24px;
}

.output-tools {
  margin-top: 16px;
  display: flex;
  flex-wrap: wrap;
  gap: 16px;
  justify-content: center;
  width: 100%;
}

.toolbar-container, .symbol-picker-container {
  margin-bottom: 16px;
}

.manual-selection {
  width: 100%;
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.selection-row {
  display: flex;
  gap: 8px;
}

.select-dropdown, .task-number-input {
  flex: 1;
  padding: 8px 12px;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.load-specific-btn {
  width: 100%;
}

.arc-version-selector {
  width: 100%;
  margin-bottom: 16px;
  
  label {
    display: block;
    margin-bottom: 8px;
    font-weight: bold;
    color: var(--text-color);
  }
  
  select {
    width: 100%;
  }
}

@media (max-width: 1200px) {
  .main-container {
    flex-direction: column;
    height: auto;
  }
  
  .sidebar {
    width: 100%;
    height: auto;
  }
  
  .puzzle-workspace {
    flex-direction: column;
    align-items: center;
  }
}
</style> 