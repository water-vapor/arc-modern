<template>
  <div class="task-controls card">
    <h2 class="card-title">Task Controls</h2>
    
    <div class="control-section">
      <h3 class="section-title">Current Task</h3>
      <div class="task-info">
        <div class="task-name" v-if="taskName">
          <span class="arc-version">{{ arcVersion }}</span>
          <span class="subset-prefix">[{{ currentSubset }}]</span> {{ taskName }}
        </div>
        <div class="task-navigation" v-if="taskName">
          <div class="counter-display">
            Task {{ currentTaskIndex > -1 ? currentTaskIndex + 1 : '1' }} / {{ totalTaskCount || '?' }}
          </div>
          <div class="nav-button-group">
            <button class="btn btn-small nav-btn" @click="$emit('previous-task')">
              <span class="material-icons">navigate_before</span> Previous
            </button>
            <button class="btn btn-small nav-btn" @click="$emit('next-task')">
              Next <span class="material-icons">navigate_next</span>
            </button>
          </div>
        </div>
      </div>
    </div>
    
    <div class="control-section">
      <h3 class="section-title">Test Input Controls</h3>
      
      <div class="test-navigation">
        <div class="counter-display">
          Test {{ currentTestIndex + 1 }} / {{ totalTestCount }}
        </div>
        <div class="nav-button-group">
          <button 
            class="btn btn-small nav-btn"
            @click="$emit('previous-test')"
            :disabled="currentTestIndex <= 0"
          >
            <span class="material-icons">navigate_before</span> Previous
          </button>
          <button 
            class="btn btn-small nav-btn"
            @click="$emit('next-test')"
            :disabled="currentTestIndex >= totalTestCount - 1"
          >
            Next <span class="material-icons">navigate_next</span>
          </button>
        </div>
      </div>
    </div>
    
    <div class="control-section">
      <h3 class="section-title">Validate Solution</h3>
      
      <button 
        class="btn btn-success validate-btn" 
        @click="$emit('validate-solution')"
      >
        <span class="material-icons">check_circle</span> 
        Submit Solution
      </button>
      
      <button 
        class="btn btn-secondary show-solution-btn" 
        @click="$emit('show-solution')"
      >
        <span class="material-icons">visibility</span> 
        Show Solution
      </button>
    </div>
    
    <div class="control-section">
      <h3 class="section-title">Load Task</h3>
      
      <div class="load-options">
        <button class="btn" @click="$emit('random-task')">
          <span class="material-icons">shuffle</span> Random Task
        </button>
        
        <div class="or-divider">
          <span>OR</span>
        </div>
        
        <div class="file-upload">
          <label for="file-upload-input" class="btn btn-secondary">
            <span class="material-icons">upload_file</span> Upload JSON
          </label>
          <input 
            type="file" 
            id="file-upload-input" 
            @change="handleFileUpload" 
            accept=".json"
            style="display: none"
          >
        </div>
        
        <div class="or-divider">
          <span>OR</span>
        </div>
        
        <div class="manual-task-selection">
          <div class="arc-version-selector">
            <label for="arc-version-select">Challenge Version:</label>
            <select id="arc-version-select" v-model="selectedArcVersion" class="arc-select" @change="changeArcVersion">
              <option :value="1">ARC-AGI 1</option>
              <option :value="2">ARC-AGI 2</option>
            </select>
          </div>
          
          <div class="selection-controls">
            <select v-model="subset" class="subset-select">
              <option value="training">Training</option>
              <option value="evaluation">Evaluation</option>
            </select>
            
            <input 
              type="text" 
              v-model="taskIndex" 
              class="task-index-input"
              placeholder="Task # or Hash (e.g. 52df9849)"
            >
            
            <button class="btn" @click="loadSpecificTask">Load</button>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import { ref, onMounted } from 'vue'
import { useStore } from 'vuex'

