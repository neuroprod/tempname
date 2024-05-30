import RenderPass from "../../lib/RenderPass.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";


export default class DrawingMixPass extends RenderPass
{
    private readonly colorAttachment: ColorAttachment;
    private readonly colorTarget: RenderTexture;

    constructor(renderer: Renderer) {

        super(renderer, "DrawingMixPass");

        this.sampleCount = 1


        this.colorTarget = new RenderTexture(renderer, "drawingMixColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: false,
            width:2024,
            height:2024,
            usage: GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.colorTarget, {
            clearValue: {
                r: 1,
                g: 1,
                b: 1,
                a: 1
            }
        });

        this.colorAttachments = [this.colorAttachment];


    }
    draw(){

    }

}
