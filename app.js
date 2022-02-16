const board = document.getElementById("snakeboard");
const ctx = board.getContext("2d");
var BOARD_WIDTH = 400;
var BOARD_HEIGHT = 400;
var SNAKE_WIDTH = Math.sqrt(BOARD_WIDTH);
var SNAKE_HEIGHT = Math.sqrt(BOARD_HEIGHT);
var BOARD_COLOR = "#C5DDD6";
var SNAKE_COLOR = "#000000";
var SNAKE_HEAD_COLOR = "#FFFFFF";
var userLevel = 50;
var highScore;
var timeouts = [];

var foodImg1 = new Image();
foodImg1.src = "img/food1.png"
var foodImg2 = new Image();
foodImg2.src = "img/food2.png"
var foodImg3 = new Image();
foodImg3.src = "img/food3.png"
var foodImg4 = new Image();
foodImg4.src = "img/food4.png"
var foodImg5 = new Image();
foodImg5.src = "img/food5.png"
const foodImgs = [foodImg1, foodImg2, foodImg3, foodImg4, foodImg5];
var imgBomb = new Image();
imgBomb.src = "img/Bomb.png";
var imgBombEx = new Image();
imgBombEx.src = "img/BombEx.png";
var endBomb = new Image();
endBomb.src = "img/explosion.png";

class SnakeModel {
    constructor(){
        this.place = [
            { x:BOARD_WIDTH/2, y:BOARD_HEIGHT/2 },
            { x:BOARD_WIDTH/2-SNAKE_WIDTH, y:BOARD_HEIGHT/2 },
            { x:BOARD_WIDTH/2-SNAKE_WIDTH*2, y:BOARD_HEIGHT/2 }
        ];
        this.lastPlace = { x:BOARD_WIDTH/2-SNAKE_WIDTH*3, y:BOARD_HEIGHT/2 };
        this.size = {
            width: SNAKE_WIDTH,
            height: SNAKE_HEIGHT
        };
        this.direction = 'right'
        this.speed = function() {
            return 170 - userLevel - snake.level*10;
        };
        this.level = 1;
        this.points = 0;
    }
}

//the food
const food = {
    place: {
        x: 0,
        y: 0 
    },
    size: {
        width: 20,
        height: 20
    }
}
//the bomb
const bomb = {
    place: [],
    size: {
        width: 20,
        height: 20
    }
}

// switch case for arrow key log
function logKey(e) {
    keyDir(e.key);
}

function keyDir(dir) {
    switch(dir) {
        case 'ArrowUp':
            if(snake.direction === 'down') {
                break;
            }
            snake.direction = 'up';
            break;
        case 'ArrowDown':
            if(snake.direction === 'up') {
                break;
            }
            snake.direction = 'down';
            break;
        case 'ArrowLeft':
            if(snake.direction === 'right') {
                break;
            }
            snake.direction = 'left';
            break;
        case 'ArrowRight':
            if(snake.direction === 'left') {
                break;
            }
            snake.direction = 'right';
            break;
        default:
            return;
    }
}

var lastX;
var currX = 0;
var lastY;
var currY = 0;
var dir = 'ArrowRight';
function logKeyMove(e) {
    if(e.touches) {
        lastX = currX;
        currX = e.touches[0].pageX;
        lastY = currY;
        currY = e.touches[0].pageY;
        diffX = Math.abs(currX - lastX);
        diffY = Math.abs(currY - lastY);

        if(diffX > diffY && diffX > 0.5) {
            if(currX - lastX > 0) {
                dir = 'ArrowRight';
            } else {
                dir = 'ArrowLeft';
            }
        } else if (diffX < diffY && diffY > 0.5) {
            if(currY - lastY > 0) {
                dir = 'ArrowDown';
            } else {
                dir = 'ArrowUp';
            }
        }
        e.preventDefault();
    }
    keyDir(dir);
}

function is_touch_enabled() {
    return ( 'ontouchstart' in window ) ||
           ( navigator.maxTouchPoints > 0 ) ||
           ( navigator.msMaxTouchPoints > 0 );
}

    var snake = new SnakeModel();
    var startFirst = false;

