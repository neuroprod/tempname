
import RenderPass from "../../../lib/RenderPass.ts";
import RenderTexture from "../../../lib/textures/RenderTexture.ts";
import ColorAttachment from "../../../lib/textures/ColorAttachment.ts";
import Renderer from "../../../lib/Renderer.ts";
import CopyMaterial from "./CopyMaterial.ts";
import {Textures} from "../../../data/Textures.ts";
import Blit from "../../../lib/blit/Blit.ts";


export default class CopyPass extends RenderPass {



    private colorAttachment: ColorAttachment;
    private blitCopy: Blit;





    constructor(renderer: Renderer,target:RenderTexture) {

        super(renderer, "CopyPass");
        this.colorAttachment = new ColorAttachment(target,{});
        this.colorAttachments =[this.colorAttachment];
        let copyMaterial = new CopyMaterial(renderer,"copyMaterial");
        copyMaterial.setTexture("srcTexture",this.renderer.getTexture(Textures.GDEPTH));
        this.blitCopy = new Blit(this.renderer,"copy", copyMaterial)



    }

    draw() {

        this.blitCopy.draw(this);


    }

}
