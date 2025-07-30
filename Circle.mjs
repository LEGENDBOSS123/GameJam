import Box from "./Box.mjs";
import Vector2 from "./Vector2.mjs"

export default class Circle {
    static radius = 10;
    constructor(position = [0, 0], isStatic = false, acceleration = [0, 0]) {
        this.position = position;
        this.lastPosition = [...position];
        this.acceleration = acceleration;
        this.id = -1;
        this.isStatic = isStatic;
        this.changed = isStatic;
        this.radius = Circle.radius;
        this.mass = 1;
    }

    draw(ctx) {
        ctx.beginPath();
        ctx.arc(this.position[0], this.position[1], this.radius, 0, 2 * Math.PI);
        ctx.fillStyle = "white";
        ctx.fill();
    }

    step(deltaTime) {
        if (this.isStatic) {
            return;
        }
        const oldPositionX = this.position[0];
        const oldPositionY = this.position[1];
        this.position[0] = 2 * this.position[0] - this.lastPosition[0] + this.acceleration[0] * deltaTime * deltaTime;
        this.position[1] = 2 * this.position[1] - this.lastPosition[1] + this.acceleration[1] * deltaTime * deltaTime;
        this.lastPosition[0] = oldPositionX;
        this.lastPosition[1] = oldPositionY;
    }

    doCollisionWith(circle) {
        if(circle instanceof Box){
            return circle.doCollisionWith(this);
        }
        if(circle.isStatic && this.isStatic){
            return false;
        }
        const overlapArray = Vector2.subtractArrays(this.position, circle.position);
        const distanceSquared = Vector2.magnitudeSquaredArray(overlapArray);
        const radiusSum = this.radius + circle.radius;
        if (distanceSquared > radiusSum * radiusSum) {
            return false;
        }

        const distance = Math.sqrt(distanceSquared);
        const overlap = radiusSum - distance;
        if(distance < 0.0001){
            return false;
        }
        const normal = Vector2.normalizeArray(overlapArray);

        const relax = 1;
        const totalMass = this.mass + circle.mass;
        let massRatio = circle.mass / totalMass;
        if(this.isStatic){
            massRatio = 0;
        }
        else if(circle.isStatic){
            massRatio = 1;
        }

        this.position[0] += normal[0] * overlap * massRatio * relax;
        this.position[1] += normal[1] * overlap * massRatio * relax;
        circle.position[0] -= normal[0] * overlap * (1 - massRatio) * relax;
        circle.position[1] -= normal[1] * overlap * (1 - massRatio) * relax;

        return true;
    }


    toJSON(){
        return {
            position: this.position,
            isStatic: this.isStatic,
            radius: this.radius
        }
    }

    static fromJSON(json){
        const circle = new Circle(json.position, json.isStatic);
        circle.radius = json.radius;
        return circle;
    }

}