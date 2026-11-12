// CANCEL MY SUBSCRIPTION
// Based on the goose & carrot game: instead of chasing a carrot,
// you chase the CANCEL button and CLICK it. It runs away from you.
// Click the wrong button and you have to restart the level!

var btnX = 300;        // where the cancel button is (its center)
var btnY = 300;
var btnW = 160;        // cancel button size
var btnH = 50;
var trapX = 300;       // where the green trick button is
var trapY = 200;
var trapSpeedX = 3;    // level 5: the green button bounces around
var trapSpeedY = 2;
var score = 0;
var levelStart = 0;    // the score when this level started
var step = 0;          // which screen you're on in level 3
var message = "";

// TIMER: counts up to see how long each level takes
var gameStartTime = 0;    // when you started level 1 (in milliseconds)
var levelStartTime = 0;   // when this level started
var levelTimes = [];      // how long each level took, in seconds
var totalTime = 0;        // total time to cancel
var bestTime = null;      // best time ever (saved in the browser)
var lastBestTime = null;  // the best time before this game
var newBest = false;      // did you beat it?
var textColor;
var gameState = "begin";

// FULL SCREEN: the game is designed as a 600 x 600 square,
// then scaled up to fit whatever screen you're on.
var gameW = 600;
var gameH = 600;
var zoom = 1;          // how much to scale the game up
var offX = 0;          // space on the left/top to center it
var offY = 0;
var mx = 0;            // the mouse position inside the game
var my = 0;

function setup() {
  createCanvas(windowWidth, windowHeight);
  textAlign(CENTER, CENTER);
  rectMode(CENTER);    // rectangles are drawn from their center
  textSize(20);
  bestTime = getItem("bestCancelTime"); // load the saved best time
} // end of setup


function draw() {
  textColor = color(30, 30, 60);
  updateMouse();
  push();
  translate(offX, offY);   // center the game on the screen
  scale(zoom);             // and make it bigger

  if (gameState == "begin") {
    background(237, 233, 254);   // light purple
    beginGame();
  }
  if (gameState == "L1") {
    background(219, 234, 254);   // light blue
    levelOne();
  }
  if (gameState == "L2") {
    background(254, 243, 199);   // light yellow
    levelTwo();
  }
  if (gameState == "L3") {
    background(252, 231, 243);   // light pink
    levelThree();
  }
  if (gameState == "L4") {
    background(255, 228, 200);   // light orange
    levelFour();
  }
  if (gameState == "L5") {
    background(30, 27, 75);      // dark navy
    textColor = color(255);
    levelFive();
  }
  if (gameState == "Win") {
    background(220, 252, 231);   // light green
    win();
  }

  if (gameState != "begin" && gameState != "Win") {
    updateTimer();
    noStroke();
    fill(textColor);
    textSize(20);
    text("Score: " + score, gameW / 2, 30);
    textSize(15);
    text(message, gameW / 2, gameH - 25);
  }
  pop();
} // end of draw


// figure out how big to draw the game, and where the mouse is in it
function updateMouse() {
  zoom = min(windowWidth / gameW, windowHeight / gameH);
  offX = (windowWidth - gameW * zoom) / 2;
  offY = (windowHeight - gameH * zoom) / 2;
  mx = (mouseX - offX) / zoom;
  my = (mouseY - offY) / zoom;
}


// if the browser window changes size, resize the canvas too
function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}


// press F to go true full screen (press F again to exit)
function keyPressed() {
  if (key == "f" || key == "F") {
    fullscreen(!fullscreen());
  }
}


function beginGame() {
  noStroke();
  fill(88, 28, 135);
  textSize(46);
  text("Are You Sure?", gameW / 2, 105);
  textSize(18);
  text("A game about trying to cancel a subscription", gameW / 2, 150);

  fill(textColor);
  textSize(17);
  text("You're paying $14.99 a month for a service you never use.", gameW / 2, 205);
  text("Signing up took one click. Cancelling won't be so easy.", gameW / 2, 232);

  fill(88, 28, 135);
  textSize(21);
  text("How to play", gameW / 2, 280);
  fill(textColor);
  textSize(17);
  text("Chase the real cancel button and click it.", gameW / 2, 315);
  text("Avoid the bright decoy buttons: they restart the level.", gameW / 2, 342);
  text("Finish all five levels and try to beat your best time.", gameW / 2, 369);

  drawButton(gameW / 2, 410, 200, 55, "Play", color(124, 58, 237), color(255));
  textSize(14);
  text("Press F for full screen", gameW / 2, 465);
  text("By James Martin", gameW / 2, 495);
  if (bestTime != null) {
    textSize(16);
    text("Best time: " + bestTime.toFixed(1) + " seconds. Can you beat it?", gameW / 2, 535);
  }
} // end of beginGame


// LEVEL 1: the cancel button runs away (slowly)
function levelOne() {
  runAway(2.5);
  drawButton(btnX, btnY, btnW, btnH, "Cancel", color(255), textColor);
} // end of level 1


