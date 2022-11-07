import Maze from "./maze.js";
import PathFind from "./pathfind.js";
import {coordinate} from "./pathfind.js"
import PriorityQueue from "./priorityqueue.js";

const canvas = document.querySelector('#canvas1');
canvas.width = 1000;
canvas.height = 600;
const ctx = canvas.getContext('2d');

const canvasPosition = canvas.getBoundingClientRect();
let canvasDisabled = false;
let obstacleDrawingDisabled = false;
const algorithmDropdown = document.querySelector('#algorithm-dropdown');
const comment = document.querySelector('#comment');
let algorithmSelected = algorithmDropdown.value;
// setComment(algorithmSelected);
algorithmDropdown.oninput = () => {
    algorithmSelected = algorithmDropdown.value;
    setComment(algorithmSelected);
}

function setComment(algorithm){
    let commentText = "";
    switch(algorithm){
        
        case 'dfs':
            commentText = "Depth First Search does NOT find shortest path in a non-tree structure. It will find a path, but the path found may or may not be the shortest path.";
            break;
        case 'bfs':
            commentText = "Breadth First Search will find a shortest path unlike Depth First Search. It will be slower than Dijkstra's algorithm or A* because it does not have any prioritization of the search.";
            break;
        case 'dijkstra':
            commentText = "Dijkstra's Algorithm will find a shortest path. It uses a priority queue that prioritize paths with shorter length during search. It may seem similar to BFS in unweighted graph or weighted graph where neighboring cells have weight 1 and neighbors of neighboring cells have weight 2 and so forth."
            break;
        case 'aStar':
            commentText = "It is essentially Dijkstra's Algorithm with prioriryt queue that prioritize paths that are of shorter length and that has last node that is closer to the destination. In other words, it prioritizes paths that are heading roughly in the right direction."
            break;
    }
    comment.innerHTML = commentText;
}


const animationSpeedSlider = document.querySelector('#animation-speed-slider');
let animationSpeed = animationSpeedSlider.value;

const animationSpeedSliderOuput = document.querySelector('#animation-speed-slider-output');
animationSpeedSliderOuput.innerHTML = animationSpeed + " ms";
animationSpeedSlider.oninput = ()=>{
    animationSpeed = animationSpeedSlider.value;
    animationSpeedSliderOuput.innerHTML = animationSpeed + " ms";
    pathfind.setDelay(animationSpeed);
};

const clickModeBtns = document.querySelector('.click-mode-btns');


const findPathBtn = document.querySelector('#start-btn')
findPathBtn.addEventListener('click', async (e)=>{
    disableControls(true);
    console.log('pathfind starting: '+ algorithmSelected);
    await pathfind.findPath(algorithmSelected);
    disableControls(false);
    obstacleDrawingDisabled = true;
});

const resetBtn = document.querySelector('#reset-btn');
resetBtn.addEventListener('click', async (e) => {
    console.log('pathfind reset');
    pathfind.animation=false;
    await new Promise(resolve=>setTimeout(resolve,200)).then();
    pathfind.reset();
    disableControls(false);
});

function disableControls(boolean=true){
    algorithmDropdown.disabled = boolean;
    animationSpeedSlider.disabled = boolean;
    findPathBtn.disabled = boolean;
    canvasDisabled = boolean;
    obstacleDrawingDisabled = boolean;
}

const helpBtn = document.querySelector('#help-btn');
helpBtn.addEventListener('click', (e) => {
    comment.innerHTML = 'Click and Drag on white tiles to draw Obstacles, represented by black tiles. <br />You can also move <span style="color: red">start point</span> and <span style="color: rgb(0, 175, 0)">end point</span> by click and dragging.';
});

export function drawGrid(context, numOfRows, numOfCols){
    const cellWidth = canvas.width/numOfCols;
    const cellHeight = canvas.height/numOfRows;
    
    for (let j=0; j<=numOfCols; j++){
        context.lineWidth=1;
        context.strokeStyle = 'black';
        context.beginPath();
        context.moveTo(j*cellWidth, 0);
        context.lineTo(j*cellWidth,canvas.height);
        context.stroke();
    }
    for (let i=0; i<numOfRows+1; i++){
        context.lineWidth=1;
        context.strokeStyle = 'black';
        context.beginPath();
        context.moveTo(0, i*cellHeight);
        context.lineTo(canvas.width, i*cellHeight);
        context.stroke();
    }
}
let numberOfRows = 30;
let numberOfColumns = 50;

let cellWidth = canvas.width/numberOfColumns;
let cellHeight = canvas.height/numberOfRows;

// canvas1.addEventListener('click', (e)=>{
//     let rect = getRectFromEvent(e, numberOfRows, numberOfColumns);
//     console.log(rect);
//     ctx1.fillStyle = 'red';
//     ctx1.fillRect(rect.x, rect.y,  rect.width, rect.height);
// });

function getRectFromEvent(event, numOfRows, numOfCols){
    let cellWidth = event.target.offsetWidth/numOfCols;
    let cellHeight = event.target.offsetHeight/numOfRows;

    let x = Math.floor(event.offsetX/cellWidth) * cellWidth;
    let y = Math.floor(event.offsetY/cellHeight) * cellHeight;
    return {x: x, y: y, width: cellWidth, height: cellHeight};
}

export function drawRect(context, x, y, color='lightgreen', opacity = 1) {
    // ctx1.clearRect(0, 0, canvas1.width, canvas1.height);
    context.save();
    context.globalAlpha = opacity;
    context.fillStyle = color;
    context.fillRect(x * cellWidth, y * cellHeight, cellWidth, cellHeight);
    context.restore();
}

