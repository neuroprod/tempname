import Renderer from "../lib/Renderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import MouseListener from "../lib/MouseListener.ts";
import UI from "../lib/UI/UI.ts";
import {Vector2, Vector3} from "@math.gl/core";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";
import ShapeLineModel from "./shape/ShapeLineModel.ts";
import Model from "../lib/model/Model.ts";
import TestMaterial from "../lib/material/TestMaterial.ts";
import {CullMode} from "../lib/WebGPUConstants.ts";
import Timer from "../lib/Timer.ts";
import ExtrudeMesh from "../lib/mesh/ExtrudeMesh.ts";
import Drawing from "./drawing/Drawing.ts";
import Blit from "../lib/blit/Blit.ts";
import BaseBlitMaterial from "../lib/blit/BaseBlitMaterial.ts";
import ModelPreviewMaterial from "./ModelPreviewMaterial.ts";

enum ModelMainState{
    draw,
    cut,

}
enum ModelFocus{
    none,
    drawPanel,
    cutPanel,
    viewPanel
}



export default class ModelMaker {

    private mouseListener: MouseListener
    private renderer: Renderer;
    private mouseLocal = new Vector2()
    private center = new Vector2(0.5, 0.5)
    private points: Array<Vector2> = []
    private modelRenderer2D: ModelRenderer;
    private camera2D: Camera;
    private shapeLineModel: ShapeLineModel;

    private modelRenderer3D: ModelRenderer;
    private camera3D: Camera;
    private model3D: Model;
    private previewWidth = 0;
    private mesh: ExtrudeMesh;
    private drawing:Drawing

    private modelMainState =ModelMainState.draw;
    private modelFocus =ModelFocus.none
    private blitTextureMaterial: BaseBlitMaterial;
    private backgroundBlit: Blit;
    constructor(renderer: Renderer, mouseListener: MouseListener) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera2D = new Camera(this.renderer)
        this.camera2D.setOrtho(1, 0, 1, 0)
        this.modelRenderer2D = new ModelRenderer(this.renderer, "lines", this.camera2D)

        this.shapeLineModel = new ShapeLineModel(this.renderer);
        this.modelRenderer2D.addModel(this.shapeLineModel);


        this.camera3D = new Camera(this.renderer);
        this.camera3D.cameraWorld.set(0, 0, 2)
        this.camera3D.far = 10;
        this.camera3D.near = 1;
        this.modelRenderer3D = new ModelRenderer(this.renderer, "3D", this.camera3D);

        this.model3D = new Model(renderer, "model3D")
        this.model3D.material = new ModelPreviewMaterial(renderer,"preview")

        this.mesh = new ExtrudeMesh(renderer, "3DMesh")
        this.model3D.mesh = this.mesh;
        this.model3D.visible = false;
        this.modelRenderer3D.addModel(this.model3D)

        this.drawing =new Drawing(renderer)
        this.model3D.material.setTexture("colorTexture",this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"])
        this.blitTextureMaterial = new BaseBlitMaterial(renderer,"blitTexture")
        this.blitTextureMaterial.setTexture("colorTexture",this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"]);
        this.backgroundBlit =new Blit(renderer,"bgBlit", this.blitTextureMaterial)

    }


    update() {

        this.previewWidth = Math.min(this.renderer.width - this.renderer.height)
        this.camera3D.ratio = this.previewWidth / this.renderer.height
        this.model3D.setEuler(0, Timer.time / 2, 0)
        this.onUI();

        this.handleMouse();


    }

    draw() {


            this.drawing.draw()


       /* if(this.modelFocus ==ModelFocus.drawPanel){
            this.drawing.draw()
        }*/
    }

    drawInCanvas(pass: CanvasRenderPass) {
        pass.passEncoder.setViewport(0, 0, Math.min(this.renderer.width, this.renderer.height), this.renderer.height, 0, 1)
        this.backgroundBlit.draw(pass)

        this.modelRenderer2D.draw(pass);

        if (this.previewWidth > 1) {

            pass.passEncoder.setViewport(this.renderer.height, 0, this.previewWidth, this.renderer.height, 0, 1)
            this.modelRenderer3D.draw(pass);
        }

        pass.passEncoder.setViewport(0, 0, this.renderer.width, this.renderer.height, 0, 1)
    }

    public remapMouse(pos: Vector2) {
        this.mouseLocal.x = pos.x / this.renderer.height
        this.mouseLocal.y = 1 - pos.y / this.renderer.height
    }

    private onUI() {
        UI.pushWindow("ModelMaker")
        if(this.modelMainState ==ModelMainState.draw){
            if(UI.LButton("Cut"))this.modelMainState =ModelMainState.cut;
            UI.separator("ll", false)
            this.drawing.onUI()
        }else{
            if(UI.LButton("Draw"))this.modelMainState =ModelMainState.draw;
            UI.separator("ll", false)
        }

        UI.popWindow()

    }

    private handleMouse() {
        this.remapMouse(this.mouseListener.mousePos)
        if(this.mouseListener.isDownThisFrame && !UI.needsMouse()){
            //this.mouseListener.reset()
            if (this.mouseLocal.x > 1) {
                //rightPanel
                this.modelFocus =ModelFocus.viewPanel

            }else
            {
                if(this.modelMainState==ModelMainState.cut) {
                    this.addVectorPoint(this.mouseLocal)
                    this.modelFocus =ModelFocus.cutPanel
                }
                else if (this.modelMainState==ModelMainState.draw)
                {
                    this.modelFocus =ModelFocus.drawPanel
                }
            }
        }
        if(this.modelFocus ==ModelFocus.drawPanel){
            this.drawing.setMouse(this.mouseLocal,this.mouseListener.isDownThisFrame,this.mouseListener.isUpThisFrame)
        }



    }

    private addVectorPoint(point: Vector2) {

        this.points.push(point.clone())
        this.updateLine();
    }

    private updateLine() {

        this.shapeLineModel.setLine(this.points)
        if (this.points.length >= 3) {
            this.model3D.visible = true;
            this.mesh.setExtrusion(this.points, 0.03, new Vector3(0.5, 0.5, 0))
        } else {
            this.model3D.visible = false;
        }


    }


}
