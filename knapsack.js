// All possible items in the game
const itemTypes = [
    // Original items
    { name: "Ancient Crown", weight: 2, value: 2000 },
    { name: "Magic Scroll", weight: 0.5, value: 800 },
    { name: "Golden Chalice", weight: 3, value: 1500 },
    { name: "Enchanted Sword", weight: 4, value: 2500 },
    { name: "Dragon Scale", weight: 1, value: 1000 },
    { name: "Mystic Gem", weight: 0.2, value: 1200 },
    { name: "Silver Mirror", weight: 2, value: 500 },
    { name: "Wizard's Staff", weight: 3, value: 1800 },
    { name: "Healing Potion", weight: 0.5, value: 300 },
    { name: "Cursed Amulet", weight: 0.3, value: 900 },
    { name: "Dwarven Hammer", weight: 5, value: 1600 },
    { name: "Elven Bow", weight: 2, value: 1400 },
    { name: "Bag of Gems", weight: 1, value: 2000 },
    { name: "Ancient Coin", weight: 0.1, value: 500 },
    { name: "Crystal Ball", weight: 3, value: 1100 },
    { name: "Phoenix Feather", weight: 0.1, value: 1500 },
    { name: "Goblin's Gold", weight: 4, value: 2200 },
    { name: "Mage's Tome", weight: 2, value: 1300 },
    { name: "Royal Scepter", weight: 1.5, value: 1700 },
    { name: "Dragon's Pearl", weight: 0.3, value: 2500 },
    { name: "Unicorn Horn", weight: 0.8, value: 3000 },
    { name: "Vampire Fang", weight: 0.1, value: 1800 },
    { name: "Mermaid's Scale", weight: 0.3, value: 2200 },
    { name: "Basilisk Eye", weight: 0.2, value: 2800 },
    { name: "Frost Giant's Ring", weight: 3, value: 2400 },
    { name: "Demon's Heart", weight: 1.5, value: 3500 },
    { name: "Fairy Dust Vial", weight: 0.2, value: 1600 },
    { name: "Troll's Club", weight: 6, value: 1200 },
    { name: "Griffin Feather", weight: 0.2, value: 1900 },
    { name: "Witch's Pendant", weight: 0.4, value: 2100 },
    { name: "Celestial Map", weight: 0.3, value: 2600 },
    { name: "Obsidian Dagger", weight: 1, value: 1700 },
    { name: "Siren's Pearl", weight: 0.2, value: 2300 },
    { name: "Chimera Scale", weight: 0.5, value: 2000 },
    { name: "Warlock's Ring", weight: 0.2, value: 2700 },
    { name: "Dragon Tooth", weight: 0.4, value: 2900 },
    { name: "Pixie Wings", weight: 0.1, value: 1400 },
    { name: "Minotaur Horn", weight: 2, value: 1800 },
    { name: "Necromancer's Skull", weight: 1.5, value: 3200 },
    { name: "Banshee's Mirror", weight: 1, value: 2100 },
    { name: "Paladin's Shield", weight: 5, value: 2800 },
    { name: "Sphinx's Riddle Stone", weight: 0.5, value: 2400 },
    { name: "Kraken Tentacle", weight: 4, value: 2600 },
    { name: "Lich's Phylactery", weight: 0.3, value: 3800 },
    { name: "Werewolf Claw", weight: 0.2, value: 1600 }
];

const lootSize = 15;
const maxWeight = 8;
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
            value: randomItem.value
        });
    }
}

function restartGame() {
    selectedItems.clear();
    generateRandomItems();
    updateDisplay();
}

function calculateTotalWeight() {
    let currentWeight = 0;
    selectedItems.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        currentWeight += item.weight;
    });
    return currentWeight;
}

function updateProgressBar(currentWeight, previewWeight = 0) {
    const weightPercentage = (currentWeight / maxWeight) * 100;
    const previewPercentage = ((currentWeight + previewWeight) / maxWeight) * 100;
    
    let progressBarClass = 'progress-bar';
    let previewBarClass = 'preview-bar';
    
    if (weightPercentage >= 90) {
        progressBarClass += ' danger';
    } else if (weightPercentage >= 70) {
        progressBarClass += ' warning';
    }

    if (previewPercentage >= 90) {
        previewBarClass += ' danger';
    } else if (previewPercentage >= 70) {
        previewBarClass += ' warning';
    }

    return `
        <div class="progress-container">
            <div class="${progressBarClass}" style="width: ${Math.min(weightPercentage, 100)}%"></div>
            <div class="${previewBarClass}" style="width: ${Math.min(previewPercentage, 100)}%"></div>
        </div>
    `;
}

