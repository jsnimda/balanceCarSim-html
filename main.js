
// ============
// timing
let lastTimeMs = performance.now();
let currentTimeMs;
let deltaTime;

function next() {
  currentTimeMs = performance.now();
  deltaTime = (currentTimeMs - lastTimeMs) / 1000;
  if (app.running) {
    // readGamepad();
    calc();
  }
  lastTimeMs = currentTimeMs;
  requestAnimationFrame(next);
}
requestAnimationFrame(next);

// ============
// calc
// class ForceObject {
//   constructor() {
//     this.netForceX = 0;
//     this.netForceY = 0;
//     this.netTorque = 0; // ccw +, cw -
//   }
//   addForce(r, F) {
//     this.netForceX += F.x;
//     this.netForceY += F.y;
//     this.netTorque += r.crossProduct(F);
//   }
//   apply(obj, mass, inertia, deltaTime) {
//     let ax = this.netForceX / mass;
//     let ay = this.netForceY / mass;
//     let alpha = this.netTorque / inertia;
//     obj.vx += ax * deltaTime;
//     obj.vy += ay * deltaTime;
//     obj.w += alpha * deltaTime;
//     obj.x += obj.vx * deltaTime;
//     obj.y += obj.vy * deltaTime;
//     obj.theta += obj.w * deltaTime;
//   }
// }
// class Vector {
//   constructor(x, y) {
//     this.x = x;
//     this.y = y;
//   }
//   r() {
//     return Math.hypot(this.x, this.y);
//   }
//   theta() {
//     return Math.atan2(this.y, this.x);
//   }
//   rotate(rad) {
//     return Vector.rTheta(this.r(), this.theta() + rad);
//   }
//   add(v2) {
//     return new Vector(this.x + v2.x, this.y + v2.y);
//   }
//   multiply(scalar) {
//     return new Vector(this.x * scalar, this.y * scalar);
//   }
//   dotProduct(b) {
//     return Vector.dotProduct(this, b);
//   }
//   crossProduct(b) {
//     return Vector.crossProduct(this, b);
//   }
//   projectionToLength(b) { // length of a project to b
//     return this.dotProduct(b) / b.r();
//   }
//   static dotProduct(a, b) {
//     return a.x * b.x + a.y * b.y;
//   }
//   static crossProduct(a, b) {
//     return a.x * b.y - a.y * b.x;
//   }
//   static rTheta(r, theta) {
//     return new Vector(r * Math.cos(theta), r * Math.sin(theta));
//   }
//   static twoPoint(x1, y1, x2, y2) {
//     return new Vector(x2 - x1, y2 - y1);
//   }
// }
// function nextStep(s, v, a, subDt) { // return s, v
//   let newV = v + a * subDt;
//   let newS = s + (newV + v) / 2 * subDt;
//   return [newS, newV];
// }
function nextStep(s, v, a, subDt) { // return s, v
  let newV = v + a * subDt;
  let newS = s + newV * subDt;
  return [newS, newV];
}
function doStep(obj, subDt) {
  [obj.x, obj.vx] = nextStep(obj.x, obj.vx, obj.ax, subDt);
  [obj.y, obj.vy] = nextStep(obj.y, obj.vy, obj.ay, subDt);
  [obj.theta, obj.omega] = nextStep(obj.theta, obj.omega, obj.alpha, subDt);
}
let lastRem = 0;
function calc() {
  let timesPerSecond = app.options.timesPerSecond;
  let timesPerFrameDec = deltaTime * timesPerSecond + lastRem;
  let timesPerFrame = Math.floor(timesPerFrameDec);
  lastRem = timesPerFrameDec - timesPerFrame;
  let subDt = 1 / timesPerSecond;
  for (let i = 0; i < timesPerFrame; i++) {
    let [a1x, a2x, a2y, alpha1, alpha2] = getAccelerations();
    wheels.ax = a1x;
    wheels.alpha = -alpha1;
    cylinder.ax = a2x;
    cylinder.ay = a2y;
    cylinder.alpha = -alpha2;
    doStep(wheels, subDt);
    doStep(cylinder, subDt);
  }
}
function getMotorTorque() {
  return 0;
}
function getAccelerations() {
  let cos = Math.cos;
  let sin = Math.sin;

  let g = environment.gMPerS2;
  let J1 = environment.inertiaWheelsKgM2;
  let J2 = environment.inertiaCylinderKgM2;
  let m1 = environment.massWheelsKg;
  let m2 = environment.massCylinderKg;
  let R1 = environment.wheelRadiusM;
  let h = environment.cylinderCenterM;

  let omega = cylinder.omega;
  let theta = cylinder.theta;

  let W1 = g * m1;
  let W2 = g * m2;
  let tau = getMotorTorque();
  let I1 = J1;
  let I2 = J2;

  let a1x = -(R1*(I2*tau + h**2*m2*tau*cos(theta)**2 + h**2*m2*tau*sin(theta)**2 - R1*h**3*m2**2*omega**2*sin(theta)**3 - R1*h**3*m2**2*omega**2*cos(theta)**2*sin(theta) - I2*R1*h*m2*omega**2*sin(theta) + R1*W2*h**2*m2*cos(theta)*sin(theta)))/(I1*I2 + I2*R1**2*m1 + I2*R1**2*m2 + I1*h**2*m2*cos(theta)**2 + I1*h**2*m2*sin(theta)**2 + R1**2*h**2*m2**2*sin(theta)**2 + R1**2*h**2*m1*m2*cos(theta)**2 + R1**2*h**2*m1*m2*sin(theta)**2);
  let a2x = -(I2*R1*tau + I1*I2*h*omega**2*sin(theta) - I1*W2*h**2*cos(theta)*sin(theta) + R1*h**2*m2*tau*sin(theta)**2 + I1*h**3*m2*omega**2*sin(theta)**3 - R1**2*W2*h**2*m1*cos(theta)*sin(theta) + R1**2*h**3*m1*m2*omega**2*sin(theta)**3 + I1*h**3*m2*omega**2*cos(theta)**2*sin(theta) + I2*R1**2*h*m1*omega**2*sin(theta) + R1**2*h**3*m1*m2*omega**2*cos(theta)**2*sin(theta))/(I1*I2 + I2*R1**2*m1 + I2*R1**2*m2 + I1*h**2*m2*cos(theta)**2 + I1*h**2*m2*sin(theta)**2 + R1**2*h**2*m2**2*sin(theta)**2 + R1**2*h**2*m1*m2*cos(theta)**2 + R1**2*h**2*m1*m2*sin(theta)**2);
  let a2y = -(h*(I1*I2*omega**2*cos(theta) + I1*W2*h*sin(theta)**2 + I2*R1**2*m1*omega**2*cos(theta) + I2*R1**2*m2*omega**2*cos(theta) + R1**2*W2*h*m1*sin(theta)**2 + R1**2*W2*h*m2*sin(theta)**2 + I1*h**2*m2*omega**2*cos(theta)**3 + R1**2*h**2*m1*m2*omega**2*cos(theta)**3 + R1*h*m2*tau*cos(theta)*sin(theta) + I1*h**2*m2*omega**2*cos(theta)*sin(theta)**2 + R1**2*h**2*m1*m2*omega**2*cos(theta)*sin(theta)**2))/(I1*I2 + I2*R1**2*m1 + I2*R1**2*m2 + I1*h**2*m2*cos(theta)**2 + I1*h**2*m2*sin(theta)**2 + R1**2*h**2*m2**2*sin(theta)**2 + R1**2*h**2*m1*m2*cos(theta)**2 + R1**2*h**2*m1*m2*sin(theta)**2);
  let alpha1 = (I2*tau + h**2*m2*tau*cos(theta)**2 + h**2*m2*tau*sin(theta)**2 - R1*h**3*m2**2*omega**2*sin(theta)**3 - R1*h**3*m2**2*omega**2*cos(theta)**2*sin(theta) - I2*R1*h*m2*omega**2*sin(theta) + R1*W2*h**2*m2*cos(theta)*sin(theta))/(I1*I2 + I2*R1**2*m1 + I2*R1**2*m2 + I1*h**2*m2*cos(theta)**2 + I1*h**2*m2*sin(theta)**2 + R1**2*h**2*m2**2*sin(theta)**2 + R1**2*h**2*m1*m2*cos(theta)**2 + R1**2*h**2*m1*m2*sin(theta)**2);
  let alpha2 = -(h*(- h*cos(theta)*sin(theta)*R1**2*m2**2*omega**2 + W2*sin(theta)*R1**2*m2 + W2*m1*sin(theta)*R1**2 + tau*cos(theta)*R1*m2 + I1*W2*sin(theta)))/(I1*I2 + I2*R1**2*m1 + I2*R1**2*m2 + I1*h**2*m2*cos(theta)**2 + I1*h**2*m2*sin(theta)**2 + R1**2*h**2*m2**2*sin(theta)**2 + R1**2*h**2*m1*m2*cos(theta)**2 + R1**2*h**2*m1*m2*sin(theta)**2);

  return [a1x, a2x, a2y, alpha1, alpha2];
}

// ============
// controller + ui

let index;
window.addEventListener("gamepadconnected", (event) => {
  app.controllerConnected = true;
  app.controllerName = event.gamepad.id;
  index = event.gamepad.index;
});

function getGamepadInputs() {
  return navigator.getGamepads()[index];
}
function getCorrectedAxes() {
  return getGamepadInputs().axes.slice().map(x => {
    let absx = Math.abs(x);
    return absx < app.deadzone ? 0 : (absx - app.deadzone) / (1 - app.deadzone) * Math.sign(x);
  });
}

function readGamepad() {
  if (!app.controllerConnected) return;
  app.controlMethods[app.selectedControlMethod].readGamepad();
}