// LEVEL 2: faster and smaller
function levelTwo() {
  runAway(4);
  drawButton(btnX, btnY, btnW, btnH, "cancel", color(255), textColor);
} // end of level 2


// LEVEL 3: the "are you sure?" screens
function levelThree() {
  noStroke();
  fill(textColor);
  textSize(26);
  if (step == 0) {
    text("Manage your plan", gameW / 2, 150);
    drawButton(300, 300, 260, 55, "Cancel subscription", color(255), textColor);
  }
  if (step == 1) {
    text("Are you sure?", gameW / 2, 150);
    drawButton(180, 300, 190, 55, "No, keep it", color(124, 58, 237), color(255));
    drawButton(420, 300, 190, 55, "Yes, cancel", color(255), textColor);
  }
  if (step == 2) {
    text("Do you want to cancel your cancel?", gameW / 2, 150);
    drawButton(180, 300, 190, 55, "Continue", color(255), textColor);
    drawButton(420, 300, 190, 55, "Cancel", color(239, 68, 68), color(255));
  }
  if (step == 3) {
    text("Wait! Switch from Premium to ULTRA?", gameW / 2, 150);
    drawButton(300, 280, 320, 75, "YES! Switch to ULTRA", color(250, 204, 21), textColor);
    drawButton(300, 400, 170, 28, "no, cancel my plan", color(255), color(150));
  }
} // end of level 3


// LEVEL 4: the GREEN button says cancel... but it's a trick!
function levelFour() {
  drawButton(trapX, trapY, 220, 70, "CANCEL", color(34, 197, 94), color(255));
  runAway(4.5);
  drawButton(btnX, btnY, btnW, btnH, "end plan", color(203, 213, 225), color(100));
} // end of level 4


// LEVEL 5: the real button shrinks as your score goes up,
// and the green trick button bounces around on top of everything
function levelFive() {
  btnW = 100 - (score - 10) * 15;   // smaller every point (like ballSize - 1)
  btnH = 35 - (score - 10) * 4;
  runAway(5.5);
  drawButton(btnX, btnY, btnW, btnH, "end plan", color(203, 213, 225), color(100));

  trapX = trapX + trapSpeedX;
  trapY = trapY + trapSpeedY;
  if (trapX < 90 || trapX > gameW - 90) {
    trapSpeedX = -trapSpeedX;
  }
  if (trapY < 90 || trapY > gameH - 90) {
    trapSpeedY = -trapSpeedY;
  }
  drawButton(trapX, trapY, 180, 60, "CANCEL", color(34, 197, 94), color(255));
} // end of level 5


function win() {
  noStroke();
  fill(21, 128, 61);
  textSize(36);
  text("Subscription Cancelled!", gameW / 2, 90);
  fill(textColor);
  textSize(24);
  text("It took you " + totalTime.toFixed(1) + " seconds", gameW / 2, 145);

  // how long each level took
  textSize(16);
  for (var i = 0; i < levelTimes.length; i++) {
    text("Level " + (i + 1) + ":  " + levelTimes[i].toFixed(1) + " s", gameW / 2, 195 + i * 26);
  }

  // best time
  textSize(18);
  if (lastBestTime == null) {
    text("Last best time: none yet", gameW / 2, 345);
  } else {
    text("Last best time: " + lastBestTime.toFixed(1) + " seconds", gameW / 2, 345);
  }
  if (newBest) {
    fill(124, 58, 237);
    textSize(22);
    text("NEW BEST TIME!", gameW / 2, 380);
  } else {
    text("Try again to beat it!", gameW / 2, 380);
  }

  fill(textColor);
  textSize(15);
  text("Signing up took 1 click. Cancelling took " + totalTime.toFixed(1) + " seconds.", gameW / 2, 425);
  drawButton(gameW / 2, 500, 220, 65, "Pay Again", color(34, 197, 94), color(255));
} // end win


// ---------- CLICKING ----------
function startGame() {
  score = 0;
  levelTimes = [];
  gameStartTime = millis();
  goToLevel("L1", "Level 1: Click the cancel button 3 times");
}

function mousePressed() {
  var splash = document.getElementById("splash");
  if (splash && !splash.hidden) return;
  updateMouse();
  if (gameState == "begin") {
    if (overButton(gameW / 2, 410, 200, 55)) {
      startGame();
    }
  } else if (gameState == "L3") {
    clickLevelThree();
  } else if (gameState == "Win") {
    if (overButton(gameW / 2, 500, 220, 65)) {
      gameState = "begin";
    }
  } else {
    clickChase();
  }
} // end of mousePressed


