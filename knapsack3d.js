// Game constants and state
const GRID_WIDTH = 12;
const GRID_HEIGHT = 10;
const MAX_WEIGHT = 20;
let autoRotate = false;

// Grid system
let inventoryGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
let selectedItems = new Set();
let currentItems = [];
let draggedItem = null;
let isRotated = {};
let isMovingPlacedItem = false;
let originalPosition = null;


// All possible items in the game
const itemTypes = [
    // Small valuable items (1x1, 2x2)
    { name: "Ancient Coin", width: 1, height: 1, weight: 0.2, value: 500 },
    { name: "Magic Gem", width: 2, height: 2, weight: 0.3, value: 600 },
    { name: "Dragon Scale", width: 2, height: 2, weight: 0.4, value: 800 },
    { name: "Phoenix Feather", width: 2, height: 2, weight: 0.1, value: 900 },
    { name: "Unicorn Horn", width: 3, height: 2, weight: 0.3, value: 1000 },
    
    // Long items (1x4 to 1x8)
    { name: "Magic Staff", width: 1, height: 6, weight: 1.5, value: 2000 },
    { name: "Crystal Sword", width: 1, height: 5, weight: 2.0, value: 1800 },
    { name: "Ancient Spear", width: 1, height: 7, weight: 1.8, value: 1900 },
    { name: "Dragon Lance", width: 1, height: 8, weight: 2.5, value: 2500 },
    { name: "Royal Scepter", width: 1, height: 6, weight: 1.2, value: 2200 },
    
    // Wide items (4x1 to 8x1)
    { name: "Magic Scroll", width: 4, height: 1, weight: 0.5, value: 1200 },
    { name: "Shield", width: 5, height: 1, weight: 3.0, value: 1500 },
    { name: "Bow", width: 7, height: 1, weight: 1.0, value: 1600 },
    { name: "War Banner", width: 8, height: 1, weight: 1.5, value: 2000 },
    { name: "Dragon Wing", width: 6, height: 1, weight: 2.0, value: 2300 },
    
    // Medium square items (3x3, 4x4)
    { name: "Armor Piece", width: 4, height: 4, weight: 4.0, value: 2500 },
    { name: "Magic Mirror", width: 3, height: 3, weight: 2.0, value: 2200 },
    { name: "Treasure Chest", width: 4, height: 4, weight: 3.0, value: 3000 },
    { name: "Crystal Orb", width: 3, height: 3, weight: 1.5, value: 2800 },
    { name: "Rune Tablet", width: 4, height: 4, weight: 2.5, value: 2600 },
    
    // Large items (5x4, 4x5, 5x5)
    { name: "Golden Throne", width: 5, height: 4, weight: 8.0, value: 5000 },
    { name: "Crystal Table", width: 4, height: 5, weight: 6.0, value: 4000 },
    { name: "Magic Carpet", width: 5, height: 4, weight: 2.0, value: 3500 },
    { name: "Dragon Altar", width: 5, height: 5, weight: 7.0, value: 6000 },
    { name: "Portal Frame", width: 5, height: 5, weight: 5.0, value: 5500 },
    
    // Extra large items (6x5 to 8x6)
    { name: "War Machine", width: 6, height: 5, weight: 9.0, value: 7000 },
    { name: "Enchanted Gate", width: 5, height: 6, weight: 8.0, value: 6500 },
    { name: "Dragon Statue", width: 7, height: 5, weight: 9.5, value: 8000 },
    { name: "Ancient Obelisk", width: 5, height: 7, weight: 7.5, value: 7500 },
    { name: "Wizard Tower", width: 8, height: 6, weight: 8.5, value: 7800 }
];

function generateRandomItems() {
    console.log('Generating random items...');
    currentItems = [];
    for (let i = 0; i < 10; i++) {
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        currentItems.push({
            id: i + 1,
            ...randomItem,
            rotated: false
        });
    }
    console.log('Generated items:', currentItems);
}

