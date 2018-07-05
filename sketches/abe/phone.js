var phones = {};
var pg;

var CMD_START = 0;
var CMD_MOVE = 1;
var CMD_END = 2;
var CMD_COLOR = 3;

// --- sockets ---
var socket = io();

screen.lockOrientationUniversal = screen.lockOrientation || screen.mozLockOrientation || screen.msLockOrientation;
screen.lockOrientationUniversal("landscape-primary");

socket.on('connected', function(id) {
  console.log('connected with id:', id);
});

/* For switching into a new sketch, a reload has to be performed */
socket.on('reload', function(piecename) {
  location.reload();
});

var processData = function(data) {
  if(phones[data.id] == undefined) {
    phones[data.id] = { };
  }

  switch(data.cmd) {
    case CMD_MOVE:
    case CMD_END:
      pg.stroke(255, 150);
      pg.line(
        data.x * width,
        data.y * height,
        phones[data.id].x * width,
        phones[data.id].y * height);

      break;
  }

  phones[data.id].x = data.x;
  phones[data.id].y = data.y;
  phones[data.id].last = new Date().getTime();
}

socket.on('dataChannel1', processData);

/* There are 3 channels to send data through sockets.
 * You can use them as you want.
 * For example, you can use one channel to send sensor data from the phone to the visuals,
 * another channel to trigger events and the last one for communicating with other phones
 * on the network.
 */

// --- p5.js ---

function setup() {
  createCanvas(windowWidth, windowHeight);
  pg = createGraphics(windowWidth, windowHeight);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  var newPG = createGraphics(windowWidth, windowHeight);
  newPG.image(pg, 0, 0, newPG.width, newPG.height);
  pg = newPG;
}

function emit(cmd) {
  // send the input data to the display using dataChannel1
  var data = {
    id: socket.id,
    cmd: cmd,
    x: mouseX / width,
    y: mouseY / height
  };
  socket.emit('dataChannel1', data);
  // data is not sent to self, so we simulate that here:
  processData(data);
}

function touchStarted() {
  frameRate(15);
  emit(CMD_START);
}

function touchMoved() {
  emit(CMD_MOVE);
}

function touchEnded() {
  frameRate(60);
  emit(CMD_END);
}


function draw() {
  background(17);
  image(pg, 0, 0);
  noStroke();
  fill(255);

  if (mouseIsPressed) {
    ellipse(mouseX, mouseY, 80, 80);
  }

  drawPlayers();
}

function drawPlayers() {
  for(var id in phones) {
    var phone = phones[id];
    if (phone.position != undefined) {
      // fade out when inactive
      var timeDistance = new Date().getTime() - phone.last;
      if (timeDistance < 2000) {
        fill(map( timeDistance, 0, 2000, 255, 0 ));
        stroke(0);

        ellipse(phone.position.x * width, phone.position.y * height, 10, 10);
      } else {
        phone.position = undefined;
      }
    }
  }
}

function b1() {
  socket.emit('dataChannel1', {
    id: socket.id,
    cmd: CMD_COLOR
  });
}