export default {
  name: 'TaskControls',
  props: {
    taskName: {
      type: String,
      default: ''
    },
    currentTaskIndex: {
      type: Number,
      default: -1
    },
    currentSubset: {
      type: String,
      default: 'training'
    },
    currentTestIndex: {
      type: Number,
      default: 0
    },
    totalTestCount: {
      type: Number,
      default: 0
    },
    totalTaskCount: {
      type: Number,
      default: 0
    },
    arcVersion: {
      type: String,
      default: 'ARC 2'
    }
  },
  emits: [
    'previous-task', 
    'next-task', 
    'random-task',
    'load-task',
    'load-file',
    'previous-test',
    'next-test',
    'validate-solution',
    'show-solution'
  ],
  setup(props, { emit }) {
    const store = useStore()
    const taskIndex = ref(props.currentTaskIndex >= 0 ? (props.currentTaskIndex + 1).toString() : '1') // Convert to 1-indexed string
    const subset = ref(props.currentSubset)
    const selectedArcVersion = ref(store.state.arcVersion)
    
    onMounted(() => {
      // Update the task index when props change
      if (props.currentTaskIndex >= 0) {
        taskIndex.value = (props.currentTaskIndex + 1).toString() // Convert to 1-indexed string
      }
    })
    
    const handleFileUpload = (event) => {
      const file = event.target.files[0]
      if (file) {
        emit('load-file', file)
      }
      // Clear the input value to allow selecting the same file again
      event.target.value = ''
    }
    
    const loadSpecificTask = () => {
      // Check if input is a hash (8-character hex string) or a number
      const isHash = /^[a-fA-F0-9]{8}$/.test(taskIndex.value.toString().trim())
      
      if (isHash) {
        // Emit with hash flag
        emit('load-task', { 
          hash: taskIndex.value.toString().trim(),
          subset: subset.value,
          isHash: true
        })
      } else {
        // Emit with numeric index
        const numericIndex = parseInt(taskIndex.value.toString().trim(), 10)
        if (isNaN(numericIndex) || numericIndex < 1) {
          // Could show error here, but let parent handle validation
          return
        }
        emit('load-task', { 
          taskIndex: numericIndex, // Will be converted to 0-indexed in parent component
          subset: subset.value,
          isHash: false
        })
      }
    }
    
    const changeArcVersion = () => {
      store.dispatch('setArcVersion', selectedArcVersion.value)
      // Reset task index to 1 when changing versions
      taskIndex.value = '1'
    }
    
    return {
      taskIndex,
      subset,
      selectedArcVersion,
      handleFileUpload,
      loadSpecificTask,
      changeArcVersion
    }
  }
}
</script>

<style lang="scss" scoped>
.task-controls {
  max-width: 100%;
}

.control-section {
  margin-bottom: 24px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

.section-title {
  font-size: 16px;
  font-weight: 500;
  margin: 0 0 12px 0;
  color: var(--secondary-color);
}

.task-info {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.task-name {
  font-size: 16px;
  font-weight: bold;
  word-break: break-word;
  
  .subset-prefix {
    color: var(--primary-color);
    font-weight: normal;
  }
}

.task-navigation, .test-navigation {
  display: flex;
  flex-direction: column;
  width: 100%;
  gap: 8px;
}

.arc-version {
  display: inline-block;
  background-color: var(--primary-color);
  color: white;
  font-size: 12px;
  padding: 2px 6px;
  border-radius: 4px;
  margin-right: 6px;
}

.counter-display {
  width: 100%;
  text-align: center;
  font-weight: 500;
  background-color: #f5f7fa;
  padding: 8px;
  border-radius: 4px;
  color: var(--secondary-color);
}

.load-options {
  display: flex;
  flex-direction: column;
  gap: 16px;
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
    margin: 0 8px;
  }
}

.selection-controls {
  display: flex;
  flex-direction: column;
  gap: 8px;
  width: 100%;
}

.subset-select, .task-index-input, .arc-select {
  width: 100%;
  padding: 8px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
}

.arc-version-selector {
  margin-bottom: 10px;
  
  label {
    display: block;
    margin-bottom: 6px;
    font-weight: 500;
  }
}

.validate-btn, .show-solution-btn {
  width: 100%;
  margin-bottom: 8px;
  
  &:last-child {
    margin-bottom: 0;
  }
}

@media (max-width: 768px) {
  .selection-controls {
    flex-direction: column;
  }
}

.nav-button-group {
  display: flex;
  width: 100%;
  align-items: center;
  justify-content: space-between;
  gap: 8px;
}

.nav-btn {
  flex: 1;
  white-space: nowrap;
  justify-content: center;
  max-width: none;
}
</style> 