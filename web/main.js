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

var minLvlHeight = 100;
var maxLvlHeight = cHeight/6;

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#000000";

levelCanvas.width = cWidth;
levelCanvas.height = cHeight;
levelCtx.fillStyle = "#FF00FF";

var imgData = levelCtx.createImageData(levelCanvas.width, levelCanvas.height);

var genX = 0;
var genY = levelCanvas.height - minLvlHeight;

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
	
	generateLevel();

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
	
	var curveEnd = Math.floor(Math.random() * maxLvlHeight) + minLvlHeight;
	var curveDir = Math.random() < 0.5 ? -1 : 1;
	
	for (i = 0; i < curveEnd; i++) { 
		if(genY >= levelCanvas.height - minLvlHeight) curveDir *= -1;
		else if(i == curveEnd*Math.random()) curveDir *= -1;
	
		levelCtx.save();
		
		levelCtx.beginPath();
		levelCtx.moveTo(genX,cHeight);
		levelCtx.lineTo(genX,genY);
		levelCtx.stroke();
		
		levelCtx.restore();
		
		var vStepping = Math.random() * curveDir;
		
		genX += 0.5;
		genY += Math.random() < 0.5 ? vStepping : 0;
		
	}
	
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
	setTimeout(gameLoop, 200);
}