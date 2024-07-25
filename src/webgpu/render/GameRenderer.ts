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
import GTAORenderPass from "./ao/GTAORenderPass.ts";
import DeNoisePass from "./ao/DeNoisePass.ts";
import ShadowRenderPass from "./shadow/ShadowRenderPass.ts";
import AOPreprocessDepth from "./ComputePasses/AOPreprocessDepth.ts";
import GTAO from "./ComputePasses/GTAO.ts";
import TimeStampQuery from "../lib/TimeStampQuery.ts";

export default class GameRenderer{
    private renderer: Renderer;
    public gBufferPass: GBufferRenderPass;
    private debugTextureMaterial: DebugTextureMaterial;
    private blitFinal: Blit;

    private currentValue = {texture: "kka", type: 0}

    private passSelect: Array<SelectItem> = []
    private lightPass: LightRenderPass;
    private sunLight: DirectionalLight;
    public shadowMapPass: ShadowMapRenderPass;
    private shadowBlurPass: ShadowBlurRenderPass;
    //preProcessDepth: PreProcessDepth;
   // private gtoaPass: GTAORenderPass;
    //private gtoaDenoisePass: GTAODenoisePass;
    private shadowPass: ShadowRenderPass;
    private preDept: AOPreprocessDepth;
    private ao: GTAO;
    private preProcessDepth: PreProcessDepth;
    private aoDenoise: DeNoisePass;
    private shadowDenoise: DeNoisePass;



    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.sunLight = new DirectionalLight(renderer)
        this.shadowMapPass =new ShadowMapRenderPass(renderer,this.sunLight)
        this.shadowBlurPass =new ShadowBlurRenderPass(renderer);
        this.gBufferPass =new GBufferRenderPass(renderer,camera);
       this.preProcessDepth = new PreProcessDepth(renderer);
        //this.gtoaPass = new GTAORenderPass(renderer,camera);
        this.shadowPass = new ShadowRenderPass(renderer,camera,this.sunLight)
        //this.gtoaDenoisePass = new GTAODenoisePass(renderer);
        this.preDept=new AOPreprocessDepth(renderer)
        this.ao = new GTAO(renderer,camera)
        this.aoDenoise = new DeNoisePass(renderer,Textures.GTAO_DENOISE,Textures.GTAO)
        this.shadowDenoise = new DeNoisePass(renderer,Textures.SHADOW_DENOISE,Textures.SHADOW)


        this.lightPass =new LightRenderPass(renderer,camera,this.sunLight)




        this.debugTextureMaterial = new DebugTextureMaterial(this.renderer,"debugTextureMaterial")
        this.blitFinal =new Blit(renderer,"blitFinal",this.debugTextureMaterial)
        //this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH, {texture: Textures.SHADOW_DEPTH, type: 2}));

       //this.passSelect.push(new SelectItem(Textures.GTAO, {texture: Textures.GTAO, type: 1}));
        this.passSelect.push(new SelectItem(Textures.LIGHT, {texture: Textures.LIGHT, type: 0}));
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
        this.debugTextureMaterial.setTexture("colorTexture",this.renderer.getTexture(this.currentValue.texture));
        this.debugTextureMaterial.setUniform("renderType",  this.currentValue.type)


    }
    update(){
        this.shadowMapPass.update()
        this.lightPass.update();
    }
    onUI(){
        let value = UI.LSelect("Render Pass", this.passSelect)
        if (value != this.currentValue) {
            this.currentValue = value;

            this.debugTextureMaterial.setTexture("colorTexture",this.renderer.getTexture(this.currentValue.texture));
            this.debugTextureMaterial.setUniform("renderType",  this.currentValue.type)

        }
    }
    //doPasses
    draw(){

        this.shadowMapPass.add( );

        this.gBufferPass.add(this.renderer.timeStamps.getSet(0,1));

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

        this.lightPass.add(this.renderer.timeStamps.getSet(2,3));

    }

    //put in canvas
    drawFinal(pass: CanvasRenderPass) {
        this.blitFinal.draw(pass);
    }
}
