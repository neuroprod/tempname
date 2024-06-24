import Vec2 from "../math/Vec2";

import Rect from "../math/Rect";
import Texture from "../../textures/Texture.ts";
import UniformGroup from "../../material/UniformGroup.ts";
import Renderer from "../../Renderer.ts";
import UI_I from "../UI_I.ts";
import {Vector4} from "@math.gl/core";


export class TextureBatchData extends UniformGroup {
    public posSize: Array<number> = [];
    public uiTexture: Texture;
    public uvScale: Array<number>;
    public uvOffset: Array<number>;
    public alpha: number;

    constructor(renderer: Renderer,
                rect: Rect,
                uiTexture: Texture,
                alpha: number,
                uvScale: Vec2,
                uvOffset: Vec2
    ) {
        super(renderer, "uniforms", false)

        this.addTexture("colorTexture", uiTexture)
        this.addSampler("mySampler")
        this.addUniform("rect", new Vector4(rect.pos.x, rect.pos.y, rect.size.x, rect.size.y));
        this.uiTexture = uiTexture;
        this.uvScale = uvScale.getArray();
        this.uvOffset = uvOffset.getArray();


        this.alpha = alpha;
    }
}

export default class TextureBatch {
    public textureData: Array<TextureBatchData> = [];

    constructor() {
    }

    addTexture(
        rect: Rect,
        uiTexture: Texture,
        alpha = 1,
        uvScale: Vec2 = new Vec2(1, 1),
        uvOffset = new Vec2(0, 0)
    ) {
        console.log("addTexture", this.textureData.length)
        let t = new TextureBatchData(UI_I.renderer, rect, uiTexture, alpha, uvScale, uvOffset);
        t.update()
        this.textureData.push(t);
    }

    clear() {
        console.log("clear TextureBatch")
        this.textureData = [];
    }

    destroy() {
        console.log("destroy TextureBatch")
        this.textureData = [];
    }
}
