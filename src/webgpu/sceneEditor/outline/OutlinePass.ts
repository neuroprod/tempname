import RenderPass from "../../lib/RenderPass.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import Camera from "../../lib/Camera.ts";
import Blit from "../../lib/blit/Blit.ts";
import OutlineMaterial from "./OutlineMaterial.ts";

export default class OutlinePass extends RenderPass {


    private readonly colorTarget: RenderTexture;
    private readonly colorAttachment: ColorAttachment;
    private blit: Blit;


    constructor(renderer: Renderer) {

        super(renderer, "OutlinePass");

        this.colorTarget = new RenderTexture(renderer, "OutlinePass", {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: 1,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget, {clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0}});
        this.colorAttachments = [this.colorAttachment]
        let material = new OutlineMaterial(this.renderer,"outline");
        material.setTexture('inputTexture',this.renderer.getTexture("OutlinePrePass"));
        this.blit =new Blit(renderer,"outline", material)

    }

    draw() {
        this.blit.draw(this)
    }

}
