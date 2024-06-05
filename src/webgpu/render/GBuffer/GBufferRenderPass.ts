import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import DepthStencilAttachment from "../../lib/textures/DepthStencilAttachment.ts";
import Camera from "../../lib/Camera.ts";
import {Textures} from "../../data/Textures.ts";


export default class GBufferRenderPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public depthTarget: RenderTexture;
    public normalTarget: RenderTexture;

    private colorAttachment: ColorAttachment;
    private normalAttachment: ColorAttachment;




    constructor(renderer: Renderer,camera:Camera) {

        super(renderer, "GbufferRenderPass");

        this.modelRenderer = new ModelRenderer(renderer,"modelRenderer",camera)

        this.colorTarget = new RenderTexture(renderer, Textures.GCOLOR, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget);


        this.normalTarget = new RenderTexture(renderer, Textures.GNORMAL, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.normalAttachment = new ColorAttachment(this.normalTarget);



        this.colorAttachments = [this.colorAttachment, this.normalAttachment];


        this.depthTarget = new RenderTexture(renderer, Textures.GDEPTH, {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);


    }

    draw() {

        this.modelRenderer.draw(this);


    }

}
