import Renderer from "../../lib/Renderer.ts";
import Camera from "../../lib/Camera.ts";

import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import Model from "../../lib/model/Model.ts";
import Timer from "../../lib/Timer.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import PreviewPass from "./PreviewPass.ts";


export default class PreviewRenderer{
    private renderer: Renderer;
    private camera3D: Camera;

    private modelRenderer3D: ModelRenderer;
    private model3D: Model;
    private previewRenderPass: PreviewPass;

    constructor(renderer: Renderer, model3D: Model, camera3D: Camera) {
        this.renderer =new Renderer()
        this.model3D =model3D


        this.camera3D = camera3D
        this.camera3D.cameraWorld.set(0, 0, 3)
        this.camera3D.cameraLookAt.set(0, 0, 0);
        this.camera3D.far = 10;
        this.camera3D.near = 0.1;



        this.modelRenderer3D = new ModelRenderer(this.renderer, "3D", this.camera3D);
        this.modelRenderer3D.addModel(model3D)
        this.previewRenderPass = new PreviewPass(renderer,this.modelRenderer3D)
    }

    update() {
        this.camera3D.ratio = this.renderer.ratio;

        if (this.model3D) {

            let scale = 1/this.model3D.mesh.radius;
            this.model3D.setScaler(scale)
            let c = this.model3D.mesh.center.clone().negate()
            c.scale(scale)
            this.model3D.setPositionV(c)
            this.model3D.setEuler(Math.sin(Timer.time / 3) * 0.2, Math.sin(Timer.time) * 0.8, 0)
        }
    }
    public draw(){
        this.previewRenderPass.add()
    }
    drawInCanvas(pass: CanvasRenderPass) {

     //   this.modelRenderer3D.draw(pass);

      // this.modelRenderer3D.draw(pass);

    }
}
