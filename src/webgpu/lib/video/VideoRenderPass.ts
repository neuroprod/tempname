import RenderTexture from "../textures/RenderTexture.ts";
import Blit from "../blit/Blit.ts";
import RenderPass from "../RenderPass.ts";
import VideoBlitMaterial from "./VideoBlitMaterial.ts";
import Renderer from "../Renderer.ts";
import ColorAttachment from "../textures/ColorAttachment.ts";
import {TextureFormat} from "../WebGPUConstants.ts";
import {Vector2} from "@math.gl/core";

export default class VideoRenderPass extends RenderPass{
    texture: RenderTexture;
    private blit: Blit;
    material: VideoBlitMaterial;

constructor(renderer:Renderer,file:string,size:Vector2) {
    super(renderer,"webcamRenderpass")

        this.texture = new RenderTexture(renderer, file, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            width:size.x,
            height: size.y,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachments =[ new ColorAttachment( this.texture  )]

    this.material = new VideoBlitMaterial(this.renderer,"videoBlit")
        this.blit = new Blit(this.renderer,"videoBlit",this.material)
    }


    draw() {

        this.blit.draw(this)


    }




}
