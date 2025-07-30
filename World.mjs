import Circle from "./Circle.mjs";
import Hashmap from "./Hashmap.mjs";
import Stick from "./Stick.mjs";

export default class World {

    constructor() {
        this.circles = [];
        this.sticks = [];
        this.all = {};
        this.maxId = 0;
        this.hashmap = new Hashmap();
        this.staticHashMap = new Hashmap();
        this.pairs = new Map();
    }

    addPair(circle1, circle2, _this) {
        if (circle1.id > circle2.id) {
            _this.pairs.set(circle2.id + "," + circle1.id, [circle2, circle1]);
        }
        else {
            _this.pairs.set(circle1.id + "," + circle2.id, [circle1, circle2]);
        }
    }

    add(obj) {
        obj.id = this.maxId++;
        if (obj instanceof Circle) {
            this.circles.push(obj);
            this.all[obj.id] = obj;
        }
        else if (obj instanceof Stick) {
            this.sticks.push(obj);
            this.all[obj.id] = obj
        }
    }

    draw(ctx) {
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].draw(ctx);
        }
    }

    step(deltaTime) {
        this.hashmap.clear();
        for (let i = 0; i < this.circles.length; i++) {
            this.circles[i].step(deltaTime);
        }
        for(let i = 0; i < this.sticks.length; i++){
            this.sticks[i].step(this);
        }
        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].isStatic) {
                if (this.circles[i].changed) {
                    this.staticHashMap.insert(this.circles[i]);
                    this.circles[i].changed = false;
                }
                continue;
            }
            this.hashmap.insert(this.circles[i]);
        }

        for (let i = 0; i < this.circles.length; i++) {
            if (this.circles[i].isStatic) {
                continue;
            }
            this.hashmap.query(this.circles[i], this.addPair, this);
            this.staticHashMap.query(this.circles[i], this.addPair, this);
        }

        for (let [key, value] of this.pairs) {
            value[0].doCollisionWith(value[1]);
        }
    }
}