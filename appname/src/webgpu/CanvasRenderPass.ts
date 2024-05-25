import RenderPass from "./lib/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";
import {TextureFormat} from "./lib/WebGPUConstants.ts";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment.ts";

import ModelRenderer from "./lib/model/ModelRenderer.ts";
import Camera from "./lib/Camera.ts";
import UI from "./lib/UI/UI.ts";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;
    left: boolean;


    private readonly canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;

    modelRenderer: ModelRenderer;
    camera: Camera;

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
                r: 0.1,
                g: 0.1,
                b: 0.1,
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

        this.camera = new Camera(renderer);
        this.modelRenderer = new ModelRenderer(renderer, "modelRenderer", this.camera);




    }


    public update() {
        this.camera.ratio = this.renderer.ratio


    }

    draw() {

        this.modelRenderer.draw(this);

        UI.drawGPU(this.passEncoder, true)
    }


}
