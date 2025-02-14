// Initial JSON data for the leaderboard
let players = [];

// Function to save players to localStorage
function saveToLocalStorage() {
    localStorage.setItem('leaderboardData', JSON.stringify(players));
}

// Function to load players from localStorage
function loadFromLocalStorage() {
    const savedData = localStorage.getItem('leaderboardData');
    if (savedData) {
        players = JSON.parse(savedData);
    } else {
        // Default data if nothing is saved
        players = [
            { name: "Alice", score: 150 },
            { name: "Bob", score: 200 },
            { name: "Charlie", score: 100 }
        ];
        saveToLocalStorage();
    }
}

// Initialize toast notification
const toast = new bootstrap.Toast(document.getElementById('notification'));

function showNotification(message, isError = false) {
    const toastElement = document.getElementById('notification');
    toastElement.className = `toast align-items-center text-white bg-${isError ? 'danger' : 'success'}`;
    toastElement.querySelector('.toast-body').textContent = message;
    toast.show();
}

function clearAllPlayers() {
    clearAllModal.show();
}

function resetFilter() {
    document.getElementById('minScore').value = '';
    document.getElementById('searchInput').value = '';
    populateLeaderboard(players);
}

// Enhance populateLeaderboard to include rank
function populateLeaderboard(data) {
    const table = document.getElementById('leaderboard');
    let tableHTML = `
        <thead>
            <tr>
                <th>Rank</th>
                <th>Player</th>
                <th>Score</th>
                <th>Action</th>
            </tr>
        </thead>
        <tbody>
    `;

    const topScore = Math.max(...data.map(player => player.score));
    
    // Create a ranking map based on scores
    const rankMap = new Map();
    [...data]
        .sort((a, b) => b.score - a.score)
        .forEach((player, index) => {
            rankMap.set(player.name, index + 1);
        });

    data.forEach(player => {
        tableHTML += `
            <tr ${player.score === topScore ? 'class="top-player"' : ''}>
                <td>#${rankMap.get(player.name)}</td>
                <td>${player.name}</td>
                <td>${player.score}</td>
                <td>
                    <button class="btn-delete" onclick="removePlayer('${player.name}')">Delete</button>
                </td>
            </tr>
        `;
    });

    tableHTML += '</tbody>';
    table.innerHTML = tableHTML;
}

// Add search functionality
document.getElementById('searchInput').addEventListener('input', function(e) {
    const searchTerm = e.target.value.toLowerCase();
    const filteredPlayers = players.filter(player => 
        player.name.toLowerCase().includes(searchTerm)
    );
    populateLeaderboard(filteredPlayers);
});

let playerToDeleteName = '';
const deleteModal = new bootstrap.Modal(document.getElementById('deleteConfirmModal'));
const clearAllModal = new bootstrap.Modal(document.getElementById('clearAllModal'));

function removePlayer(name) {
    playerToDeleteName = name;
    document.getElementById('playerToDelete').textContent = name;
    deleteModal.show();
}

// Add event listener for delete confirmation
document.getElementById('confirmDelete').addEventListener('click', function() {
    players = players.filter(player => player.name !== playerToDeleteName);
    saveToLocalStorage();
    sortLeaderboard();
    deleteModal.hide();
    showNotification('Player deleted successfully');
});

// Add event listener for clear all confirmation
document.getElementById('confirmClearAll').addEventListener('click', function() {
    players = [];
    saveToLocalStorage();
    populateLeaderboard(players);
    clearAllModal.hide();
    showNotification('All players cleared successfully');
});

// Function to sort the leaderboard by score
function sortLeaderboard() {
    players.sort((a, b) => b.score - a.score); // Sort in descending order
    populateLeaderboard(players);
    saveToLocalStorage();
}

// Enhance addPlayer with validation
function addPlayer() {
    const name = document.getElementById('newName').value.trim();
    const score = parseInt(document.getElementById('newScore').value);

    if (!name) {
        showNotification('Please enter a player name', true);
        return;
    }

    if (isNaN(score) || score < 0) {
        showNotification('Please enter a valid positive score', true);
        return;
    }

    if (players.some(p => p.name.toLowerCase() === name.toLowerCase())) {
        showNotification('Player already exists', true);
        return;
    }

    players.push({ name, score });
    sortLeaderboard();
    document.getElementById('newName').value = '';
    document.getElementById('newScore').value = '';
    showNotification('Player added successfully');
}

// Enhance updatePlayerScore with better feedback
function updatePlayerScore() {
    const playerName = document.getElementById('playerName').value.trim();
    const newScore = parseInt(document.getElementById('newPlayerScore').value);

    if (!playerName || isNaN(newScore) || newScore < 0) {
        showNotification('Please enter valid player name and positive score', true);
        return;
    }

    const playerIndex = players.findIndex(p => p.name.toLowerCase() === playerName.toLowerCase());
    if (playerIndex !== -1) {
        players[playerIndex].score = newScore;
        sortLeaderboard();
        document.getElementById('playerName').value = '';
        document.getElementById('newPlayerScore').value = '';
        showNotification('Score updated successfully');
    } else {
        showNotification('Player not found', true);
    }
}

// Function to filter the leaderboard by minimum score
function filterLeaderboard() {
    const minScore = parseInt(document.getElementById('minScore').value);

    if (!isNaN(minScore)) {
        const filteredPlayers = players.filter(player => player.score >= minScore);
        populateLeaderboard(filteredPlayers);
    } else {
        alert("Please enter a valid minimum score.");
    }
}

function handleSort() {
    const sortType = document.getElementById('sortType').value;
    if (sortType === 'name') {
        sortByName();
    } else {
        sortLeaderboard();
    }
}

function sortByName() {
    players.sort((a, b) => a.name.localeCompare(b.name));
    populateLeaderboard(players);
    saveToLocalStorage();
}

// Initialize the leaderboard
loadFromLocalStorage();
sortLeaderboard();