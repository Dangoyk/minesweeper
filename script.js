class ParkMinesweeper {
    constructor() {
        this.boardSize = 10;
        this.mineCount = 10;
        this.board = [];
        this.gameState = 'playing'; // 'playing', 'won', 'lost'
        this.firstClick = true;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        this.timer = null;
        
        // DOM elements
        this.gameBoard = document.getElementById('game-board');
        this.mineCountDisplay = document.getElementById('mine-count');
        this.timerDisplay = document.getElementById('timer');
        this.gameStatus = document.getElementById('game-status');
        this.resetButton = document.getElementById('reset-btn');
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.board = [];
        this.gameState = 'playing';
        this.firstClick = true;
        this.flaggedCount = 0;
        this.revealedCount = 0;
        this.startTime = null;
        this.stopTimer();
        
        this.updateMineCountDisplay();
        this.updateTimerDisplay(0);
        this.updateGameStatus('');
        this.createBoard();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        // Initialize board data
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                this.board[row][col] = {
                    isMine: false,
                    isRevealed: false,
                    isFlagged: false,
                    neighborMines: 0
                };
            }
        }
        
        // Create DOM tiles
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
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
        
        tile.addEventListener('click', (e) => {
            e.preventDefault();
            this.handleLeftClick(row, col);
        });
        
        tile.addEventListener('contextmenu', (e) => {
            e.preventDefault();
            this.handleRightClick(row, col);
        });
        
        return tile;
    }
    
    placeMines(excludeRow, excludeCol) {
        let minesPlaced = 0;
        while (minesPlaced < this.mineCount) {
            const row = Math.floor(Math.random() * this.boardSize);
            const col = Math.floor(Math.random() * this.boardSize);
            
            if (!this.board[row][col].isMine && 
                !(row === excludeRow && col === excludeCol)) {
                this.board[row][col].isMine = true;
                minesPlaced++;
            }
        }
        
        // Calculate neighbor mine counts
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                if (!this.board[row][col].isMine) {
                    this.board[row][col].neighborMines = this.countNeighborMines(row, col);
                }
            }
        }
    }
    
    countNeighborMines(row, col) {
        let count = 0;
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.isValidPosition(newRow, newCol) && 
                    this.board[newRow][newCol].isMine) {
                    count++;
                }
            }
        }
        return count;
    }
    
    isValidPosition(row, col) {
        return row >= 0 && row < this.boardSize && 
               col >= 0 && col < this.boardSize;
    }
    
    handleLeftClick(row, col) {
        if (this.gameState !== 'playing') return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed || cell.isFlagged) return;
        
        if (this.firstClick) {
            this.firstClick = false;
            this.placeMines(row, col);
            this.startTimer();
        }
        
        this.revealCell(row, col);
    }
    
    handleRightClick(row, col) {
        if (this.gameState !== 'playing') return;
        
        const cell = this.board[row][col];
        if (cell.isRevealed) return;
        
        this.toggleFlag(row, col);
    }
    
    toggleFlag(row, col) {
        const cell = this.board[row][col];
        const tile = this.getTile(row, col);
        
        if (cell.isFlagged) {
            cell.isFlagged = false;
            this.flaggedCount--;
            tile.classList.remove('flagged');
            tile.textContent = '';
        } else {
            cell.isFlagged = true;
            this.flaggedCount++;
            tile.classList.add('flagged');
            tile.textContent = '🚩';
        }
        
        this.updateMineCountDisplay();
    }
    
    revealCell(row, col) {
        const cell = this.board[row][col];
        if (cell.isRevealed) return;
        
        cell.isRevealed = true;
        this.revealedCount++;
        const tile = this.getTile(row, col);
        tile.classList.add('revealed');
        
        if (cell.isMine) {
            tile.classList.add('mine');
            tile.textContent = '💥';
            this.gameOver(false);
            return;
        }
        
        if (cell.neighborMines > 0) {
            tile.textContent = cell.neighborMines;
            tile.classList.add(`number-${cell.neighborMines}`);
        } else {
            // Reveal adjacent cells automatically
            this.revealAdjacentCells(row, col);
        }
        
        this.checkWinCondition();
    }
    
    revealAdjacentCells(row, col) {
        for (let r = -1; r <= 1; r++) {
            for (let c = -1; c <= 1; c++) {
                const newRow = row + r;
                const newCol = col + c;
                if (this.isValidPosition(newRow, newCol)) {
                    this.revealCell(newRow, newCol);
                }
            }
        }
    }
    
    getTile(row, col) {
        return this.gameBoard.children[row * this.boardSize + col];
    }
    
    checkWinCondition() {
        const totalCells = this.boardSize * this.boardSize;
        if (this.revealedCount === totalCells - this.mineCount) {
            this.gameOver(true);
        }
    }
    
    gameOver(won) {
        this.gameState = won ? 'won' : 'lost';
        this.stopTimer();
        
        if (won) {
            this.updateGameStatus('🎉 You found all the safe spots in the park! 🎉');
            this.resetButton.textContent = '🎊 New Park';
        } else {
            this.updateGameStatus('💥 Oh no! You disturbed the wildlife! 💥');
            this.resetButton.textContent = '🔄 Try Again';
            this.revealAllMines();
        }
    }
    
    revealAllMines() {
        for (let row = 0; row < this.boardSize; row++) {
            for (let col = 0; col < this.boardSize; col++) {
                const cell = this.board[row][col];
                if (cell.isMine && !cell.isFlagged) {
                    const tile = this.getTile(row, col);
                    tile.classList.add('revealed', 'mine');
                    tile.textContent = '💥';
                }
            }
        }
    }
    
    startTimer() {
        this.startTime = Date.now();
        this.timer = setInterval(() => {
            const elapsed = Math.floor((Date.now() - this.startTime) / 1000);
            this.updateTimerDisplay(elapsed);
        }, 1000);
    }
    
    stopTimer() {
        if (this.timer) {
            clearInterval(this.timer);
            this.timer = null;
        }
    }
    
    updateMineCountDisplay() {
        this.mineCountDisplay.textContent = this.mineCount - this.flaggedCount;
    }
    
    updateTimerDisplay(seconds) {
        this.timerDisplay.textContent = seconds.toString().padStart(3, '0');
    }
    
    updateGameStatus(message) {
        this.gameStatus.textContent = message;
    }
    
    setupEventListeners() {
        this.resetButton.addEventListener('click', () => this.resetGame());
        
        document.addEventListener('keydown', (e) => {
            if (e.key === 'r' || e.key === 'R') {
                this.resetGame();
            }
        });
    }
    
    resetGame() {
        this.gameBoard.style.opacity = '0.5';
        this.gameBoard.style.transform = 'scale(0.95)';
        this.resetButton.textContent = '🌱 New Park';
        
        setTimeout(() => {
            this.initializeGame();
            this.gameBoard.style.opacity = '1';
            this.gameBoard.style.transform = 'scale(1)';
        }, 200);
    }
}

// Initialize the game when the page loads
document.addEventListener('DOMContentLoaded', () => {
    new ParkMinesweeper();
});

// Add floating particles effect for ambiance
document.addEventListener('DOMContentLoaded', () => {
    createFloatingParticles();
});

function createFloatingParticles() {
    const particleContainer = document.createElement('div');
    particleContainer.style.position = 'fixed';
    particleContainer.style.top = '0';
    particleContainer.style.left = '0';
    particleContainer.style.width = '100%';
    particleContainer.style.height = '100%';
    particleContainer.style.pointerEvents = 'none';
    particleContainer.style.zIndex = '-1';
    document.body.appendChild(particleContainer);
    
    // Create leaves and petals floating
    const particles = ['🍃', '🌸', '🌺', '🦋', '🌼'];
    
    for (let i = 0; i < 15; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.fontSize = '20px';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${5 + Math.random() * 5}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 3 + 's';
        particle.textContent = particles[Math.floor(Math.random() * particles.length)];
        particleContainer.appendChild(particle);
    }
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); opacity: 0.7; }
            50% { transform: translateY(-30px) rotate(180deg); opacity: 1; }
        }
    `;
    document.head.appendChild(style);
}