import Maze from "./maze.js";
import PriorityQueue from "./priorityqueue.js";
import { drawPath, drawGrid, drawRect } from "./script.js";

export default class PathFind {
    constructor(numOfRows, numOfCols, canvasWidth, canvasHeight){
        this.maze = new Maze(numOfRows, numOfCols);
        this.rows = numOfRows;
        this.cols = numOfCols;
        this.start= {x:0, y:0};
        this.destination = {x: numOfCols-1, y: numOfRows-1};
        this.diagonalTraversal = false;
        this.pathMap = new Map();
        this.delay = 5;
        this.pathFound = new Path();
        this.animation = true;
        this.particles = [];
        this.canvasWidth = canvasWidth;
        this.canvasHeight = canvasHeight; 
        this.cellWidth = canvasWidth/numOfCols;
        this.cellHeight = canvasHeight/numOfRows;
        this.pathSearching = new Path();
    }
    
    setStart(point){
        console.log(`set start at ${point.x}, ${point.y}`);
        this.start = point;
    }

    setDestination(point){
        this.destination = point;
    }

    setDelay(delay){
        this.delay = delay;
        
    }

    isPathFound(){
        return this.pathFound.length() > 0;
    }

    async findPath(algorithm, animation=true) {
        let path;
        switch(algorithm){
            case 'dijkstra':
                path = await this.dijkstra(animation);
                break;
            case 'aStar':
                path = await this.aStar(animation);
                break;
            case 'bfs':
                path = await this.bfs(animation);
                break;
            case 'dfs':
                path = await this.dfs(animation);
                break;
        }
        if (typeof path === 'undefined') console.log('path not found');
        else {
            console.log('path found');
        }
        return path;
    }

