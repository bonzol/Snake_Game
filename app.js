const board = document.getElementById("snakeboard");
const ctx = board.getContext("2d");
var BOARD_WIDTH = 400;
var BOARD_HEIGHT = 400;
var SNAKE_WIDTH = Math.sqrt(BOARD_WIDTH);
var SNAKE_HEIGHT = Math.sqrt(BOARD_HEIGHT);
var SNAKE_SPEED = 160;
var BOARD_COLOR = "#5adaaf";
var SNAKE_COLOR = "#000000";
var SNAKE_HEAD_COLOR = "#FFFFFF";
var FOOD_COLOR = "#FF0000";
var scores = [];

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
            return SNAKE_SPEED - snake.level*10;
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

// switch case for arrow key log
function logKey(e) {
    switch(e.key) {
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

    var snake;
    var startFirst = false;

function init() {
    document.getElementById("snakeboard").style.backgroundColor = BOARD_COLOR;
    document.getElementById("boardColor").value = BOARD_COLOR;
    document.getElementById("SnakeColor").value = SNAKE_COLOR;
    document.getElementById("SnakeHeadColor").value = SNAKE_HEAD_COLOR;
    document.getElementById("FoodColor").value = FOOD_COLOR;
    document.getElementById("speed").value = 370;
    board.style.width = BOARD_WIDTH + "px";
    board.style.height = BOARD_HEIGHT + "px";
    if(localStorage.getItem('scores') == undefined) {
        localStorage.setItem('scores', JSON.stringify(scores));
    } else {
        scores = JSON.parse(localStorage.getItem('scores'));
    }
    buildScores()
}

function buildScores() {
    if(scores.length > 0) {
        var tbody = document.getElementById("scores");
        tbody.innerHTML = "";
        for(let i = 0; i < scores.length; i++) {
           tbody.innerHTML += "<tr><td>" + scores[i] + "</td></tr>"
        }
    }
}

function start() {
    if(startFirst) {
        startAgain();
    }
    startFirst = true;
    snake = new SnakeModel();
    document.getElementById("score").innerHTML = snake.points;
    document.getElementById("level").innerHTML = "Level " + snake.level;
    SNAKE_SPEED = 500 - document.getElementById("speed").value;
    BOARD_COLOR = document.getElementById("boardColor").value;
    document.getElementById("snakeboard").style.backgroundColor = BOARD_COLOR;
    SNAKE_COLOR = document.getElementById("SnakeColor").value;
    SNAKE_HEAD_COLOR = document.getElementById("SnakeHeadColor").value;
    FOOD_COLOR = document.getElementById("FoodColor").value;
    document.addEventListener('keydown', logKey);
    buildSnake();
    repeater = setInterval(move, snake.speed());
    buildFood();
}


function buildSnake() {
    snake.place.forEach((p) => {
        if(JSON.stringify(snake.place[0]) === JSON.stringify(p) ) { 
            ctx.fillStyle = SNAKE_HEAD_COLOR;
            ctx.fillRect(p.x, p.y, snake.size.width, snake.size.height)
        } else {
            ctx.fillStyle = SNAKE_COLOR;
            ctx.fillRect(p.x, p.y, snake.size.width, snake.size.height)
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
        document.getElementById("level").innerHTML = "Level " + snake.level;
        growSnake();
        buildFood();
    }
}

function checkLevel() {
    snake.level = Math.floor(snake.points/100)+1;
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


function stopGame() {
    clearInterval(repeater);
    let newScore = parseInt(document.getElementById("score").innerHTML);
    if(!scores.includes(newScore)) {
        scores.push(newScore);
        scores.sort((a,b) => {return a-b});
        if(scores.length > 7) {
            scores.shift();
        }
    }
    localStorage.setItem('scores', JSON.stringify(scores));
    buildScores();
    ctx.textAlign = "center";
    ctx.font = "60px Arial red";
    ctx.fillStyle = "red";    
    ctx.fillText("GAME OVER",200, 200);
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
    ctx.fillStyle = FOOD_COLOR;
    ctx.strokestyle = "#000000";
    ctx.fillRect(food.place.x, food.place.y, food.size.width, food.size.height);
}

function randomFoodPlace() {
    const isDiff = (p) => JSON.stringify(p) != JSON.stringify(cord);
    do {
        var cord = {
            x: (parseInt(Math.random()*20 +1))*20-20,
            y: (parseInt(Math.random()*20 +1))*20-20
        }
        snake.place.every(isDiff);
    } while(!isDiff);
    return cord;
}


function startAgain() {
    ctx.fillStyle = BOARD_COLOR;
    ctx.fillRect(0, 0, 400, 400);
    clearInterval(repeater);
}
