var phones = {};
var fx;

var CMD_START = 0;
var CMD_MOVE = 1;
var CMD_END = 2;
var CMD_COLOR = 3;

// --- socket ---
var socket = io();

socket.on('connected', function(id) {
  console.log('connected', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});

// receive data from the phones
socket.on('dataChannel1', function(data) {

  if(phones[data.id] == undefined) {
    phones[data.id] = {
      color: color(random(255), random(255), random(255))
    };
  }
  var phone = phones[data.id];

  if(data.cmd <= CMD_END) {
    phone.last = new Date().getTime();
    phone.x = data.x;
    phone.y = data.y;
  } else if(data.cmd == CMD_COLOR) {
    phone.color = color(random(255), random(255), random(255));
  }
});

// --- p5.js ---

function preload() {
  var r = Math.random();
  fx = loadShader('vert.glsl?r='+r, 'frag.glsl?r='+r);
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  setAttributes('antialias', true);
  shader(fx);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
}

function draw() {
  var t = millis() * 0.001;
  fx.setUniform('t', t);

  //background(0);
  drawCubes();
}

// draw a cube at the position of each phone input
function drawCubes() {
  push();
  translate(-width/2, -height/2);

  for(var id in phones) {
    var phone = phones[id];
    if (phone.x) {
      push();

      // fade cube out when is inactive
      var timeDistance = new Date().getTime() - phone.last;
      if (timeDistance < 2000) {
        var a = map( timeDistance, 0, 2000, 255, 0 );
        fill(phone.color);
        shader(fx);
        noStroke();
        directionalLight(255, 255, 255, -1, -1, -1);
        translate(phone.x * width, phone.y * height);
        rotateX(frameCount * 0.01);
        box(50);
      }
      else {
        phone.x = undefined;
        phone.y = undefined;
      }

      pop();
    }
  }
  pop();
}
