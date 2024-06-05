import RenderPass from "./lib/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";
import {TextureFormat} from "./lib/WebGPUConstants.ts";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment.ts";


import UI from "./lib/UI/UI.ts";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;



    private readonly canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;



    constructor(renderer: Renderer) {

        super(renderer, "canvasRenderPass");

        this.sampleCount = 4


        this.canvasColorTarget = new RenderTexture(renderer, "canvasColor", {
            format: renderer.presentationFormat,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });

        this.canvasColorAttachment = new ColorAttachment(this.canvasColorTarget, {
            clearValue: {
                r: 0.5,
                g: 0.7,
                b: 1,
                a: 1
            }
        });

        this.colorAttachments = [this.canvasColorAttachment];

        this.canvasDepthTarget = new RenderTexture(renderer, "canvasDepth", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: this.sampleCount,
            scaleToCanvas: true,
            usage: GPUTextureUsage.RENDER_ATTACHMENT
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.canvasDepthTarget);






    }

    drawInCanvas(param: CanvasRenderPass) {

    }



    draw() {


        this.drawInCanvas(this);


        UI.drawGPU(this.passEncoder, true)
    }


}
