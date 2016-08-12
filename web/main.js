//resolution stuff
var cWidth = window.innerWidth || document.documentElement.clientWidth || document.body.clientWidth;

var cHeight = window.innerHeight || document.documentElement.clientHeight || document.body.clientHeight;	

var MAX_SHIPS = 10;
var gameSpeed = 45;
var gameIntervalId;
var debugLog = false;
var gameSteps = 4;

var expImg = new Image();
expImg.src = "explosion.png";

var playerShip;

var tileset = new Image();
tileset.src = 'tileset.png';
var tileSize = 16;

var tileArray = new Array(Math.floor(cWidth/16)*Math.floor(cHeight/16));
var shipArray = new Array(MAX_SHIPS);

//canvas properties
var canvas = document.createElement('canvas');
var enemyCanvas = document.createElement('canvas');
var levelCanvas = document.createElement('canvas');
var bgCanvas = document.createElement('canvas');
var fxCanvas = document.createElement('canvas');
var fireCanvas = document.createElement('canvas');
var lightCanvas = document.createElement('canvas');

var screenCanvas = document.getElementById("onScreen");
var screenCtx = screenCanvas.getContext("2d");

var minBottomHeight = cHeight-16;
var maxBottomHeight = cHeight-16*12;

var minTopHeight = 0;
var maxTopHeight = Math.floor(cHeight/16) * 4;

canvas.width = cWidth;
canvas.height = cHeight;
var ctx = canvas.getContext("2d");
ctx.fillStyle = "#000000";

enemyCanvas.width = cWidth;
enemyCanvas.height = cHeight;
var enemyCtx = enemyCanvas.getContext("2d");
enemyCtx.fillStyle = "#000000";

levelCanvas.width = cWidth+16;
levelCanvas.height = cHeight;
var levelCtx = levelCanvas.getContext("2d");
levelCtx.fillStyle = "#000000";

bgCanvas.width = cWidth;
bgCanvas.height = cHeight;
var bgCtx = bgCanvas.getContext("2d");
bgCtx.fillStyle = "#111111";

fxCanvas.width = cWidth;
fxCanvas.height = cHeight;
var fxCtx = fxCanvas.getContext("2d");
fxCtx.fillStyle = "#000000";

fireCanvas.width = cWidth;
fireCanvas.height = cHeight;
var fireCtx = fireCanvas.getContext("2d");
fireCtx.fillStyle = "#000000";

lightCanvas.width = cWidth;
lightCanvas.height = cHeight;
var lightCtx = lightCanvas.getContext("2d");
lightCtx.fillStyle = "#000000";

screenCanvas.width = cWidth;
screenCanvas.height = cHeight;
screenCtx.fillStyle = "#000000";

var bGenX = 0;
var bGenY = minBottomHeight-16;

var tGenY = minTopHeight+16;

var SHIP_TYPE_PLAYER = 0;
var SHIP_TYPE_ENEMY = 1;

var gl;

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
	
	initializeGL();
	
	playerShip = new Ship(15, cHeight/2, 67, 50, 0, 0, SHIP_TYPE_PLAYER);
	generateFirst();
	setTimeout(generateEnemy, 2000);
	
	bgCtx.fillRect(0, 0, bgCanvas.width, bgCanvas.height);
	
	lightCtx.globalCompositeOperation = "lighter";
	var gradient = lightCtx.createLinearGradient(0, 0, 0, lightCanvas.height);
	gradient.addColorStop(0, "rgba(0, 0, 0, 0.5)");
	gradient.addColorStop(0.5, "rgba(0, 0, 0, 0)");
	gradient.addColorStop(1, "rgba(0, 0, 0, 0.5)");
	lightCtx.fillStyle = gradient;
	lightCtx.fillRect(0, 0, lightCanvas.width, lightCanvas.height);
	
	window.requestAnimationFrame(renderOnScreen);
	
	gameIntervalId = setInterval(update, 1000/gameSpeed);
};

function initializeGL() {
	gl = initWebGL(screenCanvas);
	  
	if (!gl) {
		return;
	}

	gl.clearColor(0.0, 0.0, 0.0, 1.0);
	gl.enable(gl.DEPTH_TEST);
	gl.depthFunc(gl.LEQUAL);
	gl.clear(gl.COLOR_BUFFER_BIT | gl.DEPTH_BUFFER_BIT);
}

$(document).keydown(function(e) {
	map[e.keyCode] = true;
    switch (e.keyCode) {
        case 37:
            playerShip.speedX = -gameSteps;
            break;
        case 39:
            playerShip.speedX = gameSteps;
            break;
        case 38:
            playerShip.speedY = -gameSteps;
            break;
        case 40:
            playerShip.speedY = gameSteps;
            break;
        case 83:
            // press S to slow game down
            gameSpeed = (gameSpeed === 1 ? 45 : 1);
            clearInterval(gameIntervalId);
            gameIntervalId = setInterval(update, 1000/gameSpeed);
            debugLog = !debugLog;
            break;
        case 80:
            // press P for pause
            if (gameIntervalId) {
                clearInterval(gameIntervalId);
                gameIntervalId = null;
            } else {
                gameIntervalId = setInterval(update, 1000/gameSpeed);
            }
            break;
        default:
            console.log("No key handler for " + e.keyCode);
    }
});

$(document).keyup(function(e) {
	map[e.keyCode] = false;
	if(!map[37] && !map[39]) playerShip.speedX = 0;
	if(!map[38] && !map[40]) playerShip.speedY = 0;
});

function update() {	
	generateLevel();
	renderTiles();
	renderShips();
}

function renderOnScreen() {
	
	if(!gl) {
		screenCtx.clearRect(0, 0, screenCanvas.width, screenCanvas.height);
		
		screenCtx.drawImage(bgCanvas, 0, 0);
		screenCtx.drawImage(fireCanvas, 0, 0);
		screenCtx.drawImage(canvas, 0, 0);
		screenCtx.drawImage(enemyCanvas, 0, 0);
		screenCtx.drawImage(levelCanvas, 0, 0);
		screenCtx.drawImage(fxCanvas, 0, 0);
		screenCtx.drawImage(lightCanvas, 0, 0);		
	}
	else {
		gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, gl.RGBA, gl.UNSIGNED_BYTE, gl.screenCanvas);	
	}
	
	window.requestAnimationFrame(renderOnScreen);
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
	fireCtx.clearRect(0, 0, fireCanvas.width, fireCanvas.height);
	playerShip.render();
    enemyCtx.clearRect(0, 0, enemyCanvas.width, enemyCanvas.height);    // you cleared enemyCtx before checking for enemies
	
	for(var i = 0; i < shipArray.length; i++) {
		if(shipArray[i]) {
			if(shipArray[i].isDead || shipArray[i].x < 0) {
				deleteEnemy(i);
			}
			else {
				shipArray[i].render();
			}
		}
	}
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
		if(!shipArray[i]) {
			shipArray[i] = new Ship(x, y, 67, 50, 0, 0, SHIP_TYPE_ENEMY);
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

function initWebGL(canvas) {
  gl = null;
 
  gl = canvas.getContext("webgl") || canvas.getContext("experimental-webgl");
  
  if (!gl) {
    alert("Unable to initialize WebGL. Your browser may not support it.");
  }
  
  return gl;
}