import Renderer from "../lib/Renderer.ts";
import Camera from "../lib/Camera.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import GBufferRenderPass from "./GBuffer/GBufferRenderPass.ts";
import DebugTextureMaterial from "./debug/DebugTextureMaterial.ts";
import Blit from "../lib/blit/Blit.ts";
import {Textures} from "../data/Textures.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import UI from "../lib/UI/UI.ts";
import LightRenderPass from "./light/LightRenderPass.ts";
import ShadowMapRenderPass from "./shadow/ShadowMapRenderPass.ts";
import DirectionalLight from "./lights/DirectionalLight.ts";
import ShadowBlurRenderPass from "./shadow/ShadowBlurRenderPass.ts";
import PreProcessDepth from "./ao/PreProcessDepth.ts";
import DeNoisePass from "./ao/DeNoisePass.ts";
import ShadowRenderPass from "./shadow/ShadowRenderPass.ts";
import AOPreprocessDepth from "./ComputePasses/AOPreprocessDepth.ts";
import GTAO from "./ComputePasses/GTAO.ts";
import LoadHandler from "../data/LoadHandler.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Model from "../lib/model/Model.ts";
import SceneObject3D from "../data/SceneObject3D.ts";

export default class GameRenderer {
    public allModels: Array<Model> = []
    private renderer: Renderer;
    private gBufferPass: GBufferRenderPass;
    private debugTextureMaterial: DebugTextureMaterial;
    private blitFinal: Blit;
    private currentValue = {texture: "kka", type: 0}
    private passSelect: Array<SelectItem> = []
    private lightPass: LightRenderPass;
    private sunLight: DirectionalLight;
    private shadowMapPass: ShadowMapRenderPass;
    //preProcessDepth: PreProcessDepth;
    // private gtoaPass: GTAORenderPass;
    private shadowBlurPass: ShadowBlurRenderPass;
    //private gtoaDenoisePass: GTAODenoisePass;
    private shadowPass: ShadowRenderPass;
    private preDept: AOPreprocessDepth;
    private ao: GTAO;
    private preProcessDepth: PreProcessDepth;
    private aoDenoise: DeNoisePass;
    private shadowDenoise: DeNoisePass;
    private transparentModelRenderer: ModelRenderer;
    private transitionValue: number =0;

