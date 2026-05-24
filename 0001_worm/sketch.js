let fieldWidth = 740;
let fieldHight = 540;
let backgroundColor = 160;

let foodRad = 15;
let foodColor = "green";
let foodX = -1;
let foodY = -1;

let playerLength = 1;
let playerRad = 40;
let playerBodyColor = 255;
let playerHeadColor = 40;

const mousePositions = [];
let maxMousePositions = 50;

function setup() {
  createCanvas(fieldWidth, fieldHight);
  foodX = random(foodRad, fieldWidth-foodRad);
  foodY = random(foodRad, fieldHight-foodRad);
  mousePositions.push({x: mouseX, y: mouseY});
}


function draw() {
  background(backgroundColor);

  // check if player found food
  if (dist(foodX, foodY, mouseX, mouseY) < playerRad) {
    // player eats food
    foodX = random(foodRad, fieldWidth-foodRad);
    foodY = random(foodRad, fieldHight-foodRad);
    playerLength += 1; 
  }

  fill(foodColor);
  circle(foodX, foodY, 2*foodRad);
  
  drawPlayer();
  mousePositions.push({x: mouseX, y: mouseY});
  if (playerLength < 50)
  {
    maxMousePositions = 50;
  } else {
    // 50 + 20 for every other 50
    maxMousePositions = 50 + 20 * floor((playerLength - 50) / 50);
  }
    if (mousePositions.length > maxMousePositions) {
     mousePositions.shift();
  }
}

function drawPlayer() {
  // map 50+ mouse positions to the number of body circles
  let step = mousePositions.length / playerLength;
  if (playerLength % 10 == 0)
  {
    print(playerLength," -> step =", step, "maxMousePositions =", maxMousePositions);
  }
  
  fill(playerBodyColor);
  for (let i = 0; i < playerLength-1; i++) {
    let pos = floor(step * (i + 1) - 1);
    if (pos < 0) pos = 0;
    
    let x = mousePositions[pos].x;
    let y = mousePositions[pos].y;
    circle(x, y, 2*playerRad);
  }
  fill(playerHeadColor);
  circle(mouseX, mouseY, 2*playerRad);
}
