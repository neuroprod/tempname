import Renderer from "../lib/Renderer.ts";
import Camera from "../lib/Camera.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import GBufferRenderPass from "./GBuffer/GBufferRenderPass.ts";
import DebugTextureMaterial from "./debug/DebugTextureMaterial.ts";
import Blit from "../lib/blit/Blit.ts";
import {Textures} from "../data/Textures.ts";

export default class GameRenderer{
    private renderer: Renderer;
    public gBufferPass: GBufferRenderPass;
    private debugTextureMaterial: DebugTextureMaterial;
    private blitFinal: Blit;





    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.gBufferPass =new GBufferRenderPass(renderer,camera);

        this.debugTextureMaterial = new DebugTextureMaterial(this.renderer,"debugTextureMaterial")
        this.blitFinal =new Blit(renderer,"blitFinal",this.debugTextureMaterial)
        this.debugTextureMaterial.setTexture("colorTexture",this.renderer.getTexture(Textures.GNORMAL));
    }
    onUI(){

    }
    //doPasses
    draw(){
        this.gBufferPass.add();
    }

    //put in canvas
    drawFinal(pass: CanvasRenderPass) {
        this.blitFinal.draw(pass);
    }
}
