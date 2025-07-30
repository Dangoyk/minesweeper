class EnhancedMinesweeper {
    constructor() {
        this.boardSize = 10;
        this.board = [];
        this.tilesRevealed = 0;
        this.gameBoard = document.getElementById('game-board');
        this.tilesRevealedDisplay = document.getElementById('tiles-revealed');
        this.resetButton = document.getElementById('reset-btn');
        
        this.initializeGame();
        this.setupEventListeners();
    }
    
    initializeGame() {
        this.board = [];
        this.tilesRevealed = 0;
        this.updateTilesRevealedDisplay();
        this.createBoard();
    }
    
    createBoard() {
        this.gameBoard.innerHTML = '';
        
        for (let row = 0; row < this.boardSize; row++) {
            this.board[row] = [];
            for (let col = 0; col < this.boardSize; col++) {
                // Initialize each tile with state (unrevealed = 0, revealed states = 1-6)
                this.board[row][col] = {
                    revealed: false,
                    colorState: 0
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
        
        tile.addEventListener('click', () => this.handleTileClick(row, col));
        
        return tile;
    }
    
    handleTileClick(row, col) {
        const tile = this.gameBoard.children[row * this.boardSize + col];
        const tileData = this.board[row][col];
        
        // If tile is already revealed, cycle through color states
        if (tileData.revealed) {
            this.cycleTileColor(tile, tileData);
        } else {
            // First click - reveal the tile
            this.revealTile(tile, tileData);
        }
    }
    
    revealTile(tile, tileData) {
        tileData.revealed = true;
        tileData.colorState = 1; // Start with first color state
        this.tilesRevealed++;
        this.updateTilesRevealedDisplay();
        
        // Apply the revealed class
        tile.classList.add('revealed-1');
        
        // Add a subtle sound effect simulation
        this.playPopSound();
    }
    
    cycleTileColor(tile, tileData) {
        // Remove current color class
        tile.classList.remove(`revealed-${tileData.colorState}`);
        
        // Cycle to next color (1-6, then back to 1)
        tileData.colorState = (tileData.colorState % 6) + 1;
        
        // Add new color class
        tile.classList.add(`revealed-${tileData.colorState}`);
        
        // Trigger animation
        tile.style.animation = 'none';
        tile.offsetHeight; // Trigger reflow
        tile.style.animation = 'pop 0.3s ease';
        
        this.playPopSound();
    }
    
    playPopSound() {
        // Create a simple audio feedback using Web Audio API
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
    }
    
    updateTilesRevealedDisplay() {
        this.tilesRevealedDisplay.textContent = this.tilesRevealed;
    }
    
    setupEventListeners() {
        this.resetButton.addEventListener('click', () => this.resetGame());
        
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
    new EnhancedMinesweeper();
});

// Add some nice visual effects
document.addEventListener('DOMContentLoaded', () => {
    // Add floating particles effect
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
    
    for (let i = 0; i < 20; i++) {
        const particle = document.createElement('div');
        particle.style.position = 'absolute';
        particle.style.width = '4px';
        particle.style.height = '4px';
        particle.style.backgroundColor = 'rgba(255, 255, 255, 0.3)';
        particle.style.borderRadius = '50%';
        particle.style.left = Math.random() * 100 + '%';
        particle.style.top = Math.random() * 100 + '%';
        particle.style.animation = `float ${3 + Math.random() * 4}s infinite ease-in-out`;
        particle.style.animationDelay = Math.random() * 2 + 's';
        particleContainer.appendChild(particle);
    }
    
    // Add CSS for floating animation
    const style = document.createElement('style');
    style.textContent = `
        @keyframes float {
            0%, 100% { transform: translateY(0px) rotate(0deg); }
            50% { transform: translateY(-20px) rotate(180deg); }
        }
    `;
    document.head.appendChild(style);
}