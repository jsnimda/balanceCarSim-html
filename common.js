
function normAngle(rad) { // -PI (inclu) to PI (exclu)
  return rad - Math.floor((rad + Math.PI) / (2 * Math.PI)) * 2 * Math.PI;
}

function rotateCoord(x, y, angle) {
  return [x * Math.cos(angle) + y * Math.sin(angle),
    -x * Math.sin(angle) + y * Math.cos(angle)];
}