    async dijkstra(animation=true){
        this.animation = animation;
        let priorityQueue = new PriorityQueue((entry1, entry2)=>entry1.length()-entry2.length());
        priorityQueue.enqueue(new Path([this.start]));

        while (!priorityQueue.isEmpty()){
            let pathSelected = priorityQueue.dequeue();
            let lastNode = pathSelected.getLast();
            // check if pathSelected is the path to destination by checking if lastNode == this.destination
            if (lastNode.x == this.destination.x && lastNode.y == this.destination.y) {
                this.pathFound = pathSelected;
                return pathSelected.getPath();
            }
            let neighbors = this.findNeighbors(lastNode.x, lastNode.y);
            for (const neighbor of neighbors){
                if (this.maze.getValue(neighbor.x, neighbor.y) === 0 && !pathSelected.contains(neighbor)) {
                    let path = new Path(Array.of(...pathSelected.getPath(), neighbor));
                    if ((!this.pathMap.has(neighbor.key())) || (this.pathMap.get(neighbor.key()).length() > path.length())) {
                        this.pathMap.set(neighbor.key(), path);
                        if (this.animation) this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}));
                        else this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}, false));
                        if (this.animation) await this.sleep(this.delay);
                        priorityQueue.enqueue(path);
                    }
                }
            }
            
        }
        return;
    }

    async aStar(animation=true){
        this.animation = animation; // make this global so we can modify it during runtime
        let priorityQueue = new PriorityQueue((entry1, entry2) => (entry1.length() + this.findDist(entry1.getLast(), this.destination) * 2) - (entry2.length() + this.findDist(entry2.getLast(), this.destination) * 2));
        priorityQueue.enqueue(new Path([this.start]));

        while (!priorityQueue.isEmpty()){
            let pathSelected = priorityQueue.dequeue();
            let lastNode = pathSelected.getLast();
            // check if pathSelected is the path to destination by checking if lastNode == this.destination
            if (lastNode.x == this.destination.x && lastNode.y == this.destination.y) {
                this.pathFound = pathSelected;
                return pathSelected.getPath();
            }
            let neighbors = this.findNeighbors(lastNode.x, lastNode.y);
            for (const neighbor of neighbors){
                if (this.maze.getValue(neighbor.x, neighbor.y) === 0 && !pathSelected.contains(neighbor)) {
                    let path = new Path(Array.of(...pathSelected.getPath(), neighbor));
                    if ((!this.pathMap.has(neighbor.key())) || (this.pathMap.get(neighbor.key()).length() > path.length())) {
                        this.pathMap.set(neighbor.key(), path);
                        if (this.animation) this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}));
                        else this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}, false));
                        if (this.animation) await this.sleep(this.delay);
                        
                        priorityQueue.enqueue(path);
                    }
                }
            }
            
        }
        return;
    }

    async bfs(animation=true){
        this.animation = animation;
        let queue = [];
        let visited = new Set();
        queue.push(new Path([this.start]));
        visited.add(JSON.stringify(this.start));
        while (queue.length>0){
            let pathSelected = queue.shift();
            let lastNode = pathSelected.getLast();

            console.log(lastNode);
            if (lastNode.x===this.destination.x && lastNode.y===this.destination.y){
                this.pathFound = pathSelected;
                return pathSelected.getPath();
            }

            let neighbors = this.findNeighbors(lastNode.x, lastNode.y);
            for (const neighbor of neighbors){
                if (this.maze.getValue(neighbor.x, neighbor.y) === 0 && !pathSelected.contains(neighbor) && !visited.has(JSON.stringify(neighbor))){
                    let path = new Path(Array.of(...pathSelected.getPath(), neighbor));
                    queue.push(path);
                    visited.add(JSON.stringify(neighbor));
                    if (this.animation) this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}));
                    else this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}, false));
                    if (this.animation) await this.sleep(this.delay);
                }
            }
        }
        return;
    }

    async dfs(animation=true){
        this.animation = animation;
        let stack = [];
        let visited = new Set();
        let minLength = 10000;
        stack.push(new Path([this.start]));
        
        while (stack.length>0){
            let pathSelected = stack.pop();
            if (pathSelected.length() < minLength){
                let lastNode = pathSelected.getLast();
                visited.add(JSON.stringify(lastNode));
                console.log(lastNode);
                if (lastNode.x===this.destination.x && lastNode.y===this.destination.y){
                    if (pathSelected.length() < minLength) {
                        this.pathFound = pathSelected;
                        minLength = pathSelected.length();
                    }
                }

                let neighbors = this.findNeighbors(lastNode.x, lastNode.y);
                for (const neighbor of neighbors){
                    if (this.maze.getValue(neighbor.x, neighbor.y) === 0 && !pathSelected.contains(neighbor) && !visited.has(JSON.stringify(neighbor))){
                        let path = new Path(Array.of(...pathSelected.getPath(), neighbor));
                        stack.push(path);
                        // visited.add(JSON.stringify(neighbor));
                        if (this.animation) this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}));
                        else this.particles.push(new Particle({x:neighbor.x*this.cellWidth, y:neighbor.y*this.cellHeight, width:this.cellWidth, height:this.cellHeight}, false));
                        if (this.animation) await this.sleep(this.delay);
                    }
                }
            }
        }
        return this.pathFound;
    }

    // utility method that calculates distance between two points using pythagorean theorem
    findDist(pointA, pointB){
        let deltaX = pointB.x - pointA.x;
        let deltaY = pointB.y - pointA.y;
        return Math.sqrt(deltaX*deltaX+deltaY*deltaY);
    }

    findNeighbors(x, y){
        let neighbors = [];
        
        // neighbor above
        if (y > 0) neighbors.push(coordinate(x, y-1));
       
        // neighbor left
        if (x > 0) neighbors.push(coordinate(x-1, y));
        // neighbor right
        if (x < this.maze.cols - 1) neighbors.push(coordinate(x+1, y));
        // neighbor below
        if (y < this.maze.rows - 1) neighbors.push(coordinate(x, y+1));

        // in case we want to enable diagonal traversal in the future.
        if (this.diagonalTraversal){
            // neighbor above right
            if (x < this.maze.cols - 1 && y > 0) neighbors.push(coordinate(x+1, y-1));
            // neighbor above left
            if (x > 0 && y > 0) neighbors.push(coordinate(x-1, y-1));
            // neighbor below right
            if (x < this.maze.cols - 1 && y < this.maze.rows - 1) neighbors.push(coordinate(x+1, y+1));
            // neighbor below left
            if (x > 0 && y < this.maze.rows - 1)neighbors.push(coordinate(x-1, y+1));
        }
        return neighbors;
    }

    sleep(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    reset(){
        this.maze.reset();
        this.resetPathFound();
    }

    resetPathFound(){
        this.particles = [];
        this.pathFound = new Path();
        this.pathMap.clear();
    }

    updateParticles(deltaTime){
        this.particles.forEach(particle=>particle.update(deltaTime));
    }
    // return array of points to be drawn on canvas as points searched and points being searched and so on.
    // these points are ierated in animation loop to be drawn.
    // keys of pathMap are all points that's been searched
    // neighbors are points being searched atm
    draw(context, canvasWidth, canvasHeight){
        context.save();
        this.maze.draw(context, canvasWidth, canvasHeight);
        // for (const key of this.pathMap.keys()){
        //     let point = this.pathMap.get(key).getLast();
        //     drawRect(context1, point.x, point.y, 'lightgreen', 0.5);
        // }
        this.particles.forEach(particle=>particle.draw(context));
        // console.log(this.particles);
        // for (const particle of this.particles){
        //     particle.draw(context1);
        // }
        
        if (this.pathFound.length() != 0) drawPath(context, this.pathFound.getPath(), false);
        if (this.pathSearching.length() != 0) drawPath(context, this.pathSearching.getPath(), false);
        context.beginPath();
        // context.globalAlpha = 0.8;
        context.arc(this.start.x * this.cellWidth + this.cellWidth/2, this.start.y * this.cellHeight + this.cellHeight/2, this.cellWidth/2, 0, 2 * Math.PI, false);
        context.fillStyle = 'rgb(255, 77, 77)';
        context.fill();
        context.beginPath();
        context.arc(this.destination.x * this.cellWidth + this.cellWidth/2, this.destination.y * this.cellHeight + this.cellHeight/2, this.cellWidth/2, 0, 2 * Math.PI, false);
        context.fillStyle = 'rgb(84, 250, 51)';
        context.fill();

        context.restore();
    }

}


