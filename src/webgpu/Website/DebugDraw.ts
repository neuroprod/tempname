import Path from "../lib/path/Path.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import RenderPass from "../lib/RenderPass.ts";
import Renderer from "../lib/Renderer.ts";
import ShapeLineModel from "../modelMaker/cutting/ShapeLineModel.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";

class DebugDraw {

    public path = new Path()
    private renderer!: Renderer;


    private shapeLine!: ShapeLineModel;
    private modelRenderer!: ModelRenderer;
    init(renderer:Renderer,camera:Camera){
        this.renderer =renderer;
        this.shapeLine= new ShapeLineModel(renderer,"debugLines","#FF0000")
        this.modelRenderer =new ModelRenderer(renderer,"debuglineRenderer",camera)
        this.modelRenderer.addModel(this.shapeLine)

    }
    update(){
        this.shapeLine.setPath(this.path)
        this.path.clear()
    }

    draw(pass: RenderPass){

        this.modelRenderer.draw(pass);
    }
}

export default new DebugDraw();
