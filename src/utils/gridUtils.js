// Grid class for handling grid operations
export class Grid {
  constructor(height, width, values) {
    this.height = height
    this.width = width
    this.grid = new Array(height)
    
    for (let i = 0; i < height; i++) {
      this.grid[i] = new Array(width)
      for (let j = 0; j < width; j++) {
        if (values !== undefined && values[i] !== undefined && values[i][j] !== undefined) {
          this.grid[i][j] = values[i][j]
        } else {
          this.grid[i][j] = 0
        }
      }
    }
  }
}

// Flood fill from a specific location
export function floodFillFromLocation(grid, i, j, symbol) {
  i = parseInt(i)
  j = parseInt(j)
  symbol = parseInt(symbol)

  const target = grid[i][j]
  
  if (target === symbol) {
    return
  }

  function flow(i, j, symbol, target) {
    if (i >= 0 && i < grid.length && j >= 0 && j < grid[i].length) {
      if (grid[i][j] === target) {
        grid[i][j] = symbol
        flow(i - 1, j, symbol, target)
        flow(i + 1, j, symbol, target)
        flow(i, j - 1, symbol, target)
        flow(i, j + 1, symbol, target)
      }
    }
  }
  
  flow(i, j, symbol, target)
}

// Parse a size string like "3x3" into [height, width]
export function parseSizeTuple(size) {
  const dimensions = size.split('x')
  
  if (dimensions.length !== 2) {
    throw new Error('Grid size should have the format "3x3", "5x7", etc.')
  }
  
  const height = parseInt(dimensions[0])
  const width = parseInt(dimensions[1])
  
  if (height < 1 || width < 1) {
    throw new Error('Grid size should be at least 1. Cannot have a grid with no cells.')
  }
  
  if (height > 30 || width > 30) {
    throw new Error('Grid size should be at most 30 per side. Pick a smaller size.')
  }
  
  return [height, width]
}


// Calculate cell size for proper display
export const MAX_CELL_SIZE = 50

export function calculateCellSize(height, width, containerHeight, containerWidth) {
  const candidateHeight = Math.floor((containerHeight - height) / height)
  const candidateWidth = Math.floor((containerWidth - width) / width)
  const size = Math.min(candidateHeight, candidateWidth, MAX_CELL_SIZE)
  return Math.max(10, size) // Ensure minimum size of 10px
}

 