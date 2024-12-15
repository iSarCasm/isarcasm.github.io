// Game constants
const lootSize = 20;
const maxWeight = 8; 
const maxSpace = 10; 

// All possible items in the game
const itemTypes = [
    // Deceptively valuable items (high value but very inefficient for space/weight)
    { name: "Golden Statue", weight: 5, size: 7, value: 5000 },
    { name: "Diamond Throne", weight: 4.5, size: 6, value: 4800 },
    { name: "Crystal Chandelier", weight: 3.5, size: 7.5, value: 4200 },
    
    // Efficient but low value items
    { name: "Ancient Coin", weight: 0.1, size: 0.1, value: 300 },
    { name: "Magic Seed", weight: 0.2, size: 0.2, value: 400 },
    { name: "Fairy Dust", weight: 0.15, size: 0.15, value: 350 },
    
    // Balanced items with quirky ratios
    { name: "Cloud Fragment", weight: 0.1, size: 4, value: 1200 },
    { name: "Gravity Pearl", weight: 3, size: 0.2, value: 1400 },
    { name: "Time Shard", weight: 1.5, size: 1.5, value: 1100 },
    
    // Items with inverse weight/size relationships
    { name: "Pocket Universe", weight: 4, size: 0.5, value: 2200 },
    { name: "Giant Feather", weight: 0.3, size: 5, value: 2000 },
    { name: "Dense Crystal", weight: 2.5, size: 0.8, value: 1800 },
    
    // Moderate value items with odd constraints
    { name: "Shadow Essence", weight: 0.8, size: 3, value: 1600 },
    { name: "Light Fragment", weight: 2, size: 0.6, value: 1500 },
    { name: "Space Fold", weight: 1.2, size: 2.4, value: 1700 },
    
    // High risk-reward items
    { name: "Dragon Scale", weight: 1.8, size: 1.8, value: 2800 },
    { name: "Phoenix Feather", weight: 0.5, size: 3.5, value: 2600 },
    { name: "Unicorn Horn", weight: 2.2, size: 1.2, value: 2400 },
    
    // Trap items (seem good but aren't)
    { name: "Fool's Gold", weight: 2, size: 2, value: 1000 },
    { name: "Mirage Crystal", weight: 1.5, size: 1.5, value: 800 },
    { name: "Cursed Coin", weight: 0.5, size: 0.5, value: 400 },
    
    // True optimal items (but harder to spot)
    { name: "Void Shard", weight: 0.4, size: 0.8, value: 1900 },
    { name: "Quantum Dust", weight: 0.6, size: 0.4, value: 1800 },
    { name: "Astral Essence", weight: 0.5, size: 0.6, value: 1700 },
    
    // Items with prime number ratios
    { name: "Prime Pearl", weight: 2.3, size: 1.7, value: 2300 },
    { name: "Chaos Fragment", weight: 1.7, size: 2.3, value: 2100 },
    { name: "Entropy Shard", weight: 1.3, size: 1.9, value: 1900 },
    
    // Items with fibonacci sequence relationships
    { name: "Fibonacci Crystal", weight: 1.618, size: 1, value: 1618 },
    { name: "Golden Spiral", weight: 1, size: 1.618, value: 1618 },
    { name: "Nature's Pattern", weight: 0.618, size: 1.618, value: 1618 }
];

let selectedItems = new Set();
let currentItems = [];

function generateRandomItems() {
    currentItems = [];
    for (let i = 0; i < lootSize; i++) {
        const randomItem = itemTypes[Math.floor(Math.random() * itemTypes.length)];
        currentItems.push({
            id: i + 1,
            name: randomItem.name,
            weight: randomItem.weight,
            size: randomItem.size,
            value: randomItem.value
        });
    }
}

function restartGame() {
    selectedItems.clear();
    generateRandomItems();
    updateDisplay();
}

function calculateTotals() {
    let currentWeight = 0;
    let currentSpace = 0;
    let totalValue = 0;
    selectedItems.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        currentWeight += item.weight;
        currentSpace += item.size;
        totalValue += item.value;
    });
    return { currentWeight, currentSpace, totalValue };
}

