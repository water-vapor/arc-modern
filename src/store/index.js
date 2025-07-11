import { createStore } from 'vuex'
import axios from 'axios'

// API endpoints for ARC 1 and ARC 2
const API_ENDPOINTS = {
  1: {
    base: 'https://api.github.com/repos/fchollet/ARC/contents/data',
    name: 'ARC 1'
  },
  2: {
    base: 'https://api.github.com/repos/arcprize/ARC-AGI-2/contents/data',
    name: 'ARC 2'
  }
}

export default createStore({
  state: {
    currentTask: null,
    taskName: '',
    trainExamples: [],
    testPairs: [],
    currentTestPairIndex: 0,
    currentInputGrid: null,
    currentOutputGrid: null,
    selectedSymbol: 0,
    currentSubset: 'training',
    currentTaskIndex: 0,
    totalTaskCount: 0,
    tasksMetadata: {},
    arcVersion: 2, // Default to ARC 2
  },
  getters: {
    currentTestInput(state) {
      if (state.testPairs.length === 0) return null
      return state.testPairs[state.currentTestPairIndex]?.input || null
    },
    currentTestOutput(state) {
      if (state.testPairs.length === 0) return null
      return state.testPairs[state.currentTestPairIndex]?.output || null
    },
    apiEndpoint: (state) => {
      return API_ENDPOINTS[state.arcVersion]?.base || API_ENDPOINTS[2].base
    },
    arcVersionName: (state) => {
      return API_ENDPOINTS[state.arcVersion]?.name || 'ARC 2'
    }
  },
  mutations: {
    setArcVersion(state, version) {
      state.arcVersion = version
      state.tasksMetadata = {}
      state.totalTaskCount = 0
    },
    setTask(state, { train, test, taskName, taskIndex, subset, totalCount }) {
      state.trainExamples = train
      state.testPairs = test
      state.taskName = taskName
      state.currentTaskIndex = taskIndex !== undefined ? taskIndex : state.currentTaskIndex
      state.currentSubset = subset || state.currentSubset
      state.currentTestPairIndex = 0
      if (totalCount !== undefined) {
        state.totalTaskCount = totalCount
      }

      // Set current input grid
      if (test.length > 0) {
        state.currentInputGrid = test[0].input
      }

      // Initialize empty output grid with same dimensions as input
      if (test.length > 0) {
        const inputGrid = test[0].input
        state.currentOutputGrid = Array(inputGrid.length).fill().map(() => 
          Array(inputGrid[0].length).fill(0)
        )
      }
    },
    nextTestInput(state) {
      if (state.currentTestPairIndex < state.testPairs.length - 1) {
        state.currentTestPairIndex++
        state.currentInputGrid = state.testPairs[state.currentTestPairIndex].input
        
        // Initialize empty output grid with same dimensions as new input
        const inputGrid = state.currentInputGrid
        state.currentOutputGrid = Array(inputGrid.length).fill().map(() => 
          Array(inputGrid[0].length).fill(0)
        )
      }
    },
    previousTestInput(state) {
      if (state.currentTestPairIndex > 0) {
        state.currentTestPairIndex--
        state.currentInputGrid = state.testPairs[state.currentTestPairIndex].input
        
        // Initialize empty output grid with same dimensions as new input
        const inputGrid = state.currentInputGrid
        state.currentOutputGrid = Array(inputGrid.length).fill().map(() => 
          Array(inputGrid[0].length).fill(0)
        )
      }
    },
    setOutputGrid(state, grid) {
      state.currentOutputGrid = grid
    },
    updateOutputCell(state, { row, col, value }) {
      state.currentOutputGrid[row][col] = value
    },
    copyFromInput(state) {
      if (state.currentInputGrid) {
        state.currentOutputGrid = JSON.parse(JSON.stringify(state.currentInputGrid))
      }
    },
    resetOutputGrid(state) {
      if (state.currentInputGrid) {
        const height = state.currentInputGrid.length
        const width = state.currentInputGrid[0].length
        state.currentOutputGrid = Array(height).fill().map(() => Array(width).fill(0))
      }
    },
    resizeOutputGrid(state, { height, width }) {
      // Create a new grid with the desired dimensions
      const newGrid = Array(height).fill().map(() => Array(width).fill(0))
      
      // Copy over existing values where possible
      if (state.currentOutputGrid) {
        for (let i = 0; i < Math.min(height, state.currentOutputGrid.length); i++) {
          for (let j = 0; j < Math.min(width, state.currentOutputGrid[0].length); j++) {
            newGrid[i][j] = state.currentOutputGrid[i][j]
          }
        }
      }
      
      state.currentOutputGrid = newGrid
    },
    setSelectedSymbol(state, symbol) {
      state.selectedSymbol = symbol
    },
    setTasksMetadata(state, { subset, tasks }) {
      state.tasksMetadata = {
        ...state.tasksMetadata,
        [subset]: tasks
      }
      if (subset === state.currentSubset) {
        state.totalTaskCount = tasks.length
      }
    }
  },
  actions: {
    setArcVersion({ commit }, version) {
      commit('setArcVersion', version)
      return { success: true }
    },
    setSubset({ commit, state }, subset) {
      commit('setTask', {
        train: state.trainExamples,
        test: state.testPairs,
        taskName: state.taskName,
        taskIndex: state.currentTaskIndex,
        subset: subset,
        totalCount: state.tasksMetadata[subset]?.length || state.totalTaskCount
      })
      return { success: true }
    },
    async loadTasksMetadata({ commit, getters }, subset) {
      try {
        const response = await axios.get(`${getters.apiEndpoint}/${subset}`)
        const tasks = response.data
        
        commit('setTasksMetadata', { subset, tasks })
        return { success: true, count: tasks.length }
      } catch (error) {
        console.error('Error loading tasks metadata:', error)
        return { success: false, error }
      }
    },
    async loadRandomTask({ commit, dispatch, state, getters }) {
      try {
        // First ensure we have metadata
        let totalCount = state.tasksMetadata[state.currentSubset]?.length
        
        if (!totalCount) {
          const metadataResult = await dispatch('loadTasksMetadata', state.currentSubset)
          if (!metadataResult.success) {
            return { success: false, error: 'Failed to load tasks metadata' }
          }
          totalCount = metadataResult.count
        }
        
        const tasks = state.tasksMetadata[state.currentSubset]
        const taskIndex = Math.floor(Math.random() * tasks.length)
        const task = tasks[taskIndex]
        
        const taskResponse = await axios.get(task.download_url)
        const { train, test } = taskResponse.data
        
        commit('setTask', {
          train,
          test,
          taskName: task.name,
          taskIndex,
          subset: state.currentSubset,
          totalCount
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error loading random task:', error)
        return { success: false, error }
      }
    },
    async loadTask({ commit, dispatch, state, getters }, { taskIndex, subset }) {
      try {
        // First ensure we have metadata
        let tasks = state.tasksMetadata[subset]
        
        if (!tasks) {
          const metadataResult = await dispatch('loadTasksMetadata', subset)
          if (!metadataResult.success) {
            return { success: false, error: 'Failed to load tasks metadata' }
          }
          tasks = state.tasksMetadata[subset]
        }
        
        if (taskIndex < 0) {
          return { success: false, error: 'Task index cannot be negative', isNavigation: true }
        }
        
        if (taskIndex >= tasks.length) {
          return { success: false, error: 'You\'ve reached the last task', isNavigation: true }
        }
        
        const task = tasks[taskIndex]
        const taskResponse = await axios.get(task.download_url)
        const { train, test } = taskResponse.data
        
        commit('setTask', {
          train,
          test,
          taskName: task.name,
          taskIndex,
          subset,
          totalCount: tasks.length
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error loading task:', error)
        return { success: false, error, isNavigation: true }
      }
    },
    async loadTaskByHash({ commit, dispatch, state, getters }, { hash, subset }) {
      try {
        // First ensure we have metadata
        let tasks = state.tasksMetadata[subset]
        
        if (!tasks) {
          const metadataResult = await dispatch('loadTasksMetadata', subset)
          if (!metadataResult.success) {
            return { success: false, error: 'Failed to load tasks metadata' }
          }
          tasks = state.tasksMetadata[subset]
        }
        
        // Find task by hash - the task name should be hash.json
        const taskName = `${hash}.json`
        const taskIndex = tasks.findIndex(task => task.name === taskName)
        
        if (taskIndex === -1) {
          return { success: false, error: `Task with hash ${hash} not found in ${subset} dataset` }
        }
        
        const task = tasks[taskIndex]
        const taskResponse = await axios.get(task.download_url)
        const { train, test } = taskResponse.data
        
        commit('setTask', {
          train,
          test,
          taskName: task.name,
          taskIndex,
          subset,
          totalCount: tasks.length
        })
        
        return { success: true }
      } catch (error) {
        console.error('Error loading task by hash:', error)
        return { success: false, error: `Failed to load task ${hash}: ${error.message}` }
      }
    },
    async loadTaskFromFile({ commit }, file) {
      try {
        return new Promise((resolve, reject) => {
          const reader = new FileReader()
          
          reader.onload = (e) => {
            try {
              const contents = JSON.parse(e.target.result)
              const { train, test } = contents
              
              commit('setTask', {
                train,
                test,
                taskName: file.name
              })
              
              resolve({ success: true })
            } catch (error) {
              reject({ success: false, error: 'Invalid JSON format' })
            }
          }
          
          reader.onerror = () => {
            reject({ success: false, error: 'Error reading file' })
          }
          
          reader.readAsText(file)
        })
      } catch (error) {
        console.error('Error loading task from file:', error)
        return { success: false, error }
      }
    }
  }
}) 