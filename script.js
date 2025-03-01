// Global variables
let array = [];
let arrayBars = [];
let sortingInProgress = false;
let stopSorting = false;
let comparisons = 0;
let swaps = 0;
let startTime = 0;
let timerInterval = null;
let arrayAccesses = 0;
let efficiency = 'N/A';

// DOM elements
const arrayContainer = document.getElementById('array-container');
const generateBtn = document.getElementById('generate');
const sortBtn = document.getElementById('sort');
const stopBtn = document.getElementById('stop');
const sizeSlider = document.getElementById('size');
const speedSlider = document.getElementById('speed');
const algorithmSelect = document.getElementById('algorithm');
const statusElement = document.getElementById('status');
const comparisonsElement = document.getElementById('comparisons');
const swapsElement = document.getElementById('swaps');
const timeElement = document.getElementById('time');
const arrayAccessElement = document.getElementById('array-access');
const efficiencyElement = document.getElementById('efficiency');
const complexityElement = document.getElementById('complexity');
const algorithmDescriptionElement = document.getElementById('algorithm-description');
const colorThemeSelect = document.getElementById('color-theme');
const soundToggle = document.getElementById('sound-toggle');

// Initialize the application
document.addEventListener('DOMContentLoaded', () => {
    // Show loading animation
    const loadingOverlay = document.querySelector('.loading-overlay');
    
    // Initialize the application after loading
    setTimeout(() => {
        loadingOverlay.classList.add('hidden');
        
        // Initialize the app
        generateArray();
        setupEventListeners();
        setupGlitchEffects();
        
        // Reset and start the timer
        resetTimer();
        setInterval(updateTimer, 1000);
        
        // Add typewriter effect to terminal
        typewriterEffect();
        
        // Initialize algorithm info
        updateAlgorithmInfo();
    }, 3500); // Wait for loading animation to complete
});

// Set up event listeners
function setupEventListeners() {
    generateBtn.addEventListener('click', generateArray);
    sortBtn.addEventListener('click', startSorting);
    stopBtn.addEventListener('click', stopSortingProcess);
    sizeSlider.addEventListener('input', generateArray);
    
    // Add event listeners for new elements
    algorithmSelect.addEventListener('change', updateAlgorithmInfo);
    colorThemeSelect.addEventListener('change', changeColorTheme);
    soundToggle.addEventListener('change', toggleSoundEffects);
}

// Generate a new random array
function generateArray() {
    if (sortingInProgress) return;
    
    resetStats();
    const size = parseInt(sizeSlider.value);
    array = [];
    
    // Generate random values
    for (let i = 0; i < size; i++) {
        array.push(Math.floor(Math.random() * 100) + 1);
    }
    
    // Update the visualization
    updateArrayVisualization();
    statusElement.textContent = 'Ready';
}

// Update the array visualization
function updateArrayVisualization() {
    arrayContainer.innerHTML = '';
    arrayBars = [];
    
    const containerWidth = arrayContainer.clientWidth;
    const barWidth = Math.max(2, Math.floor(containerWidth / array.length) - 1);
    
    for (let i = 0; i < array.length; i++) {
        const bar = document.createElement('div');
        bar.className = 'array-bar';
        bar.style.height = `${array[i] * 3.5}px`;
        bar.style.width = `${barWidth}px`;
        arrayContainer.appendChild(bar);
        arrayBars.push(bar);
    }
}

// Start the sorting process
function startSorting() {
    if (sortingInProgress) return;
    
    sortingInProgress = true;
    stopSorting = false;
    resetStats();
    startTimer();
    
    statusElement.textContent = 'Sorting...';
    sortBtn.disabled = true;
    generateBtn.disabled = true;
    sizeSlider.disabled = true;
    
    const algorithm = algorithmSelect.value;
    
    switch (algorithm) {
        case 'bubble':
            bubbleSort();
            break;
        case 'selection':
            selectionSort();
            break;
        case 'insertion':
            insertionSort();
            break;
        case 'quick':
            quickSort();
            break;
        case 'merge':
            mergeSort();
            break;
    }
}

// Stop the sorting process
function stopSortingProcess() {
    stopSorting = true;
    sortingInProgress = false;
    sortBtn.disabled = false;
    generateBtn.disabled = false;
    sizeSlider.disabled = false;
    statusElement.textContent = 'Stopped';
    
    // Reset the array bars to remove any coloring
    arrayBars.forEach(bar => {
        bar.className = 'array-bar';
    });
    
    // Stop the timer
    stopTimer();
}

// Reset statistics
function resetStats() {
    comparisons = 0;
    swaps = 0;
    arrayAccesses = 0;
    efficiency = 'N/A';
    
    comparisonsElement.textContent = '0';
    swapsElement.textContent = '0';
    arrayAccessElement.textContent = '0';
    efficiencyElement.textContent = 'N/A';
    
    timeElement.textContent = '0.00s';
    clearInterval(timerInterval);
}

