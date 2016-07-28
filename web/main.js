//resolution stuff
var cWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

var cHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;	

var MAX_SHIPS = 10;

var expImg = new Image();
expImg.src = "explosion.png";

var playerShip;

var tileset = new Image();
tileset.src = 'tileset.png';
var tileSize = 16;

var tileArray = new Array(Math.floor(cWidth/16)*Math.floor(cHeight/16));
var shipArray = new Array(MAX_SHIPS);

//canvas properties
var canvas = document.getElementById("myCanvas");
var ctx = canvas.getContext("2d");

var enemyCanvas = document.getElementById("enemyCanvas");
var enemyCtx = enemyCanvas.getContext("2d");

var levelCanvas = document.getElementById("level");
var levelCtx = levelCanvas.getContext("2d");

var bgCanvas = document.getElementById("background");
var bgCtx = bgCanvas.getContext("2d");

var fxCanvas = document.getElementById("fx");
var fxCtx = fxCanvas.getContext("2d");

var fireCanvas = document.getElementById("fireCanvas");
var fireCtx = fireCanvas.getContext("2d");

var minBottomHeight = cHeight-16;
var maxBottomHeight = cHeight-16*12;

var minTopHeight = 0;
var maxTopHeight = Math.floor(cHeight/16) * 4;

canvas.width = cWidth;
canvas.height = cHeight;
ctx.fillStyle = "#000000";

enemyCanvas.width = cWidth;
enemyCanvas.height = cHeight;
enemyCtx.fillStyle = "#000000";

levelCanvas.width = cWidth+16;
levelCanvas.height = cHeight;
levelCtx.fillStyle = "#000000";

bgCanvas.width = cWidth;
bgCanvas.height = cHeight;
bgCtx.fillStyle = "#111111";

fxCanvas.width = cWidth;
fxCanvas.height = cHeight;
fxCtx.fillStyle = "#000000";

fireCanvas.width = cWidth;
fireCanvas.height = cHeight;
fireCtx.fillStyle = "#000000";

var colorLayer = levelCtx.createImageData(levelCanvas.width, levelCanvas.height);

var bGenX = 0;
var bGenY = minBottomHeight-16;

var tGenY = minTopHeight+16;

var SHIP_TYPE_PLAYER = 0;
var SHIP_TYPE_ENEMY = 1;

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
	
	playerShip = new Ship(0, cHeight/2, 67, 50, 0, 0, 0);
	generateFirst();
	setTimeout(generateEnemy, 2000);
	window.requestAnimationFrame(renderShips);
	
	bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
	
	setInterval(update, 1000/45);
};

$(document).keydown(function(e) {
	map[e.keyCode] = true;
	if(e.keyCode == 37) playerShip.speedX = -4;
	if(e.keyCode == 39) playerShip.speedX = 4;
	if(e.keyCode == 38) playerShip.speedY = -4;
	if(e.keyCode == 40) playerShip.speedY = 4;
});

$(document).keyup(function(e) {
	map[e.keyCode] = false;
	if(!map[37] && !map[39]) playerShip.speedX = 0;
	if(!map[38] && !map[40]) playerShip.speedY = 0;
});

function update() {	
	generateLevel();
	renderTiles();
}

function renderTiles() {
	levelCtx.clearRect(0, 0, levelCanvas.width, levelCanvas.height);	
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] === undefined) continue;
		tileArray[i].render();
	}
}

function renderShips() {
	ctx.clearRect(0, 0, canvas.width, canvas.height);
	enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);
	fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
	playerShip.render();
	
	for(var i = 0; i < shipArray.length; i++) {
		if(shipArray[i] !== undefined) {
			if(shipArray[i].isDead || shipArray[i].x < 0) {
				deleteEnemy(i);
			}
			else {
				shipArray[i].render();
			}
		}
	}
	
	window.requestAnimationFrame(renderShips);
}

function generateFirst() {
	for(x = 0; x < levelCanvas.width; x += 16) {
		var chance = Math.random();
		var i;
		
		if(chance <= 0.25 && bGenY < minBottomHeight-32) {
			bGenY += 16;
		}
		else if(chance <= 0.50 && bGenY > maxBottomHeight) {
			bGenY -= 16;
		}
		
		createTile(x, bGenY+16, 0, 1);
		createTile(x, bGenY+16, 1, 1);
		createTile(x, bGenY+32, 1, 3);
		createTile(x, bGenY+48, 1, 6);
		
		for(i = minBottomHeight; i > bGenY+48; i -= 16) {
			createTile(x, i, 3, 6);
		}	
		
		chance = Math.random();
			
		if(chance <= 0.25 && tGenY < maxTopHeight) {
			tGenY += 16;
		}
		else if(chance <= 0.50 && tGenY > minTopHeight+32) {
			tGenY -= 16;
		}		
		
		createTile(x, tGenY, 1, 4);
		createTile(x, tGenY-16, 1, 3);
		createTile(x, tGenY-32, 1, 1);
		createTile(x, tGenY-48, 1, 8);
		
		for(i = tGenY-64; i >= minTopHeight; i -= 16) {
			createTile(x, i, 3, 6);
		}		
	}
}

function generateLevel() {
	
	var chance = Math.random();
	var i;
	
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
	
	for(i = minBottomHeight; i > bGenY+48; i -= 16) {
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
	
	for(i = tGenY-64; i >= minTopHeight; i -= 16) {
		createTile(bGenX, i, 3, 6);
	}
	
	bGenX = levelCanvas.width-16;
	
	scrollLevel();
	
}

function generateEnemy() {
	createEnemy(canvas.width, playerShip.y);
	
	setTimeout(generateEnemy, Math.floor((Math.random() * 2000) + 100));
}

function scrollLevel() {
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] !== undefined) {
			tileArray[i].x -= 16;
			if(tileArray[i].x < 0) deleteTile(i);
		}	
	}
}

function fillRow(y, tilerow, tilecolumn) {
	for(var i = 0; i < levelCanvas.width; i += 16) {
		createTile(i, y, tilerow, tilecolumn);
	}		
}

function createTile(x, y, row, column) {
	for(var i = 0; i < tileArray.length; i++) {
		if(tileArray[i] !== undefined) {
			if(x == tileArray[i].x && y == tileArray[i].y) {
				tileArray[i] = new Tile(x, y, row, column);
				return tileArray[i];	
			}
		}
		if(tileArray[i] === undefined) {
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

function createEnemy(x, y) {
	for(var i = 0; i < shipArray.length; i++) {
		if(shipArray[i] === undefined) {
			shipArray[i] = new Ship(x, y, 67, 50, 0, 0, 1);
			return shipArray[i];
		}
	}
	return undefined;
}

function deleteEnemy(enemyid) {
	clearInterval(shipArray[enemyid].aiTimer);	
	shipArray[enemyid] = undefined;
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