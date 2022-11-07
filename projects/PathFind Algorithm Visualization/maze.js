export default class Maze {
    constructor(numOfRows, numOfCols){
        this.rows = numOfRows;
        this.cols = numOfCols;
        this.maze = [];
        this.initializeMaze();
    }

    initializeMaze(initialValue=0){
        this.maze = [];
        for (let i=0; i<this.cols; i++){
            let col = [];
            for (let j=0; j<this.rows; j++){
                col.push(initialValue);
            }
            this.maze.push(col);
        }
    }

    getNeighbors(current){
        let x = current.x;
        let y = current.y;
        let neighbors = [];
        
        // neighbor above
        if (y > 0) neighbors.push(coordinate(x, y-1));
        // neighbor below
        if (y < this.maze.rows - 1) neighbors.push(coordinate(x, y+1));
        // neighbor left
        if (x > 0) neighbors.push(coordinate(x-1, y));
        // neighbor right
        if (x < this.maze.cols - 1) neighbors.push(coordinate(x+1, y));
        return neighbors;
    }

    
    setObstacle(x, y){
        this.maze[x][y] = 1;
    }

    toggleObstacle(x, y){
        if (this.maze[x][y] == 0) this.maze[x][y] = 1;
        else this.maze[x][y] = 0;
    }

    getValue(x, y){
        return this.maze[x][y];
    }

    reset(){
        this.initializeMaze();
    }

    draw(context, canvasWidth, canvasHeight){
        const cellWidth = canvasWidth/this.cols;
        const cellHeight = canvasHeight/this.rows;
        
        for (let j=0; j<=this.cols; j++){
            context.lineWidth=1;
            context.strokeStyle = 'black';
            context.beginPath();
            context.moveTo(j * cellWidth, 0);
            context.lineTo(j * cellWidth, canvasHeight);
            context.stroke();
        }
        for (let i=0; i<this.rows+1; i++){
            context.lineWidth=1;
            context.strokeStyle = 'black';
            context.beginPath();
            context.moveTo(0, i * cellHeight);
            context.lineTo(canvasWidth, i * cellHeight);
            context.stroke();
        }
        for (let y=0; y<this.rows; y++){
            for( let x=0; x<this.cols; x++){
                if (this.maze[x][y] == 1) {
                    context.fillStyle = 'black';
                    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
                }
            }
        }
    }
}