// Start the timer
function startTimer() {
    startTime = Date.now();
    timerInterval = setInterval(() => {
        const elapsedTime = (Date.now() - startTime) / 1000;
        timeElement.textContent = `${elapsedTime.toFixed(2)}s`;
    }, 10);
}

// Stop the timer
function stopTimer() {
    clearInterval(timerInterval);
}

// Finish sorting
function finishSorting() {
    sortingInProgress = false;
    stopTimer();
    sortBtn.disabled = false;
    generateBtn.disabled = false;
    sizeSlider.disabled = false;
    statusElement.textContent = 'Completed';
    
    // Calculate final efficiency
    updateEfficiency();
    
    // Mark all bars as sorted
    arrayBars.forEach(bar => {
        bar.className = 'array-bar sorted';
    });
}

// Helper function to update comparison count
function updateComparisons() {
    comparisons++;
    comparisonsElement.textContent = comparisons;
}

// Helper function to update swap count
function updateSwaps() {
    swaps++;
    swapsElement.textContent = swaps;
}

// Helper function for delay
function sleep(ms) {
    return new Promise(resolve => setTimeout(resolve, ms));
}

// Get delay based on speed slider
function getDelay() {
    return 101 - parseInt(speedSlider.value);
}

// Highlight bars being compared
async function highlightComparing(i, j) {
    if (i >= arrayBars.length || j >= arrayBars.length) return;
    
    arrayBars[i].classList.add('comparing');
    arrayBars[j].classList.add('comparing');
    
    updateComparisons();
    updateArrayAccess(); // Track array access
    
    await sleep(getDelay());
    
    arrayBars[i].classList.remove('comparing');
    arrayBars[j].classList.remove('comparing');
}

// Highlight bars being swapped
async function highlightSwapping(i, j) {
    arrayBars[i].classList.add('swapping');
    arrayBars[j].classList.add('swapping');
    updateSwaps();
    await sleep(getDelay());
    arrayBars[i].classList.remove('swapping');
    arrayBars[j].classList.remove('swapping');
}

// Update a single bar
function updateBar(index, value) {
    array[index] = value;
    arrayBars[index].style.height = `${value * 3}px`;
}

// Swap two elements in the array
async function swap(i, j) {
    await highlightSwapping(i, j);
    
    const temp = array[i];
    array[i] = array[j];
    array[j] = temp;
    
    arrayBars[i].style.height = `${array[i] * 3}px`;
    arrayBars[j].style.height = `${array[j] * 3}px`;
}

// Bubble Sort Algorithm
async function bubbleSort() {
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        for (let j = 0; j < n - i - 1; j++) {
            if (stopSorting) {
                finishSorting();
                return;
            }
            
            await highlightComparing(j, j + 1);
            
            if (array[j] > array[j + 1]) {
                await swap(j, j + 1);
            }
        }
        
        // Mark sorted element
        arrayBars[n - i - 1].className = 'array-bar sorted';
    }
    
    // Mark the first element as sorted
    arrayBars[0].className = 'array-bar sorted';
    
    finishSorting();
}

// Selection Sort Algorithm
async function selectionSort() {
    const n = array.length;
    
    for (let i = 0; i < n - 1; i++) {
        let minIndex = i;
        
        for (let j = i + 1; j < n; j++) {
            if (stopSorting) {
                finishSorting();
                return;
            }
            
            await highlightComparing(minIndex, j);
            
            if (array[j] < array[minIndex]) {
                minIndex = j;
            }
        }
        
        if (minIndex !== i) {
            await swap(i, minIndex);
        }
        
        // Mark sorted element
        arrayBars[i].className = 'array-bar sorted';
    }
    
    // Mark the last element as sorted
    arrayBars[n - 1].className = 'array-bar sorted';
    
    finishSorting();
}

// Insertion Sort Algorithm
async function insertionSort() {
    const n = array.length;
    
    for (let i = 1; i < n; i++) {
        let key = array[i];
        let j = i - 1;
        
        // Mark the current element being inserted
        arrayBars[i].classList.add('comparing');
        await sleep(getDelay());
        arrayBars[i].classList.remove('comparing');
        
        while (j >= 0 && array[j] > key) {
            if (stopSorting) {
                finishSorting();
                return;
            }
            
            await highlightComparing(j, j + 1);
            await highlightSwapping(j, j + 1);
            
            array[j + 1] = array[j];
            arrayBars[j + 1].style.height = `${array[j + 1] * 3}px`;
            
            j--;
        }
        
        array[j + 1] = key;
        arrayBars[j + 1].style.height = `${key * 3}px`;
    }
    
    // Mark all elements as sorted
    for (let i = 0; i < n; i++) {
        if (stopSorting) break;
        arrayBars[i].className = 'array-bar sorted';
        await sleep(10);
    }
    
    finishSorting();
}

