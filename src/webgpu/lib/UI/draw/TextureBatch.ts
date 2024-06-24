import Vec2 from "../math/Vec2";

import Rect from "../math/Rect";
import Texture from "../../textures/Texture.ts";
import UniformGroup from "../../material/UniformGroup.ts";
import Renderer from "../../Renderer.ts";
import UI_I from "../UI_I.ts";
import {Vector4} from "@math.gl/core";


export class TextureBatchData extends UniformGroup {

    public uiTexture: Texture;



    constructor(renderer: Renderer,
                rect: Rect,
                uiTexture: Texture,

    ) {
        super(renderer, "uniforms", false)

        this.addTexture("colorTexture", uiTexture)
        this.addSampler("mySampler")
        this.addUniform("rect", new Vector4(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y));
        this.uiTexture = uiTexture;

    }
}

export default class TextureBatch {
    public textureData: Array<TextureBatchData> = [];

    constructor() {
    }

    addTexture(
        rect: Rect,
        uiTexture: Texture,

    ) {


        for(let t of this.textureData ){
            if(t.uiTexture.UUID == uiTexture.UUID){

                t.setUniform("rect", new Vector4(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y));
                t.update()
                return;
            }

        }

        let t = new TextureBatchData(UI_I.renderer, rect, uiTexture);
        t.update()
        this.textureData.push(t);
    }

    clear() {
        //TODO: handle clear, dont want to create uniform group every frame
     //   console.log("clear TextureBatch")
        //this.textureData = [];
    }

    destroy() {
        for(let t of this.textureData ){
            t.destroy();
        }

        this.textureData = [];
    }
}
