
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";

import {Textures} from "../../data/Textures.ts";

import ShadowBlurMaterial from "./ShadowBlurMaterial.ts";
import Blit from "../../lib/blit/Blit.ts";
import Camera from "../../lib/Camera.ts";
import DirectionalLight from "../lights/DirectionalLight.ts";
import PCSSShadowMaterial from "./PCSSShadowMaterial.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";


export default class ShadowRenderPass extends RenderPass {


    public colorTarget: RenderTexture;



    private colorAttachment: ColorAttachment;
    private material: PCSSShadowMaterial;
    private blit: Blit;
    private dirLight: DirectionalLight;





    constructor(renderer: Renderer,camera:Camera,dirLight:DirectionalLight) {

        super(renderer, "ShadowRenderPass");


        this.dirLight =dirLight;
        this.colorTarget = new RenderTexture(renderer, Textures.SHADOW, {
            format: TextureFormat.RG16Float,
            sampleCount: this.sampleCount,
            scaleToCanvas:true,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.colorTarget);
        this.colorAttachments = [this.colorAttachment];

        this.material =new PCSSShadowMaterial(renderer,'shadowMat')
        this.material.setUniform("shadowViewMatrix",dirLight.shadowCamera.view)
        this.material.setUniform("shadowViewProjectionMatrix",dirLight.shadowCamera.viewProjection)

       // this.material.setUniform("shadowCameraPosition",[dirLight.shadowCamera.cameraWorld.x,dirLight.shadowCamera.cameraWorld.y,dirLight.shadowCamera.cameraWorld.z,0])
        this.material.uniformGroups[0]=camera;
        this.blit =new Blit(this.renderer,"shadowBlit",this.material)

    }
    update() {
        this.material.setUniform("shadowViewMatrix",this.dirLight.shadowCamera.view)
        this.material.setUniform("shadowViewProjectionMatrix",this.dirLight.shadowCamera.viewProjection)
    }
    draw() {

        this.blit.draw(this);


    }


}
