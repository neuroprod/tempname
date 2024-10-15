import fontdata from "./bold.json"
import Vec2 from "../lib/UI/math/Vec2.ts";



export class Char{
    w: number = 0;
    h: number = 0;
    uvSize: Vec2 = new Vec2();
    uvPos: Vec2 = new Vec2();


    uv0: Vec2 = new Vec2();
    uv1: Vec2 = new Vec2();
    uv2: Vec2 = new Vec2();
    uv3: Vec2 = new Vec2();



    xadvance: number = 0;
    xOffset: number = 0;
    yOffset: number = 0;
    char: string="";
    constructor(data:any) {
        if (!data) return;

        this.w = data.width ;
        this.h = data.height ;
        this.xadvance = data.xadvance;
        this.xOffset = data.xoffset;
        this.yOffset = data.yoffset;


        this.uvSize = new Vec2(data.width / 512, data.height / 512)
        this.uvPos = new Vec2(data.x / 512, data.y / 512)
        this.uv0.set((this.uvPos.x),(this.uvPos.y+this.uvSize.y))
        this.uv1.set((this.uvPos.x+this.uvSize.x),(this.uvPos.y+this.uvSize.y))
        this.uv2.set((this.uvPos.x),this.uvPos.y)
        this.uv3.set((this.uvPos.x+this.uvSize.x),this.uvPos.y)

        this.char =data.char;

    }


}
export default class Font{
   charArray = new Array<Char>(200);
    constructor() {



        for (let data of fontdata.chars) {
            this.charArray[data.id] = new Char(data)

        }


    }



}