function createGrid() {
    console.log('Creating grid...');
    const grid = document.getElementById('inventory-grid');
    grid.style.gridTemplateColumns = `repeat(${GRID_WIDTH}, 50px)`;
    grid.innerHTML = '';
    
    for (let y = 0; y < GRID_HEIGHT; y++) {
        for (let x = 0; x < GRID_WIDTH; x++) {
            const cell = document.createElement('div');
            cell.className = 'grid-cell';
            cell.dataset.x = x;
            cell.dataset.y = y;
            grid.appendChild(cell);
        }
    }
    console.log('Grid created with dimensions:', GRID_WIDTH, 'x', GRID_HEIGHT);
}

function canPlaceItem(item, startX, startY, rotated = false) {
    console.log('Checking if can place item:', item.name, 'at', startX, startY, 'rotated:', rotated);
    
    // Check if coordinates are negative
    if (startX < 0 || startY < 0) {
        console.log('Invalid position: negative coordinates');
        return false;
    }
    
    const width = rotated ? item.height : item.width;
    const height = rotated ? item.width : item.height;
    
    // Check if item fits within grid bounds
    if (startX + width > GRID_WIDTH || startY + height > GRID_HEIGHT) {
        console.log('Item out of bounds');
        return false;
    }
    
    // Check if all required cells are empty
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            if (inventoryGrid[y][x] !== null && inventoryGrid[y][x] !== item.id) {
                console.log('Cell occupied at', x, y);
                return false;
            }
        }
    }
    
    // Check weight limit
    const { currentWeight } = calculateTotals();
    if (!selectedItems.has(item.id) && currentWeight + item.weight > MAX_WEIGHT) {
        console.log('Weight limit exceeded');
        return false;
    }
    
    console.log('Can place item:', true);
    return true;
}

function calculateTotals() {
    let currentWeight = 0;
    let totalValue = 0;
    selectedItems.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        currentWeight += item.weight;
        totalValue += item.value;
    });
    return { currentWeight, totalValue };
}

function updateDisplay() {
    console.log('Updating display...');
    const availableItemsDiv = document.getElementById('available-items');
    const { currentWeight, totalValue } = calculateTotals();
    
    // Update available items with grid layout
    availableItemsDiv.innerHTML = currentItems
        .filter(item => !selectedItems.has(item.id))
        .map(item => {
            const width = isRotated[item.id] ? item.height : item.width;
            const height = isRotated[item.id] ? item.width : item.height;
            const GAP_SIZE = 2;
            const totalWidth = width * 50 + (width - 1) * GAP_SIZE;
            const totalHeight = height * 50 + (height - 1) * GAP_SIZE;
            
            return `
                <div class="available-item" 
                     draggable="false" 
                     id="available-${item.id}"
                     style="width: ${totalWidth}px; height: ${totalHeight}px;">
                    <div class="item-content">
                        <span>${item.name}</span>
                    </div>
                    <div class="item-tooltip">
                        <div class="tooltip-title">${item.name}</div>
                        <div class="tooltip-stats">
                            <span>Weight: ${item.weight}kg</span>
                            <span>Value: ${item.value}g</span>
                        </div>
                    </div>
                </div>
            `;
        }).join('');
    
    // Update status
    document.getElementById('weight-status').innerHTML = `Weight: ${currentWeight.toFixed(1)}/${MAX_WEIGHT}kg`;
    document.getElementById('value-status').innerHTML = `Value: ${totalValue}g`;
    
    // Reinitialize draggable items
    initializeDraggable();
    
    // Add double-click to rotate for available items
    document.querySelectorAll('.available-item').forEach(item => {
        item.addEventListener('dblclick', () => {
            const itemId = parseInt(item.id.split('-')[1]);
            console.log('Rotating item:', itemId);
            isRotated[itemId] = !isRotated[itemId];
            updateDisplay();
        });
    });
}

