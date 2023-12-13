//VARS VARS VARS

let paused = false;

speedoflife = 3;

let cols, rows;
let w = 40;
let grid;
let playing = false;
let synth;
let font;
let textSizeValue = 12;


let deathButton;

// POEM
let words = ["Death", "is", "a", "beautiful", "car", "parked", "only",
"to","be","stolen","on","a","street","lined","with","trees",
"whose","branches","are","like","the","intestines", "of",
"an","emerald.","You","hotwire","death","get","in,","and","drive","away",
"like","a","flag","made","from","a","thousand","burning",
"funeral", "parlors.","You","have","stolen","death","because","you're","bored.",
"There's","nothing","good","playing","at","the","movies",
"in","San","Francisco.","You","joyride","around","for","a","while","listening","to",
"the","radio,","and","then","abandon","death,","walk","away,","and","leave","death","for",
"the","police","to","find."];


// LOAD FONTS 
function preload() {
  font = loadFont('fonts/syntMono.otf');
}


function setup() {
  frameRate(4);
  createCanvas(windowWidth, windowHeight);
  cols = floor(width / w);
  rows = floor(height / w);

  // Create synth with reverb
  synth = new Tone.PolySynth({
    oscillator: {
      type: 'sine'
    },
    envelope: {
      attack: 0.001,
      decay: 0.2,
      sustain: 0.2,
      release: .01
    }
  }).connect(new Tone.Reverb({
    decay: 6,
    wet: 0.40
  }).toDestination());

  deathButton = createButton("Death");
  deathButton.position(width / 2 - 30, height / 2);
  deathButton.mousePressed(startGame);
}

// adjust speed
function keyPressed() {
  if (keyCode === UP_ARROW) {
    // Increase framerate by 1
    speedoflife++;
    frameRate(speedoflife);
  } else if (keyCode === DOWN_ARROW) {
    // Decrease framerate by 1, but keep it positive
    speedoflife = max(1, speedoflife - 1);
    frameRate(speedoflife);
  } else if (keyCode === ENTER) {
    // Toggle pause state
    paused = !paused;
    if (paused) {
      noLoop(); // Pause the game
    } else {
      loop(); // Resume the game
    }
  } else if (keyCode === 187) { // Plus key
    textSizeValue++;
  } else if (keyCode === 189) { // Minus key
    textSizeValue = max(1, textSizeValue - 1);
  }
}

function startGame() {
  grid = createRandomGrid();
  playing = true;
  // loop();
}


function draw() {
  background(0);

if (playing && !paused) {
    generate();
    playNotes();

    for (let i = 0; i < cols; i++) {
      for (let j = 0; j < rows; j++) {
        let x = i * w;
        let y = j * w;
        if (grid[i][j] === 1) {
          // Display poem
          displayPoem(x, y, calculateTextSize());
        }
      }
    }

    // Looks at all remaining live cells and counts them
    // If too few live cells, restart the game
    let sum = 0;
    for (let i=0; i<cols; i++) {
      for (let j=0; j<rows; j++) {
        sum += grid[i][j];
      }
    }
    if (sum <= 5) {
      restartGrid();
      deathButton.show(); // Show the button when restarting the game
    } else {
      deathButton.hide(); // Hide the button when the game is playing
    }
  } else {
    // If the game is not playing or paused, show the button
    deathButton.show();
  }
}

function createRandomGrid() {
  let grid = new Array(cols);
  for (let i = 0; i < cols; i++) {
    grid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      grid[i][j] = floor(random(2));
    }
  }
  return grid;
}

function restartGrid() {
  let restartedGrid = new Array(cols);
  for (let i = 0; i < cols; i++) {
    restartedGrid[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      restartedGrid[i][j] = floor(random(2));
    }
  }
  grid = restartedGrid;
}

function generate() {
  let nextGen = new Array(cols);
  for (let i = 0; i < cols; i++) {
    nextGen[i] = new Array(rows);
    for (let j = 0; j < rows; j++) {
      let state = grid[i][j];
      let neighbors = countNeighbors(grid, i, j);

      if (state === 0 && neighbors === 3) {
        nextGen[i][j] = 1;
      } else if (state === 1 && (neighbors < 2 || neighbors > 3)) {
        nextGen[i][j] = 0;
      } else {
        nextGen[i][j] = state;
      }
    }
  }
  grid = nextGen;
}

function countNeighbors(grid, x, y) {
  let sum = 0;

  for (let i = -1; i < 2; i++) {
    for (let j = -1; j < 2; j++) {
      let col = (x + i + cols) % cols;
      let row = (y + j + rows) % rows;
      sum += grid[col][row];
    }
  }
  sum -= grid[x][y];
  return sum;
}

let maxNotesPerGeneration = 3; // Set the maximum number of notes per generation

function playNotes() {
  let notesPlayed = 0;


  // let sum = 0;
  // for (let i=0; i<cols; i++) {
  //   for (let j=0; j<rows; j++) {
  //     sum += grid[i][j];
  //   }
  // }

  // if (sum > 20) {

  // } else if (sum > 15) {

  // } else if (sum > 10) {

  // } else {

  // }

  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 0 && notesPlayed < maxNotesPerGeneration) {
        playRandomNote();
        notesPlayed++;
        
      }
    }
  }
}

function playRandomNote() {
  const scale = ["E2", "G3", "B3", "C3", "D3", "E3"];
  const randomNote = scale[floor(random(scale.length))];
  synth.triggerAttackRelease(randomNote, .001);
}

function displayPoem(x, y, customTextSize) {
  fill(255);
  textFont(font);
  textSize(textSizeValue);
  textAlign(CENTER, CENTER);
  let randomWord = words[floor(random(words.length))];
  text(randomWord, x + w / 2, y + w / 2);
}

function calculateTextSize() {
  // Adjust the text size based on the number of live cells
  let liveCellCount = 0;
  for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
      if (grid[i][j] === 1) {
        liveCellCount++;
      }
    }
  }

  // Map live cell count to text size (adjust the values as needed)
  return map(liveCellCount, 0, cols * rows, 5, 200);
}

//resize canvas

function windowResized() {
  // Adjust the canvas size when the window is resized
  resizeCanvas(windowWidth, windowHeight);

  // Recalculate the number of columns and rows
  cols = floor(width / w);
  rows = floor(height / w);
}