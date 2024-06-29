import RenderPass from "../../lib/RenderPass.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import {LoadOp, StoreOp, TextureFormat} from "../../lib/WebGPUConstants.ts";
import LineRenderer from "./LineRenderer.ts";
import Material from "../../lib/material/Material.ts";
import BaseBlitMaterial from "../../lib/blit/BaseBlitMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";
import {Textures} from "../../data/Textures.ts";

export default class DrawBufferTempPass extends RenderPass{
    private readonly colorAttachment: ColorAttachment;
    colorTarget: RenderTexture;
    public lineRenderer: LineRenderer;
    public blitMat: BaseBlitMaterial;
    private blit: Blit;

    constructor(renderer: Renderer) {


        super(renderer, "DrawBufferTempPass");

        this.colorTarget = new RenderTexture(renderer, Textures.DRAWING_BUFFER_TEMP, {
            format: TextureFormat.RGBA8Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: false,
            width:2024,
            height:2024,
            usage: GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC
        });


        this.colorAttachment = new ColorAttachment( this.colorTarget, {
            clearValue: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            },
            loadOp:LoadOp.Clear,
            storeOp:StoreOp.Store
        });
        this.colorAttachments = [this.colorAttachment];

        this.blitMat =new BaseBlitMaterial(this.renderer,"baseBlit");
        this.blit =new Blit(renderer,"baseblit",this.blitMat )

        this.lineRenderer = new LineRenderer(renderer)



    }

    draw(){

        this.blit.draw(this);
        this.lineRenderer.draw(this)
    }
}
