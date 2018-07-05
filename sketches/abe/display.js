var phones = {};
var pg;
var fx;
var tex;
var texNum = Math.floor(Math.random() * 40);
var particles = [];

var CMD_START = 0;
var CMD_MOVE = 1;
var CMD_END = 2;

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

  if(data.cmd == CMD_START) {
    phone.color = tex.get(
      data.x * tex.width,
      data.y * tex.height);
  }
  if(data.cmd <= CMD_END) {
    phone.last = new Date().getTime();
    phone.x = data.x;
    phone.y = data.y;
    particles.push({
      x: phone.x,
      y: phone.y,
      color: phone.color,
      age: 1.0
    });
  }
});

// --- p5.js ---

function preload() {
  var r = Math.random();
  fx = loadShader('vert.glsl?r='+r, 'frag.glsl?r='+r);
  tex = loadImage('media/' + nf(texNum, 2) + '.jpg');
}

function setup() {
  createCanvas(windowWidth, windowHeight, WEBGL);
  pg = createGraphics(windowWidth, windowHeight, WEBGL);
  //pg.setAttributes('antialias', true);
  pg.shader(fx);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  var newPG = createGraphics(windowWidth, windowHeight);
  newPG.image(pg, 0, 0, newPG.width, newPG.height);
  pg = newPG;
}

function draw() {
  var t = millis() * 0.001;
  fx.setUniform('t', t);

  if(frameCount % (60 * 15) == 0) {
    texNum = floor(random(40));
    tex = loadImage('media/' + nf(texNum, 2) + '.jpg');
  }

  drawCubes();
}

// draw a cube at the position of each phone input
function drawCubes() {
  pg.clear();
  pg.push();
  pg.translate(-width/2, -height/2);
  pg.directionalLight(100, 100, 100, -1, -1, -1);
  pg.noStroke();

  for(var id in particles) {

    var p = particles[id];
    p.age *= 0.9;
    var c = tex.get(
      p.x * tex.width,
      p.y * tex.height);

    var a = (c[0] + c[1] + c[2]) * 0.01;
    p.x += 0.01 * Math.cos(a);
    p.y += 0.01 * Math.sin(a);

    pg.push();
    pg.fill(p.color);
    pg.shader(fx);
    pg.translate(p.x * width, p.y * height);
    pg.rotateX(frameCount * 0.01 + 5 * p.age);
    pg.rotateY(frameCount * 0.03 - 5 * p.age);
    var s = 100 * p.age;
    pg.box(s * 2, s /5, s /5, 1, 1);
    pg.pop();

  }
  pg.pop();

  particles = particles.filter(function(v, i, a) { return v.age > 0.01; });

  texture(pg);
  plane(width, height);
}