// clicking in levels 1, 2, 4 and 5
function clickChase() {
  // level 5: the green button is on top, so it gets clicked first
  if (gameState == "L5" && overButton(trapX, trapY, 180, 60)) {
    restartLevel("The green CANCEL kept your subscription!");
    return;
  }
  // the real cancel button
  if (overButton(btnX, btnY, btnW, btnH)) {
    score = score + 1;
    jump();
    if (gameState == "L1" && score >= 3) {
      goToLevel("L2", "Level 2: Faster and smaller. Click it 3 more times");
    } else if (gameState == "L2" && score >= 6) {
      goToLevel("L3", "Level 3: Click your way through. Read carefully!");
    } else if (gameState == "L4" && score >= 10) {
      goToLevel("L5", "Level 5: Click it 4 more times. It shrinks!");
    } else if (gameState == "L5" && score >= 14) {
      finishGame();
    }
    return;
  }
  // level 4: the big green trick button
  if (gameState == "L4" && overButton(trapX, trapY, 220, 70)) {
    restartLevel("Gotcha! The green CANCEL kept your subscription!");
  }
} // end of clickChase


// clicking in level 3
function clickLevelThree() {
  if (step == 0 && overButton(300, 300, 260, 55)) {
    step = 1;
  } else if (step == 1 && overButton(420, 300, 190, 55)) {
    step = 2;
  } else if (step == 1 && overButton(180, 300, 190, 55)) {
    restartLevel("You kept your subscription!");
  } else if (step == 2 && overButton(180, 300, 190, 55)) {
    step = 3;
  } else if (step == 2 && overButton(420, 300, 190, 55)) {
    restartLevel("You cancelled your cancel!");
  } else if (step == 3 && overButton(300, 400, 170, 28)) {
    score = score + 1;
    goToLevel("L4", "Level 4: Click the real cancel 3 times. Green isn't always good!");
  } else if (step == 3 && overButton(300, 280, 320, 75)) {
    restartLevel("You upgraded to ULTRA ($24.99/mo)!");
  }
} // end of clickLevelThree


// ---------- LEVELS ----------
// start a level fresh
function goToLevel(level, msg) {
  if (level != gameState) {
    // a NEW level: save how long the last one took, start a new clock
    if (gameState != "begin") {
      levelTimes.push((millis() - levelStartTime) / 1000);
    }
    levelStartTime = millis();
  }
  gameState = level;
  levelStart = score;
  message = msg;
  step = 0;
  if (level == "L1") {
    btnW = 160;
    btnH = 50;
  } else {
    btnW = 100;
    btnH = 35;
  }
  trapX = 300;
  trapY = 200;
  jump();
} // end of goToLevel


// wrong button: go back to the start of this level
function restartLevel(why) {
  score = levelStart;   // lose the points from this level
  goToLevel(gameState, "WRONG BUTTON! " + why + " Level restarted.");
} // end of restartLevel


// ---------- TIMER ----------
// show how long you've been on this level (top right)
function updateTimer() {
  var t = (millis() - levelStartTime) / 1000;
  noStroke();
  fill(textColor);
  textSize(20);
  text("Time: " + t.toFixed(1), gameW - 75, 30);
} // end of updateTimer


// the game is over: work out the times and check for a new best
function finishGame() {
  levelTimes.push((millis() - levelStartTime) / 1000); // level 5's time
  totalTime = (millis() - gameStartTime) / 1000;
  lastBestTime = bestTime;
  if (bestTime == null || totalTime < bestTime) {
    bestTime = totalTime;
    newBest = true;
    storeItem("bestCancelTime", bestTime); // save it in the browser
  } else {
    newBest = false;
  }
  gameState = "Win";
} // end of finishGame


// ---------- HELPER FUNCTIONS ----------

// the cancel button moves away from the mouse (like the carrot)
function runAway(speed) {
  var d = dist(btnX, btnY, mx, my);
  if (d < 120 && d > 0) {
    btnX = btnX + (btnX - mx) / d * speed;
    btnY = btnY + (btnY - my) / d * speed;
  }
  // keep it on the screen, so you can trap it in a corner
  btnX = constrain(btnX, btnW / 2, gameW - btnW / 2);
  btnY = constrain(btnY, 60 + btnH / 2, gameH - 50 - btnH / 2);
} // end of runAway


// move the cancel button to a random spot (like the carrot did)
// (keeps trying until the spot is far from the mouse)
function jump() {
  btnX = random(100, 500);
  btnY = random(120, 480);
  while (dist(btnX, btnY, mx, my) < 200) {
    btnX = random(100, 500);
    btnY = random(120, 480);
  }
}


// is the mouse on top of this button?
function overButton(x, y, w, h) {
  if (mx > x - w / 2 && mx < x + w / 2 &&
      my > y - h / 2 && my < y + h / 2) {
    return true;
  }
  return false;
}


// draw a rounded button with text
function drawButton(x, y, w, h, label, c, tc) {
  noStroke();
  fill(0, 0, 0, 30);
  rect(x, y + 4, w, h, 12);   // little shadow
  stroke(0, 0, 0, 40);
  fill(c);
  rect(x, y, w, h, 12);
  noStroke();
  fill(tc);
  textSize(min(18, h * 0.45)); // text fits the button size
  text(label, x, y);
}
