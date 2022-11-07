

const canvas = document.getElementById('canvas1');
canvas.width = 1000;
canvas.height = 600;
const ctx = canvas.getContext('2d');
console.log(canvas.width, canvas.height);

const algorithmDropdown = document.querySelector('#algorithm-selection');
let algorithm = algorithmDropdown.value;
algorithmDropdown.oninput = () => algorithm = algorithmDropdown.value;

const startBtn = document.querySelector('#start-btn');
startBtn.addEventListener('click', async function(e){
    console.log(algorithm);
    disableControls(true);
    switch(algorithm){
        case 'insertion':
            dataSet = await insertionSort(ctx, dataSet, animationSpeed);
            break;
        case 'selection':
            dataSet = await selectionSort(ctx, dataSet, animationSpeed);
            break;
        case 'merge':
            dataSet = await mergeSort(ctx, dataSet, 0, dataSet.length-1, animationSpeed);
            break;
        case 'heap':
            dataSet = await heapSort(ctx, dataSet, animationSpeed);
            break;
        case 'quick':
            dataSet = await quickSort(ctx, dataSet, 0, dataSet.length-1, animationSpeed);
            break;
        case 'bubble':
            dataSet = await bubbleSort(ctx, dataSet, animationSpeed);
            break;
    }
    
    await sleep(animationSpeed);
    draw(ctx, dataSet);
    disableControls(false);
});

const shuffleBtn = document.querySelector('#shuffle-btn');
shuffleBtn.addEventListener('click', ()=>{
    initialize();
    disableControls(false);
});

const resetBtn = document.querySelector('#reset-btn');
resetBtn.addEventListener('click', () => window.location.reload());

const sampleSizeSlider = document.querySelector('#sample-size-slider');
const sampleSizeOutput = document.querySelector('#sample-size-output');
let sampleSize = sampleSizeSlider.value;
sampleSizeOutput.innerHTML = sampleSizeSlider.value;
sampleSizeSlider.oninput = () => {
    sampleSizeOutput.innerHTML = sampleSizeSlider.value;
    sampleSize = sampleSizeSlider.value;
    initialize();
};



const animationSpeedSlider = document.querySelector('#animation-speed-slider');
const animationSpeedOutput = document.querySelector('#animation-speed-output');
let animationSpeed = animationSpeedSlider.value;
animationSpeedOutput.innerHTML = animationSpeedSlider.value + " ms";
animationSpeedSlider.oninput = function(){
    animationSpeedOutput.innerHTML = animationSpeedSlider.value + " ms";
    animationSpeed = animationSpeedSlider.value;
}

function disableControls(disable){
    startBtn.disabled = disable;
    shuffleBtn.disabled = disable;
    sampleSizeSlider.disabled = disable;
    animationSpeedSlider.disabled = disable;
    algorithmDropdown.disabled = disable;
}

function range(min, max, step=1){
    let data = [];
    for (let i=min; i<=max; i+=step){
        data.push(i)
    }
    return data;
}

function sleep(ms) {
    return new Promise(resolve => {
        setTimeout(resolve, ms);
    });
}

function draw(context, dataSet, redIndices = [], greenIndices = [], blueIndices = []){
    const gap = (canvas.width-30) / dataSet.length;
    context.clearRect(0, 0, canvas.width, canvas.height);
    for (let i=0; i<dataSet.length; i++){
        if (blueIndices.includes(i)) context.fillStyle = 'rgb(168, 61, 255)';
        else if (greenIndices.includes(i)) context.fillStyle = 'rgb(103, 255, 103)';
        else if (redIndices.includes(i)) context.fillStyle = 'rgb(255, 99, 99)';
        else context.fillStyle = 'rgb(23, 238, 253)';
        let x = i * gap + (canvas.width / dataSet.length * 0.1);
        let rectWidth = canvas.width / dataSet.length * 0.8;
        let rectHeight = dataSet[i] * heightRatio;
        context.shadowColor = 'black';
        context.shadowBlur = 5;
        context.fillRect(x, 0, rectWidth, rectHeight);
    }
}

async function selectionSort(context, dataSet, delay){
    for (let i=0; i<dataSet.length; i++){
        let minValue = Math.min(...dataSet.slice(i));
        let minIndex = dataSet.indexOf(minValue);
        console.log(minIndex);
        draw(context, dataSet, [minIndex], [i]);
        await sleep(delay);
        dataSet[minIndex] = dataSet[i];
        dataSet[i] = minValue;
        draw(context, dataSet, [i], [minIndex]);
        await sleep(delay);
    }
    return dataSet;
}

async function insertionSort(context, dataSet, delay){ 
    for (let i=0; i<dataSet.length; i++){
        draw(context, dataSet, [i]);
        await sleep(delay);
        let j = i;
        while (j>0 && dataSet[j]<dataSet[j-1]) {
            draw(context, dataSet, [j], [j-1]);
            await sleep(delay);
            let temp = dataSet[j-1];
            dataSet[j-1] = dataSet[j];
            dataSet[j] = temp;
            draw(context, dataSet, [j-1], [j]);
            await sleep(delay);
            j--;
        }
    }
    return dataSet;
}

