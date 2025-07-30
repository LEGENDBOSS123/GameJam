import Circle from "./Circle.mjs";
import Stick from "./Stick.mjs";
import World from "./World.mjs";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

let tps = 60;
let deltaTime = 1000 / tps;
let nowTime = performance.now();
let accumulatedTime = 0;
let lastFrameTime = 0;
let frameCount = 0;
let fps = 0;
let lastSecondTime = 0;
let pageOutTime = 0;
let pageOutDuration = 0;


let player = new Circle([canvas.width / 2, canvas.height / 2]);
const world = new World();

let playerBalls = [
    player,
    new Circle([canvas.width / 2, canvas.height / 2 + 20]),
    new Circle([canvas.width / 2, canvas.height / 2 + 40]),
    new Circle([canvas.width / 2, canvas.height / 2 + 60]),
    new Circle([canvas.width / 2, canvas.height / 2 + 80]),
    new Circle([canvas.width / 2, canvas.height / 2 + 100]),
    new Circle([canvas.width / 2, canvas.height / 2 + 120]),
    new Circle([canvas.width / 2, canvas.height / 2 + 140]),
    new Circle([canvas.width / 2, canvas.height / 2 + 160]),
    new Circle([canvas.width / 2, canvas.height / 2 + 180], true),
]

playerBalls.forEach(e => world.add(e));
for (let i = 0; i < playerBalls.length - 1; i++) {
    world.add(new Stick(playerBalls[i].id, playerBalls[i + 1].id, Circle.radius * 2));
}



const cols = 800 / (Circle.radius * 2); // 40
const rows = 600 / (Circle.radius * 2); // 30


// border
const padding = 2;

for (let i = 0; i < cols; i++) {
    for (let j = 0; j < rows; j++) {
        if (i >= padding && i < cols - padding &&
            j >= padding && j < rows - padding) {
            continue;
        }

        const x = i * Circle.radius * 2 + Circle.radius;
        const y = j * Circle.radius * 2 + Circle.radius;

        world.add(new Circle([x, y], true));
    }
}



const keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
});
document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
})

const drawText = function (color, font, text, x, y, ctx) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}
const draw = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);
    world.draw(ctx);
    drawText("black", "14px Arial", "FPS: " + Math.round(fps), 10, 20, ctx);
}


document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        pageOutTime = performance.now();
    }
    else {
        pageOutDuration = performance.now() - pageOutTime;
    }
});


const update = function () {
    const accel = 0.0001;
    player.acceleration[0] = keys["ArrowLeft"] ? -accel : keys["ArrowRight"] ? accel : 0;
    player.acceleration[1] = keys["ArrowUp"] ? -accel : keys["ArrowDown"] ? accel : accel;

    if (keys["r"]) {
        player.position[0] = canvas.width / 2;
        player.position[1] = canvas.height / 2;
        player.lastPosition[0] = canvas.width / 2;
        player.lastPosition[1] = canvas.height / 2;
    }
    for (let i = 0; i < 1; i++) {
        world.step(deltaTime);
    }

}

const animate = function (currentTime) {
    const deltaTime = currentTime - lastFrameTime;
    lastFrameTime = currentTime;
    frameCount++;
    if (currentTime >= lastSecondTime + 1000) {
        fps = frameCount;
        frameCount = 0;
        lastSecondTime = currentTime;
    }
    accumulatedTime += performance.now() - nowTime;
    accumulatedTime -= pageOutDuration;
    pageOutDuration = 0;
    while (accumulatedTime >= deltaTime) {
        update();
        accumulatedTime -= deltaTime;
    }
    nowTime = performance.now();
    draw();
    requestAnimationFrame(animate);
}

animate();