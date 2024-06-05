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
import ShadowRenderPass from "./shadow/ShadowRenderPass.ts";
import DirectionalLight from "./lights/DirectionalLight.ts";

export default class GameRenderer{
    private renderer: Renderer;
    public gBufferPass: GBufferRenderPass;
    private debugTextureMaterial: DebugTextureMaterial;
    private blitFinal: Blit;

    private currentValue = {texture: "kka", type: 0}

    private passSelect: Array<SelectItem> = []
    private lightPass: LightRenderPass;
    private sunLight: DirectionalLight;
    public shadowPass: ShadowRenderPass;


    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.sunLight = new DirectionalLight(renderer)
        this.shadowPass =new ShadowRenderPass(renderer,this.sunLight)
        this.gBufferPass =new GBufferRenderPass(renderer,camera);


        this.lightPass =new LightRenderPass(renderer,camera,this.sunLight)






        this.debugTextureMaterial = new DebugTextureMaterial(this.renderer,"debugTextureMaterial")
        this.blitFinal =new Blit(renderer,"blitFinal",this.debugTextureMaterial)

        this.passSelect.push(new SelectItem(Textures.LIGHT, {texture: Textures.LIGHT, type: 0}));
        this.passSelect.push(new SelectItem(Textures.SHADOW_DEPTH, {texture: Textures.SHADOW_DEPTH, type: 0}));
        this.passSelect.push(new SelectItem(Textures.GCOLOR, {texture: Textures.GCOLOR, type: 0}));
        this.passSelect.push(new SelectItem(Textures.GNORMAL, {texture: Textures.GNORMAL, type: 0}));
        this.passSelect.push(new SelectItem(Textures.GDEPTH, {texture: Textures.GDEPTH, type: 0}));


        this.currentValue = this.passSelect[0].value;
        this.debugTextureMaterial.setTexture("colorTexture",this.renderer.getTexture(this.currentValue.texture));
        this.debugTextureMaterial.setUniform("renderType",  this.currentValue.type)


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
        this.shadowPass.add();
        this.gBufferPass.add();
        this.lightPass.add();
    }

    //put in canvas
    drawFinal(pass: CanvasRenderPass) {
        this.blitFinal.draw(pass);
    }
}