// Quick Sort Algorithm
async function quickSort() {
    await quickSortHelper(0, array.length - 1);
    
    if (!stopSorting) {
        // Mark all elements as sorted if not stopped
        for (let i = 0; i < array.length; i++) {
            arrayBars[i].className = 'array-bar sorted';
            await sleep(10);
        }
    }
    
    finishSorting();
}

async function quickSortHelper(low, high) {
    if (low < high && !stopSorting) {
        const pivotIndex = await partition(low, high);
        
        // Mark pivot as temporarily sorted
        arrayBars[pivotIndex].className = 'array-bar sorted';
        
        await quickSortHelper(low, pivotIndex - 1);
        await quickSortHelper(pivotIndex + 1, high);
    }
}

async function partition(low, high) {
    const pivot = array[high];
    let i = low - 1;
    
    // Highlight pivot
    arrayBars[high].classList.add('comparing');
    
    for (let j = low; j < high; j++) {
        if (stopSorting) return i + 1;
        
        await highlightComparing(j, high);
        
        if (array[j] < pivot) {
            i++;
            await swap(i, j);
        }
    }
    
    await swap(i + 1, high);
    arrayBars[high].classList.remove('comparing');
    
    return i + 1;
}

// Merge Sort Algorithm
async function mergeSort() {
    await mergeSortHelper(0, array.length - 1);
    
    if (!stopSorting) {
        // Mark all elements as sorted if not stopped
        for (let i = 0; i < array.length; i++) {
            arrayBars[i].className = 'array-bar sorted';
            await sleep(10);
        }
    }
    
    finishSorting();
}

async function mergeSortHelper(left, right) {
    if (left < right && !stopSorting) {
        const mid = Math.floor((left + right) / 2);
        
        await mergeSortHelper(left, mid);
        await mergeSortHelper(mid + 1, right);
        
        await merge(left, mid, right);
    }
}

async function merge(left, mid, right) {
    const n1 = mid - left + 1;
    const n2 = right - mid;
    
    // Create temporary arrays
    const L = new Array(n1);
    const R = new Array(n2);
    
    // Copy data to temporary arrays
    for (let i = 0; i < n1; i++) {
        L[i] = array[left + i];
    }
    for (let j = 0; j < n2; j++) {
        R[j] = array[mid + 1 + j];
    }
    
    // Merge the temporary arrays back
    let i = 0, j = 0, k = left;
    
    while (i < n1 && j < n2 && !stopSorting) {
        // Compare elements from both subarrays
        await highlightComparing(left + i, mid + 1 + j);
        
        if (L[i] <= R[j]) {
            array[k] = L[i];
            arrayBars[k].style.height = `${L[i] * 3}px`;
            arrayBars[k].classList.add('swapping');
            await sleep(getDelay());
            arrayBars[k].classList.remove('swapping');
            i++;
        } else {
            array[k] = R[j];
            arrayBars[k].style.height = `${R[j] * 3}px`;
            arrayBars[k].classList.add('swapping');
            await sleep(getDelay());
            arrayBars[k].classList.remove('swapping');
            j++;
        }
        updateSwaps();
        k++;
    }
    
    // Copy remaining elements of L[]
    while (i < n1 && !stopSorting) {
        array[k] = L[i];
        arrayBars[k].style.height = `${L[i] * 3}px`;
        arrayBars[k].classList.add('swapping');
        await sleep(getDelay());
        arrayBars[k].classList.remove('swapping');
        updateSwaps();
        i++;
        k++;
    }
    
    // Copy remaining elements of R[]
    while (j < n2 && !stopSorting) {
        array[k] = R[j];
        arrayBars[k].style.height = `${R[j] * 3}px`;
        arrayBars[k].classList.add('swapping');
        await sleep(getDelay());
        arrayBars[k].classList.remove('swapping');
        updateSwaps();
        j++;
        k++;
    }
}

// Reset the timer to a random time between 20-30 hours
function resetTimer() {
    // Generate random hours (20-30), minutes (0-59), seconds (0-59)
    const hours = Math.floor(Math.random() * 10) + 20;
    const minutes = Math.floor(Math.random() * 60);
    const seconds = Math.floor(Math.random() * 60);
    
    // Store the target time as a future timestamp
    window.timerTarget = new Date();
    window.timerTarget.setHours(window.timerTarget.getHours() + hours);
    window.timerTarget.setMinutes(window.timerTarget.getMinutes() + minutes);
    window.timerTarget.setSeconds(window.timerTarget.getSeconds() + seconds);
    
    // Update the timer immediately
    updateTimer();
}

