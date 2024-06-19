import RenderPass from "../../lib/RenderPass.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import Camera from "../../lib/Camera.ts";

export default class OutlinePrePass extends RenderPass {

    public modelRenderer: ModelRenderer;
    private readonly colorTarget: RenderTexture;
    private readonly colorAttachment: ColorAttachment;


    constructor(renderer: Renderer,camera:Camera) {

        super(renderer, "OutlinePrePass");

        this.colorTarget = new RenderTexture(renderer, "OutlinePrePass", {
            format: TextureFormat.R8Unorm,
            sampleCount: 1,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget, {clearValue: {r: 0.0, g: 0.0, b: 0.0, a: 0.0}});
        this.colorAttachments = [this.colorAttachment]


        this.modelRenderer = new ModelRenderer(renderer,"OutlinePrePass",camera)
    }

    draw() {
        this.modelRenderer.draw(this)
    }

}