function restartGame() {
    console.log('Restarting game...');
    // Clear grid
    inventoryGrid = Array(GRID_HEIGHT).fill().map(() => Array(GRID_WIDTH).fill(null));
    selectedItems.clear();
    isRotated = {};
    
    // Clear visual grid
    const grid = document.getElementById('inventory-grid');
    while (grid.firstChild) {
        grid.removeChild(grid.firstChild);
    }
    
    // Regenerate
    generateRandomItems();
    createGrid();
    updateDisplay();
    
    // Reset auto-rotate
    autoRotate = false;
    const button = document.querySelector('.auto-rotate-button');
    if (button) {
        button.classList.remove('active');
    }
    console.log('Game restarted');
}

// Initialize draggable items using interact.js
function initializeDraggable() {
    console.log('Initializing draggable items...');
    interact('.available-item').draggable({
        inertia: false,
        autoScroll: true,
        listeners: {
            start(event) {
                console.log('Drag started');
                const target = event.target;
                target.classList.add('dragging');
                document.querySelector('.grid-container').classList.add('drag-active');
                
                // Store the dragged item
                const itemId = parseInt(target.id.split('-')[1]);
                draggedItem = currentItems.find(i => i.id === itemId);
                if (draggedItem) {
                    draggedItem.rotated = isRotated[itemId] || false;
                    isMovingPlacedItem = false;
                    originalPosition = null;

                    // Calculate dimensions
                    const width = draggedItem.rotated ? draggedItem.height : draggedItem.width;
                    const height = draggedItem.rotated ? draggedItem.width : draggedItem.height;
                    const GAP_SIZE = 2;
                    const totalWidth = width * 50 + (width - 1) * GAP_SIZE;
                    const totalHeight = height * 50 + (height - 1) * GAP_SIZE;

                    // Set click offset to center of item
                    draggedItem.clickOffsetX = totalWidth / 2;
                    draggedItem.clickOffsetY = totalHeight / 2;
                }
                console.log('Dragged item:', draggedItem);

                // Create a drag preview that matches the item's size
                const width = draggedItem.rotated ? draggedItem.height : draggedItem.width;
                const height = draggedItem.rotated ? draggedItem.width : draggedItem.height;
                target.style.width = `${width * 50 + (width - 1) * 2}px`;
                target.style.height = `${height * 50 + (height - 1) * 2}px`;
            },
            move(event) {
                const target = event.target;
                
                // Position the element directly at the mouse position, accounting for the initial click offset
                const x = event.clientX - draggedItem.clickOffsetX;
                const y = event.clientY - draggedItem.clickOffsetY;

                // Apply the transform directly based on page coordinates
                target.style.position = 'fixed';
                target.style.left = x + 'px';
                target.style.top = y + 'px';
                target.style.transform = 'none';

                // Update drop indicators
                if (draggedItem) {
                    const gridContainer = document.querySelector('.grid-container');
                    const gridRect = gridContainer.getBoundingClientRect();
                    
                    // Calculate grid cell position accounting for the click offset
                    const cellX = Math.floor((event.clientX - draggedItem.clickOffsetX - gridRect.left) / 50);
                    const cellY = Math.floor((event.clientY - draggedItem.clickOffsetY - gridRect.top) / 50);

                    // Clear previous indicators
                    document.querySelectorAll('.grid-cell').forEach(cell => {
                        cell.classList.remove('drop-active', 'drop-invalid');
                    });

                    if (draggedItem && canPlaceItem(draggedItem, cellX, cellY, draggedItem.rotated)) {
                        highlightDropZone(cellX, cellY, draggedItem, true);
                    } else {
                        highlightDropZone(cellX, cellY, draggedItem, false);
                    }
                }
            },
            end(event) {
                console.log('Drag ended');
                const target = event.target;
                target.classList.remove('dragging');
                document.querySelector('.grid-container').classList.remove('drag-active');
                
                // Reset positioning
                target.style.position = '';
                target.style.left = '';
                target.style.top = '';
                target.style.transform = '';
                target.style.width = '';
                target.style.height = '';

                // Clear drop indicators
                document.querySelectorAll('.grid-cell').forEach(cell => {
                    cell.classList.remove('drop-active', 'drop-invalid');
                });
            }
        }
    });
}

