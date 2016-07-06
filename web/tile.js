function Tile(x, y, row, column) {
	this.x = x;
	this.y = y;
	this.row = row;
	this.column = column;
}

Tile.prototype.render = function () {
	if(this.x >= 0 && this.x <= levelCanvas.width) {
		levelCtx.drawImage(tileset, Math.floor(this.column * tileSize) + this.column, Math.floor(this.row * tileSize) + this.row, tileSize, tileSize, this.x, this.y, tileSize, tileSize);
	}
}