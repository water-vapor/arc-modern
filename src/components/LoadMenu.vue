<template>
  <div class="load-menu">
    <div class="menu-header">
      <h2>Load Puzzle</h2>
    </div>
    
    <div class="arc-version-selector">
      <label for="arc-version">Challenge Version:</label>
      <select id="arc-version" v-model="selectedArcVersion" @change="changeArcVersion">
        <option :value="1">ARC-AGI 1</option>
        <option :value="2">ARC-AGI 2</option>
      </select>
    </div>

    <div class="dataset-selector">
      <button 
        :class="['dataset-button', { active: currentSubset === 'training' }]"
        @click="changeSubset('training')"
      >
        Training
      </button>
      <button 
        :class="['dataset-button', { active: currentSubset === 'evaluation' }]"
        @click="changeSubset('evaluation')"
      >
        Evaluation
      </button>
    </div>
    
    <div class="task-selector">
      <input 
        type="number" 
        v-model.number="taskId" 
        min="1" 
        placeholder="Task #"
        class="task-input"
      />
      <button 
        :class="['load-button']"
        @click="loadSpecificTask"
        :disabled="loading"
      >
        Load Task
      </button>
    </div>
    
    <button 
      class="random-button"
      @click="loadRandomTask"
      :disabled="loading"
    >
      Random Task
    </button>
    
    <div v-if="error" class="error-message">
      {{ error }}
    </div>
  </div>
</template>

<script>
import { mapActions, mapState, mapGetters } from 'vuex'

export default {
  name: 'LoadMenu',
  data() {
    return {
      loading: false,
      selectedArcVersion: 2, // Default to ARC 2
      error: null,
      taskId: 1
    }
  },
  
  computed: {
    ...mapState(['currentTaskIndex', 'currentSubset', 'totalTaskCount', 'taskName', 'arcVersion']),
    ...mapGetters(['arcVersionName'])
  },
  
  created() {
    // Initialize the selected version from the store
    this.selectedArcVersion = this.arcVersion
    this.taskId = this.currentTaskIndex + 1
  },
  
  methods: {
    ...mapActions(['loadTask', 'loadRandomTask', 'setSubset', 'setArcVersion']),
    
    async changeArcVersion() {
      try {
        this.loading = true
        this.error = null
        
        const result = await this.setArcVersion(this.selectedArcVersion)
        if (result.success) {
          // Reset task index to 1 when changing versions (for display)
          this.taskId = 1
          await this.loadTask({ taskIndex: 1, subset: this.currentSubset })
        } else {
          this.error = result.error || 'Failed to change ARC version'
        }
      } catch (error) {
        this.error = error.message || 'An error occurred'
      } finally {
        this.loading = false
      }
    },
    
    async changeSubset(subset) {
      try {
        this.loading = true
        this.error = null
        
        await this.setSubset(subset)
        const result = await this.loadTask({ taskIndex: 1, subset })
        
        if (!result.success && !result.isNavigation) {
          this.error = result.error || 'Failed to load task'
        }
      } catch (error) {
        this.error = error.message || 'An error occurred'
      } finally {
        this.loading = false
      }
    },
    
    async loadSpecificTask() {
      try {
        this.loading = true
        this.error = null
        
        const result = await this.loadTask({ taskIndex: this.taskId, subset: this.currentSubset })
        
        if (!result.success) {
          this.error = result.error || 'Failed to load task'
        }
      } catch (error) {
        this.error = error.message || 'An error occurred'
      } finally {
        this.loading = false
      }
    }
  }
}
</script>

<style scoped>
.load-menu {
  background-color: var(--menu-bg);
  padding: 1rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  border-radius: 8px;
  box-shadow: 0 2px 10px rgba(0, 0, 0, 0.1);
}

.menu-header {
  text-align: center;
  margin-bottom: 0.5rem;
}

.menu-header h2 {
  margin: 0;
  color: var(--primary-color);
}

.arc-version-selector {
  display: flex;
  align-items: center;
  gap: 10px;
  margin-bottom: 10px;
}

.arc-version-selector label {
  font-weight: bold;
  color: var(--text-color);
}

.arc-version-selector select {
  padding: 5px 10px;
  border-radius: 4px;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  font-size: 14px;
  flex: 1;
}

.dataset-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.dataset-button {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  background-color: var(--bg-color);
  color: var(--text-color);
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.dataset-button.active {
  background-color: var(--primary-color);
  color: white;
  border-color: var(--primary-color);
}

.task-selector {
  display: flex;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.task-input {
  flex: 1;
  padding: 0.5rem;
  border: 1px solid var(--border-color);
  border-radius: 4px;
  font-size: 14px;
}

.load-button, .random-button {
  padding: 0.5rem 1rem;
  background-color: var(--primary-color);
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
  transition: all 0.2s ease;
}

.load-button:hover, .random-button:hover {
  background-color: var(--primary-color-dark);
}

.load-button:disabled, .random-button:disabled {
  background-color: #ccc;
  cursor: not-allowed;
}

.error-message {
  color: red;
  font-size: 14px;
  text-align: center;
  margin-top: 0.5rem;
}
</style> 