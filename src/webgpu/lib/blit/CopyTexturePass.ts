import RenderPass from "../RenderPass.ts";
import Renderer from "../Renderer.ts";
import Texture from "../textures/Texture.ts";
import Blit from "./Blit.ts";
import BaseBlitMaterial from "./BaseBlitMaterial.ts";
import ColorAttachment from "../textures/ColorAttachment.ts";
import {LoadOp, StoreOp} from "../WebGPUConstants.ts";

export default class CopyTexturePass extends RenderPass{
    private blit: Blit;

    constructor(renderer:Renderer) {
        super(renderer,"copyTexture")


        this.blit = new Blit(renderer,"copyBlit",new BaseBlitMaterial(renderer,this.label))
    }
    setTextures(target:Texture,source:Texture){


        this.blit.material.setTexture("colorTexture",source);
        this.blit.material.uniformGroups[0].update()
        let colorAttachment = new ColorAttachment( target, {
            clearValue: {
                r: 0,
                g: 0,
                b: 0,
                a: 0
            },
            loadOp:LoadOp.Clear,
            storeOp:StoreOp.Store
        });
        this.colorAttachments =[colorAttachment]
        this.setDirty();

    }
    draw(){

        this.blit.draw(this);
    }

}
