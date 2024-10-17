import Path from "../lib/path/Path.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import RenderPass from "../lib/RenderPass.ts";
import Renderer from "../lib/Renderer.ts";
import ShapeLineModel from "../modelMaker/cutting/ShapeLineModel.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";
import {Vector3} from "@math.gl/core";

class DebugDraw {

    public path = new Path()
    private renderer!: Renderer;


    private shapeLine!: ShapeLineModel;
    private modelRenderer!: ModelRenderer;


    p =new Vector3()
    cp1 =new Vector3()
    cp2 =new Vector3()
    private needsDrawing: boolean =false;
    init(renderer:Renderer,camera:Camera){
        this.renderer =renderer;
        this.shapeLine= new ShapeLineModel(renderer,"debugLines","#FF0000")
        this.modelRenderer =new ModelRenderer(renderer,"debuglineRenderer",camera)
        this.modelRenderer.addModel(this.shapeLine)

    }
    update(){
       if( this.shapeLine.setPath(this.path)){

        this.needsDrawing = true;
        this.path.clear()
       }else{
           this.needsDrawing = false;
       }
    }

    draw(pass: RenderPass){
        if(this.needsDrawing) this.modelRenderer.draw(pass);
    }

    drawCircle(pos:Vector3, radius:number){
        let cpOff = 0.552284749831*radius
        this.p.copy(pos);
        this.p.x+=radius

        this.path.moveTo(this.p.clone())
        this.cp1.copy(this.p);
        this.cp1.y+=cpOff;
        this.p.copy(pos);
        this.p.y +=radius;
        this.cp2.copy(this.p)
        this.cp2.x+=cpOff;

        this.path.bezierCurveTo(this.cp1.clone(),this.cp2.clone(),this.p.clone())
        this.cp1.copy(this.p);
        this.cp1.x-=cpOff;
        this.p.copy(pos);
        this.p.x -=radius;
        this.cp2.copy(this.p);
        this.cp2.y+=cpOff;
        this.path.bezierCurveTo(this.cp1.clone(),this.cp2.clone(),this.p.clone())

        this.cp1.copy(this.p);
        this.cp1.y-=cpOff;
        this.p.copy(pos);
        this.p.y -=radius;
        this.cp2.copy(this.p);
        this.cp2.x-=cpOff;
        this.path.bezierCurveTo(this.cp1.clone(),this.cp2.clone(),this.p.clone())

        this.cp1.copy(this.p);
        this.cp1.x+=cpOff;
        this.p.copy(pos);
        this.p.x +=radius;
        this.cp2.copy(this.p);
        this.cp2.y-=cpOff;
        this.path.bezierCurveTo(this.cp1.clone(),this.cp2.clone(),this.p.clone())
    }





}

export default new DebugDraw();
