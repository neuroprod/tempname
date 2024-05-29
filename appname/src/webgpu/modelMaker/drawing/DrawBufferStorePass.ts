import RenderPass from "../../lib/RenderPass.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import {LoadOp, StoreOp} from "../../lib/WebGPUConstants.ts";

export default class DrawBufferStorePass extends RenderPass{
    private readonly colorAttachment: ColorAttachment;

    constructor(renderer: Renderer,target:RenderTexture) {

        super(renderer, "DrawBufferStorePass");
        this.colorAttachment = new ColorAttachment(target, {
            clearValue: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            },
            loadOp:LoadOp.Load,
            storeOp:StoreOp.Store
        });
        this.colorAttachments = [this.colorAttachment];

    }
    draw(){
//addStuff
    }
}