export function drawPath(context, path, refresh=false){
    if (refresh) context.clearRect(0, 0, canvas.width, canvas.height);
    // for (const rect of path){
    //     drawRect(context, rect.x, rect.y, 'pink');
    // }
    for (let i=0; i<path.length-1; i++){
        context.beginPath();
        context.strokeStyle = 'red';
        context.moveTo(path[i].x * cellWidth + cellWidth/2, path[i].y * cellHeight + cellHeight/2);
        context.lineTo(path[i+1].x *cellWidth + cellWidth/2, path[i+1].y * cellHeight+ cellHeight/2);
        context.stroke();
    }
}

class InputHandler { 
    constructor(canvas, pathfind){
        this.dragObj = [];
        this.dragging = false;
        this.canvas = canvas;
        this.pathfind = pathfind;
        this.rows = pathfind.rows;
        this.cols = pathfind.cols;
        this.start= pathfind.start;
        this.destination = pathfind.destination;
        this.canvasPosition = canvas.getBoundingClientRect();
        this.cellWidth = this.canvasPosition.width / this.cols;
        this.cellHeight = this.canvasPosition.height/ this.rows;
        this.previous = coordinate(0,0);

        canvas.addEventListener('mousedown', (e)=>{
            // have to refresh this.canvasPosition in case canvas changes its position because of change in the comment div size 
            this.canvasPosition = this.canvas.getBoundingClientRect();
            if (e.x > this.canvasPosition.left && 
                e.x < this.canvasPosition.right &&
                e.y > this.canvasPosition.top &&
                e.y < this.canvasPosition.bottom &&
                !canvasDisabled){
                    
                    if (this.isClicked(e, this.start) && !this.dragObj.includes(this.start)){
                        // start is clicked 
                        this.dragObj.push(this.start);
                    }
                    else if (this.isClicked(e, this.destination) && !this.dragObj.includes(this.destination)){
                        // destination is clicked
                        this.dragObj.push(this.destination);
                    }
                    else if (!obstacleDrawingDisabled){
                        // clicked anywhere in canvas excluding start and destination
                        let coordinateInMaze = this.getRowColInMaze(e);
                        this.pathfind.maze.toggleObstacle(coordinateInMaze.x, coordinateInMaze.y);
                    }
                }
            // this.previous is used to check if mouse moved to different cell
            // to prevent toggleObstacle from being called soooo many times whenever mouse twitches.
            this.previous = this.getRowColInMaze(e);
            
        });

        canvas.addEventListener('mousemove',(e)=>{
            // have to refresh this.canvasPosition in case canvas changes its position because of change in the comment div size 
            this.canvasPosition = this.canvas.getBoundingClientRect();

            let rowColInMaze = this.getRowColInMaze(e);
            if (e.buttons == 1) this.dragging = true;
            if (e.x > this.canvasPosition.left && 
                e.x < this.canvasPosition.right &&
                e.y > this.canvasPosition.top &&
                e.y < this.canvasPosition.bottom &&
                this.dragging &&
                !canvasDisabled) {
                
                // xInCanvas is x and y in context of left upper corner of canvas being (0, 0)
                let xInCanvas = e.x - this.canvasPosition.left;
                let yInCanvas = e.y - this.canvasPosition.top;
                
                if (this.dragObj.length > 0) {
                    let row = Math.floor(xInCanvas/this.cellWidth);
                    let col = Math.floor(yInCanvas/this.cellHeight);
                    if (this.pathfind.maze.getValue(row, col) == 0) {
                        this.dragObj[0].x = row;
                        this.dragObj[0].y = col;
                        if (this.pathfind.isPathFound() && !this.previous.equals(rowColInMaze) ) {
                            this.pathfind.resetPathFound();
                            this.pathfind.findPath(algorithmSelected, false);
                        }
                    }
                } 
                else if(this.dragObj.length == 0 && !this.previous.equals(rowColInMaze) && !obstacleDrawingDisabled){
                    this.pathfind.maze.toggleObstacle(rowColInMaze.x, rowColInMaze.y);
                    
                }
                this.previous = rowColInMaze;
            } else {
                // this is incase mouse cursor leaves canvas while dragging.
                this.dragObj = [];
                this.dragging = false;
            }
        });

        canvas.addEventListener('mouseup', (e)=>{
            //reset 
            this.dragObj = [];
            this.dragging = false;
        });
    }

    isClicked(event, target){
        let xInCanvas = event.x - this.canvasPosition.left;
        let yInCanvas = event.y - this.canvasPosition.top;
        return ((xInCanvas > target.x  * this.cellWidth && xInCanvas < (target.x + 1) * this.cellWidth) &&
                (yInCanvas > target.y * this.cellHeight && yInCanvas < (target.y + 1) * this.cellHeight))
    }

    getRowColInMaze(event){
        let xInCanvas = event.x - this.canvasPosition.left;
        let yInCanvas = event.y - this.canvasPosition.top;
        let xInMaze = Math.floor(xInCanvas/this.cellWidth);
        let yInMaze = Math.floor(yInCanvas/this.cellHeight);
        return coordinate(xInMaze, yInMaze);
    }

}



let pathfind = new PathFind(numberOfRows, numberOfColumns, canvas.width, canvas.height);

let input = new InputHandler(canvas, pathfind);
let lastTime = 1;
function animate(timeStamp){
    const deltaTime = timeStamp - lastTime;
    lastTime = timeStamp;

    ctx.clearRect(0, 0, canvas.width, canvas.height);

    pathfind.updateParticles(deltaTime);
    pathfind.draw(ctx, canvas.width, canvas.height);
        
    requestAnimationFrame(animate);
}

animate(0);