function updateProgressBar(current, max, previewValue = 0) {
    const percentage = (current / max) * 100;
    const previewPercentage = ((current + previewValue) / max) * 100;
    
    let progressBarClass = 'progress-bar';
    let previewBarClass = 'preview-bar';
    
    if (percentage >= 100) {
        progressBarClass += ' danger';
    } else if (percentage >= 70) {
        progressBarClass += ' warning';
    }

    // For removal previews, adjust the preview bar position and width
    let previewStyle = '';
    if (previewValue < 0) {
        previewBarClass += ' removal-preview';
        // Position preview bar at the end of what will remain
        const remainingPercentage = ((current + previewValue) / max) * 100;
        previewStyle = `left: ${remainingPercentage}%; width: ${-previewValue / max * 100}%`;
    } else {
        previewStyle = `width: ${previewPercentage}%`;
        if (previewPercentage >= 100) {
            previewBarClass += ' danger';
        } else if (previewPercentage >= 70) {
            previewBarClass += ' warning';
        }
    }

    return {
        progressBarClass,
        previewBarClass,
        percentage: Math.min(percentage, 100),
        previewPercentage: Math.min(previewPercentage, 100),
        previewStyle
    };
}

function updateDisplay() {
    const availableItemsDiv = document.getElementById('availableItems');
    const selectedItemsDiv = document.getElementById('selectedItems');
    const weightStatusDiv = document.getElementById('weight-status');
    const spaceStatusDiv = document.getElementById('space-status');
    const valueStatusDiv = document.getElementById('value-status');

    const { currentWeight, currentSpace, totalValue } = calculateTotals();

    // Update available items
    availableItemsDiv.innerHTML = currentItems
        .map(item => `
            <div class="item ${selectedItems.has(item.id) ? 'selected' : ''}"
                 onclick="toggleItem(${item.id})"
                 onmouseover="previewItem(${item.id})"
                 onmouseout="clearPreview()">
                ${item.name}
                <div class="stats">
                    <span>Weight: ${item.weight}kg</span>
                    <span>Size: ${item.size}u³</span>
                    <span>Value: ${item.value} gold</span>
                </div>
            </div>
        `).join('');

    // Update selected items
    selectedItemsDiv.innerHTML = Array.from(selectedItems)
        .map(id => {
            const item = currentItems.find(i => i.id === id);
            return `
                <div class="item selected"
                     onclick="toggleItem(${item.id})"
                     onmouseover="previewItem(${item.id})"
                     onmouseout="clearPreview()">
                    ${item.name}
                    <div class="stats">
                        <span>Weight: ${item.weight}kg</span>
                        <span>Size: ${item.size}u³</span>
                        <span>Value: ${item.value} gold</span>
                    </div>
                </div>
            `;
        }).join('');

    // Update weight status
    const weightProgress = updateProgressBar(currentWeight, maxWeight);
    weightStatusDiv.innerHTML = `
        <h3>Weight: ${currentWeight.toFixed(1)}/${maxWeight}kg<span></span></h3>
        <div class="progress-container">
            <div class="${weightProgress.progressBarClass}" style="width: ${weightProgress.percentage}%"></div>
            <div class="${weightProgress.previewBarClass}" style="${weightProgress.previewStyle}"></div>
        </div>
    `;

    // Update space status
    const spaceProgress = updateProgressBar(currentSpace, maxSpace);
    spaceStatusDiv.innerHTML = `
        <h3>Space: ${currentSpace.toFixed(1)}/${maxSpace}u³<span></span></h3>
        <div class="progress-container">
            <div class="${spaceProgress.progressBarClass}" style="width: ${spaceProgress.percentage}%"></div>
            <div class="${spaceProgress.previewBarClass}" style="${spaceProgress.previewStyle}"></div>
        </div>
    `;

    // Update value status
    valueStatusDiv.innerHTML = `
        <h3>Value: ${totalValue} gold<span></span></h3>
    `;

    // Update status classes
    weightStatusDiv.className = currentWeight > maxWeight ? 'status error' : 'status';
    spaceStatusDiv.className = currentSpace > maxSpace ? 'status error' : 'status';
}

