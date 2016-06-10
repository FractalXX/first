//resolution stuff
var cWidth = window.innerWidth
|| document.documentElement.clientWidth
|| document.body.clientWidth;

var cHeight = window.innerHeight
|| document.documentElement.clientHeight
|| document.body.clientHeight;	

//img properties
var img = new Image();
img.src = "rocket.png";

var imgX = 20;
var imgY = 20;

//canvas properties
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#FFFFFF";


// speed of rocket
var speedX = 0;
var speedY = 0;

// key map
var map = {37: -1, 39: 1, 38: -1, 40: 1};
			
window.onload = function() {
	gameLoop();
};

img.onload = function() {
	updatePosition();
};

window.onkeydown = function(e) {
	// left or right
	if (e.keyCode == 37 || e.keyCode == 39) {
		speedX = map[e.keyCode];
	}
	// up or down
	if (e.keyCode == 38 || e.keyCode == 40) {
		speedY = map[e.keyCode];
	}
}

window.onkeyup = function(e) {
	//left or right
	if (e.keyCode == 37 || e.keyCode == 39) {
		speedX -= map[e.keyCode];
	}
	//up or down
	if (e.keyCode == 38 || e.keyCode == 40) {
		speedY -= map[e.keyCode];
	}
}

function updatePosition() {	

	if(!checkBorders()) {
		imgX += speedX;
		imgY += speedY;
	}

	updateCanvas();
}

function updateCanvas() {
    ctx.clearRect(0,0,canvas.width,canvas.height);
    ctx.save();
	ctx.drawImage(img, imgX, imgY);
	ctx.restore();	
}

function checkBorders() {
	if(speedX > 0 && imgX + img.width >= canvas.width) {
		speedX = 0;
		return true;
	}
	if(speedX < 0 && imgX <= 0) {
		speedX = 0;
		return true;
	}
	if(speedY > 0 && imgY + img.height >= canvas.height) {
		speedY = 0;
		return true;
	}
	if(speedY < 0 && imgY <= 0) {
		speedY = 0;
		return true;
	}	
	return false;
}

function gameLoop()
{
	updatePosition();
	setTimeout(gameLoop,1);
}