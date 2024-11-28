import Renderer from "../lib/Renderer.ts";
import Camera from "../lib/Camera.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";

export default class Overlay{
   modelRenderer: ModelRenderer;
   camera: Camera;
    private renderer: Renderer;



    constructor(renderer:Renderer) {
        this.camera = new Camera(renderer)
        this.camera.near = -100;
        this.camera.far = 100;
        this.renderer =renderer;
        this.modelRenderer = new ModelRenderer(renderer, "overlayRenderer", this.camera)
    }
    update(){
        this.camera.setOrtho(100 * this.renderer.ratio, -100 * this.renderer.ratio, 100, -100)

    }
    draw(pass: CanvasRenderPass) {

        this.modelRenderer.draw(pass)
    }


}
