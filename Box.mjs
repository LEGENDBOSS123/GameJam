export default class Box {
    constructor(x, y, width, height, patternName = "floor") {
        this.x = x;
        this.y = y;
        this.width = width;
        this.height = height;
        this.patternName = patternName;
    }

    draw(world, options) {
        const ctx = options.ctx;

        ctx.fillStyle = options[this.patternName];
        ctx.fillRect(this.x, this.y, this.width, this.height);
    }

    drawLayer2(world, options) {
        const ctx = options.ctx;

        ctx.fillStyle = options[this.patternName];
        ctx.globalAlpha = 0.4;
        ctx.translate(this.x + (options.player.position[0] - this.x - this.width/2) * 0.035, 0);
        ctx.fillRect(0, this.y - Math.min(10, this.height * 0.1), this.width, this.height);
        ctx.translate(-(this.x + (options.player.position[0] - this.x - this.width/2) * 0.035),0);
        ctx.globalAlpha = 1;
    }

    doCollisionWith(circle) {
        const closestX = Math.max(this.x, Math.min(circle.position[0], this.x + this.width));
        const closestY = Math.max(this.y, Math.min(circle.position[1], this.y + this.height));

        const deltaX = circle.position[0] - closestX;
        const deltaY = circle.position[1] - closestY;

        const distanceSquared = (deltaX * deltaX) + (deltaY * deltaY);
        const radiusSquared = circle.radius * circle.radius;

        if (distanceSquared > radiusSquared) {
            return false;
        }

        if (distanceSquared === 0) {
            const overlap = circle.radius;
            circle.position[1] = this.y - circle.radius;
            return true;
        }


        const distance = Math.sqrt(distanceSquared);
        const overlap = circle.radius - distance;

        const normalX = deltaX / distance;
        const normalY = deltaY / distance;

        circle.position[0] += normalX * overlap;
        circle.position[1] += normalY * overlap;

        return true;
    }

    toJSON() {
        return {
            x: this.x,
            y: this.y,
            width: this.width,
            height: this.height,
            patternName: this.patternName
        }
    }

    static fromJSON(json) {
        return new Box(
            json.x,
            json.y,
            json.width,
            json.height,
            json.patternName
        )
    }
}