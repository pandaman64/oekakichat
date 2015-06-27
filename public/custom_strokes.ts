/// <reference path="point.ts">
/// <reference path="motion.ts">
/// <reference path="brush.ts">
/// <reference path="stroke.ts">

class Pen implements Brush {
    type = "Pen";
    constructor(public color: String, public size: number) { }

    draw(ctx: CanvasRenderingContext2D, path: Motion<Point>): void {
        if (path.empty()) {
            return;
        }
        ctx.beginPath();
        ctx.strokeStyle = this.color;
        ctx.lineWidth = this.size;
        ctx.moveTo(path.front().x, path.front().y);
        path.forEach(
            (v, i) => {
                ctx.lineTo(v.x, v.y);
            });
        ctx.stroke();
    }
}

class BreakLineCircle implements Brush {
    type = "BreakLineCircle";
    constructor(public color: String, public size: number) { }

    draw(ctx: CanvasRenderingContext2D, path: Motion<Point>): void {
        path.forEach((v, i) => this.drawArc(ctx, v));
    }

    drawArc(ctx: CanvasRenderingContext2D, pt: Point) {
        ctx.lineWidth = 1;
        ctx.strokeStyle = this.color;
        for (var i = 0; i < 12; i++) {
            ctx.beginPath();
            ctx.arc(pt.x, pt.y, this.size, 2 * i * Math.PI / 12, (2 * i + 1) * Math.PI / 12);
            ctx.stroke();
        }
    }
}