// Update the timer based on the difference between current time and target time
function updateTimer() {
    const now = new Date();
    const diff = Math.floor((window.timerTarget - now) / 1000);
    
    if (diff <= 0) {
        // Reset timer if it reaches zero
        resetTimer();
        return;
    }
    
    const hours = Math.floor(diff / 3600);
    const minutes = Math.floor((diff % 3600) / 60);
    const seconds = diff % 60;
    
    document.querySelector('.timer').textContent = `T-MINUS ${String(hours).padStart(2, '0')}:${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

// Add typewriter effect to the terminal command
function typewriterEffect() {
    const commandElement = document.querySelector('.command');
    const originalText = commandElement.textContent;
    commandElement.textContent = '';
    
    let i = 0;
    const typing = setInterval(() => {
        if (i < originalText.length) {
            commandElement.textContent += originalText.charAt(i);
            i++;
        } else {
            clearInterval(typing);
        }
    }, 50);
}

// Add occasional glitch effect to text elements
function setupGlitchEffects() {
    setInterval(() => {
        const glitchElements = document.querySelectorAll('.glitch-text');
        const randomElement = glitchElements[Math.floor(Math.random() * glitchElements.length)];
        
        randomElement.classList.add('active-glitch');
        setTimeout(() => {
            randomElement.classList.remove('active-glitch');
        }, 200);
    }, 3000);
}

// Update array access count
function updateArrayAccess() {
    arrayAccesses++;
    arrayAccessElement.textContent = arrayAccesses;
}

// Update efficiency calculation
function updateEfficiency() {
    const n = array.length;
    const theoreticalComparisons = getTheoreticalComparisons(algorithmSelect.value, n);
    
    if (theoreticalComparisons > 0) {
        const efficiencyRatio = (theoreticalComparisons / comparisons * 100).toFixed(1);
        efficiency = `${efficiencyRatio}%`;
        efficiencyElement.textContent = efficiency;
    }
}

// Get theoretical comparisons for different algorithms
function getTheoreticalComparisons(algorithm, n) {
    switch (algorithm) {
        case 'bubble':
            return (n * (n - 1)) / 2; // O(n²)
        case 'selection':
            return (n * (n - 1)) / 2; // O(n²)
        case 'insertion':
            return (n * (n - 1)) / 2; // O(n²)
        case 'quick':
            return n * Math.log2(n); // O(n log n)
        case 'merge':
            return n * Math.log2(n); // O(n log n)
        default:
            return 0;
    }
}

// Update algorithm complexity display
function updateAlgorithmInfo() {
    const algorithm = algorithmSelect.value;
    
    // Update complexity display
    switch (algorithm) {
        case 'bubble':
        case 'selection':
        case 'insertion':
            complexityElement.textContent = 'O(n²)';
            break;
        case 'quick':
        case 'merge':
            complexityElement.textContent = 'O(n log n)';
            break;
    }
    
    // Update algorithm description
    const descriptions = {
        bubble: 'Bubble Sort repeatedly steps through the list, compares adjacent elements and swaps them if they are in the wrong order. The pass through the list is repeated until the list is sorted.',
        selection: 'Selection Sort divides the input list into two parts: a sorted sublist and an unsorted sublist. It repeatedly selects the smallest element from the unsorted sublist and moves it to the end of the sorted sublist.',
        insertion: 'Insertion Sort builds the final sorted array one item at a time. It is efficient for small data sets and is often used as part of more sophisticated algorithms.',
        quick: 'Quick Sort selects a "pivot" element and partitions the array around the pivot. It is one of the fastest sorting algorithms and uses a divide-and-conquer strategy.',
        merge: 'Merge Sort divides the array into two halves, recursively sorts them, and then merges the sorted halves. It guarantees O(n log n) performance but requires additional space.'
    };
    
    algorithmDescriptionElement.textContent = descriptions[algorithm];
}

// Change color theme
function changeColorTheme() {
    const theme = colorThemeSelect.value;
    const root = document.documentElement;
    
    switch (theme) {
        case 'nerv':
            root.style.setProperty('--primary', '#ff4500');
            root.style.setProperty('--secondary', '#00ffff');
            break;
        case 'seele':
            root.style.setProperty('--primary', '#7b68ee');
            root.style.setProperty('--secondary', '#ffffff');
            break;
        case 'eva01':
            root.style.setProperty('--primary', '#9932cc');
            root.style.setProperty('--secondary', '#7cfc00');
            break;
        case 'eva02':
            root.style.setProperty('--primary', '#ff0000');
            root.style.setProperty('--secondary', '#ffa500');
            break;
    }
}

// Toggle sound effects
function toggleSoundEffects() {
    // Implementation for sound effects
    console.log('Sound effects:', soundToggle.checked ? 'ON' : 'OFF');
} 