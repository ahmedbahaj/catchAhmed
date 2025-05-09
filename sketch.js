let cols = 38, rows = 18;
let tileSize = 40;

let player;
let mazeA = [], mazeB = [], illusionLayer = [];
let currentMaze;
let blinkCooldown = 0;

let myHandsfree;

let playerImgA, playerImgB;
let currentGoal;

//-------
function preload() {
  playerImgA = loadImage("assets/nawaf.jpg");
  playerImgB = loadImage("assets/sultan.png");
  ahmed = loadImage("assets/image.png");
  // ahmed = loadImage("assets/ahmed.jpg");

}

//-------
function setup() {
  createCanvas(cols * tileSize, rows * tileSize);
  frameRate(30);

  //two versions of the maze
  mazeA = generateMaze();
  mazeB = generateMaze();
  currentMaze = mazeA;

  illusionLayer = generateIllusions();

  // initial random goal
  player = createVector(0, 0);
  currentGoal = getValidRandomGoal(currentMaze);
  
  mazeA[0][0] = 0;
  mazeB[0][0] = 0;

  myHandsfree = new Handsfree({ hideCursor: true });
  myHandsfree.start();
}

//-------
function draw() {
  background(255);

  // handle blink
  if (myHandsfree.isTracking && myHandsfree.pose.length > 0) {
    const face = myHandsfree.pose[0].face;
    if (detectBlinks(face) && blinkCooldown <= 0) {
      handleBlink();
      blinkCooldown = 30;
      console.log("Blink detected");
    }
  }

  if (blinkCooldown > 0) blinkCooldown--;

  drawMazeWithShadows();
  drawIllusionLayer();

  //draw goal
  fill(255, 215, 0);
  rect(currentGoal.x * tileSize, currentGoal.y * tileSize, tileSize, tileSize);
  image(ahmed, currentGoal.x * tileSize, currentGoal.y * tileSize, tileSize, tileSize);

  // player
  let playerImg = (currentMaze === mazeA) ? playerImgA : playerImgB;
  image(playerImg, player.x * tileSize, player.y * tileSize, tileSize, tileSize);

  // check win
  if (player.x === currentGoal.x && player.y === currentGoal.y) {
    fill(0);
    textSize(32);
    textAlign(CENTER);
    text("You caught Ahmed! ⚡", width / 2, height / 2);
    noLoop();
  }
}

//-------
// moving mechanism
function keyPressed() {
  let next = player.copy();

  if (keyCode === UP_ARROW) next.y--;
  else if (keyCode === DOWN_ARROW) next.y++;
  else if (keyCode === LEFT_ARROW) next.x--;
  else if (keyCode === RIGHT_ARROW) next.x++;
  
  if (
    next.x >= 0 &&
    next.x < cols &&
    next.y >= 0 &&
    next.y < rows &&
    currentMaze[next.y][next.x] === 0
  ) {
    player = next;
  }
}

//-------
function handleBlink() {
  //switch maze reality
  currentMaze = (currentMaze === mazeA) ? mazeB : mazeA;

  //update illusion walls
  illusionLayer = generateIllusions();

  //update goal location
  currentGoal = getValidRandomGoal(currentMaze);
}

//-------
function generateMaze() {
  let maze = [];
  for (let y = 0; y < rows; y++) {
    maze[y] = [];
    for (let x = 0; x < cols; x++) {
      maze[y][x] = random() < 0.3 ? 1 : 0;
    }
  }
  return maze;
}

//-------
function generateIllusions() {
  let layer = [];
  for (let y = 0; y < rows; y++) {
    layer[y] = [];
    for (let x = 0; x < cols; x++) {
      layer[y][x] = (random() < 0.2) ? 1 : 0; // 1 = fake wall
    }
  }
  return layer;
}

//-------
function drawMazeWithShadows() {
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (currentMaze[y][x] === 1) {
        fill(180, 0, 0, 100);
        noStroke();
        rect(x * tileSize + 4, y * tileSize + 4, tileSize, tileSize); // shadow
        fill(100);
        rect(x * tileSize, y * tileSize, tileSize, tileSize); //tiles
      }
    }
  }
}

//-------
function drawIllusionLayer() {
  fill(60, 30, 100);
  for (let y = 0; y < rows; y++) {
    for (let x = 0; x < cols; x++) {
      if (illusionLayer[y][x] === 1) {
        rect(x * tileSize, y * tileSize, tileSize, tileSize); //illusion tiels
      }
    }
  }
}

//-------
function getValidRandomGoal(maze) {
  let gx, gy;
  do {
    gx = floor(random(cols));
    gy = floor(random(rows));
  } while (maze[gy][gx] === 1 || (gx === player.x && gy === player.y));
  return createVector(gx, gy);
}


//-------
function detectBlinks(face) {
  const leftEAR = getEAR(face, [36, 37, 38, 39, 40, 41]);
  const rightEAR = getEAR(face, [42, 43, 44, 45, 46, 47]);
  const avgEAR = (leftEAR + rightEAR) / 2;
  return avgEAR < 0.2;
}

//-------
function getEAR(face, indices) {
  function dist(i1, i2) {
    const x1 = face.vertices[i1 * 2];
    const y1 = face.vertices[i1 * 2 + 1];
    const x2 = face.vertices[i2 * 2];
    const y2 = face.vertices[i2 * 2 + 1];
    return distBetween(x1, y1, x2, y2);
  }

  const A = dist(indices[1], indices[5]);
  const B = dist(indices[2], indices[4]);
  const C = dist(indices[0], indices[3]);
  return (A + B) / (2.0 * C);
}

//-------
function distBetween(x1, y1, x2, y2) {
  return Math.hypot(x1 - x2, y1 - y2);
}
