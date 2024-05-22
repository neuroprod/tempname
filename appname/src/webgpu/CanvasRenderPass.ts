import RenderPass from "./lib/RenderPass.ts";
import ColorAttachment from "./lib/textures/ColorAttachment.ts";
import RenderTexture from "./lib/textures/RenderTexture.ts";
import Renderer from "./lib/Renderer.ts";
import {TextureFormat} from "./lib/WebGPUConstants.ts";
import DepthStencilAttachment from "./lib/textures/DepthStencilAttachment.ts";
import TestMaterial from "./TestMaterial.ts";
import Model from "./lib/model/Model.ts";
import ModelRenderer from "./lib/model/ModelRenderer.ts";
import Camera from "./lib/Camera.ts";
import KeyInput from "./KeyInput.ts";
import Box from "./lib/mesh/geometry/Box.ts";
import Ray from "./lib/Ray.ts";
import Timer from "./lib/Timer.ts";


export default class CanvasRenderPass extends RenderPass {
    public canvasColorAttachment: ColorAttachment;
    left: boolean;


    private readonly canvasColorTarget: RenderTexture;
    private canvasDepthTarget: RenderTexture;
    private material: TestMaterial;
    private mesh: Box;
    private model: Model;
    modelRenderer: ModelRenderer;
    private camera: Camera;
    private ray :Ray =new Ray()

    private floorModels:Array<Model>=[];
    private isInAir: boolean =false;
    private ySpeed =0;
    posX = 0;
    posY = 0;
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
                r: 0.2,
                g: 0.2,
                b: 0.2,
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

     //   this.model.getWorldPos();
        /*
if(this.keyInput.getJump()  && !this.isInAir){
    this.ySpeed =30;
    this.isInAir =true;
}

        this.posX += this.keyInput.getHdir() * 0.1;
        this.posY+=this.ySpeed *Timer.delta;
        //raytrace down/left

        if(this.posY<-10){
            this.posX =0;
            this.posY =5;
            this.ySpeed =0
        }

        this.model.setPosition(this.posX, this.posY, 0);
        this.ray.rayStart.from(this.model.getWorldPos());
        let r = this.ray.intersectModels(this.floorModels);
        let floorDist =0
        if(r.length>0){
            floorDist =r[0].distance-0.5
        }else {
            floorDist =1000;
        }
        if(floorDist>0.01){
            this.isInAir =true;
        } else  if(floorDist<0.01){
            this.ySpeed =-this.ySpeed*0.1
            this.posY -=floorDist;
            this.isInAir =false;
        }else{
            this.ySpeed =0;
            this.isInAir =false;
        }

        if(this.isInAir){
            this.ySpeed-=100*Timer.delta;
        }

      // this.ray.intersectModel(this.model)
        this.camera.ratio = this.renderer.ratio
*/
    }

    draw() {

        this.modelRenderer.draw(this);

    }


}
