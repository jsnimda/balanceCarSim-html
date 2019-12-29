let methods = app.controlMethods;

function safeV(val) {
  return Math.min(Math.abs(val), app.environment.maxVelocity) * Math.sign(val);
}
function setVs(v1, v2) {
  input.v1 = safeV(v1);
  input.v2 = safeV(v2);
}

methods.push(...[
  {
    name: 'wheels separately',
    readGamepad: function() {
      let a = getCorrectedAxes();
      input.v1 = (a[1] * -app.environment.maxVelocity) << 0;
      input.v2 = (a[3] * -app.environment.maxVelocity) << 0;
    }
  },
  {
    name: '^v / <>',
    readGamepad: function() {
      let maxV = app.environment.maxVelocity;
      let maxRotate = maxV;

      let buttons = getGamepadInputs().buttons;
      if (buttons[5].value) {
        maxV /= 4;
        maxRotate /= 4;
      } else if (buttons[1].value) {
        maxRotate /= 4;
      }

      let a = getCorrectedAxes();
      let v1, v2;
      v1 = v2 = (a[1] * -maxV) << 0;
      let c = a[2] * maxRotate << 0;
      v1 += c;
      v2 -= c;
      setVs(v1, v2);
    }
  },
  {
    name: 'bump + <>',
    readGamepad: function() {
      let maxV = app.environment.maxVelocity;
      let maxRotate = maxV;

      let buttons = getGamepadInputs().buttons;
      if (buttons[1].value) {
        maxV /= 4;
        maxRotate /= 4;
      } else if (buttons[1].value) {
        maxRotate /= 4;
      }
      let a = getCorrectedAxes();
      let v1, v2;
      v1 = v2 = (buttons[7].value - buttons[6].value) * maxV;
      let c = a[0] * maxRotate;
      v1 += c;
      v2 -= c;
      setVs(v1 << 0, v2 << 0);
    }
  },
  {
    name: '<^v>',
    readGamepad: function() {
      let a = getCorrectedAxes();
      let v1, v2;
      v1 = v2 = (a[1] * -app.environment.maxVelocity) << 0;
      let c = a[0] * app.environment.maxVelocity << 0;
      v1 += c;
      v2 -= c;
      setVs(v1, v2);
    }
  },
  {
    name: '1/2 <^v>',
    readGamepad: function() {
      let a = getCorrectedAxes();
      let v1, v2;
      v1 = v2 = (a[1] * -app.environment.maxVelocity / 2) << 0;
      let c = a[0] * app.environment.maxVelocity / 2 << 0;
      v1 += c;
      v2 -= c;
      setVs(v1, v2);
    }
  },
]);

function getAxesAngles() {
  let a = getCorrectedAxes();
  return [Math.atan2(-a[1], a[0]), Math.atan2(-a[3], a[2])]
}
function getAxesPolars() {
  let a = getCorrectedAxes();
  return [Math.hypot(a[1], a[0]), Math.atan2(-a[1], a[0]), Math.hypot(a[3], a[2]), Math.atan2(-a[3], a[2])]
}

methods.push(...[
  {
    name: 'smart direction',
    readGamepad: function() {
      let a = getCorrectedAxes();
      let b = getAxesPolars();
      let deltaAngle = normAngle(b[1] - b[3]);
      let v1, v2;
      v1 = v2 = (getGamepadInputs().buttons[7].value - getGamepadInputs().buttons[6].value) * app.environment.maxVelocity;
      let c = -deltaAngle / Math.PI * app.environment.maxVelocity * b[0] * b[2];
      v1 += c;
      v2 -= c;
      setVs(v1 << 0, v2 << 0);
    },
    description: `Left stick control desired direction. \nRight stick control current direction.`
  },
]);