function previewItem(id) {
    const item = currentItems.find(i => i.id === id);
    const { currentWeight, currentSpace, totalValue } = calculateTotals();
    const previewWeight = selectedItems.has(id) ? -item.weight : item.weight;
    const previewSpace = selectedItems.has(id) ? -item.size : item.size;

    const weightStatusDiv = document.getElementById('weight-status');
    const spaceStatusDiv = document.getElementById('space-status');
    const valueStatusDiv = document.getElementById('value-status');

    // Update weight status with preview
    const weightProgress = updateProgressBar(currentWeight, maxWeight, previewWeight);
    weightStatusDiv.innerHTML = `
        <h3>Weight: ${currentWeight.toFixed(1)}/${maxWeight}kg<span></span></h3>
        <div class="progress-container">
            <div class="${weightProgress.progressBarClass}" style="width: ${weightProgress.percentage}%"></div>
            <div class="${weightProgress.previewBarClass}" style="${weightProgress.previewStyle}"></div>
        </div>
    `;

    // Update space status with preview
    const spaceProgress = updateProgressBar(currentSpace, maxSpace, previewSpace);
    spaceStatusDiv.innerHTML = `
        <h3>Space: ${currentSpace.toFixed(1)}/${maxSpace}u³<span></span></h3>
        <div class="progress-container">
            <div class="${spaceProgress.progressBarClass}" style="width: ${spaceProgress.percentage}%"></div>
            <div class="${spaceProgress.previewBarClass}" style="${spaceProgress.previewStyle}"></div>
        </div>
    `;

    // Update value status with preview
    const previewValue = selectedItems.has(id) ? totalValue - item.value : totalValue + item.value;
    valueStatusDiv.innerHTML = `
        <h3>Value: ${totalValue} gold<span>(→ ${previewValue})</span></h3>
    `;
}

function clearPreview() {
    updateDisplay();
}

function toggleItem(id) {
    const item = currentItems.find(i => i.id === id);
    const { currentWeight, currentSpace } = calculateTotals();

    if (selectedItems.has(id)) {
        selectedItems.delete(id);
    } else {
        if (currentWeight + item.weight > maxWeight || currentSpace + item.size > maxSpace) {
            alert("Cannot add item! Either weight or space limit would be exceeded.");
        } else {
            selectedItems.add(id);
        }
    }
    updateDisplay();
}

function findOptimalSolution(items, maxWeight, maxSpace) {
    // This is a simplified version that doesn't guarantee optimality for 2D constraint
    // A more complex algorithm would be needed for true 2D knapsack optimization
    const n = items.length;
    const selected = new Set();
    
    // Sort items by value density (value per unit of constraint)
    const sortedItems = [...items].sort((a, b) => {
        const densityA = a.value / Math.max(a.weight / maxWeight, a.size / maxSpace);
        const densityB = b.value / Math.max(b.weight / maxWeight, b.size / maxSpace);
        return densityB - densityA;
    });

    let totalValue = 0;
    let currentWeight = 0;
    let currentSpace = 0;

    // Greedy selection
    for (const item of sortedItems) {
        if (currentWeight + item.weight <= maxWeight && 
            currentSpace + item.size <= maxSpace) {
            selected.add(item.id);
            totalValue += item.value;
            currentWeight += item.weight;
            currentSpace += item.size;
        }
    }

    return {
        maxValue: totalValue,
        selectedItems: selected
    };
}

function checkOptimalSolution() {
    const optimal = findOptimalSolution(currentItems, maxWeight, maxSpace);
    const { totalValue } = calculateTotals();
    const optimalValue = optimal.maxValue;
    
    // Calculate the items that should have been selected
    const optimalItems = Array.from(optimal.selectedItems).map(id => {
        const item = currentItems.find(i => i.id === id);
        return `${item.name} (Value: ${item.value} gold, Weight: ${item.weight}kg, Size: ${item.size}u³)`;
    }).join('\n');

    // Calculate efficiency percentage
    const efficiency = ((totalValue / optimalValue) * 100).toFixed(1);

    const message = `Your loot value: ${totalValue} gold\n` +
                   `Best possible value: ${optimalValue} gold\n` +
                   `Your efficiency: ${efficiency}%\n\n` +
                   `Suggested selection:\n${optimalItems}`;

    alert(message);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    generateRandomItems();
    updateDisplay();
}); 