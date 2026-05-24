const WALL = "w"
const WALL_COLOR = [100,100,100]
const maze1 = [
  [0,  0,   WALL, 0],
  [0,  0,   WALL, 0],
  [0, WALL, WALL, 0],
  [0,  0,    0,   0]
]
const maze = [
  [0,  0,   WALL,  0,    0,    0,   0],
  [0,  0,   WALL,  0,    0,   WALL, 0],
  [0, WALL, WALL, WALL,  0,   WALL, 0],
  [0, WALL,  0,   WALL, WALL, WALL, 0],
  [0,  0,    0,    0,    0,    0,   0]
]

// gas sources in the original maze BEFORE dividing into smaller cells
const gasSources = [[0, 0], [2, 4]]  // gotta not be a wall
const p0 = [10000, 4000]  // starting gas densities

const maxDensity = Math.max(...p0);  // used for choosing color of cells

const mazeRows = maze.length
const mazeCols = maze[0].length

const chunksPerMazeCell = 2
const dx = 1 / chunksPerMazeCell

const canvasW = 600
const canvasH = canvasW * (mazeRows/mazeCols)

const canvasRows = mazeRows * chunksPerMazeCell
const canvasCols = mazeCols * chunksPerMazeCell

const chunkW = canvasW / canvasCols
const chunkH = canvasH / canvasRows
console.log("chunkW", chunkW, "chunkH", chunkH)

const dt = 0.1
const D = 0.5  // diffussion constant 
let canvas = []  // density, -1 means wall 

const cfl = D*dt/(dx*dx)
if (cfl >= 0.25)   // 1/2 for 1D, 1/4 for 2D
   console.error("CFL: D*dt/(dx**2) =", cfl, ">= 1/4")
else
   console.log("CFL: D*dt/(dx**2) =", cfl, "< 1/4")


function updateDensity(d) {
  // dp/dt = D*d(p/dx)/dx
  // count laplacian ^^
  // p_new = p + dt*D*d(p/dx)/dx
  // for discrete case, d(p/dx)/dx = (p_(i+1) + p_(i-1) - 2(p_i))/(dx^2)
  // for edges (walls, -1), consider p_(i-1) = p_i
  // for 2D, just (sum 4 neighbors - 4 * self) / (dx * dy)
  const dx_dx = dx*dx
  var newD = d.map((row, i) => {
      return row.map((p, j) => {
        if (p === WALL) return p
        
        let laplacian = -4 * p
        laplacian += (j===0 || d[i][j-1]===WALL) ? p : d[i][j-1]  // left
        laplacian += (j===canvasCols-1 || d[i][j+1]===WALL) ? p : d[i][j+1]  // right
        laplacian += (i===0 || d[i-1][j]===WALL) ? p : d[i-1][j]  // top
        laplacian += (i===canvasRows-1 || d[i+1][j]===WALL) ? p : d[i+1][j]  // bottom
        laplacian /= dx_dx
        return p + dt * D * laplacian
      })
  })
  return newD
}

function getColor(c) {
    if (c === WALL) {
      return color(...WALL_COLOR)
    }
    // choose a color depending on density
    // gamma
    let gamma = 0.2
    let v = Math.pow(c / maxDensity, gamma)
    return color(0, 0, 255 * v)
    // return color(255 * v, 100, 255 * (1 - v));

    // log scale
    // let eps = 1e-6
    // let v = Math.log(c + eps) / Math.log(maxDensity + eps)
    // return color(0, 0, 255 * v)
}

function drawGas(c) {
  for (let i = 0; i <  canvasRows; i++) {
    for (let j = 0; j < canvasCols; j++) {
      // Get cell value (0 or 1)
      let cell = c[i][j];

      fill(getColor(cell))
      stroke(0);
      rect(j * chunkW, i * chunkH, chunkH, chunkW);
    }
  }
}

let deltaLayer  // changes in density
let canvasNew  // to reach it from drawDelta()

function drawDelta(layer) {
  layer.background(0);
  layer.noStroke();
  
  // normalize deltas to [-1, 1]
  for (let i = 0; i < canvasRows; i++) {
    for (let j = 0; j < canvasCols; j++) {
      let r = 0;
      let g = 0;
      let b = 0;

      if (canvas[i][j] === WALL) {
        [r, g, b] = WALL_COLOR
      } else {
        let d = canvasNew[i][j] - canvas[i][j]
        let sensitivity = 1;  // can be changed
        let v = constrain(d * sensitivity, -1, 1);

        if (v > 0) {
          // more gas here now, make greenish-ish
          b = 150 * v;
          g = 255 * v;
        } else {
          // less gas here now, make reddish
          r = 255 * (-v);
          b = 120 * (-v);
        }
      }
      layer.fill(r, g, b);

      let px = j * chunkW;
      let py = i * chunkH * (2/3);

      layer.rect(px, py, chunkW, chunkH * (2/3));
    }
  }
}

function setup() {
  createCanvas(canvasW, canvasH*(5/3));  // for delta layer of 2/3 height
  deltaLayer = createGraphics(canvasW, canvasH*(2/3));
  
  for (var k = 0; k < gasSources.length; k++) {
    var [i, j] = gasSources[k]
    maze[i][j] = p0[k]
  }
  
  for (let i = 0; i <  mazeRows; i++) {
    var row = [] 
    for (let j = 0; j < mazeCols; j++) {
        for (let k = 0; k < chunksPerMazeCell; k++) {
            row.push(maze[i][j])
        }
    }
    for (let k = 0; k < chunksPerMazeCell; k++) {
        canvas.push(row.slice())  // copy
    }
  }
  canvas.map((row, i) => {
     console.log(row.toString())
  })
}

var timeStart = 0
const sleepTime = dt * 1000  // to seconds
var iterations = 0

function draw() {
  if (millis() - timeStart > sleepTime)  {
    // time to redraw
    drawGas(canvas)
    
    timeStart = millis()
    iterations += 1
    console.log(iterations*dt, "s, i =", iterations)
     
    canvasNew = updateDensity(canvas)
    
    drawDelta(deltaLayer);
    image(deltaLayer, 0, canvasH);
    
    canvas = canvasNew.map(row => row.slice())
    
    //canvas.map((row, i) => {
    //  console.log(row.toString())
    //})
  }
}