function init() {
    board.style.width = BOARD_WIDTH + "px";
    board.style.height = BOARD_HEIGHT + "px";
    board.style.border = "2px solid black";
    document.body.style.backgroundColor = BOARD_COLOR;
    if(localStorage.getItem('highScore') == null) {
        highScore = 0;
        localStorage.setItem('highScore', highScore);
    } else {
        highScore = localStorage.getItem('highScore');
    }
    document.getElementById("highScore").innerText = "High Score: " + highScore; 
}

function start() {
    userLevel = document.getElementById("youAre").value;
    if(startFirst) {
        startAgain();
    }
    startFirst = true;
    if( is_touch_enabled() ) {
        board.addEventListener('touchstart', logKeyMove);
        board.addEventListener('touchmove', logKeyMove);
    }
    else {
        document.addEventListener('keydown', logKey);
    }
    buildSnake();
    repeater = setInterval(move, snake.speed());
    buildFood();
}


function buildSnake() {
    snake.place.forEach((p) => {
        if(JSON.stringify(snake.place[0]) === JSON.stringify(p) ) { 
            ctx.fillStyle = SNAKE_HEAD_COLOR;
            ctx.strokeStyle = BOARD_COLOR;
            ctx.fillRect(p.x, p.y, snake.size.width, snake.size.height);
            ctx.strokeRect(p.x, p.y, snake.size.width, snake.size.height)
        } else {
            ctx.fillStyle = SNAKE_COLOR;
            ctx.strokeStyle = BOARD_COLOR;
            ctx.fillRect(p.x, p.y, snake.size.width, snake.size.height)
            ctx.strokeRect(p.x, p.y, snake.size.width, snake.size.height)
        }
    })    
}

function move() {
    snake.lastPlace.x = snake.place[snake.place.length-1].x;
    snake.lastPlace.y = snake.place[snake.place.length-1].y;
    checkOutOfBounds();
    checkifEaten();
    next();
    buildSnake();
    ctx.clearRect(snake.lastPlace.x, snake.lastPlace.y, snake.size.width, snake.size.height);
    checkifEntwined();
    checkifEatBomb()
}

function next() {
    for(let i=snake.place.length-1; i > 0; i--) {
        snake.place[i].x = snake.place[i-1].x;
        snake.place[i].y = snake.place[i-1].y;
    }
    if(snake.direction === 'up') {
        snake.place[0].y -= 20;
    } else if(snake.direction === 'down') {
        snake.place[0].y += 20;
    } else if(snake.direction === 'right') {
        snake.place[0].x += 20;
    } else if(snake.direction === 'left') {
        snake.place[0].x -= 20;
    } 
}

function checkOutOfBounds() {
    if(snake.place[0].x < 0) {
        snake.place[0].x = 380;
    } else if(snake.place[0].x > 380) {
        snake.place[0].x = 0;
    } else if (snake.place[0].y < 0) {
        snake.place[0].y = 380;
    } else if(snake.place[0].y > 380) {
        snake.place[0].y = 0;
    }
}

function checkifEaten() {
    if(JSON.stringify(snake.place[0]) == JSON.stringify(food.place)) {
        snake.points += 10;
        checkLevel();
        document.getElementById("score").innerHTML = snake.points;
        growSnake();
        buildFood();
    }
}

function checkLevel() {
    snake.level = Math.floor(snake.points/(120-userLevel))+1;
    if(snake.points % 20 == 0) {
        for(let i = 0; i < snake.level; i++) {
            drawBomb = setTimeout(buildBomb, randomTimeBomb());
            timeouts.push(drawBomb);
        }
    }
    clearInterval(repeater);
    repeater = setInterval(move, snake.speed());
}

function checkifEntwined() {
    const setTemp = new Set();
    snake.place.forEach((p) => {
        setTemp.add(JSON.stringify(p));
    })
    if(setTemp.size != snake.place.length) {
        stopGame();
    }
}
function checkifEatBomb() {
    bomb.place.forEach((p) => {
        if(JSON.stringify(snake.place[0]) == JSON.stringify(p)) {
            ctx.drawImage(endBomb, 0, 0, 400, 400);
            stopGame();
        }
    })
}


