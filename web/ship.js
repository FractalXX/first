//img properties
var playerRocket = new Image();
playerRocket.src = "player.png";

var enemyRocket = new Image();
enemyRocket.src = "enemy.png";

var rocketFire = new Image();
rocketFire.src = "fire.png";

var enemyFire = new Image();
enemyFire.src = "fire_enemy.png";

var collisionOffsets = [[35, 8],[35, 44],[67, 26],[0, 26]];

function Ship(x, y, sizeX, sizeY, speedX, speedY, type) {
	this.x = x;
	this.y = y;
	this.sizeX = sizeX;
	this.sizeY = sizeY;
	this.speedX = speedX;
	this.speedY = speedY;
	this.type = type;
	
	this.isDead = false;
	this.oldimgX = 0;
	this.oldimgY = 0;
	
	this.fireRow = 0;
	this.fireColumn = 0;
	
	drawFire(this, 0, 0);
	
	if(this.type === 0) this.gfx = playerRocket;
	if(this.type === 1) {
		this.gfx = enemyRocket;
		this.speedX = -16;
		this.aiTimer = setInterval(AI, 1000/15, this);
	}
}

Ship.prototype.render = function () {	
	//ctx.clearRect(this.oldimgX, this.oldimgY, this.gfx.width*scaleFactor, this.gfx.height*scaleFactor);
	//ctx.clearRect(this.x, this.y, this.gfx.width*scaleFactor, this.gfx.height*scaleFactor);
	
	if(this.isDead) {
		return;
	} 
	
	if(this.tileCollision(this.x, this.y) || (this.shipCollision() && this.type === 0)) {
		this.kill();
	}	
	
	//console.log(this.shipCollision.bind(this));
	
	if(!this.checkBorders() && !this.tileCollision(this.x, this.y)) {
		this.oldimgX = this.x;
		this.oldimgY = this.y;
	
		this.x += this.speedX;
		this.y += this.speedY;
	}
	
	if(this.type === 0) ctx.drawImage(this.gfx, this.x, this.y, this.sizeX, this.sizeY);	
	if(this.type === 1) enemyCtx.drawImage(this.gfx, this.x, this.y, this.sizeX, this.sizeY);	
	
	this.fireColumn += 1;
	
	if(this.fireColumn === 4) {
		this.fireColumn = 0;
		this.fireRow += 1;
	}	
	
	if(this.fireRow === 4) {
		this.fireRow = 0;
	}
	
	drawFire(this);
};

Ship.prototype.kill = function() {
	createExplosion(this.x, this.y);
	
	if(this.type === 0) fireCtx.clearRect(this.x-48, this.y+10, 160, 64);
	if(this.type === 1) fireCtx.clearRect(this.x+42, this.y+10, 160, 64);
		
	this.x = levelCanvas.width;
	this.y = levelCanvas.height;
	
	if(this.type === 1) {
		this.isDead = true;
		clearInterval(this.aiTimer);
	} 
	
	if(this.type === 1) enemyCtx.clearRect(this.x, this. y, this.gfx.width, this.gfx.height);
		
	if(this.type === 0) setTimeout(resetShip, 2000, this);	
};

Ship.prototype.tileCollision = function(checkX, checkY) {
	var whatColor = levelCtx.getImageData(checkX, checkY, this.gfx.width, this.gfx.height);
	
	for(var index = 0; index < 4; index++) {	
		var x = collisionOffsets[index][0];
		var y = collisionOffsets[index][1];
		if(whatColor.data[((this.gfx.width * y) + x) * 4 + 3] !== 0) {
			return true;
		}
	}
	
	return false;
};

Ship.prototype.shipCollision = function() {
	var whatColor = enemyCtx.getImageData(this.x, this.y, this.gfx.width, this.gfx.height);
	
	for(var index = 0; index < 4; index++) {
		var x = collisionOffsets[index][0];
		var y = collisionOffsets[index][1];
		if(whatColor.data[((this.gfx.width * y) + x) * 4 + 3] !== 0) {
			return true;
		}
	}
	
	return false;
};

Ship.prototype.checkBorders = function() {
	if(this.type === 1) return false;
	if(this.speedX > 0 && this.x + this.gfx.width >= canvas.width) {
		this.speedX = 0;
		return true;
	}
	if(this.speedX < 0 && this.x <= 0) {
		this.speedX = 0;
		return true;
	}
	if(this.speedY > 0 && this.y + this.gfx.height >= canvas.height) {
		this.speedY = 0;
		return true;
	}
	if(this.speedY < 0 && this.y <= 0) {
		this.speedY = 0;
		return true;
	}	
	return false;
};

function AI(which) {
	if(Math.random() <= 0.5) {
		which.speedX = -16;
		which.speedY = 0;
	}	
	
	if(which.tileCollision(which.x-32, which.y+32)) {
		which.speedX = 0;
		which.speedY = -4;
	}
	
	if(which.tileCollision(which.x-32, which.y-32)) {
		which.speedX = 0;
		which.speedY = 4;
	}
}

function resetShip(which) {
	which.x = 0;
	which.y = levelCanvas.height/2;
	
	ctx.clearRect(canvas.width, canvas.height, which.gfx.width, which.gfx.height);
}

function drawFire(which) {
	var x = which.x;
	var y = which.y;
	var img;	
	
	if(which.type === 0) {
		x -= 48;
		y += 10;
		
		img = rocketFire;
	}
	
	if(which.type === 1) {
		x += 42;
		y += 10;
		
		img = enemyFire;
	}
	
	fireCtx.drawImage(img, 64*which.fireColumn, 64*which.fireRow, 64, 64, x, y, 80, 32);
}