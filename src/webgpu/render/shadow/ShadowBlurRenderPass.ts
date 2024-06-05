
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";

import {Textures} from "../../data/Textures.ts";

import ShadowBlurMaterial from "./ShadowBlurMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";


export default class ShadowBlurRenderPass extends RenderPass {


    public colorTarget: RenderTexture;



    private colorAttachment: ColorAttachment;

    private width =1024
    private height =1024
    private material: ShadowBlurMaterial;
    private blit: Blit;



    constructor(renderer: Renderer) {

        super(renderer, "ShadowBlurrRenderPass");



        this.colorTarget = new RenderTexture(renderer, Textures.SHADOW_DEPTH_BLUR, {
            format: TextureFormat.RG16Float,
            sampleCount: this.sampleCount,
            width:this.width,
            height:this.height,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.colorTarget);
        this.colorAttachments = [this.colorAttachment];

        this.material =new ShadowBlurMaterial(renderer,'shadowBlur')
        this.blit =new Blit(this.renderer,"shdowBlurBlit",this.material)

    }

    draw() {

this.blit.draw(this);


    }

}
