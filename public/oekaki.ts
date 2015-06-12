class BaseField {
    mousedown = false;
    brush_history: Stroke[] = new Array();
    brush_size = 10;
    sock = new WebSocket("ws://127.0.0.1:8080/ws/chat");
    color = random_color();

    constructor(public base_field: HTMLCanvasElement) {
        this.base_field.onmousedown = ev => {
            this.mousedown = true;
            this.brush_history.push(new Stroke(new Pen(this.color, this.brush_size)));
        }
        this.base_field.onmouseup = ev => {
            this.mousedown = false;
            this.sock.send(JSON.stringify(flatten(this.brush_history[this.brush_history.length - 1])));
            //this.draw();
        }
        this.base_field.onmousemove = ev => {
            var val = this.getMouseRelativePosition(ev);
            if (this.mousedown) {
                this.brush_history[this.brush_history.length - 1].path.push(val);
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
    }

    clearField(): void {
        var ctx = this.base_field.getContext("2d");
        ctx.clearRect(0, 0, this.base_field.width, this.base_field.height);
    }
    
    clearHistory(): void {
        this.brush_history = new Array();
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

interface Point {
    x: number;
    y: number;
}

class Motion<T>{
    constructor(public values_:T[] = new Array<T>()) {
    }

    //access
    front(): T {
        return this.values_[0];
    }
    forEach(callback: (v:T, i:number) => void): void{
        this.values_.forEach(
            (val, index, array) => {
                callback(val, index);
            });
    }

    //length
    length(): number {
        return this.values_.length;
    }
    empty(): boolean {
        return this.length() === 0;
    }

    //modify
    push(v: T): void {
        if (this.empty() || this.values_[this.values_.length - 1] !== v) {
            this.values_.push(v);
        }
    }
    pop(): void {
        this.values_.shift();
    }
    clear(): void {
        this.values_ = new Array<T>();
    }
}

class DrawOption {
}

interface Brush {
    draw(ctx: CanvasRenderingContext2D, path:Motion<Point>, args?: DrawOption): void;
}

class Stroke {
    public path: Motion<Point>;
    constructor(public brush: Brush) {
        this.path = new Motion<Point>();
    }
}

class Pen implements Brush {
    constructor(public color: String,public size:number) { }

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
    constructor(public color: String, public size: number) { }

    draw(ctx: CanvasRenderingContext2D, path: Motion<Point>): void {
        path.forEach((v, i) => this.drawArc(ctx,v));
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

window.onload = () => {
    var base_field = new BaseField(<HTMLCanvasElement> document.getElementById("base_field"));
    (<HTMLButtonElement> document.getElementById("clear_button")).onclick = (ev) => {
        base_field.clearHistory();
        base_field.clearField();
    };

    var brush = new BreakLineCircle("#000000", this.brush_size);
    var ctx = base_field.base_field.getContext("2d");
    var p = new Motion<Point>();
    p.push({ x: 50, y: 50 });
    brush.draw(ctx, p);
};

