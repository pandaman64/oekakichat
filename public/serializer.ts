module Serializer {
    export class Serializer {
        template_table = {};

        register(object: {type:string}): void {
            this.template_table[object.type] = object;
        }
        remove(type: string): void {
            delete this.template_table[type];
        }

        stringify(value: {type:string}):string {
            if (value === null || value === undefined) {
                throw new TypeError("null or undefined");
            }
            if(!(value.type in this.template_table)){
                console.log("this type of object has not been registered. ",value.type);
            }
            return JSON.stringify(flatten(value));
        }
        parse(json_text: string): any {
            var json = JSON.parse(json_text, (k, v) => {
                if (v === null || typeof (v) !== "object") {
                    return v;
                }
                //check if value is registered
                if (!("type" in v) || !(v.type in this.template_table)) {
                    return v;
                }
                return fill_property(this.template_table[v.type], v);
            });
            return json;
        }
    }

    function flatten(val: any): any {
        var result: Object = Object.create(val);
        for (var key in result) {
            result[key] = result[key];
        }
        return result;
    }
    function fill_property(empty: any, data: any): any {
        var ret = Object.create(empty);
        for (var key in data) {
            ret[key] = data[key];
        }
        return ret;
    }
} 
