import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import DepthStencilAttachment from "../../lib/textures/DepthStencilAttachment.ts";
import Camera from "../../lib/Camera.ts";
import {Textures} from "../../data/Textures.ts";


export default class PreviewPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public depthTarget: RenderTexture;


    private colorAttachment: ColorAttachment;





    constructor(renderer: Renderer,modelRenderer:ModelRenderer) {

        super(renderer, "PreviewRenderPass");

        this.modelRenderer = modelRenderer

        this.colorTarget = new RenderTexture(renderer, Textures.PREVIEW_MODEL, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            width:512,
            height:512,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget,{
            clearValue: {
                r: 0.2,
                g: 0.2,
                b: 0.2,
                a: 1
            }
        });





        this.colorAttachments = [this.colorAttachment];


        this.depthTarget = new RenderTexture(renderer, "previewDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            width:512,
            height:512,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);


    }

    draw() {

        this.modelRenderer.draw(this);


    }

}
