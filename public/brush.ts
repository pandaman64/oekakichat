/// <reference path="point.ts">
/// <reference path="motion.ts">

class DrawOption {
}

interface Brush {
    draw(ctx: CanvasRenderingContext2D, path: Motion<Point>, args?: DrawOption): void;
    type: string;
}