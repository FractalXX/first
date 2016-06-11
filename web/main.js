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
var oldimgX = imgX;
var oldimgY = imgY;

//canvas properties
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var levelCanvas = document.getElementById("level");
var levelCtx = levelCanvas.getContext("2d");

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#000000";

levelCanvas.width = cWidth;
levelCanvas.height = cHeight;
levelCtx.fillStyle = "#FF00FF";

var genX = 0;
var genY = levelCanvas.height;

// speed of rocket
var speedX = 0;
var speedY = 0;

// key map
var map = [];

function backingScale(context) {
    if ('devicePixelRatio' in window) {
        if (window.devicePixelRatio > 1) {
            return window.devicePixelRatio;
        }
    }
    return 1;
}

var scaleFactor = backingScale(ctx);
			
window.onload = function() {
	gameLoop();
	if (scaleFactor > 1) {
		canvas.width = canvas.width * scaleFactor;
		canvas.height = canvas.height * scaleFactor;
		// update the context for the new canvas scale
		var ctx = canvas.getContext("2d");
	}
	setTimeout(update,1000/60);
};

img.onload = function() {
	update();
};

$(document).keydown(function(e) {
	map[e.keyCode] = true;
	if(e.keyCode == 37) speedX = -2;
	if(e.keyCode == 39) speedX = 2;
	if(e.keyCode == 38) speedY = -2;
	if(e.keyCode == 40) speedY = 2;
});

$(document).keyup(function(e) {
	map[e.keyCode] = false;
	if(!map[37] && !map[39]) speedX = 0;
	if(!map[38] && !map[40]) speedY = 0;
});

function update() {	

	window.requestAnimationFrame(update);

	ctx.clearRect(oldimgX, oldimgY, img.width*scaleFactor, img.height*scaleFactor);
	ctx.clearRect(imgX, imgY, img.width*scaleFactor, img.height*scaleFactor);

	if(!checkBorders()) {
		oldimgX = imgX;
		oldimgY = imgY;
		imgX += speedX;
		imgY += speedY;
	}
	
	ctx.save();
	ctx.drawImage(img, imgX, imgY);
	ctx.restore();
	
}

function generateLevel() {
	lineLength = Math.floor((Math.random() * 20) + 10);
	
	levelCtx.save();
	
	levelCtx.beginPath();
	levelCtx.moveTo(genX,genY);
	levelCtx.lineTo(genX,genY-lineLength);
	levelCtx.stroke();
	
	levelCtx.restore();
	
	genX += 1;
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
	generateLevel();
	setTimeout(gameLoop, 200);
}