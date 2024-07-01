import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import RenderPass from "../../lib/RenderPass.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Renderer from "../../lib/Renderer.ts";
import {TextureFormat} from "../../lib/WebGPUConstants.ts";
import DepthStencilAttachment from "../../lib/textures/DepthStencilAttachment.ts";
import Camera from "../../lib/Camera.ts";
import {Textures} from "../../data/Textures.ts";
import ShadowDepthMaterial from "./ShadowDepthMaterial.ts";
import DirectionalLight from "../lights/DirectionalLight.ts";
import SceneObject3D from "../../sceneEditor/SceneObject3D.ts";


export default class ShadowMapRenderPass extends RenderPass {

    public modelRenderer: ModelRenderer;
    public colorTarget: RenderTexture;
    public depthTarget: RenderTexture;


    private colorAttachment: ColorAttachment;

    private width =1024
    private height =1024



    constructor(renderer: Renderer,dirLight:DirectionalLight) {

        super(renderer, "ShadowRenderPass");



        this.colorTarget = new RenderTexture(renderer, Textures.SHADOW_DEPTH, {
            format: TextureFormat.R16Float,
            sampleCount: this.sampleCount,
            width:this.width,
            height:this.height,

            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });

        this.colorAttachment = new ColorAttachment(this.colorTarget,{
            clearValue:{r: -100000.0, g: 0, b: 0, a: 0}
        });
        this.colorAttachments = [this.colorAttachment];

        this.depthTarget = new RenderTexture(renderer, "shadowDepthTarget", {
            format: TextureFormat.Depth16Unorm,
            sampleCount: 1,
            width:this.width,
            height:this.height,
            usage: GPUTextureUsage.RENDER_ATTACHMENT | GPUTextureUsage.TEXTURE_BINDING
        });
        this.depthStencilAttachment = new DepthStencilAttachment(this.depthTarget);

        //
        this.modelRenderer = new ModelRenderer(renderer,"modelRendererShadow",dirLight.shadowCamera)
        this.modelRenderer.setMaterialType("shadow")


        // this.modelRendererClip = new ModelRenderer(renderer,"modelRendererShadowClip",dirLight.shadowCamera)
        //this.materialClip  = new ShadowDepthClipMaterial(renderer,"shadowClipDepth");
       // this.modelRendererClip .setMaterial(this.materialClip )

    }

    draw() {

        this.modelRenderer.draw(this);


    }

    addSceneObject(m: SceneObject3D) {
        if(!m.model)return;

            this.modelRenderer.addModel(m.model)

    }

    removeSceneObject(m: SceneObject3D) {
        if(!m.model)return;
        this.modelRenderer.removeModel(m.model)

    }
}
