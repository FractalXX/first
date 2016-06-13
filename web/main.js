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

var tileset = new Image();
tileset.src = 'tileset.png';
var tileSize = 16;

var tileArray = [];

var genTile;

//canvas properties
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var levelCanvas = document.getElementById("level");
var levelCtx = levelCanvas.getContext("2d");

var minBottomHeight = cHeight-16;
var maxBottomHeight = Math.floor(cHeight/16) * 14;

var minTopHeight = 0;
var maxTopHeight = Math.floor(cHeight/16) * 4;

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#000000";

levelCanvas.width = cWidth+cWidth/2;
levelCanvas.height = cHeight;
levelCtx.fillStyle = "#000000";

var colorLayer = levelCtx.createImageData(levelCanvas.width, levelCanvas.height);

var bGenX = 0;
var bGenY = maxBottomHeight;

var tGenY = maxTopHeight;

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
	fillAir();
	genTile = createTile(0, 0, 3, 6);
	fillRow(minBottomHeight, 3, 6);
	fillRow(minBottomHeight+16, 3, 6);
	fillRow(minBottomHeight+32, 3, 6);
	fillRow(minBottomHeight+48, 3, 6);
	fillRow(minTopHeight, 3, 6);
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
	
	ctx.drawImage(img, imgX, imgY);
	
	renderTiles();
	
}

function renderTiles() {
	levelCtx.clearRect(0, 0, levelCanvas.width, levelCanvas.height);
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i].id != -1 && !isAir(i)) {
			levelCtx.drawImage(tileset, Math.floor(tileArray[i].column * tileSize) + tileArray[i].column, Math.floor(tileArray[i].row * tileSize) + tileArray[i].row, tileSize, tileSize, tileArray[i].x, tileArray[i].y, tileSize, tileSize);
		}	
	}
}

function generateLevel() {
	
	var chance = Math.random();
	
	if(chance <= 0.25) {
		bGenY += 16;
	}
	else if(chance <= 0.50) {
		bGenY -= 16;
	}
	
	if(bGenY > maxBottomHeight) bGenY = maxBottomHeight;
	
	genTile = createTile(bGenX, bGenY, 3, 1);
	
	createTile(bGenX, bGenY+16, 3, 1);
	createTile(bGenX, bGenY+32, 3, 1);
	
	for(var i = minBottomHeight; i > bGenY+32; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}
	
	chance = Math.random();
	
	if(chance <= 0.25) {
		tGenY += 16;
	}
	else if(chance <= 0.50) {
		tGenY -= 16;
	}
	
	if(tGenY > maxTopHeight) tGenY = maxTopHeight;
	
	genTile = createTile(bGenX, tGenY, 3, 1);
	
	createTile(bGenX, tGenY-16, 3, 1);
	createTile(bGenX, tGenY-32, 3, 1);
	
	for(var i = tGenY-32; i > minTopHeight; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}	
	
	bGenX += 16;
	
	/*for(var i = 0; i < levelCanvas.width; i += 4) {
		//bottom
		levelCtx.beginPath();
		levelCtx.moveTo(bGenX,bGenY);
		bGenX += Math.floor(Math.random() * 70) + 30;
		bGenY = maxBottomHeight - generator.getVal(bGenX);	
		levelCtx.lineTo(bGenX,bGenY);
		levelCtx.stroke();
					
		//top
		levelCtx.beginPath();
		levelCtx.moveTo(tGenX,tGenY);
		tGenX += Math.floor(Math.random() * 70) + 30;
		tGenY = maxTopHeight + generator.getVal(tGenX);	
		levelCtx.lineTo(tGenX,tGenY);
		levelCtx.stroke();		
	}
	
	resetGeneration();
	
	levelCtx.transform(1,0,0,1,-1,0);
	levelCtx.clearRect(0, 0, levelCanvas.width, levelCanvas.height);	
	
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
		
	}*/
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

function isAir(tileid) {
	return tileArray[tileid].row == 4 && tileArray[tileid].column == 2 ? true : false;
}

function fillAir() {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		for(var j = 0; j < levelCanvas.height; j += 16) {
			createTile(i, j, 4, 2);
		}
	}
}

function fillRow(y, tilerow, tilecolumn) {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		createTile(i, y, tilerow, tilecolumn);
	}		
}

function resetGeneration() {
	bGenX = 0;
	bGenY = maxBottomHeight;

	tGenX = 0;
	tGenY = minTopHeight;
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

function createTile(x, y, row, column) {
	for(var i = 0; i < tileArray.length; i++) {
		if(x == tileArray[i].x && y == tileArray[i].y) {
			deleteTile(i);
		}
	}
	
	var tile = new Tile();
	tile.x = x;
	tile.y = y;
	tile.row = row;
	tile.column = column;
	
	tileArray.push(tile);
	
	return tile;
}

function deleteTile(tileid) {
	tileArray[tileid].x = -1;
	tileArray[tileid].y = -1;
	tileArray[tileid].row = -1;
	tileArray[tileid].column = -1;
	tileArray[tileid].id = -1;
	
	isUsedId[tileid] = false;
}