// Helper function to highlight drop zone
function highlightDropZone(startX, startY, item, isValid) {
    if (!item) return;
    
    const width = item.rotated ? item.height : item.width;
    const height = item.rotated ? item.width : item.height;
    
    for (let y = startY; y < startY + height && y < GRID_HEIGHT; y++) {
        for (let x = startX; x < startX + width && x < GRID_WIDTH; x++) {
            const cell = document.querySelector(`.grid-cell[data-x="${x}"][data-y="${y}"]`);
            if (cell) {
                cell.classList.add(isValid ? 'drop-active' : 'drop-invalid');
            }
        }
    }
}

// Initialize droppable grid cells
function initializeDroppable() {
    console.log('Initializing droppable cells...');
    
    // Grid dropzone
    interact('.grid-container').dropzone({
        accept: '.available-item, .placed-item',
        overlap: 0.5,
        ondropactivate: function (event) {
            event.target.classList.add('drop-possible');
        },
        ondragenter: function (event) {
            console.log('Drag entered grid');
            if (draggedItem) {
                const gridRect = event.target.getBoundingClientRect();
                const x = Math.floor((event.dragEvent.clientX - gridRect.left - draggedItem.clickOffsetX) / 50);
                const y = Math.floor((event.dragEvent.clientY - gridRect.top - draggedItem.clickOffsetY) / 50);
                
                console.log('Adjusted grid position:', x, y);
                
                if (canPlaceItem(draggedItem, x, y, draggedItem.rotated)) {
                    highlightDropZone(x, y, draggedItem, true);
                } else {
                    highlightDropZone(x, y, draggedItem, false);
                }
            }
        },
        ondragleave: function (event) {
            document.querySelectorAll('.grid-cell').forEach(cell => {
                cell.classList.remove('drop-active', 'drop-invalid');
            });
        },
        ondrop: function (event) {
            console.log('Item dropped on grid');
            if (draggedItem) {
                const gridRect = event.target.getBoundingClientRect();
                const x = Math.floor((event.dragEvent.clientX - gridRect.left - draggedItem.clickOffsetX) / 50);
                const y = Math.floor((event.dragEvent.clientY - gridRect.top - draggedItem.clickOffsetY) / 50);
                
                console.log('Drop position adjusted for offset:', x, y);
                
                if (canPlaceItem(draggedItem, x, y, draggedItem.rotated)) {
                    console.log('Placing item at:', x, y);
                    placeItem(draggedItem, x, y, draggedItem.rotated);
                } else if (isMovingPlacedItem && originalPosition) {
                    console.log('Invalid drop, returning to original position:', originalPosition);
                    placeItem(draggedItem, originalPosition.x, originalPosition.y, originalPosition.rotated);
                }
            }
            
            draggedItem = null;
            originalPosition = null;
            isMovingPlacedItem = false;
            updateDisplay();
            
            document.querySelectorAll('.grid-cell').forEach(cell => {
                cell.classList.remove('drop-active', 'drop-invalid');
            });
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-possible');
        }
    });

    // Available items dropzone
    interact('.available-grid').dropzone({
        accept: '.placed-item',
        overlap: 0.5,
        ondropactivate: function (event) {
            event.target.classList.add('drop-possible');
        },
        ondragenter: function (event) {
            console.log('Drag entered available items');
            event.target.classList.add('drop-active');
        },
        ondragleave: function (event) {
            event.target.classList.remove('drop-active');
        },
        ondrop: function (event) {
            console.log('Item dropped in available items');
            if (draggedItem && isMovingPlacedItem) {
                console.log('Removing item from inventory:', draggedItem.id);
                removeItem(draggedItem.id);
                updateDisplay();
            }
            draggedItem = null;
            originalPosition = null;
            isMovingPlacedItem = false;
            event.target.classList.remove('drop-active');
        },
        ondropdeactivate: function (event) {
            event.target.classList.remove('drop-possible', 'drop-active');
        }
    });
}

