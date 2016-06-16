var isUsedId = [];

function Tile(x, y, row, column) {
	this.x = x;
	this.y = y;
	this.row = row;
	this.column = column;
	
	tileArray.push(this);
}