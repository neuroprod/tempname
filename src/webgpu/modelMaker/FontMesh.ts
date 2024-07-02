import Mesh from "../lib/mesh/Mesh.ts";


import Font, {Char} from "../data/Font.ts";

export default class FontMesh extends Mesh{
    private startX: number =0;
    private posTemp:Array<number> =[]
    private uvTemp:Array<number> =[]
    private normalTemp:Array<number> =[]
    private indexTemp:Array<number> =[]
    private indicesPos: number=0;

    setText(text: string,font:Font){
        this.startX =0;
        this.indicesPos =0;

        for (let i = 0; i < text.length; i++) {
            let c = text.charCodeAt(i);

            let char =font.charArray[c];


            this.addChar( char,0.003);
            //startPos.x += Font.charSize.x;
            //rect.pos = startPos.clone();
        }

        this.setPositions(new Float32Array(this.posTemp))
        this.setNormals(new Float32Array(this.normalTemp))
        this.setUV0(new Float32Array(this.uvTemp))
        this.setIndices(new Uint16Array(this.indexTemp))


        this.posTemp =[];
        this.normalTemp =[];
        this.uvTemp =[];
        this.indexTemp =[];

    }


    addChar( char: Char,fontSize:number) {



        let posX = this.startX +char.xOffset*fontSize;;
        let posY = char.yOffset*fontSize;
        //
        //
        //
        // this.startPos.x+=char.
        this.posTemp.push(posX,(posY+char.h*fontSize )*-1,0)
        this.posTemp.push(posX+char.w*fontSize,(posY+char.h*fontSize)*-1,0)
        this.posTemp.push(posX,posY*-1,0)
        this.posTemp.push(posX+char.w*fontSize,posY*-1,0)

        this.uvTemp = this.uvTemp.concat( char.uv0.getArray())
        this.uvTemp = this.uvTemp.concat( char.uv1.getArray())
        this.uvTemp = this.uvTemp.concat( char.uv2.getArray())
        this.uvTemp = this.uvTemp.concat( char.uv3.getArray())


        this.normalTemp.push(0,0,1)
        this.normalTemp.push(0,0,1)
        this.normalTemp.push(0,0,1)
        this.normalTemp.push(0,0,1)


        this.indexTemp.push(
            this.indicesPos,
            this.indicesPos + 1,
            this.indicesPos + 3
        );
        this.indexTemp.push(
            this.indicesPos,
            this.indicesPos + 3,
            this.indicesPos + 2
        );
        this.indicesPos += 4;

        this.startX+=char.xadvance*fontSize -3*fontSize
    }





}