// function merge(arrayA, arrayB) {
//     let mergedArray = [];
//     while (arrayA.length && arrayB.length){
//         if (arrayA[0] >= arrayB[0]){
//             mergedArray.push(arrayB[0]);
//             arrayB.splice(0,1);
//         } else {
//             mergedArray.push(arrayA[0]);
//             arrayA.splice(0,1);
//         }
//     }
//     console.log(arrayA, arrayB);
//     if (!arrayA.length) mergedArray.push(...arrayB);
//     else if (!arrayB.length) mergedArray.push(...arrayA);
//     // if (!arrayA.length || !arrayB.length) mergedArray.push(...arrayA, ...arrayB);
//     return mergedArray;
// }

// async function mergeSort(context, dataSet, delay){
//     if (dataSet.length <=1) {
//         return dataSet;
//     }
//     let splitIndex = Math.floor(dataSet.length/2);
//     let array1 = await mergeSort(context, dataSet.slice(0,splitIndex), delay);
//     let array2 = await mergeSort(context, dataSet.slice(splitIndex), delay);
//     console.log('merge: ', array1, array2);
//     let mergedArray = await merge(array1, array2);
//     draw(context, mergedArray);
//     await sleep(1000);
    
//     return mergedArray;
// }

// Need to perform mergeSort within the existing dataSet in order to display the 
// data during the sorting process. If mergeSort is implemented in the traditional
// recursive manner, each stage of recursion only have subset of the dataSet. Then 
// we cannot use draw(..) to display the entire dataSet during the sorting process, 
// simply because we wouldn't have the entire dataSet to display at each step of the sort.


// Assume that startIndexA < startIndexB and that [startIndexA~endIndexA] is adjacent to [startIndexB~endIndexB]
async function merge(dataArray, context, startIndexA, endIndexA, startIndexB, endIndexB, delay){
    let redIndices = range(startIndexA, endIndexB);
    while (startIndexA <= endIndexA && startIndexB <= endIndexB) {
        if (dataArray[startIndexA] < dataArray[startIndexB]) {
            // console.log('A is smaller', dataArray, startIndexA, startIndexB);
            startIndexA++;
        } else {
            // console.log('B is smaller', dataArray, startIndexA, startIndexB);
            let previousValue = dataArray[startIndexA];
            dataArray[startIndexA] = dataArray[startIndexB];
            // shift everything starting startIndexA+1 till startIndexB
            for (let i=startIndexA+1; i<=startIndexB; i++){
                let temp = dataArray[i];
                dataArray[i] = previousValue;
                previousValue = temp;
            }
            startIndexA++;
            endIndexA++;
            startIndexB++;
        }
        draw(context, dataArray, redIndices, range(startIndexA,endIndexA), range(startIndexB, endIndexB));
        await sleep(delay);
    }
}

async function mergeSort(context, dataArray, startIndex, endIndex, delay){
    if (endIndex - startIndex === 0) return dataArray;
    let splitIndex = startIndex+Math.floor((endIndex - startIndex)/2);
    await mergeSort(context, dataArray, startIndex, splitIndex, delay);
    await mergeSort(context, dataArray, splitIndex+1, endIndex, delay);
    await merge(dataArray, context, startIndex, splitIndex, splitIndex+1, endIndex, delay);
    // draw(context, dataArray, range(startIndex, endIndex));
    return dataArray;
}

let dataSet, heightRatio;
let maxHeightRatio = 0.95;
function initialize(){
    dataSet = range(1,sampleSize);
    dataSet.sort(()=>Math.random()-0.5);
    heightRatio = canvas.height * maxHeightRatio / Math.max(...dataSet);
    draw(ctx, dataSet);
    startBtn.disabled = false;
    shuffleBtn.disabled = false;
}

initialize();

function buildMinHeap(unsortedArray){
    console.log(unsortedArray);
    console.log(unsortedArray.length);
    for (let i=Math.floor(unsortedArray.length/2); i>=0; i--){
        minHeapify(unsortedArray,i);
    }
}

function minHeapify(array, i, rootIndex=0){
    indexOfLeftChild = 2 * (i-rootIndex) + 1;
    indexOfRightChild = 2 * (i-rootIndex) + 2;
    if (indexOfLeftChild > array.length-1-rootIndex) return;
    else if (indexOfRightChild > array.length-1-rootIndex) {
        if (array[i] <= array[indexOfLeftChild]) return;
        // console.log('swapping', i, indexOfLeftChild);
        swap(array, i, indexOfLeftChild);
        minHeapify(array,indexOfLeftChild);
        
    } else {
        if (array[i] <= Math.min(array[indexOfLeftChild], array[indexOfRightChild])) return;
        if (array[indexOfLeftChild] > array[indexOfRightChild]) {
            // console.log('swapping', i, indexOfRightChild);
            swap(array, i, indexOfRightChild);
            minHeapify(array,indexOfRightChild);
        }
        else {
            // console.log('swapping', i, indexOfLeftChild);
            swap(array, i, indexOfLeftChild);
            minHeapify(array, indexOfLeftChild);
        }
        
    }
}

