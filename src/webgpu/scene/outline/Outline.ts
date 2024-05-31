import Renderer from "../../lib/Renderer.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import Model from "../../lib/model/Model.ts";
import Camera from "../../lib/Camera.ts";
import OutlinePrePass from "./OutlinePrePass.ts";
import Blit from "../../lib/blit/Blit.ts";
import BaseBlitMaterial from "../../lib/blit/BaseBlitMaterial.ts";

import Blend from "../../lib/material/Blend.ts";
import SolidMaterial from "../../lib/material/SolidMaterial.ts";

export default class Outline{


    private currentModel: Model|null =null;
    private renderer: Renderer;
    private outlinePrePass: OutlinePrePass;
    private outlineBlit: Blit;
    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.outlinePrePass = new OutlinePrePass(renderer,camera)
        let solidMaterial = new SolidMaterial(this.renderer,"solidOutlineMaterial")
        this.outlinePrePass.modelRenderer.setMaterial( solidMaterial);

        let blitMaterial =new BaseBlitMaterial(this.renderer,"baseBlit");
        blitMaterial.setTexture("colorTexture",this.renderer.textureHandler.texturesByLabel["OutlinePrePass"]);
        blitMaterial.blendModes =[Blend.add()]
        this.outlineBlit =new Blit(this.renderer,"outlineBlit",blitMaterial)
    }
    setCurrentModel(model: Model | null) {
        this.currentModel = model;
        if(!this.currentModel)return
        this.outlinePrePass.modelRenderer.setModels([this.currentModel])

    }
    draw()
    {
        if(!this.currentModel)return
        this.outlinePrePass.add();
    }

    drawFinal(pass: CanvasRenderPass) {
        if(!this.currentModel)return
        this.outlineBlit.draw(pass)

    }
}
