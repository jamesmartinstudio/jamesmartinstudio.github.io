// SPLATTER — traditional brushes, digitally compressed
// by James Martin
//
// Each brush starts as a familiar art tool and is then "compressed":
// its pressure, edges or texture get rounded off the way image formats
// round off information. The tool keeps the gesture and throws away
// the subtlety.

var initials = 'jm'; // your initials
var screenbg = 250; // off white background
var choice = '1'; // current brush
var drawingOnCanvas = false; // only draw if the click started on the canvas
var undoSteps = []; // canvas snapshots for undo
var redoSteps = []; // canvas snapshots for redo

// the color choices: black + the rainbow
var colors = ['#141414', '#e63946', '#f4892b', '#f5d02f', '#3aa85b', '#2d6fe0', '#8a4fd0'];
var ink = colors[0];

// [key, name, description]
var brushes = [
  ['1', 'Pencil', '4 strengths, set by speed'],
  ['2', 'Ink pen', 'width jumps: 6, 4, 2, 1px'],
  ['3', 'Marker', 'see-through, builds up in layers'],
  ['4', 'Watercolor', 'a wash made of square pixels'],
  ['5', 'Charcoal', 'soft edges faked with dither'],
  ['6', 'Airbrush', 'spray snapped to a 2px grid'],
  ['7', 'Smudge', 'drags wet paint along'],
  ['8', 'Crayon', 'gaps on every other row'],
  ['9', 'Calligraphy', '45° nib, stair-stepped'],
  ['0', 'Drip', 'paint runs down in repeated rows'],
  ['e', 'Eraser', 'clears whole 8×8 blocks']
];

// 4x4 Bayer matrix, used for the charcoal's dither pattern
var bayer = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];

function setup() {
  createCanvas(600, 600);
  pixelDensity(1); // keeps pixel math simple on retina screens
  background(screenbg);
  buildPanel();
}

function draw() {
  if (keyIsPressed && '1234567890e'.includes(key.toLowerCase())) pickBrush(key.toLowerCase());
  if (mouseIsPressed && drawingOnCanvas) newkeyChoice(choice);
}

function mousePressed() {
  drawingOnCanvas = mouseX >= 0 && mouseX <= width && mouseY >= 0 && mouseY <= height;
  if (drawingOnCanvas) saveStep(); // remember the canvas before each stroke
}

function mouseReleased() {
  drawingOnCanvas = false;
}

function keyPressed() {
  if (key == 'x' || key == 'X') clear_print();
  if (key == 'p' || key == 'P') saveme();
  if (key == 'z') undo();
  if (key == 'Z') redo(); // Shift + z
}

// ---------- brushes ----------

