var big;
var biggies = [];
var song;
var back;
//var gold;

function preload(){
  soundFormats('ogg','mp3');
  big = loadImage("biggie.png");
  song = loadSound("Biggie.mp3");
  back = loadImage("biggie_back.jpg");
  //gold = loadImage("goldstripes.png");
}

function setup() {
  createCanvas(windowWidth, windowHeight);
  song.loop();
  background(back);
}

function mouseDragged(){
  var b = new Biggie(mouseX,mouseY,big);
  biggies.push(b);
}

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

function draw(){
  //image(gold,0,0);
  for(var i = 0; i<biggies.length; i++){
    biggies[i].display();
  }

}
