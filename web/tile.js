var isUsedId = [];

function Tile(x, y, row, column) {
	this.x = x;
	this.y = y;
	this.row = row;
	this.column = column;
	this.id = -1;
	
	do {
		this.id += 1;
	} 
	while(isUsedId[this.id]);
	isUsedId[this.id] = true;	
}