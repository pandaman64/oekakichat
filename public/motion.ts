class Motion<T>{
    type = "Motion";
    constructor(public values_: T[]= new Array<T>()) {
    }

    //access
    front(): T {
        return this.values_[0];
    }
    forEach(callback: (v: T, i: number) => void): void {
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