function updateDisplay() {
    const availableItemsDiv = document.getElementById('availableItems');
    const selectedItemsDiv = document.getElementById('selectedItems');
    const statusDiv = document.getElementById('status');

    // Calculate current weight and value
    let currentWeight = 0;
    let totalValue = 0;
    selectedItems.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        currentWeight += item.weight;
        totalValue += item.value;
    });

    // Update available items
    availableItemsDiv.innerHTML = currentItems
        .map(item => `
            <div class="item ${selectedItems.has(item.id) ? 'selected' : ''}"
                 onclick="toggleItem(${item.id})"
                 onmouseover="previewItem(${item.id})"
                 onmouseout="clearPreview()">
                ${item.name} (Weight: ${item.weight}kg, Value: ${item.value} gold)
            </div>
        `).join('');

    // Update selected items
    selectedItemsDiv.innerHTML = Array.from(selectedItems)
        .map(id => {
            const item = currentItems.find(i => i.id === id);
            return `
                <div class="item selected" onclick="toggleItem(${item.id})"
                     onmouseover="previewItem(${item.id})"
                     onmouseout="clearPreview()">
                    ${item.name} (Weight: ${item.weight}kg, Value: ${item.value} gold)
                </div>
            `;
        }).join('');

    // Update status
    statusDiv.innerHTML = `
        <div>Current Weight: ${currentWeight.toFixed(1)}/${maxWeight}kg</div>
        <div>Total Value: ${totalValue} gold</div>
        ${updateProgressBar(currentWeight)}
    `;
    statusDiv.className = currentWeight > maxWeight ? 'status error' : 'status';
}

function previewItem(id) {
    const item = currentItems.find(i => i.id === id);
    const currentWeight = calculateTotalWeight();
    const statusDiv = document.getElementById('status');
    const previewWeight = selectedItems.has(id) ? -item.weight : item.weight;
    
    statusDiv.innerHTML = `
        <div>Current Weight: ${currentWeight.toFixed(1)}/${maxWeight}kg</div>
        <div>Total Value: ${calculateTotalValue()} gold</div>
        ${updateProgressBar(currentWeight, previewWeight)}
    `;
}

function clearPreview() {
    updateDisplay();
}

function calculateTotalValue() {
    let totalValue = 0;
    selectedItems.forEach(id => {
        const item = currentItems.find(i => i.id === id);
        totalValue += item.value;
    });
    return totalValue;
}

function toggleItem(id) {
    const item = currentItems.find(i => i.id === id);
    let currentWeight = calculateTotalWeight();

    if (selectedItems.has(id)) {
        selectedItems.delete(id);
    } else {
        if (currentWeight + item.weight <= maxWeight) {
            selectedItems.add(id);
        } else {
            alert("Cannot add item! Knapsack weight limit exceeded.");
        }
    }
    updateDisplay();
}

function findOptimalSolution(items, capacity) {
    const n = items.length;
    const dp = Array(n + 1).fill().map(() => Array(Math.floor(capacity * 10) + 1).fill(0));
    const selected = new Set();

    // Fill the dp table
    for (let i = 1; i <= n; i++) {
        for (let w = 0; w <= capacity * 10; w++) {
            if (items[i-1].weight * 10 <= w) {
                dp[i][w] = Math.max(
                    dp[i-1][w],
                    dp[i-1][w - Math.floor(items[i-1].weight * 10)] + items[i-1].value
                );
            } else {
                dp[i][w] = dp[i-1][w];
            }
        }
    }

    // Backtrack to find selected items
    let w = Math.floor(capacity * 10);
    for (let i = n; i > 0 && w > 0; i--) {
        if (dp[i][w] !== dp[i-1][w]) {
            selected.add(items[i-1].id);
            w -= Math.floor(items[i-1].weight * 10);
        }
    }

    return {
        maxValue: dp[n][Math.floor(capacity * 10)],
        selectedItems: selected
    };
}

function checkOptimalSolution() {
    const optimal = findOptimalSolution(currentItems, maxWeight);
    const currentValue = calculateTotalValue();
    const optimalValue = optimal.maxValue;
    
    // Calculate the items that should have been selected
    const optimalItems = Array.from(optimal.selectedItems).map(id => {
        const item = currentItems.find(i => i.id === id);
        return `${item.name} (Value: ${item.value} gold, Weight: ${item.weight}kg)`;
    }).join('\n');

    // Calculate efficiency percentage
    const efficiency = ((currentValue / optimalValue) * 100).toFixed(1);

    const message = `Your loot value: ${currentValue} gold\n` +
                   `Best possible value: ${optimalValue} gold\n` +
                   `Your efficiency: ${efficiency}%\n\n` +
                   `Optimal selection would be:\n${optimalItems}`;

    alert(message);
}

// Initial setup
document.addEventListener('DOMContentLoaded', () => {
    generateRandomItems();
    updateDisplay();
}); 