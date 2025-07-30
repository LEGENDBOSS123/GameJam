import Box from "./Box.mjs";
import Circle from "./Circle.mjs";
import SoundManager from "./SoundManager.mjs";
import Stick from "./Stick.mjs";
import World from "./World.mjs";
import Level1 from "./Level1.mjs";
import Vector2 from "./Vector2.mjs";

const canvas = document.getElementById('gameCanvas');
const ctx = canvas.getContext('2d');

const soundManager = new SoundManager();
soundManager.addSounds({
    "explosion": "explosion.mov",
})


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

let currentZoom = 1.0;
const ZOOM_FACTOR = 1.1;


function screenToWorld(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    const canvasX = clientX - rect.left; // X relative to canvas element
    const canvasY = clientY - rect.top; // Y relative to canvas element

    const worldX = (canvasX - cameraX) / currentZoom;
    const worldY = (canvasY - cameraY) / currentZoom;
    return [worldX, worldY];
}

// selected shape handler
let selectedShape = "";
let lastShape = null;
let mouse = [0, 0];
document.getElementById("boxTypeBtn").addEventListener("click", function () {
    selectedShape = "box";
})
document.getElementById("circleTypeBtn").addEventListener("click", function () {
    selectedShape = "circle";
})
document.getElementById("stickTypeBtn").addEventListener("click", function () {
    selectedShape = "stick";
    lastShape = null;
})
canvas.addEventListener("click", function (event) {
    mouse = [event.clientX, event.clientY];
    if (selectedShape == "circle") {
        world.add(new Circle(screenToWorld(event.clientX, event.clientY), document.getElementById("isStaticInput").checked, [0, 0.0001]));
    }
    else if(selectedShape == "stick"){
        if(lastShape == null){
            const c = new Circle(screenToWorld(event.clientX, event.clientY), document.getElementById("isStaticInput").checked);
            world.add(c);
            lastShape = c.id;
        }
        else{
            const c = new Circle(screenToWorld(event.clientX, event.clientY), document.getElementById("isStaticInput").checked);
            world.add(c);
            world.add(new Stick(lastShape, c.id, Vector2.distanceArrays(
                world.all[lastShape].position,
                world.all[c.id].position
            )));
            lastShape = c.id;
        }
    }
})



let cameraX = 0;
let cameraY = 0;

const cameraSmoothness = 1;



//zoom in
document.getElementById("zoomInBtn").addEventListener("click", function () {
    currentZoom *= ZOOM_FACTOR;
})
document.getElementById("zoomOutBtn").addEventListener("click", function () {
    currentZoom /= ZOOM_FACTOR;
})


// visibility handler
document.addEventListener('visibilitychange', function () {
    if (document.hidden) {
        pageOutTime = performance.now();
    }
    else {
        pageOutDuration = performance.now() - pageOutTime;
    }
});



// key handler
const keys = {};
document.addEventListener('keydown', function (event) {
    keys[event.key] = true;
});
document.addEventListener('keyup', function (event) {
    keys[event.key] = false;
})




let player = new Circle([canvas.width / 2, canvas.height / 2]);
const world = new World();

top.world = world;

let playerBalls = [
    player
]

playerBalls.forEach(e => world.add(e));
for (let i = 0; i < playerBalls.length - 1; i++) {
    world.add(new Stick(playerBalls[i].id, playerBalls[i + 1].id, Circle.radius * 2));
}


world.parseJSON(Level1);




const drawText = function (color, font, text, x, y, ctx) {
    ctx.fillStyle = color;
    ctx.font = font;
    ctx.fillText(text, x, y);
}


const draw = function () {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    const targetCameraX = canvas.width / 2 - player.position[0] * currentZoom;
    const targetCameraY = canvas.height / 2 - player.position[1] * currentZoom;
    cameraX += (targetCameraX - cameraX) * cameraSmoothness;
    cameraY += (targetCameraY - cameraY) * cameraSmoothness;
    ctx.save();
    ctx.translate(cameraX, cameraY);
    ctx.scale(currentZoom, currentZoom);
    world.draw(ctx);

    ctx.restore();
    drawText("black", "14px Arial", "FPS: " + Math.round(fps), 10, 20, ctx);
}



const update = function () {
    const accel = 0.0001;
    player.acceleration[0] = keys["ArrowLeft"] ? -accel : keys["ArrowRight"] ? accel : 0;
    player.acceleration[1] = keys["ArrowUp"] ? -accel : keys["ArrowDown"] ? accel : 0;

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