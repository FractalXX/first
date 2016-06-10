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
var map = [];
			
window.onload = function() {
	gameLoop();
};

img.onload = function() {
	update();
};

$(document).keydown(function(e) {
	map[e.keyCode] = true;
	if(e.keyCode == 37) speedX = -1;
	if(e.keyCode == 39) speedX = 1;
	if(e.keyCode == 38) speedY = -1;
	if(e.keyCode == 40) speedY = 1;
});

$(document).keyup(function(e) {
	map[e.keyCode] = false;
	if(!map[37] && !map[39]) speedX = 0;
	if(!map[38] && !map[40]) speedY = 0;
});

function update() {	

	ctx.clearRect(imgX, imgY, img.width, img.height);

	if(!checkBorders()) {
		imgX += speedX;
		imgY += speedY;
	}
	
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
	update();
	setTimeout(gameLoop, 1);
}