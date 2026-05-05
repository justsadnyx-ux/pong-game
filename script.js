// Canvas setup
const canvas = document.getElementById('pongCanvas');
const ctx = canvas.getContext('2d');

// Game objects
const paddleWidth = 10;
const paddleHeight = 80;
const ballSize = 6;
const paddleSpeed = 6;
const ballSpeed = 4;

let gameRunning = false;
let gameStarted = false;

// Player paddle
const player = {
    x: 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Computer paddle
const computer = {
    x: canvas.width - paddleWidth - 10,
    y: canvas.height / 2 - paddleHeight / 2,
    width: paddleWidth,
    height: paddleHeight,
    dy: 0,
    score: 0
};

// Ball
const ball = {
    x: canvas.width / 2,
    y: canvas.height / 2,
    size: ballSize,
    dx: ballSpeed,
    dy: ballSpeed,
    speed: ballSpeed
};

// Mouse and keyboard tracking
let mouseY = canvas.height / 2;
let keys = {};

// Event listeners
document.addEventListener('mousemove', (e) => {
    const rect = canvas.getBoundingClientRect();
    mouseY = e.clientY - rect.top;
});

document.addEventListener('keydown', (e) => {
    keys[e.key] = true;
});

document.addEventListener('keyup', (e) => {
    keys[e.key] = false;
});

document.getElementById('startBtn').addEventListener('click', toggleGame);
document.getElementById('resetBtn').addEventListener('click', resetGame);

// Toggle game
function toggleGame() {
    if (!gameStarted) {
        gameRunning = true;
        gameStarted = true;
        document.getElementById('startBtn').textContent = 'Pause Game';
        gameLoop();
    } else {
        gameRunning = !gameRunning;
        document.getElementById('startBtn').textContent = gameRunning ? 'Pause Game' : 'Resume Game';
        if (gameRunning) gameLoop();
    }
}

// Reset game
function resetGame() {
    player.score = 0;
    computer.score = 0;
    gameRunning = false;
    gameStarted = false;
    document.getElementById('startBtn').textContent = 'Start Game';
    document.getElementById('playerScore').textContent = '0';
    document.getElementById('computerScore').textContent = '0';
    resetBall();
    draw();
}

// Reset ball to center
function resetBall() {
    ball.x = canvas.width / 2;
    ball.y = canvas.height / 2;
    const angle = (Math.random() - 0.5) * Math.PI / 4;
    const direction = Math.random() > 0.5 ? 1 : -1;
    ball.dx = Math.cos(angle) * ball.speed * direction;
    ball.dy = Math.sin(angle) * ball.speed;
}

// Update player paddle position
function updatePlayer() {
    // Mouse control
    if (mouseY > 0 && mouseY < canvas.height) {
        player.y = mouseY - paddleHeight / 2;
    }
    
    // Arrow keys control
    if (keys['ArrowUp'] && player.y > 0) {
        player.y -= paddleSpeed;
    }
    if (keys['ArrowDown'] && player.y < canvas.height - paddleHeight) {
        player.y += paddleSpeed;
    }

    // Keep player paddle in bounds
    if (player.y < 0) player.y = 0;
    if (player.y > canvas.height - paddleHeight) {
        player.y = canvas.height - paddleHeight;
    }
}

// Update computer paddle (AI)
function updateComputer() {
    const computerCenter = computer.y + paddleHeight / 2;
    const difficulty = 4; // Adjust for difficulty (higher = easier)
    
    if (computerCenter < ball.y - difficulty) {
        computer.y += paddleSpeed * 0.8;
    } else if (computerCenter > ball.y + difficulty) {
        computer.y -= paddleSpeed * 0.8;
    }

    // Keep computer paddle in bounds
    if (computer.y < 0) computer.y = 0;
    if (computer.y > canvas.height - paddleHeight) {
        computer.y = canvas.height - paddleHeight;
    }
}

// Update ball position
function updateBall() {
    ball.x += ball.dx;
    ball.y += ball.dy;

    // Ball collision with top and bottom walls
    if (ball.y - ball.size < 0 || ball.y + ball.size > canvas.height) {
        ball.dy = -ball.dy;
        ball.y = ball.y - ball.size < 0 ? ball.size : canvas.height - ball.size;
    }

    // Ball collision with paddles
    if (
        ball.x - ball.size < player.x + player.width &&
        ball.y > player.y &&
        ball.y < player.y + player.height
    ) {
        ball.dx = -ball.dx;
        ball.x = player.x + player.width + ball.size;
        
        // Add spin based on paddle position
        const deltaY = ball.y - (player.y + player.height / 2);
        ball.dy = deltaY * 0.2;
    }

    if (
        ball.x + ball.size > computer.x &&
        ball.y > computer.y &&
        ball.y < computer.y + computer.height
    ) {
        ball.dx = -ball.dx;
        ball.x = computer.x - ball.size;
        
        // Add spin based on paddle position
        const deltaY = ball.y - (computer.y + computer.height / 2);
        ball.dy = deltaY * 0.2;
    }

    // Ball out of bounds (score)
    if (ball.x < 0) {
        computer.score++;
        document.getElementById('computerScore').textContent = computer.score;
        resetBall();
    }
    if (ball.x > canvas.width) {
        player.score++;
        document.getElementById('playerScore').textContent = player.score;
        resetBall();
    }
}

// Draw game objects
function draw() {
    // Clear canvas
    ctx.fillStyle = 'rgba(26, 26, 46, 0.1)';
    ctx.fillRect(0, 0, canvas.width, canvas.height);

    // Draw center line
    ctx.strokeStyle = 'rgba(255, 255, 255, 0.2)';
    ctx.setLineDash([5, 5]);
    ctx.beginPath();
    ctx.moveTo(canvas.width / 2, 0);
    ctx.lineTo(canvas.width / 2, canvas.height);
    ctx.stroke();
    ctx.setLineDash([]);

    // Draw player paddle
    ctx.fillStyle = '#00ff88';
    ctx.fillRect(player.x, player.y, player.width, player.height);
    ctx.shadowColor = '#00ff88';
    ctx.shadowBlur = 10;

    // Draw computer paddle
    ctx.fillStyle = '#ff6b6b';
    ctx.fillRect(computer.x, computer.y, computer.width, computer.height);
    ctx.shadowColor = '#ff6b6b';
    ctx.shadowBlur = 10;

    // Draw ball
    ctx.fillStyle = '#ffff00';
    ctx.beginPath();
    ctx.arc(ball.x, ball.y, ball.size, 0, Math.PI * 2);
    ctx.fill();
    ctx.shadowColor = '#ffff00';
    ctx.shadowBlur = 15;

    ctx.shadowColor = 'transparent';
}

// Game loop
function gameLoop() {
    if (!gameRunning) return;

    updatePlayer();
    updateComputer();
    updateBall();
    draw();

    requestAnimationFrame(gameLoop);
}

// Initial draw
draw();