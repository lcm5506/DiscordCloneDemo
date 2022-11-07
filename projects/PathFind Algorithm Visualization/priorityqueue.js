export default class PriorityQueue {

    constructor(comparator){
        this.queue = [];
        this.comparator = comparator;
    }

    enqueue(entry){
        this.queue.push(entry);
        this.queue.sort(this.comparator);
    }

    dequeue(){
        return this.queue.shift();
    }

    isEmpty(){
        return this.queue.length === 0;
    }

    size(){
        return this.queue.length;
    }

    peek(i){
        return this.queue[i];
    }

    setComparator(comparator){
        this.comparator = comparator;
    }

    getComparator(){
        return this.comparator;
    }
}