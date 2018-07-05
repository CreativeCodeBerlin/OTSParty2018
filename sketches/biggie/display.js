var phones = {};

var big;
//var biggies = [];
var song;
var back;
//var gold;

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
    phones[data.id] = { };
  }
  var phone = phones[data.id];

  if (data.mousePosition != undefined) {
    imageMode(CENTER);
    image(big,
      data.mousePosition.x * width,
      data.mousePosition.y * height);

    var speed = map(data.mousePosition.y, 0.0, 1.0, 0.8, 1.2);
    song.rate(speed);
  }
});

// --- p5.js ---

function preload() {
  soundFormats('ogg','mp3');
  big = loadImage("media/biggie.png");
  song = loadSound("media/Biggie.mp3");
  back = loadImage("media/biggie_back.jpg");
  //gold = loadImage("media/goldstripes.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  song.loop();
  background(back);
}

/*
function Biggie(x,y,img){
  this.x = x;
  this.y = y;
  this.img = img;

  var speed = map(this.y,0.1,height,0,2);
  speed = constrain(speed,0.8,1.2);
  song.rate(speed);

  this.display = function(img){
    imageMode(CENTER);
    image(this.img,this.x,this.y);
  }
}
*/

function mouseDragged(){
  //var b = new Biggie(mouseX,mouseY,big);
  //biggies.push(b);
}

function windowResized() {
  resizeCanvas(windowWidth, windowHeight);
  imageMode(CORNER);
  background(back);
}

function draw() {
  //image(gold,0,0);
  //for(var i = 0; i<biggies.length; i++){
    //biggies[i].display();
  //}
}