function stopGame() {
    clearInterval(repeater);
    if(typeof clearBombTimeout !== 'undefined') {
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];
    }
    let newScore = parseInt(document.getElementById("score").innerHTML);
    if(newScore > highScore) {
        highScore = newScore;
        localStorage.setItem('highScore', highScore);
    }
    document.getElementById("highScore").innerText = "High Score: " + highScore; 
    ctx.textAlign = "center";
    ctx.font = "60px Verdana";
    ctx.fillStyle = "white";    
    ctx.fillText("GAME OVER",200, 220);
}

function growSnake() {
    if(snake.direction === 'right') {
        snake.place.push({ x:snake.place[snake.place.length-1].x-20, y:snake.place[snake.place.length-1].y })
    } else if(snake.direction === 'left') {
        snake.place.push({ x:snake.place[snake.place.length-1].x+20, y:snake.place[snake.place.length-1].y })
    } else if(snake.direction === 'up') {
        snake.place.push({ x:snake.place[snake.place.length-1].x, y:snake.place[snake.place.length-1].y-20 })
    } else if(snake.direction === 'down') {
        snake.place.push({ x:snake.place[snake.place.length-1].x, y:snake.place[snake.place.length-1].y+20 })
    }
}

function buildFood() {    
    var cordinate = randomFoodPlace();
    food.place.x = cordinate.x;
    food.place.y = cordinate.y;
    randomNum = Math.floor(Math.random() * 5);
    ctx.drawImage(foodImgs[randomNum], food.place.x, food.place.y, food.size.width, food.size.height);

}

function buildBomb() {    
    var cordinate = randomBombPlace();
    bomb.place.push({x: cordinate.x, y: cordinate.y});
    ctx.drawImage(imgBomb, cordinate.x, cordinate.y, bomb.size.width, bomb.size.height);
    clearBombTimeout = setTimeout(clearBomb, randomTime());
    timeouts.push(clearBombTimeout);
}

function clearBomb() {
    var lastBomb = bomb.place.shift();
    fillBomb();
    ctx.drawImage(imgBombEx, lastBomb.x, lastBomb.y, bomb.size.width, bomb.size.height);
    setTimeout(fillBomb, 165);
    function fillBomb() {
        ctx.fillStyle = BOARD_COLOR;
        ctx.fillRect(lastBomb.x, lastBomb.y, bomb.size.width, bomb.size.height);
    }
}

function randomTime() {
    var ranTime = Math.floor(Math.random()*8000) + snake.level*1000;
    return ranTime;
}

function randomTimeBomb() {
    var ranTime = Math.floor(Math.random()*3000);
    return ranTime;
}

function randomFoodPlace() {
    const Diff = (p) => JSON.stringify(p) != JSON.stringify(cord);
    let isDiff = false;
    do {
        var cord = {
            x: (parseInt(Math.random()*20))*20,
            y: (parseInt(Math.random()*20))*20
        }
        isDiff = snake.place.every(Diff) && bomb.place.every(Diff);
    } while(!isDiff);
    return cord;
}

function randomBombPlace() {
    const Diff = (p) => JSON.stringify(p) != JSON.stringify(cord);
    let isDiff = false;
    let nextHead = getNextHead();
    do {
        var cord = {
            x: (parseInt(Math.random()*20))*20,
            y: (parseInt(Math.random()*20))*20
        }
        isDiff = snake.place.every(Diff) && JSON.stringify(food.place) != JSON.stringify(cord) && JSON.stringify(cord) != JSON.stringify(nextHead[0]);
    } while(!isDiff);
    return cord;
}

function getNextHead() {
    let head = [{x: snake.place[0].x, y: snake.place[0].y}];
    if(snake.direction === 'up') {
        head[0].y -= 20;
    } else if(snake.direction === 'down') {
        head[0].y += 20;
    } else if(snake.direction === 'right') {
        head[0].x += 20;
    } else if(snake.direction === 'left') {
        head[0].x -= 20;
    } 
    return head;
}

function startAgain() {
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, 400, 400);
    clearInterval(repeater);
    if(typeof clearBombTimeout !== 'undefined') {
        for (var i = 0; i < timeouts.length; i++) {
            clearTimeout(timeouts[i]);
        }
        timeouts = [];
    }
    snake = new SnakeModel();
    document.getElementById("score").innerHTML = snake.points;
    bomb.place = [];
}
