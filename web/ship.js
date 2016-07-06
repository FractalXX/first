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
	
	requestAnimationFrame(this.render.bind(this));
	drawFire(this, 0, 0);
	
	if(this.type == 0) this.gfx = playerRocket;
	if(this.type == 1) {
		this.gfx = enemyRocket;
		this.speedX = -16;
		setInterval(AI, 1000/15, this);
	}
}

Ship.prototype.render = function () {	
	ctx.clearRect(this.oldimgX, this.oldimgY, this.gfx.width*scaleFactor, this.gfx.height*scaleFactor);
	ctx.clearRect(this.x, this.y, this.gfx.width*scaleFactor, this.gfx.height*scaleFactor);
	
	if(this.isDead) {
		return;
	} 
	
	if(this.tileCollision(this.x, this.y)) {
		this.kill();
	}	
	
	if(!this.checkBorders() && !this.tileCollision(this.x, this.y)) {
		this.oldimgX = this.x;
		this.oldimgY = this.y;
	
		this.x += this.speedX;
		this.y += this.speedY;
	}
	
	ctx.drawImage(this.gfx, this.x, this.y, this.sizeX, this.sizeY);	
	
	this.fireColumn += 1;
	
	if(this.fireColumn == 4) {
		this.fireColumn = 0;
		this.fireRow += 1;
	}	
	
	if(this.fireRow == 4) {
		this.fireRow = 0;
	}
	
	drawFire(this);
	
	window.requestAnimationFrame(this.render.bind(this));
};

Ship.prototype.kill = function() {
	createExplosion(this.x, this.y);
	
	if(this.type == 0) fireCtx.clearRect(this.x-48, this.y+10, 160, 64);
	if(this.type == 1) fireCtx.clearRect(this.x+42, this.y+10, 160, 64);
		
	this.x = levelCanvas.width;
	this.y = levelCanvas.height;
	
	if(this.type == 1) this.isDead = true;
		
	if(this.type == 0) setTimeout(resetShip, 2000, this);	
}

Ship.prototype.tileCollision = function(checkX, checkY) {
	whatColor = levelCtx.getImageData(checkX, checkY, this.gfx.width, this.gfx.height);
	
	for(var index = 0; index < 4; index++) {
		var x = checkX + collisionOffsets[index][0];
		var y = checkY + collisionOffsets[index][1];
		if(whatColor.data[(x+y)*4+3] !== 0) {
			return true;
		}
	}
	
	/*for(var x = this.x; x < this.x + this.gfx.width; x++) {
		if(x === this.x || x === this.x + this.gfx.width - 1) {
			for(var y = this.y; y < this.y + this.gfx.height; y++) {
				if(whatColor.data[(x+y)*4+3] !== 0) {
					return true;
				}	
			}
		}
		else {
			if(whatColor.data[(x+this.y+this.gfx.height)*4+3] !== 0) {
				return true;
			}		
		}
	}*/
	return false;
}

Ship.prototype.checkBorders = function() {
	if(this.type == 1) return false;
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
}

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
}

function drawFire(which) {
	var x = which.x;
	var y = which.y;
	var img;	
	
	if(which.type == 0) {
		x -= 48;
		y += 10;
		
		img = rocketFire;
	}
	
	if(which.type == 1) {
		x += 42;
		y += 10;
		
		img = enemyFire;
	}
	
	fireCtx.clearRect(x, y, 160, 64);
	fireCtx.drawImage(img, 64*which.fireColumn, 64*which.fireRow, 64, 64, x, y, 80, 32);
}