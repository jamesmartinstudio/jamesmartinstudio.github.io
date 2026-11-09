function setup() {
  createCanvas(600, 600);
}

function draw() {
  background(220, 235, 245);
  noStroke();

  // Background circle
  fill(250, 225, 170);
  ellipse(300, 290, 350, 350);

  // Body
  fill(65, 110, 165);
  ellipse(300, 560, 300, 230);

  // Neck
  fill(205, 150, 110);
  rect(270, 370, 60, 95);

  // Back hair
  fill(55, 35, 25);
  ellipse(300, 255, 210, 250);

  // Ears
  fill(205, 150, 110);
  ellipse(205, 300, 35, 55);
  ellipse(395, 300, 35, 55);

  // Face
  ellipse(300, 295, 185, 230);

  // Top hair
  fill(55, 35, 25);
  ellipse(250, 207, 75, 65);
  ellipse(300, 190, 85, 65);
  ellipse(350, 207, 75, 65);

  // Eyebrows
  rect(240, 268, 40, 6);
  rect(320, 268, 40, 6);

  // Eyes
  fill(255);
  ellipse(260, 292, 40, 24);
  ellipse(340, 292, 40, 24);

  // Irises
  fill(85, 65, 40);
  ellipse(260, 292, 17, 20);
  ellipse(340, 292, 17, 20);

  // Pupils
  fill(0);
  ellipse(260, 292, 8, 12);
  ellipse(340, 292, 8, 12);

  // Nose
  fill(180, 125, 90);
  ellipse(300, 328, 22, 16);

  // Mouth
  fill(105, 50, 45);
  ellipse(300, 360, 55, 15);
}
