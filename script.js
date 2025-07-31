class Minesweeper {
    constructor() {
        this.difficulties = {
            easy: { boardSize: 9, mineCount: 10 },
            medium: { boardSize: 16, mineCount: 40 },
            hard: { boardSize: 16, mineCount: 99 }
        };
        
        this.currentDifficulty = 'easy';
        this.boardSize = this.difficulties[this.currentDifficulty].boardSize;
        this.mineCount = this.difficulties[this.currentDifficulty].mineCount;
        this.board = [];
        this.mines = new Set();
        this.gameOver = false;
        this.firstClick = true;
        this.tilesRevealed = 0;
        this.flagsPlaced = 0;
        this.gameStarted = false;
        this.startTime = 0;
        this.timerInterval = null;
        
        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.minesRemainingDisplay = document.getElementById('mines-remaining');
        this.timerDisplay = document.getElementById('timer');
        this.resetButton = document.getElementById('reset-btn');
        this.difficultyButtons = document.querySelectorAll('.difficulty-btn');
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.board = [];
        this.mines.clear();
        this.gameOver = false;
        this.firstClick = true;
        this.tilesRevealed = 0;
        this.flagsPlaced = 0;
        this.gameStarted = false;
        this.startTime = 0;
        this.stopTimer();
        this.updateMinesRemaining();
        this.updateTimer();
        this.createBoard();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        this.gameBoard.style.gridTemplateColumns = `repeat(${this.boardSize}, 1fr)`;
        this.gameBoard.style.gridTemplateRows = `repeat(${this.boardSize}, 1fr)`;
        
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = {
                    revealed: false,
                    flagged: false,
                    isMine: false,
                    adjacentMines: 0
                };
                
                const tile = this.createTile(row, col);
                this.gameBoard.appendChild(tile);
            }
        }
    }
    
    createTile(row, col) {
        const tile = document.createElement('div');
        tile.className = 'tile';
        tile.dataset.row = row;
        tile.dataset.col = col;
        
        tile.addEventListener('click', (e) => this.handleTileClick(row, col, e));
        tile.addEventListener('contextmenu', (e) => this.handleRightClick(row, col, e));
        
        return tile;
    }
    
    placeMines(firstRow, firstCol) {
        // Create a safe zone around the first click (3x3 area)
        const safeZone = [];
        for (let dr = -1; dr <= 1; dr++) {
            for (let dc = -1; dc <= 1; dc++) {
                const newRow = firstRow + dr;
                const newCol = firstCol + dc;
                if (newRow >= 0 && newRow < this.boardSize && 
                    newCol >= 0 && newCol < this.boardSize) {
                    safeZone.push(`${newRow},${newCol}`);
                }
            }
        }
        
        // Place mines randomly, avoiding the safe zone
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            const key = `${row},${col}`;
            
            // Don't place mine in safe zone or if already placed
            if (!safeZone.includes(key) && !this.mines.has(key)) {
                this.mines.add(key);
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // Calculate adjacent mine counts
        this.calculateAdjacentMines();
    }
    
    calculateAdjacentMines() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col].isMine) {
                    let count = 0;
                    // Check all 8 adjacent cells
                    for (let dr = -1; dr <= 1; dr++) {
                        for (let dc = -1; dc <= 1; dc++) {
                            const newRow = row + dr;
                            const newCol = col + dc;
                            if (newRow >= 0 && newRow < this.boardSize && 
                                newCol >= 0 && newCol < this.boardSize &&
                                this.board[newRow][newCol].isMine) {
                                count++;
                            }
                        }
                    }
                    this.board[row][col].adjacentMines = count;
                }
            }
        }
    }
    
    handleTileClick(row, col, event) {
        if (this.gameOver) return;
        
        const tile = this.gameBoard.children[row * this.boardSize + col];
        const tileData = this.board[row][col];
        
        if (tileData.flagged) return; // Can't click flagged tiles
        
        if (this.firstClick) {
            this.placeMines(row, col);
            this.firstClick = false;
            this.startTimer();
        }
        
        if (tileData.isMine) {
            this.gameOver = true;
            this.revealAllMines();
            this.stopTimer();
            this.playExplosionSound();
            setTimeout(() => {
                alert('Game Over! You hit a mine!');
            }, 500);
        } else {
            this.revealTile(row, col);
            this.checkWinCondition();
        }
    }
    
    handleRightClick(row, col, event) {
        event.preventDefault();
        if (this.gameOver) return;
        
        const tile = this.gameBoard.children[row * this.boardSize + col];
        const tileData = this.board[row][col];
        
        if (!tileData.revealed) {
            if (tileData.flagged) {
                tileData.flagged = false;
                tile.classList.remove('flagged');
                tile.textContent = '';
                this.flagsPlaced--;
            } else {
                tileData.flagged = true;
                tile.classList.add('flagged');
                tile.textContent = '🚩';
                this.flagsPlaced++;
            }
            this.updateMinesRemaining();
        }
    }
    
    revealTile(row, col) {
        const tile = this.gameBoard.children[row * this.boardSize + col];
        const tileData = this.board[row][col];
        
        if (tileData.revealed || tileData.flagged) return;
        
        tileData.revealed = true;
        this.tilesRevealed++;
        
        if (tileData.adjacentMines === 0) {
            // Reveal adjacent tiles for empty cells
            for (let dr = -1; dr <= 1; dr++) {
                for (let dc = -1; dc <= 1; dc++) {
                    const newRow = row + dr;
                    const newCol = col + dc;
                    if (newRow >= 0 && newRow < this.boardSize && 
                        newCol >= 0 && newCol < this.boardSize) {
                        this.revealTile(newRow, newCol);
                    }
                }
            }
        }
        
        this.updateTileDisplay(tile, tileData);
        this.playPopSound();
    }
    
    updateTileDisplay(tile, tileData) {
        tile.classList.add('revealed');
        
        if (tileData.adjacentMines > 0) {
            tile.textContent = tileData.adjacentMines;
            tile.classList.add(`number-${tileData.adjacentMines}`);
        } else {
            tile.textContent = '';
        }
    }
    
    revealAllMines() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.gameBoard.children[row * this.boardSize + col];
                const tileData = this.board[row][col];
                
                if (tileData.isMine) {
                    tile.classList.add('mine');
                    tile.textContent = '💣';
                }
            }
        }
    }
    
    checkWinCondition() {
        const totalSafeTiles = this.boardSize * this.boardSize - this.mineCount;
        if (this.tilesRevealed === totalSafeTiles) {
            this.gameOver = true;
            this.stopTimer();
            this.flagAllMines();
            setTimeout(() => {
                alert('Congratulations! You won!');
            }, 500);
        }
    }
    
    flagAllMines() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const tile = this.gameBoard.children[row * this.boardSize + col];
                const tileData = this.board[row][col];
                
                if (tileData.isMine && !tileData.flagged) {
                    tile.classList.add('flagged');
                    tile.textContent = '🚩';
                }
            }
        }
    }
    
    startTimer() {
        this.gameStarted = true;
        this.startTime = Date.now();
        this.timerInterval = setInterval(() => {
            this.updateTimer();
        }, 1000);
    }
    
    stopTimer() {
        if (this.timerInterval) {
            clearInterval(this.timerInterval);
            this.timerInterval = null;
        }
    }
    
    updateTimer() {
        if (!this.gameStarted) {
            this.timerDisplay.textContent = '00:00';
            return;
        }
        
        const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
        const minutes = Math.floor(elapsed / 60);
        const seconds = elapsed % 60;
        this.timerDisplay.textContent = `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
    }
    
    updateMinesRemaining() {
        const remaining = this.mineCount - this.flagsPlaced;
        this.minesRemainingDisplay.textContent = remaining;
    }
    
    changeDifficulty(difficulty) {
        this.currentDifficulty = difficulty;
        this.boardSize = this.difficulties[difficulty].boardSize;
        this.mineCount = this.difficulties[difficulty].mineCount;
        
        // Update active button
        this.difficultyButtons.forEach(btn => {
            btn.classList.remove('active');
        });
        event.target.classList.add('active');
        
        this.initializeGame();
    }
    
    playPopSound() {
        // Create a simple audio feedback using Web Audio API
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(800, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(400, audioContext.currentTime + 0.1);
                
                gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.1);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.1);
            }
        } catch (error) {
            // Silently handle audio errors
        }
    }
    
    playExplosionSound() {
        try {
            if (typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined') {
                const audioContext = new (AudioContext || webkitAudioContext)();
                const oscillator = audioContext.createOscillator();
                const gainNode = audioContext.createGain();
                
                oscillator.connect(gainNode);
                gainNode.connect(audioContext.destination);
                
                oscillator.frequency.setValueAtTime(200, audioContext.currentTime);
                oscillator.frequency.exponentialRampToValueAtTime(50, audioContext.currentTime + 0.3);
                
                gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
                gainNode.gain.exponentialRampToValueAtTime(0.001, audioContext.currentTime + 0.3);
                
                oscillator.start(audioContext.currentTime);
                oscillator.stop(audioContext.currentTime + 0.3);
            }
        } catch (error) {
            // Silently handle audio errors
        }
    }
    
    setupEventListeners() {
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        // Difficulty button listeners
        this.difficultyButtons.forEach(btn => {
            btn.addEventListener('click', (e) => {
                this.changeDifficulty(e.target.dataset.difficulty);
            });
        });
        
        // Add keyboard support
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });
    }
    
    resetGame() {
        // Add a nice transition effect
        this.gameBoard.style.opacity = '0.5';
        this.gameBoard.style.transform = 'scale(0.95)';
        
        setTimeout(() => {
            this.initializeGame();
            this.gameBoard.style.opacity = '1';
            this.gameBoard.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new Minesweeper();
});