function toggleAutoRotate() {
    autoRotate = !autoRotate;
    console.log('Auto-rotate:', autoRotate);
    const button = document.querySelector('.auto-rotate-button');
    button.classList.toggle('active');
}

function tryRotations(item, startX, startY) {
    console.log('Trying rotations for:', item.name);
    // Try all four rotations if auto-rotate is enabled
    if (autoRotate) {
        for (let i = 0; i < 4; i++) {
            const rotated = i % 2 === 1;
            if (canPlaceItem(item, startX, startY, rotated)) {
                console.log('Found valid rotation:', rotated);
                return rotated;
            }
        }
        console.log('No valid rotation found');
        return null; // No valid rotation found
    }
    // Otherwise just try the current rotation
    return isRotated[item.id];
}

function placeItem(item, startX, startY, rotated = false) {
    console.log('Placing item:', item.name, 'at', startX, startY, 'rotated:', rotated);
    const width = rotated ? item.height : item.width;
    const height = rotated ? item.width : item.height;
    
    // Remove any existing instance of this item first
    const existingItem = document.getElementById(`item-${item.id}`);
    if (existingItem) {
        existingItem.remove();
    }
    
    // Place item in grid
    for (let y = startY; y < startY + height; y++) {
        for (let x = startX; x < startX + width; x++) {
            inventoryGrid[y][x] = item.id;
        }
    }
    
    // Create and position the item element
    const itemElement = document.createElement('div');
    itemElement.className = 'placed-item';
    itemElement.id = `item-${item.id}`;
    itemElement.draggable = true;
    
    // Position and size the item, accounting for grid gaps
    const GAP_SIZE = 2; // 2px gap between cells
    itemElement.style.width = `${width * 50 + (width - 1) * GAP_SIZE}px`;
    itemElement.style.height = `${height * 50 + (height - 1) * GAP_SIZE}px`;
    itemElement.style.gridColumn = `${startX + 1} / span ${width}`;
    itemElement.style.gridRow = `${startY + 1} / span ${height}`;
    
    itemElement.innerHTML = `
        <div class="item-content">
            <span>${item.name}</span>
        </div>
        <div class="item-tooltip">
            <div class="tooltip-title">${item.name}</div>
            <div class="tooltip-stats">
                <span>Weight: ${item.weight}kg</span>
                <span>Value: ${item.value}g</span>
            </div>
        </div>
    `;
    
    document.getElementById('inventory-grid').appendChild(itemElement);
    selectedItems.add(item.id);
    isRotated[item.id] = rotated;
    console.log('Item placed successfully');

    // Initialize draggable for this specific item
    interact(itemElement).draggable({
        inertia: false,
        autoScroll: true,
        listeners: {
            start(event) {
                console.log('Drag started for placed item');
                const target = event.target;
                target.classList.add('dragging');
                document.querySelector('.grid-container').classList.add('drag-active');
                
                // Store the dragged item
                const itemId = parseInt(target.id.split('-')[1]);
                draggedItem = currentItems.find(i => i.id === itemId);
                if (draggedItem) {
                    draggedItem.rotated = isRotated[itemId] || false;
                    isMovingPlacedItem = true;

                    // Calculate dimensions
                    const width = draggedItem.rotated ? draggedItem.height : draggedItem.width;
                    const height = draggedItem.rotated ? draggedItem.width : draggedItem.height;
                    const GAP_SIZE = 2;
                    const totalWidth = width * 50 + (width - 1) * GAP_SIZE;
                    const totalHeight = height * 50 + (height - 1) * GAP_SIZE;

                    // Set click offset to center of item
                    draggedItem.clickOffsetX = totalWidth / 2;
                    draggedItem.clickOffsetY = totalHeight / 2;

                    // Find original position
                    for (let y = 0; y < GRID_HEIGHT; y++) {
                        for (let x = 0; x < GRID_WIDTH; x++) {
                            if (inventoryGrid[y][x] === itemId) {
                                originalPosition = { x, y, rotated: isRotated[itemId] };
                                break;
                            }
                        }
                        if (originalPosition) break;
                    }
                    // Clear grid cells but keep the item in selectedItems
                    for (let y = 0; y < GRID_HEIGHT; y++) {
                        for (let x = 0; x < GRID_WIDTH; x++) {
                            if (inventoryGrid[y][x] === itemId) {
                                inventoryGrid[y][x] = null;
                            }
                        }
                    }
                }
                console.log('Dragged item:', draggedItem);
                console.log('Is moving placed item:', isMovingPlacedItem);
                console.log('Original position:', originalPosition);
            },
            move(event) {
                const target = event.target;
                
                // Position the element directly at the mouse position, accounting for the initial click offset
                const x = event.clientX - draggedItem.clickOffsetX;
                const y = event.clientY - draggedItem.clickOffsetY;

                // Apply the transform directly based on page coordinates
                target.style.position = 'fixed';
                target.style.left = x + 'px';
                target.style.top = y + 'px';
                target.style.transform = 'none';

                // Update drop indicators
                const gridContainer = document.querySelector('.grid-container');
                const gridRect = gridContainer.getBoundingClientRect();
                const mouseX = event.clientX;
                const mouseY = event.clientY;

                if (mouseX >= gridRect.left && mouseX <= gridRect.right &&
                    mouseY >= gridRect.top && mouseY <= gridRect.bottom) {
                    // Calculate grid cell position accounting for the click offset
                    const cellX = Math.floor((mouseX - draggedItem.clickOffsetX - gridRect.left) / 50);
                    const cellY = Math.floor((mouseY - draggedItem.clickOffsetY - gridRect.top) / 50);

                    // Clear previous indicators
                    document.querySelectorAll('.grid-cell').forEach(cell => {
                        cell.classList.remove('drop-active', 'drop-invalid');
                    });

                    if (draggedItem && canPlaceItem(draggedItem, cellX, cellY, draggedItem.rotated)) {
                        highlightDropZone(cellX, cellY, draggedItem, true);
                    } else {
                        highlightDropZone(cellX, cellY, draggedItem, false);
                    }
                }
            },
            end(event) {
                console.log('Drag ended for placed item');
                const target = event.target;
                target.classList.remove('dragging');
                document.querySelector('.grid-container').classList.remove('drag-active');
                
                // Reset positioning
                target.style.position = '';
                target.style.left = '';
                target.style.top = '';
                target.style.transform = '';

                // Clear drop indicators
                document.querySelectorAll('.grid-cell').forEach(cell => {
                    cell.classList.remove('drop-active', 'drop-invalid');
                });
            }
        }
    });
}

function removeItem(itemId) {
    console.log('Removing item:', itemId);
    const itemElement = document.getElementById(`item-${itemId}`);
    if (itemElement) {
        itemElement.remove();
        // Clear grid cells
        for (let y = 0; y < GRID_HEIGHT; y++) {
            for (let x = 0; x < GRID_WIDTH; x++) {
                if (inventoryGrid[y][x] === itemId) {
                    inventoryGrid[y][x] = null;
                }
            }
        }
    }
    
    selectedItems.delete(itemId);
    delete isRotated[itemId];
    console.log('Item removed');
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    console.log('Game initializing...');
    restartGame();
    initializeDraggable();
    initializeDroppable();
    console.log('Game initialized');
}); 