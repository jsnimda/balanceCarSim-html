function carProvider() {
  return {
    wheels: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      theta: 0,
      omega: 0,
      alpha: 0,
      xIntegral: 0
    }, 
    cylinder: {
      x: 0,
      y: 0,
      vx: 0,
      vy: 0,
      ax: 0,
      ay: 0,
      theta: 0,
      omega: 0,
      alpha: 0,
      thetaIntegral: 0
    }
  };
}

let car = carProvider();
let wheels = car.wheels;
let cylinder = car.cylinder;

let app = new Vue({
  el: '#app',
  data: {
    normAngle: normAngle,
    message: 'Hello Vue!',
    controllerConnected: false,
    controllerName: "",
    deadzone_: 0.2,
    car: car,
    environment: {
      inertiaCylinderKgM2: 50, // kg m^2
      inertiaWheelsKgM2: 0.2,
      massCylinderKg: 30, // kg
      massWheelsKg: 10,
      wheelRadiusM: 0.2, // m
      cylinderCenterM: 0.5, // m
      gMPerS2: 9.81,
    },
    initValues: {
      thetaDeg: 5
    },
    options: {
      timesPerSecond: 30000
    },
    inputTau: 0,
    statistics: {
      maxX: 0,
      minX: 0,
      dx: 0,
      maxTheta: 0,
      minTheta: 0,
      dTheta: 0,
    },
    pid: {
      kp: 0,
      ki: 0,
      kd: 0
    },
    pidWheels: {
      kp: 0,
      ki: 0,
      kd: 0
    },
    timeT: 0,
    tauK: 0,
    sketch: {},
    lockViewToCar: false,
    lockAngleToCar: false,
    cylinderTorque: false,
    started: false,
    running: false,
    controlMethods: [],
    selectedControlMethod: 0
  },
  computed: {
    thetaRad: function() {
      return this.initValues.thetaDeg * Math.PI / 180;
    },
    deadzone: {
      get: function() {
        return this.deadzone_;
      },
      set: function(val) {
        if (!isNaN(parseFloat(val)))
          this.deadzone_ = val;
      }
    },
    v: function() {
      return this.car.wheels.vx;
    },
    x: function() {
      return this.car.wheels.x;
    },
    theta: function() {
      return this.normAngle(this.car.cylinder.theta);
    },
    thetaDeg: function() {
      return this.theta*180/Math.PI;
    },
  },
  watch: {
    environment: {
      handler() {
        if (!this.started) setPos();
      },
      deep: true
    },
    initValues: {
      handler() {
        if (!this.started) setPos();
      },
      deep: true
    },
    car: {
      handler() {
        this.statistics.minX = Math.min(this.x, this.statistics.minX);
        this.statistics.maxX = Math.max(this.x, this.statistics.maxX);
        this.statistics.dx = this.statistics.maxX - this.statistics.minX;
        this.statistics.minTheta = Math.min(this.thetaDeg, this.statistics.minTheta);
        this.statistics.maxTheta = Math.max(this.thetaDeg, this.statistics.maxTheta);
        this.statistics.dTheta = this.statistics.maxTheta - this.statistics.minTheta;
      },
      deep: true
    }
  },
  methods: {
    start: function() {
      if (this.started) {
        this.running = !this.running;
      } else {
        this.started = true;
        this.running = true;
      }
    },
    stop: function() {
      this.started = false;
      this.running = false;
      setPos();
      this.statistics = {
        maxX: 0,
        minX: 0,
        dx: 0,
        maxTheta: 0,
        minTheta: 0,
        dTheta: 0,
      };
      this.timeT = 0;
    }
  }
});

let environment = app.environment;

function setPos() {
  car = carProvider();
  wheels = car.wheels;
  cylinder = car.cylinder;
  app.car = car;

  wheels.x = 0;
  wheels.y = environment.wheelRadiusM;
  wheels.theta = 0;
  let th = app.thetaRad;
  let L = environment.cylinderCenterM;
  cylinder.x = Math.sin(th) * L;
  cylinder.y = Math.cos(th) * L + wheels.y;
  cylinder.theta = th;
}
setPos();

// let saves = ['deadzone_', 'environment', 'selectedControlMethod', 'lockViewToCar', 'lockAngleToCar'];
// let savesObj = localStorage.saves ? JSON.parse(localStorage.saves) : {};
// saves.forEach(x => {
//   if (x in savesObj) {
//     app[x] = savesObj[x];
//   }
//   app.$watch(x, function() {
//     savesObj[x] = app[x];
//     localStorage.saves = JSON.stringify(savesObj);
//   }, {
//     deep: true
//   })
// })