function newkeyChoice(toolChoice) {
  let op = float(select('#opacity').value()) / 100; // 0 to 1
  let sz = float(select('#size').value()); // 0.5x to 3x
  let c = color(ink);
  c.setAlpha(255 * op);
  let speed = dist(mouseX, mouseY, pmouseX, pmouseY); // stands in for pen pressure

  if (toolChoice == '1') {
    // PENCIL — fades toward the paper in only 4 steps, set by speed
    let p = lerpColor(c, color(screenbg), [0, 0.25, 0.5, 0.7][min(floor(speed / 6), 3)]);
    p.setAlpha(255 * op);
    stroke(p);
    strokeWeight(sz);
    for (let i = 0; i < 3; i++) {
      line(mouseX + random(-sz, sz), mouseY + random(-sz, sz),
        pmouseX + random(-sz, sz), pmouseY + random(-sz, sz));
    }

  } else if (toolChoice == '2') {
    // INK PEN — width jumps between 4 set sizes instead of swelling
    stroke(c);
    strokeWeight([6, 4, 2, 1][min(floor(speed / 8), 3)] * sz);
    line(mouseX, mouseY, pmouseX, pmouseY);

  } else if (toolChoice == '3') {
    // MARKER — broad and see-through, darker where strokes overlap
    c.setAlpha(70 * op);
    stroke(c);
    strokeWeight(14 * sz);
    line(mouseX, mouseY, pmouseX, pmouseY);

  } else if (toolChoice == '4') {
    // WATERCOLOR — a soft, layered wash made of square pixels
    c.setAlpha(18 * op);
    noStroke();
    fill(c);
    for (let i = 0; i < 12; i++) {
      let a = random(TWO_PI);
      let d = random(26 * sz);
      square(floor((mouseX + cos(a) * d) / 4) * 4, floor((mouseY + sin(a) * d) / 4) * 4,
        4 * floor(random(1, 4)));
    }

  } else if (toolChoice == '5') {
    // CHARCOAL — soft edges faked with an ordered dither (no in-between tones)
    let r = 18 * sz;
    noStroke();
    fill(c);
    for (let i = 0; i < 70 * sz; i++) {
      let a = random(TWO_PI);
      let d = random(r);
      let x = floor((mouseX + cos(a) * d) / 2) * 2;
      let y = floor((mouseY + sin(a) * d) / 2) * 2;
      if (1 - d / r > bayer[abs(y / 2) % 4][abs(x / 2) % 4] / 16) square(x, y, 2);
    }

  } else if (toolChoice == '6') {
    // AIRBRUSH — fine spray, every droplet snapped to a 2px grid
    c.setAlpha(110 * op);
    noStroke();
    fill(c);
    for (let i = 0; i < 40 * sz; i++) {
      square(floor((mouseX + randomGaussian() * 10 * sz) / 2) * 2,
        floor((mouseY + randomGaussian() * 10 * sz) / 2) * 2, 2);
    }

  } else if (toolChoice == '7') {
    // SMUDGE — drags old pixels along, like a video codec reusing them
    let s = floor(36 * sz);
    let patch = get(pmouseX - s / 2, pmouseY - s / 2, s, s);
    tint(255, 140 * op);
    image(patch, mouseX - s / 2, mouseY - s / 2);
    noTint();

  } else if (toolChoice == '8') {
    // CRAYON — waxy texture whose gaps fall on every other row (interlacing)
    let w = lerpColor(c, color(255), 0.3);
    w.setAlpha(255 * op);
    noStroke();
    fill(w);
    let steps = max(1, ceil(speed / 2));
    for (let i = 0; i <= steps; i++) {
      let x = lerp(pmouseX, mouseX, i / steps);
      let y = floor(lerp(pmouseY, mouseY, i / steps));
      for (let row = y - round(8 * sz); row <= y + round(8 * sz); row++) {
        if (row % 2 == 0 && random() > 0.3) rect(x - 2 * sz, row, 4 * sz, 1);
      }
    }

  } else if (toolChoice == '9') {
    // CALLIGRAPHY — flat 45° nib built from 2px squares, so curves stair-step
    noStroke();
    fill(c);
    let n = round(6 * sz);
    let steps = max(1, ceil(speed / 2));
    for (let i = 0; i <= steps; i++) {
      let x = lerp(pmouseX, mouseX, i / steps);
      let y = lerp(pmouseY, mouseY, i / steps);
      for (let k = -n; k <= n; k++) square(floor((x + k) / 2) * 2, floor((y - k) / 2) * 2, 2);
    }

  } else if (toolChoice == '0') {
    // DRIP — paint runs down as one repeated row of pixels,
    // like a cut-off image file filling in its missing bottom
    noStroke();
    fill(c);
    circle(mouseX, mouseY, 12 * sz);
    if (random() < 0.15) {
      let x = floor(mouseX + random(-4, 4) * sz);
      let y = floor(mouseY + 3 * sz);
      let w = floor(random(2, 5) * sz);
      copy(x, y, w, 1, x, y, w, floor(random(20, 90) * sz));
    }

  } else if (toolChoice == 'e') {
    // ERASER — even erasing is lossy: it clears whole 8x8 blocks
    let s = max(8, round(40 * sz / 8) * 8);
    noStroke();
    fill(screenbg);
    square(floor((mouseX - s / 2) / 8) * 8, floor((mouseY - s / 2) / 8) * 8, s);
  }
}

// ---------- undo, redo, clear, save ----------

function saveStep() {
  undoSteps.push(get());
  if (undoSteps.length > 20) undoSteps.shift(); // keep the last 20 steps
  redoSteps = [];
}

function undo() {
  if (undoSteps.length == 0) return;
  redoSteps.push(get());
  image(undoSteps.pop(), 0, 0);
}

