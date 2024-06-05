import RenderPass from "../../lib/RenderPass.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import {Textures} from "../../data/Textures.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import LightMaterial from "./LightMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";

export default class LightRenderPass extends RenderPass{
    private colorTarget: RenderTexture;
    private colorAttachment: ColorAttachment;
    private lightMaterial: LightMaterial;
    private blit: Blit;

    constructor(renderer:Renderer) {
            super(renderer,"lightRenderPass");
        this.colorTarget = new RenderTexture(renderer, Textures.LIGHT, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.colorAttachment = new ColorAttachment(this.colorTarget);
        this.colorAttachments = [this.colorAttachment]

        this.lightMaterial =new LightMaterial(renderer,"LightMaterial")
        this.blit  =new Blit(renderer,"blitLight",this.lightMaterial)

    }

    draw() {

       this.blit.draw(this)


    }












}
