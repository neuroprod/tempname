import Vec2 from "../math/Vec2";
import Color from "../math/Color";


import SDFFont, {SDFChar} from "./SDFFont.ts";

export default class SDFBatch {
    public indices: Array<number> = [];
    public vertices: Array<number> = [];
    private indicesPos: number = 0;
    private startPos!: Vec2;

    constructor() {
    }



    addLine(pos: Vec2, text: string, fontSize: number, color: Color) {
        this.startPos = pos.clone();


        fontSize =5;//1/42*fontSize ;

      //  let rect = new Rect(startPos, Font.charSize);
        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i);

            let char =SDFFont.charArray[c];


            this.addChar( char, color,fontSize);
            //startPos.x += Font.charSize.x;
            //rect.pos = startPos.clone();
        }

    }

    addChar( char: SDFChar, color: Color,fontSize:number) {



        let posX = this.startPos.x +char.xOffset*fontSize;
        let posY = this.startPos.y+char.yOffset*fontSize;
        //
        //
        //
        // this.startPos.x+=char.


        this.vertices = this.vertices.concat(
            [posX,posY+char.h*fontSize],//tl
            char.uv0.getArray(),
            color.getArray(),
            [posX+char.w*fontSize,posY+char.h*fontSize],//tr
            char.uv1.getArray(),
            color.getArray(),
            [posX,posY],//bl
            char.uv2.getArray(),
            color.getArray(),
            [posX+char.w*fontSize,posY],//br
            char.uv3.getArray(),
            color.getArray()
        );

        this.indices.push(
            this.indicesPos,
            this.indicesPos + 1,
            this.indicesPos + 3
        );
        this.indices.push(
            this.indicesPos,
            this.indicesPos + 2,
            this.indicesPos + 3
        );
        this.indicesPos += 4;

        this.startPos.x+=char.xadvance*fontSize
    }

    clear() {
        this.indices = [];
        this.vertices = [];
        this.indicesPos = 0;
    }
}
