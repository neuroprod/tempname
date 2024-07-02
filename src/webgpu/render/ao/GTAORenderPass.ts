
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";
import GTAOMaterial from "./gtao/GTAOMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";
import Camera from "../../lib/Camera.ts";


export default class GTAORenderPass extends RenderPass {





    private aoAttachment: ColorAttachment;
    private depthDiffAttachment: ColorAttachment;
    private aoTarget: RenderTexture;
    private depthDiffTarget: RenderTexture;
    private blit: Blit;




    constructor(renderer: Renderer,camera:Camera) {

        super(renderer, "GTAORenderPass");
        //"ambient_occlusion", this.texture, TextureFormat.R32Float);
        //this.uniformGroup.addStorageTexture("depth_differences

        this.aoTarget = new RenderTexture(renderer, Textures.GTAO, {
            format: TextureFormat.R16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:1,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.aoAttachment = new ColorAttachment( this.aoTarget );

        this.depthDiffTarget = new RenderTexture(renderer, Textures.DEPTH_DIFF, {
            format: TextureFormat.R32Uint,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            sizeMultiplier:1,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthDiffAttachment = new ColorAttachment(this.depthDiffTarget);

        this.colorAttachments = [  this.aoAttachment, this.depthDiffAttachment];

        let mat = new GTAOMaterial(this.renderer,"gtao");
        mat.uniformGroups[0] =camera;
       this.blit = new Blit(this.renderer,"aoBlit",mat)


    }

    draw() {

       this.blit.draw(this)


    }

}
