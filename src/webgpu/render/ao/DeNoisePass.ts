
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";
import GTAOMaterial from "./gtao/GTAOMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";
import Camera from "../../lib/Camera.ts";
import GTAODenoiseMaterial from "./GTAODenoiseMaterial.ts";


export default class DeNoisePass extends RenderPass {





    private aoAttachment: ColorAttachment;

    private aoDenoiseTarget: RenderTexture;

    private blit: Blit;




    constructor(renderer: Renderer,target:string,source:string) {

        super(renderer, "DeNoisePass");
        //"ambient_occlusion", this.texture, TextureFormat.R32Float);
        //this.uniformGroup.addStorageTexture("depth_differences

        this.aoDenoiseTarget = new RenderTexture(renderer, target, {
            format: TextureFormat.R8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.aoAttachment = new ColorAttachment(  this.aoDenoiseTarget );


        this.colorAttachments = [  this.aoAttachment, ];

        let mat = new GTAODenoiseMaterial(this.renderer,"denoise");
        mat.setTexture("noisy",this.renderer.getTexture(source));
        this.blit = new Blit(this.renderer,"denoiseBlit",mat)


    }

    draw() {

        this.blit.draw(this)


    }

}
