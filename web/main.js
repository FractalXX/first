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

var tileArray = [];

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
var points = [];

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
	setInterval(update, 1000/60);
	setInterval(generateLevel, 1000/30);
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
	
	renderTiles();
}

function renderTiles() {
	levelCtx.clearRect(0, 0, levelCanvas.width, levelCanvas.height);	
	for(var i = 0; i < tileArray.length; i++) {
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
	
	createTile(bGenX, bGenY, 3, 1);
	createTile(bGenX, bGenY+16, 3, 1);
	
	for(var i = minBottomHeight; i > bGenY+16; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}
	
	chance = Math.random();
		
	if(chance <= 0.25 && tGenY < maxTopHeight) {
		tGenY += 16;
	}
	else if(chance <= 0.50 && tGenY > minTopHeight+32) {
		tGenY -= 16;
	}		
	
	createTile(bGenX, tGenY, 3, 1);
	createTile(bGenX, tGenY-16, 3, 1);
	
	for(var i = tGenY-16; i >= minTopHeight; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}
	
	bGenX = levelCanvas.width-16;
	
	scrollLevel();
	
}

function scrollLevel() {
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i].id != -1) {
			tileArray[i].x -= 16;
			if(tileArray[i].x < 0) deleteTile(i);
		}	
	}
}

function resetShip() {
	imgX = 0;
	imgY = levelCanvas.height/2;
}

/*function assignStyle(tileObj) {
	
	if(tileObj.y == minBottomHeight || tileObj.y == minTopHeight) {
		tileObj.row = 3;
		tileObj.column = 6;
		return;
	}	
	
	var isLeft = false;
	var isTop = false;
	var isRight = false;
	
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i].x == tileObj.x-16 && isAir(i)) {
			isLeft = true;
		}
		if(tileArray[i].y == tileObj.y+16 && isAir(i)) {
			isTop = true;
		}
		if(tileArray[i].x == tileObj.x+16 && isAir(i)) {
			isRight = true;
		}
	}
	
	if(isLeft) {
		tileObj.row = 3;
		tileObj.column = 0;
	}
	
	if(isTop) {
		tileObj.row = 1;
		tileObj.column = 1;
	}
	
	if(isRight) {
		tileObj.row = 3;
		tileObj.column = 2;
	}
}*/

/*function isAir(tileid) {
	return tileArray[tileid].row == 4 && tileArray[tileid].column == 2 ? true : false;
}

function fillAir() {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		for(var j = 0; j < levelCanvas.height; j += 16) {
			createTile(i, j, 4, 2);
		}
	}
}*/

function fillRow(y, tilerow, tilecolumn) {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		createTile(i, y, tilerow, tilecolumn);
	}		
}

/*function resetGeneration() {
	bGenX = 0;
	bGenY = maxBottomHeight;

	tGenX = 0;
	tGenY = minTopHeight;
}*/

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
			if(whatColor.data[(x+img.height)*4+3] != 0) {
				return true;
			}		
		}
	}
	return false;
}

function createTile(x, y, row, column) {
	for(var i = 0; i < tileArray.length; i++) {
		if(x == tileArray[i].x && y == tileArray[i].y) {
			deleteTile(i);
		}
	}
	
	var tile = new Tile(x, y, row, column);
	
	return tile;
}

function deleteTile(tileid) {
	tileArray.splice(tileid, 1);
}

function createExplosion(x, y) {
	setTimeout(explosionTimer, 1000/30, x, y, 0, 0);
}

function explosionTimer(x, y, row, column) {
	fxCtx.clearRect(x, y, 128, 128);
	fxCtx.drawImage(expImg, 64*row, 64*column, 64, 64, x, y, 128, 128);
	
	if(row == 4 && column == 4) {
		setTimeout(function(){ fxCtx.clearRect(x, y, 128, 128); }, 1000/15, x, y);
	}
	
	var nextRow = row;
	var nextColumn = column + 1;
	
	if(column == 4) row++;
	
	setTimeout(explosionTimer, 1000/15, x, y, nextRow, nextColumn);
}