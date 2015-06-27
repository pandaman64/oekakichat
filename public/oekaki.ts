/// <reference path="custom_strokes.ts">

class BaseField {
    mousedown = false;
    brush_history: Stroke[] = new Array();
    working_stroke: Stroke = null;
    brush_size = 10;
    sock = new WebSocket("ws://127.0.0.1:8080/ws/chat");
    color = random_color();

    constructor(public base_field: HTMLCanvasElement) {
        this.base_field.onmousedown = ev => {
            //ignore if not left button
            if (ev.button != 0) {
                return;
            }
            this.mousedown = true;
            this.working_stroke = new Stroke(new Pen(this.color, this.brush_size));
        }
        this.base_field.onmouseup = ev => {
            //ignore if not left button
            if (ev.button != 0) {
                return;
            }
            this.mousedown = false;
            this.sock.send(JSON.stringify(flatten(this.working_stroke)));
            //this.draw();
        }
        this.base_field.onmousemove = ev => {
            var val = this.getMouseRelativePosition(ev);
            if (this.mousedown) {
                this.working_stroke.path.push(val);
            }

            this.clearField();
            this.draw();
            var brush = new BreakLineCircle(this.color, this.brush_size);
            var ctx = this.base_field.getContext("2d");
            var p = new Motion<Point>();
            p.push(val);
            brush.draw(ctx, p);
        };
        (<any>this.base_field).onwheel = ev => {
            //For FireFox
            this.brush_size -= ev.deltaY;
            if (this.brush_size <= 0) {
                this.brush_size = 1;
            }
        };
        this.sock.onmessage = ev => {
            console.log(ev);
            var stroke_tmp: Stroke = JSON.parse(ev.data);
            var pen_data = <Pen> stroke_tmp.brush;
            
            var stroke: Stroke = { path:new Motion<Point>(stroke_tmp.path.values_) , brush: new Pen(pen_data.color, pen_data.size) };
            this.brush_history.push(stroke);
            this.clearField();
            this.draw();
        };
    }

    getMouseRelativePosition(ev: MouseEvent): Point {
        var client_rect = (<HTMLElement> ev.target).getBoundingClientRect();
        return {
            x: ev.clientX - client_rect.left,
            y: ev.clientY - client_rect.top
        };
    }

    draw(): void {
        var ctx = this.base_field.getContext("2d");
        this.brush_history.forEach(
            (val, index, arr) => {
                /*ctx.beginPath();
                ctx.moveTo(val.front().x, val.front().y);
                val.forEach((v, i) => ctx.lineTo(v.x, v.y));
                ctx.stroke();*/
                val.brush.draw(ctx, val.path);
            });
        if (this.working_stroke !== null) {
            this.working_stroke.brush.draw(ctx, this.working_stroke.path);
        }
    }

    clearField(): void {
        var ctx = this.base_field.getContext("2d");
        ctx.clearRect(0, 0, this.base_field.width, this.base_field.height);
    }
    
    clearHistory(): void {
        this.brush_history = new Array();
        this.working_stroke = null;
    }

    undo(): void {
        this.brush_history.pop();
        this.clearField();
        this.draw();
    }
}

function flatten(val: any): any {
    var result: Object = Object.create(val);
    for (var key in result) {
        result[key] = result[key];
    }
    return result;
}

function random_color(): string {
    //6 levels of brightness from 0 to 5, 0 being the darkest
    var brightness = 4;
    var rgb = [Math.random() * 256, Math.random() * 256, Math.random() * 256];
    var mix = [brightness * 51, brightness * 51, brightness * 51]; //51 => 255/5
    var mixedrgb = [rgb[0] + mix[0], rgb[1] + mix[1], rgb[2] + mix[2]].map(function (x) { return Math.round(x / 2.0) })
    return "rgb(" + mixedrgb.join(",") + ")";
}

window.onload = () => {
    var base_field = new BaseField(<HTMLCanvasElement> document.getElementById("base_field"));
    (<HTMLButtonElement> document.getElementById("clear_button")).onclick = (ev) => {
        base_field.clearHistory();
        base_field.clearField();
    };
};

