import RenderPass from "../../lib/RenderPass.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import {LoadOp, StoreOp} from "../../lib/WebGPUConstants.ts";
import LineRenderer from "./LineRenderer.ts";

export default class DrawBufferTempPass extends RenderPass{
    private readonly colorAttachment: ColorAttachment;
    private readonly colorTarget: RenderTexture;
    public lineRenderer: LineRenderer;

    constructor(renderer: Renderer) {


        super(renderer, "DrawBufferTempPass");

        this.colorTarget = new RenderTexture(renderer, "drawingBufferTemp", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: false,
            width:2024,
            height:2024,
            usage: GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING|GPUTextureUsage.COPY_SRC
        });


        this.colorAttachment = new ColorAttachment( this.colorTarget, {
            clearValue: {
                r: 1,
                g: 0,
                b: 0,
                a: 1
            },
            loadOp:LoadOp.Clear,
            storeOp:StoreOp.Store
        });
        this.colorAttachments = [this.colorAttachment];

        this.lineRenderer = new LineRenderer(renderer)

    }
    draw(){
        this.lineRenderer.draw(this)
    }
}