function buildMaxHeap(unsortedArray){
    for (let i=Math.floor(unsortedArray.length/2); i>=0; i--){
        maxHeapify(unsortedArray,i);
        console.log('maxheapified at stage ', i, unsortedArray);
    }
}

function maxHeapify(array, i, sortedIndex=array.length){
    indexOfLeftChild = 2 * i + 1;
    indexOfRightChild = 2 * i + 2;
    if (indexOfLeftChild >= sortedIndex) return;
    else if (indexOfRightChild >= sortedIndex) {
        if (array[i] >= array[indexOfLeftChild]) return;
        swap(array, i, indexOfLeftChild);
        maxHeapify(array,indexOfLeftChild, sortedIndex);
        
    } else {
        if (array[i] >= Math.max(array[indexOfLeftChild], array[indexOfRightChild])) return;
        if (array[indexOfLeftChild] > array[indexOfRightChild]) {
            swap(array, i, indexOfLeftChild);
            maxHeapify(array,indexOfLeftChild, sortedIndex);
        }
        else {
            swap(array, i, indexOfRightChild);
            maxHeapify(array, indexOfRightChild, sortedIndex);
        }
        
    }

}

function swap(array, i, j) {
    if (i<0 || j<0 || i>=array.length || j>=array.length) return;
    let temp = array[i];
    array[i] = array[j];
    array[j] = temp;
}

async function heapSort(context, dataArray, delay){
    // let originalArray = Array.of(...dataSet);
    buildMaxHeap(dataArray);
    draw(context, dataArray);
    await sleep(delay);
    for (let i=dataArray.length-1; i>=0; i--){
        draw(context, dataArray, [0], [i]);
        await sleep(delay);
        swap(dataArray, 0, i);
        draw(context, dataArray, [i], [0]);
        await sleep(delay);
        maxHeapify(dataArray, 0, i);
    }
    return dataArray;
}

async function quickSort(context, dataArray, startIndex, endIndex, delay){
    if (endIndex-startIndex == 0) return;
    let i = startIndex;
    let j = endIndex;
    // pick a pivot
    let pivot = Math.floor((endIndex-startIndex)/2 + startIndex);
    draw(context, dataArray, range(startIndex, endIndex), [pivot]);
    await sleep(delay);
    console.log(`pivot index ${pivot} with value ${dataArray[pivot]}`);
    console.log(`i: ${i}, j: ${j}`);
    swap(dataArray, pivot, i);
    pivot = i;
    i++;
    draw(context, dataArray, range(startIndex, endIndex), [pivot]);
    await sleep(delay);
    while (i <= endIndex && j > 0) {
        while (dataArray[i] < dataArray[pivot]) i++;
        while (dataArray[j] > dataArray[pivot]) j--;
        if (i > j) break;
        console.log(`swapping ${i} and ${j}: ` + dataArray);
        draw(context, dataArray, range(startIndex, endIndex), [i], [j]);
        await sleep(delay);
        swap(dataArray, i, j);
        draw(context, dataArray, range(startIndex, endIndex), [j], [i]);
        await sleep(delay);
        i++;
        j--;
    }
    draw(context, dataArray, range(startIndex, endIndex), [pivot], [j]);
    await sleep(delay);
    console.log(`placing pivot by swapping ${pivot} and ${j}: ` + dataArray);
    swap(dataArray, pivot, j);
    draw(context, dataArray, range(startIndex, endIndex), [j], [pivot]);
    await sleep(delay);
    console.log(`after 1 run, ` + dataArray);
    pivot = j;
    if (pivot <= endIndex && pivot > startIndex) await quickSort(context,dataArray, startIndex, pivot-1, delay);
    if (pivot >= startIndex && pivot < endIndex) await quickSort(context,dataArray, pivot+1, endIndex, delay);
    return dataArray;
}

async function bubbleSort(context, dataArray, delay){
    for (let i=0; i<dataArray.length; i++){
        for (let j=0; j<dataArray.length-1; j++){
            console.log(j + ' iteration');
            draw(context, dataArray, [j], [j+1]);
            await sleep(delay);
            if (dataArray[j] > dataArray[j+1]) {
                swap(dataArray, j, j+1);
                draw(context, dataArray, [j+1], [j]);
                await sleep(delay);
            }
        }
    }
    return dataArray;
}

// let array1 = range(1,1000);
// array1.sort(()=>Math.random()-0.5);
// console.log(array1);
// quickSort(ctx, array1, 0, array1.length-1, 1000);
// console.log(array1);
// let array2 = range(1,1000);
// console.log(array1.filter((value, index)=>{value ==array2[index]}));