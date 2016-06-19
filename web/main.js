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

var expImg = new Image();
expImg.src = "explosion.png";

var imgX = 0;
var imgY = cHeight/2;
var oldimgX = imgX;
var oldimgY = imgY;

var tileset = new Image();
tileset.src = 'tileset.png';
var tileSize = 16;

var tileArray = new Array(Math.floor(cWidth/16)*Math.floor(cHeight/16));

//canvas properties
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var levelCanvas = document.getElementById("level");
var levelCtx = levelCanvas.getContext("2d");

var fxCanvas = document.getElementById("fx");
var fxCtx = fxCanvas.getContext("2d");

var minBottomHeight = cHeight-16;
var maxBottomHeight = cHeight-16*12;

var minTopHeight = 0;
var maxTopHeight = Math.floor(cHeight/16) * 4;

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#000000";

levelCanvas.width = cWidth+16;
levelCanvas.height = cHeight;
levelCtx.fillStyle = "#000000";

fxCanvas.width = cWidth;
fxCanvas.height = cHeight;
fxCtx.fillStyle = "#000000";

var colorLayer = levelCtx.createImageData(levelCanvas.width, levelCanvas.height);

var bGenX = 0;
var bGenY = minBottomHeight-16;

var tGenY = minTopHeight+16;

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
	if (scaleFactor > 1) {
		canvas.width = canvas.width * scaleFactor;
		canvas.height = canvas.height * scaleFactor;
		// update the context for the new canvas scale
		var ctx = canvas.getContext("2d");
	}
	
	setInterval(update, 1000/45);
};

$(document).keydown(function(e) {
	map[e.keyCode] = true;
	if(e.keyCode == 37) speedX = -4;
	if(e.keyCode == 39) speedX = 4;
	if(e.keyCode == 38) speedY = -4;
	if(e.keyCode == 40) speedY = 4;
});

$(document).keyup(function(e) {
	map[e.keyCode] = false;
	if(!map[37] && !map[39]) speedX = 0;
	if(!map[38] && !map[40]) speedY = 0;
});

function update() {	
	
	ctx.clearRect(oldimgX, oldimgY, img.width*scaleFactor, img.height*scaleFactor);
	ctx.clearRect(imgX, imgY, img.width*scaleFactor, img.height*scaleFactor);
	
	if(tileCollision()) {
		createExplosion(imgX, imgY);
		
		imgX = levelCanvas.width + img.width;
		imgY = levelCanvas.height + img.height;
		
		setTimeout(resetShip, 2000);
	}
	
	if(!checkBorders() && !tileCollision()) {
		oldimgX = imgX;
		oldimgY = imgY;
		imgX += speedX;
		imgY += speedY;
	}
	
	ctx.drawImage(img, imgX, imgY);
	
	generateLevel();
	renderTiles();
}

function renderTiles() {
	levelCtx.clearRect(0, 0, levelCanvas.width, levelCanvas.height);	
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] == undefined) continue;
		if(tileArray[i].x >= 0 && tileArray[i].x <= levelCanvas.width) {
			levelCtx.drawImage(tileset, Math.floor(tileArray[i].column * tileSize) + tileArray[i].column, Math.floor(tileArray[i].row * tileSize) + tileArray[i].row, tileSize, tileSize, tileArray[i].x, tileArray[i].y, tileSize, tileSize);
		}	
	}
}

function generateLevel() {
	
	var chance = Math.random();
	
	if(chance <= 0.25 && bGenY < minBottomHeight-32) {
		bGenY += 16;
	}
	else if(chance <= 0.50 && bGenY > maxBottomHeight) {
		bGenY -= 16;
	}	
	
	createTile(bGenX, bGenY+16, 0, 1);
	createTile(bGenX, bGenY+16, 1, 1);
	createTile(bGenX, bGenY+32, 1, 3);
	createTile(bGenX, bGenY+48, 1, 6);
	
	for(var i = minBottomHeight; i > bGenY+48; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}	
	
	chance = Math.random();
		
	if(chance <= 0.25 && tGenY < maxTopHeight) {
		tGenY += 16;
	}
	else if(chance <= 0.50 && tGenY > minTopHeight+32) {
		tGenY -= 16;
	}		
	
	createTile(bGenX, tGenY, 1, 4);
	createTile(bGenX, tGenY-16, 1, 3);
	createTile(bGenX, tGenY-32, 1, 1);
	createTile(bGenX, tGenY-48, 1, 8);
	
	for(var i = tGenY-64; i >= minTopHeight; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}
	
	bGenX = levelCanvas.width-16;
	
	scrollLevel();
	
}

function scrollLevel() {
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] != undefined) {
			tileArray[i].x -= 16;
			if(tileArray[i].x < 0) deleteTile(i);
		}	
	}
}

function resetShip() {
	imgX = 0;
	imgY = levelCanvas.height/2;
}

function fillRow(y, tilerow, tilecolumn) {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		createTile(i, y, tilerow, tilecolumn);
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

function tileCollision() {
	whatColor = levelCtx.getImageData(imgX, imgY, img.width, img.height);
	
	for(var x = imgX; x < imgX + img.width; x++) {
		if(x == imgX || x == imgX + img.width) {
			for(var y = imgY; y < imgY + img.height; y++) {
				if(whatColor.data[(x+y)*4+3] != 0) {
					return true;
				}	
			}
		}
		else {
			if(whatColor.data[(x+imgY+img.height)*4+3] != 0) {
				return true;
			}		
		}
	}
	return false;
}

function createTile(x, y, row, column) {
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] != undefined) {
			if(x == tileArray[i].x && y == tileArray[i].y) {
				tileArray[i] = new Tile(x, y, row, column);
				return tileArray[i];	
			}
		}
		if(tileArray[i] == undefined) {
			tileArray[i] = new Tile(x, y, row, column);
			return tileArray[i];
		}
	}
	console.error("Couldn't create tile at [", x, ",", y, "], tile limit reached.");
	
	return undefined;
}

function deleteTile(tileid) {
	tileArray[tileid] = undefined;
}

function createExplosion(x, y) {
	setTimeout(explosionTimer, 1000/45, x, y, 0, 0);
}

function explosionTimer(x, y, row, column) {
	fxCtx.clearRect(x, y, 128, 128);
	fxCtx.drawImage(expImg, 64*column, 64*row, 64, 64, x, y, 128, 128);
	
	var nextRow = row;
	var nextColumn = column + 1;
	
	if(column == 4) {
		nextRow++;
		nextColumn = 0;
	}
	
	if(nextRow == 5) {
		setTimeout(function(){ fxCtx.clearRect(x, y, 128, 128); }, 1000/45, x, y);
	}
	else {
		setTimeout(explosionTimer, 1000/45, x, y, nextRow, nextColumn);	
	}
}