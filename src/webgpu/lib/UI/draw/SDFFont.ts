

//https://www.npmjs.com/package/msdf-bmfont-xml

import Vec2 from "../math/Vec2.ts";

export class SDFChar {
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

    constructor(data: any) {
        if (!data) return;

        this.w = data.width ;
        this.h = data.height ;
        this.xadvance = data.xadvance;
        this.xOffset = data.xoffset ;
        this.yOffset = data.yoffset;


        this.uvSize = new Vec2(data.width / 512, data.height / 512)
        this.uvPos = new Vec2(data.x / 512, data.y / 512)
        this.uv0.set(this.uvPos.x,1-(this.uvPos.y+this.uvSize.y))
        this.uv1.set(this.uvPos.x+this.uvSize.x,1-(this.uvPos.y+this.uvSize.y))
        this.uv2.set(this.uvPos.x,1-this.uvPos.y)
        this.uv3.set(this.uvPos.x+this.uvSize.x,1-this.uvPos.y)




        this.char =data.char;

    }

}



export default class SDFFont {
    private json: any;

    static charArray: Array<SDFChar> = new Array<SDFChar>(200);

    constructor() {



        this.loadURL("Inter-Bold").then(() => {

        });

    }

    async loadURL(url: any) {


        const response = await fetch(url + ".json")
        let text = await response.text()
        this.json = JSON.parse(text)

        this.parseChars();

    }

  /*  getMesh(text: string, spacing: number = 0) {


        let lines = text.split("\n");
        let textLength = 0;
        for (let l of lines) {
            textLength += l.length;

        }

        let vertices = new Float32Array(textLength * 4 * 3)
        let uv = new Float32Array(textLength * 4 * 2)
        let indices = new Uint16Array(textLength * 2 * 3)
        let verticesCount = 0;
        let uvCount = 0;
        let indicesCount = 0;
        let indicesPos = 0;
        let yPos = 0;

        for (let l of lines) {
            let lineLength = l.length;
            let lineSize = 0

            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);
                if (c == 42) {
                    continue
                }
                let char = this.charArray[c];

                lineSize += char.xadvance + spacing
            }


            let xPos = 0;


            for (let i = 0; i < lineLength; i++) {
                let c = l.charCodeAt(i);

                let char = this.charArray[c];

                let offX = char.xOffset;
                let offY = char.yOffset;

                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y;


                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y;

                vertices[verticesCount++] = xPos + offX;
                vertices[verticesCount++] = -char.h - offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;

                vertices[verticesCount++] = char.w + xPos + offX;
                vertices[verticesCount++] = -char.h - offY + yPos;
                vertices[verticesCount++] = 0;

                uv[uvCount++] = char.uvPos.x + char.uvSize.x;
                uv[uvCount++] = char.uvPos.y + char.uvSize.y;



                indices[indicesCount++] = indicesPos;
                indices[indicesCount++] = 2 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;


                indices[indicesCount++] = 3 + indicesPos;
                indices[indicesCount++] = 1 + indicesPos;

                indices[indicesCount++] = 2 + indicesPos;
                indicesPos += 4;
                xPos += char.xadvance + spacing;
            }
            yPos -= 50 ;
        }

      //  let m = new Mesh(this.renderer, "fontText");


        //m.setTangents(uv)
        //m.setVertices(vertices)
        //m.setIndices(indices)

       // return m;
    }*/


    private parseChars() {
        for (let data of this.json.chars) {
            SDFFont.charArray[data.id] = new SDFChar(data)

        }
       // console.log(this.charArray)
    }
}
