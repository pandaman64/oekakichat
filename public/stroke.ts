/// <reference path="point.ts" />
/// <reference path="motion.ts" />
/// <reference path="brush.ts" />

class Stroke {
    type = "Stroke";
    public path: Motion<Point>;
    constructor(public brush: Brush) {
        this.path = new Motion<Point>();
    }
}