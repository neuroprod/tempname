import RenderPass from "../../lib/RenderPass.ts";
import ColorAttachment from "../../lib/textures/ColorAttachment.ts";
import Blit from "../../lib/blit/Blit.ts";
import Renderer from "../../lib/Renderer.ts";
import RenderTexture from "../../lib/textures/RenderTexture.ts";

import DepthBlurMaterial from "./DepthBlurMaterial.ts";

export default class DepthBlurPass extends RenderPass {



    private colorAttachment: ColorAttachment;
    private blitBlur: Blit;





    constructor(renderer: Renderer,target:RenderTexture,src:RenderTexture) {

        super(renderer, "CopyPass");
        this.colorAttachment = new ColorAttachment(target,{});
        this.colorAttachments =[this.colorAttachment];
        let depthBlurMaterial = new  DepthBlurMaterial(renderer,"BlurDepthMaterial");
        depthBlurMaterial.setTexture("srcTexture",src);
        this.blitBlur = new Blit(this.renderer,"blur", depthBlurMaterial)



    }

    draw() {

        this.blitBlur.draw(this);


    }

}