class Path{
    constructor(path=[]){
        this.path = [...path];
    }

    length() {
        return this.path.length;
    }

    contains(point){
        for (const coordinate of this.path){
            if (coordinate.x === point.x && coordinate.y === point.y) return true;
        }
        return false;
    }

    replace(startIndex, endIndex, replacePath){
        this.path.splice(startIndex, endIndex+1, ...replacePath);
    }

    replacePath(replacement){
        let start = replacement.get(0);
        let end = replacement.get(replacement.length()-1);
        let startIndex = this.indexOf(start);
        let endIndex = this.indexOf(end);
        if (startIndex >= 0 && endIndex >= 0) this.replace(startIndex, endIndex, ...replacement.getPath());
    }
    indexOf(point){
        for (let i=0; i<this.path.length; i++){
            if (this.path[i].x == point.x && this.path[i].y == point.y) return i;
        }
        return -1;
    }
    
    get(i){
        return this.path[0];
    }

    getPath(){
        return this.path;
    }

    getLast(){
        return this.path[this.path.length-1];
    }
}


export function coordinate(x, y){
    return {
        x: x, 
        y: y, 
        key: () => `${x},${y}`,
        equals: (other) => x === other.x && y === other.y,
    };
}

class Particle{
    constructor(bounds, animation=true){
        this.bounds = bounds;
        this.x = bounds.x;
        this.y = bounds.y;
        this.width = bounds.width;
        this.height = bounds.height;
        this.frameTime = 50;
        this.frameTimer = 0;
        this.radius = 1;
        this.opacity = 1;
        if (!animation) {
            this.radius = this.width/2;
            this.opacity = 0.5;
        }
        
    }
    update(deltaTime){
        this.frameTimer += deltaTime;
        if (this.frameTimer > this.frameTime){
            this.frameTimer = 0;
            if (this.radius < this.width/2) this.radius += 0.4;
            if (this.opacity > 0.5) this.opacity -= 0.02;
        }

    }
    draw(context){
        context.save();
        context.fillStyle = `blue`;
        if (this.radius < this.width/2) {
            context.beginPath();
            context.globalAlpha = this.opacity;
            context.arc(this.x + this.width/2, this.y + this.height/2, this.radius, 0, 2 * Math.PI, false);
            context.fill();
        }
        else {
            context.globalAlpha = this.opacity;
            context.fillRect(this.x, this.y, this.width, this.height);
            
        }
        context.restore();
    }

}