    constructor(renderer: Renderer, camera: Camera) {
        this.renderer = renderer;
        this.sunLight = new DirectionalLight(renderer, camera)
        this.shadowMapPass = new ShadowMapRenderPass(renderer, this.sunLight)
        this.shadowBlurPass = new ShadowBlurRenderPass(renderer);
        this.gBufferPass = new GBufferRenderPass(renderer, camera);
        this.preProcessDepth = new PreProcessDepth(renderer);

        this.shadowPass = new ShadowRenderPass(renderer, camera, this.sunLight)

        this.preDept = new AOPreprocessDepth(renderer)
        this.ao = new GTAO(renderer, camera)
        this.aoDenoise = new DeNoisePass(renderer, Textures.GTAO_DENOISE, Textures.GTAO)
        this.shadowDenoise = new DeNoisePass(renderer, Textures.SHADOW_DENOISE, Textures.SHADOW)


        this.lightPass = new LightRenderPass(renderer, camera, this.sunLight)


        this.debugTextureMaterial = new DebugTextureMaterial(this.renderer, "debugTextureMaterial")
        this.blitFinal = new Blit(renderer, "blitFinal", this.debugTextureMaterial)
       //
        // this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH, {texture: Textures.SHADOW_DEPTH, type: 2}));
        // this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH, {texture: Textures.SHADOW_DEPTH, type: 2}));
        //this.passSelect.push(new SelectItem(Textures.GTAO, {texture: Textures.GTAO, type: 1}));
        this.passSelect.push(new SelectItem(Textures.LIGHT, {texture: Textures.LIGHT, type: 0}));
        this.passSelect.push(new SelectItem("video/test.mp4", {texture: "video/test.mp4", type: 0}));
        this.passSelect.push(new SelectItem(Textures.SHADOW, {texture: Textures.SHADOW, type: 0}));
        // this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH_BLUR, {texture: Textures.SHADOW_DEPTH_BLUR, type: 0}));
        this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH, {texture: Textures.SHADOW_DEPTH, type: 2}));

        this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR, {texture: Textures.DEPTH_BLUR, type: 1}));
        // this.passSelect.push(new SelectItem(Textures.GTAO, {texture: Textures.GTAO, type: 1}));
        // this.passSelect.push(new SelectItem( Textures.GTAO_DENOISE, {texture: Textures.GTAO_DENOISE, type: 1}));

        //this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR_MIP4, {texture: Textures.DEPTH_BLUR_MIP4, type: 1}));
        //this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR_MIP3, {texture: Textures.DEPTH_BLUR_MIP3, type: 1}));
        //this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR_MIP2, {texture: Textures.DEPTH_BLUR_MIP2, type: 1}));
        //this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR_MIP1, {texture: Textures.DEPTH_BLUR_MIP1, type: 1}));
        //this.passSelect.push(new SelectItem(Textures.DEPTH_BLUR_MIP0, {texture: Textures.DEPTH_BLUR_MIP0, type: 1}));


        this.passSelect.push(new SelectItem(Textures.GCOLOR, {texture: Textures.GCOLOR, type: 0}));
        this.passSelect.push(new SelectItem(Textures.GNORMAL, {texture: Textures.GNORMAL, type: 0}));
        this.passSelect.push(new SelectItem(Textures.GDEPTH, {texture: Textures.GDEPTH, type: 0}));


        this.currentValue = this.passSelect[0].value;
        this.debugTextureMaterial.setTexture("colorTexture", this.renderer.getTexture(this.currentValue.texture));
        this.debugTextureMaterial.setUniform("renderType", this.currentValue.type)


        this.transparentModelRenderer = new ModelRenderer(this.renderer, "transparent", camera)


    }

    public setLevelType(type: string) {
        if (type == "platform") {
            this.sunLight.shadowCamera.setOrtho(4, -4, 4, -2);

        }
        if (type == "website") {
            this.sunLight.shadowCamera.setOrtho(1, -1, 1, -1);
        }
    }

    public clearAllModels() {

        this.gBufferPass.modelRenderer.setModels([])
        this.shadowMapPass.modelRenderer.setModels([])
        this.transparentModelRenderer.setModels([])
        this.allModels = []


    }

    public setModels(models: Array<Model>) {
        this.clearAllModels()
        for (let m of models) {
            this.addModel(m)
        }

    }

    public addModel(m: Model) {

        if (m.transparent) {
            this.transparentModelRenderer.addModel(m)
        } else {

            this.gBufferPass.modelRenderer.addModel(m)

        }
        if(m.parent ){
        if ((m.parent as SceneObject3D).dropShadow) {

            this.shadowMapPass.modelRenderer.addModel(m)
        }}

        this.allModels.push(m)


    }

    public removeModel(m: Model) {
        this.gBufferPass.modelRenderer.removeModel(m)
        this.shadowMapPass.modelRenderer.removeModel(m)
        this.transparentModelRenderer.removeModel(m)


        const index = this.allModels.indexOf(m, 0);
        if (index > -1) {
            this.allModels.splice(index, 1);
        }

    }

    public updateModel(m: Model) {
        this.removeModel(m)
        this.addModel(m)

    }


    update() {
        this.sunLight.update();
        this.shadowMapPass.update()
        this.shadowPass.update();
        this.lightPass.update();

        if(this.transitionValue !=0){
            //
        }
    }

    onUI() {

        let value = UI.LSelect("Render Pass", this.passSelect)
        if (value != this.currentValue) {
            this.currentValue = value;

            this.debugTextureMaterial.setTexture("colorTexture", this.renderer.getTexture(this.currentValue.texture));
            this.debugTextureMaterial.setUniform("renderType", this.currentValue.type)

        }
    }

    //doPasses
    draw() {
        if (LoadHandler.isLoading()) return;
        this.shadowMapPass.add();

        this.gBufferPass.add(this.renderer.timeStamps.getSet(0, 1));

        this.preProcessDepth.add();

///this.preDept.add()
        this.ao.add()

        //this.preProcessDepth.add();
        // this.gtoaPass.add()
        /// this.gtoaDenoisePass.add();


        this.shadowPass.add();
        this.aoDenoise.add()
        this.shadowDenoise.add()
        //this.shadowBlurPass.add();

        this.lightPass.add(this.renderer.timeStamps.getSet(2, 3));

    }

    //put in canvas
    drawFinal(pass: CanvasRenderPass) {

        this.blitFinal.draw(pass);

        this.transparentModelRenderer.draw(pass)

        if(this.transitionValue !=0){
            //
        }

    }
}