function redo() {
  if (redoSteps.length == 0) return;
  undoSteps.push(get());
  image(redoSteps.pop(), 0, 0);
}

function clear_print() {
  saveStep(); // so clearing can be undone
  background(screenbg);
}

function saveme() {
  saveCanvas(initials + day() + hour() + minute() + second(), 'jpg');
}

// ---------- the panel next to the canvas ----------

function buildPanel() {
  let html = '<div class="head"><h1>Splatter</h1><p>traditional brushes, digitally compressed</p><div class="colors">';
  for (let i = 0; i < colors.length; i++) {
    html += '<div class="dot" id="c' + i + '" style="background:' + colors[i] + '" onclick="pickColor(' + i + ')"></div>';
  }
  html += '</div>' +
    '<label><span>Opacity</span><input type="range" id="opacity" min="5" max="100" value="100"></label>' +
    '<label><span>Size</span><input type="range" id="size" min="0.5" max="3" step="0.1" value="1"></label></div>';

  for (let b of brushes) {
    if (b[0] == '1') html += '<h2>Brushes</h2>';
    if (b[0] == 'e') html += '<h2>Tools</h2>';
    html += '<div class="brush" id="b' + b[0] + '" onclick="pickBrush(\'' + b[0] + '\')">' +
      '<b>' + b[0] + '</b><div>' + b[1] + '<small>' + b[2] + '</small></div></div>';
  }

  html += '<div class="foot"><span><b>z</b> undo</span><span><b>&#8679;z</b> redo</span>' +
    '<span><b>x</b> clear</span><span><b>p</b> save</span></div>';

  let panel = createDiv(html);
  panel.addClass('panel');
  panel.position(620, 10);

  select('head').child(createElement('style', `
    @import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap');
    .panel { width: 240px; font: 13px 'Inter', sans-serif; color: #555; background: #fff;
             border: 1px solid #e4e4e4; border-radius: 14px; box-shadow: 0 4px 16px rgba(0,0,0,0.06); }
    .head { padding: 14px; border-bottom: 1px solid #efefef; }
    .panel h1 { font-size: 20px; color: #1c1c1c; margin: 0; }
    .panel p { font-size: 11px; color: #999; margin: 2px 0 12px; }
    .colors { display: flex; justify-content: space-between; }
    .dot { width: 22px; height: 22px; border-radius: 50%; cursor: pointer; }
    .dot.active { box-shadow: 0 0 0 2px #fff, 0 0 0 3.5px #1c1c1c; }
    .panel label { display: flex; align-items: center; margin-top: 10px; font-size: 12px; }
    .panel label span { width: 60px; }
    .panel label input { flex: 1; accent-color: #1c1c1c; }
    .panel h2 { font-size: 12px; color: #8a8a8a; margin: 12px 14px 4px; }
    .brush { display: flex; align-items: center; gap: 10px; margin: 0 6px; padding: 5px 8px;
             border: 1.5px solid transparent; border-radius: 7px; cursor: pointer; }
    .brush:hover { background: #f7f7f7; }
    .brush b { width: 20px; height: 20px; line-height: 20px; text-align: center; font-size: 11px;
               border-radius: 5px; background: #f2f2f2; color: #8a8a8a; }
    .brush small { display: none; font-size: 11px; color: #888; }
    .brush.active { border-color: #1c1c1c; color: #1c1c1c; font-weight: 600; }
    .brush.active b { background: #1c1c1c; color: #fff; }
    .brush.active small { display: block; font-weight: 400; }
    .foot { display: grid; grid-template-columns: 1fr 1fr; gap: 6px; padding: 10px 14px;
            margin-top: 6px; border-top: 1px solid #efefef; font-size: 11px; color: #999; }
    .foot b { padding: 1px 5px; margin-right: 4px; border-radius: 4px; background: #f2f2f2; color: #555; }
  `));

  pickColor(0);
  pickBrush('1');
}

// black outline on the chosen color dot
function pickColor(i) {
  ink = colors[i];
  for (let j = 0; j < colors.length; j++) select('#c' + j).removeClass('active');
  select('#c' + i).addClass('active');
}

// black outline on the chosen brush
function pickBrush(k) {
  choice = k;
  for (let b of brushes) select('#b' + b[0]).removeClass('active');
  select('#b' + k).addClass('active');
}
