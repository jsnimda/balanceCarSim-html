// draw svg
// https://thedevband.com/online-svg-viewer.html
let sketch = {
  cx: 0,
  cy: 0,
  scaleValue: 1,
  camAngleRad: 0
}
sketch.scaleValue = 0.5;

function findCenter() {
  sketch.cx = width/2 / sketch.scaleValue;
  sketch.cy = height/2 / sketch.scaleValue + 
    magnified * (environment.wheelRadiusM + environment.cylinderCenterM);
}
function findCar() {
  findCenter();
  sketch.cx -= wheels.x * magnified;
}
function thick(x) {
  return Math.max(x, x / sketch.scaleValue);
}

// ===========
// draw car
const wheelLines = 6;
const magnified = 1000;
function drawCar() {
  drawCylinder();
  drawWheels();
}
function drawWheels() {
  strokeWeight(thick(3));
  stroke('black');
  let x = sketch.cx + wheels.x * magnified;
  let y = sketch.cy - wheels.y * magnified;
  let r = environment.wheelRadiusM * magnified;
  let r2 = r * 0.85;
  let r3 = r * 0.1;
  strokeWeight(thick(5));
  circle(x, y, r * 2);
  strokeWeight(thick(3));
  circle(x, y, r2 * 2);
  circle(x, y, r3 * 2);
  for(let i = 0; i < wheelLines; i++) {
    let theta = wheels.theta + 2 * Math.PI * i / wheelLines;
    line(x + Math.cos(theta) * r3, y + Math.sin(theta) * r3,
      x + Math.cos(theta) * r2, y + Math.sin(theta) * r2);
  }
}
function drawCylinder() {
  strokeWeight(thick(5));
  stroke('blue');
  let r = environment.wheelRadiusM * magnified;
  let w = r * 1.6;
  let L = environment.cylinderCenterM * magnified;
  let h = L * 2;
  let rcx = sketch.cx + cylinder.x * magnified;
  let rcy = sketch.cy - cylinder.y * magnified;
  push();
  translate(rcx, rcy);
  rotate(cylinder.theta);
  translate(-rcx, -rcy);
  rect(rcx - w / 2, rcy - h / 2, w, h);
  pop();
}

// ===========
// draw background
function drawCenter() {
  noFill();
  strokeWeight(thick(3));
  stroke('black');
  circle(sketch.cx, sketch.cy, thick(20));
}
const gridDistance = 100;
function posMod(a, b) {
  return a - Math.floor(a / b) * b;
}
function drawGround() {
  strokeWeight(thick(5));
  line(0, sketch.cy, width / sketch.scaleValue, sketch.cy);
}
function drawBackground() {
  drawGround();
  noStroke();
  fill('grey');
  let xDots = Math.floor(width / sketch.scaleValue / gridDistance) + 1;
  let yDots = Math.floor(height / sketch.scaleValue / gridDistance) + 1;
  let dots = Math.floor(Math.hypot(width, height) / sketch.scaleValue / gridDistance) + 1;
  let firstX = posMod(sketch.cx, gridDistance);
  let firstY = posMod(sketch.cy, gridDistance);
  let ci = Math.floor(sketch.cx / gridDistance);
  let cj = Math.floor(sketch.cy / gridDistance);
  let si = ((xDots - dots) / 2) << 0;
  let sj = ((yDots - dots) / 2) << 0;
  for (let i = si; i < si + dots; i++) {
    for (let j = sj; j < sj + dots; j++) {
      if (j == cj) {
        fill('white');
      } else {
        fill('grey');
      }
      if (i != ci || j != cj) {
        circle(firstX + i * gridDistance, firstY + j * gridDistance, 5 / sketch.scaleValue);
      }
    }
  }
}

// ===========
// mouse events
let leftPressed = false;
let lastMouseX, lastMouseY;
function isInputDOM(dom){
  return 'tabIndex' in dom && !isNaN(dom.tabIndex) && dom.tabIndex > -1;
}
function mousePressed(event) { // event.button 0 1 2 left middle right
  if (isInputDOM(event.target)) return;
  if (event.button == 0) leftPressed = true;
  lastMouseX = mouseX;
  lastMouseY = mouseY;
}
function mouseReleased(event) {
  if (event.button == 0) leftPressed = false;
}
function mouseDragged() {
  if (leftPressed) {
    let dx = (mouseX - lastMouseX) / sketch.scaleValue;
    let dy = (mouseY - lastMouseY) / sketch.scaleValue;
    let [dx2, dy2] = rotateCoord(dx, dy, sketch.camAngleRad);
    sketch.cx += dx2;
    sketch.cy += dy2;
    lastMouseX = mouseX;
    lastMouseY = mouseY;
  }
}
let defaultZoomMultiplier = 0.9;
function zoom(zoomMultiplier) {
  let newScale = sketch.scaleValue * zoomMultiplier;
  if (newScale > 10 || newScale < 1/10) return;
  let dx = mouseX - width / 2;
  let dy = mouseY - height / 2;
  let [dx2, dy2] = rotateCoord(dx, dy, sketch.camAngleRad);
  sketch.cx += (1 / zoomMultiplier - 1) * (width / 2 + dx2) / sketch.scaleValue;
  sketch.cy += (1 / zoomMultiplier - 1) * (height / 2 + dy2) / sketch.scaleValue;
  sketch.scaleValue = newScale;
}
function zoomIn(originX, originY) {
  zoom(1 / defaultZoomMultiplier);
}
function zoomOut(originX, originY) {
  zoom(defaultZoomMultiplier);
}
function mouseWheel() {
  if (event.delta < 0) {
    zoomIn();
  } else if (event.delta > 0) {
    zoomOut();IDBKeyRange
  }
}

// ===========
// entry point

let img;
let svg;
function preload() {
  img = loadImage('car.svg');
  svg = new Image();
  svg.src = 'car.svg';
  //img.elt = svg;
  img.canvas = svg; // svg hack
}
let canvas;
function setup() {
  canvas = createCanvas(windowWidth, windowHeight);
  findCenter();
  canvas.style('display', 'block');
  canvas.parent('sketch-holder');
  frameRate(60);
}

function windowResized() {
  sketch.cx = sketch.cx - width / sketch.scaleValue / 2 + windowWidth / sketch.scaleValue / 2;
  sketch.cy = sketch.cy - height / sketch.scaleValue / 2 + windowHeight / sketch.scaleValue / 2;
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  clear();
  if (app.lockViewToCar) findCar();
  // if (app.lockAngleToCar)
  //   sketch.camAngleRad = car.theta - PI / 2;
  // else
  //   sketch.camAngleRad = 0;
  translate(width / 2, height / 2);
  rotate(sketch.camAngleRad);
  translate(-width / 2, -height / 2);
  scale(sketch.scaleValue);
  drawBackground();
  drawCenter();
  drawCar();
}