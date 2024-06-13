import Renderer from "../lib/Renderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import MouseListener from "../lib/MouseListener.ts";
import UI from "../lib/UI/UI.ts";
import {Vector2, Vector3} from "@math.gl/core";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";


import Drawing from "./drawing/Drawing.ts";
import Blit from "../lib/blit/Blit.ts";
import BaseBlitMaterial from "../lib/blit/BaseBlitMaterial.ts";
import {sendTextureToServer} from "../lib/SaveUtils.ts";
import Project from "./Project.ts";

import Cutting from "./cutting/Cutting.ts";
import Preview from "./preview/Preview.ts";
import Timer from "../lib/Timer.ts";
import Model from "../lib/model/Model.ts";
import Quad from "../lib/mesh/geometry/Quad.ts";
import Plane from "../lib/mesh/geometry/Plane.ts";
import DrawingPreviewMaterial from "./drawing/DrawingPreviewMaterial.ts";
import Box from "../lib/mesh/geometry/Box.ts";
import Object3D from "../lib/model/Object3D.ts";
import {NumericArray} from "@math.gl/types";


enum ModelMainState {
    draw,
    cut,

}

enum ModelFocus {
    none,
    drawPanel,
    cutPanel,
    viewPanel
}




export default class ModelMaker {

    public projects: Array<Project> = []
    private cutting: Cutting;
    private drawing: Drawing
    private preview: Preview


    private mouseListener: MouseListener
    private renderer: Renderer;
    private mouseLocal = new Vector2()


    private modelRenderer2D: ModelRenderer;
    private camera2D: Camera;



    private modelMainState = ModelMainState.draw;
    private modelFocus = ModelFocus.none

    private currentProject!: Project;
    private textureModel: Model;
    private drawingPreviewMaterial: DrawingPreviewMaterial;
    private modelRoot: Object3D;
    private zoomScale: number =1;
    private isDragging: boolean =false;
    private prevDragMouse: Vector2 =new Vector2();
    private currentDragMouse: Vector2 =new Vector2();


    constructor(renderer: Renderer, mouseListener: MouseListener, data: any) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera2D = new Camera(this.renderer)

        this.camera2D.cameraWorld.set(0, 0, 5)
        this.camera2D.cameraLookAt.set(0,0,0);
        this.camera2D.far = 10;
        this.camera2D.near = -1;
        this.preview = new Preview(renderer)

        this.modelRenderer2D = new ModelRenderer(this.renderer, "lines", this.camera2D)


       // this.camera3D = new Camera(this.renderer);
        //this.camera3D.cameraWorld.set(0, 0, 5)
        //this.camera3D.cameraLookAt.set(0,0,0);
        //this.camera3D.far = 10;
        //this.camera3D.near = -1;

        this.drawing = new Drawing(renderer);
        this.cutting = new Cutting(renderer);


        this.textureModel =new Model(renderer,"textureModel");
        this.textureModel.mesh =  new Quad(renderer)

        this.drawingPreviewMaterial =new DrawingPreviewMaterial(renderer,"materprev");
        this.drawingPreviewMaterial.setTexture("colorTexture", this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"]);
        this.textureModel.material = this.drawingPreviewMaterial;
        this.textureModel.setScaler(0.5)
        this.textureModel.x =0.5;
        this.textureModel.y =0.5;

        this.modelRoot =new Object3D(renderer,"drawingModelRoot");
        this.modelRoot.addChild(this.textureModel)
        this.modelRoot.addChild(this.cutting.shapeLineModel)
        this.modelRoot.setScaler(100)
        this.modelRenderer2D.addModel( this.textureModel )
        this.modelRenderer2D.addModel(this.cutting.shapeLineModel);



        this.setProjects(data);
        this.scaleToFit()
        setTimeout(this.scaleToFit.bind(this),10)
    }

    public scaleToFit(){
        this.zoomScale = this.renderer.height;
        this.modelRoot.setScaler(this.zoomScale)
        this.modelRoot.x = (this.renderer.width-this.renderer.height)/2
    }
    update() {
        //this.camera2D.setOrtho(10, 0, 10, 0)
        this.camera2D.setOrtho(this.renderer.width,0, this.renderer.height,0)


        this.handleMouse();



    }

    draw() {


        this.drawing.draw()


        /* if(this.modelFocus ==ModelFocus.drawPanel){
             this.drawing.draw()
         }*/
    }

    drawInCanvas(pass: CanvasRenderPass) {


        this.modelRenderer2D.draw(pass);


    }

    public remapMouse(pos: Vector2) {

        let posR = this.cutting.shapeLineModel.getLocalPos(new Vector3(pos.x,this.renderer.height-pos.y,0));
        this.mouseLocal.x = posR.x;
        this.mouseLocal.y =posR.y;
    }

    public onUI() {

        UI.pushLList("Models", 100);
        let count = 0;
        for (let p of this.projects) {
            if (UI.LListItem(p.name, p == this.currentProject)) {
                this.currentProject = p;
                this.drawing.setProject(this.currentProject);
                this.cutting.setProject(this.currentProject)
                this.preview.setProject(this.currentProject)
            }
            count++;
        }
        UI.popList();
        let newName = UI.LTextInput("Model Name", "")
        if (UI.LButton("+ Add Model")) {

            let fail = false;
            if (newName.length == 0) {
                UI.logEvent("", "Model needs a name", true);
                fail = true
            }
            for (let p of this.projects) {
                if (p.name == newName) {
                    UI.logEvent("", "Model needs unique name", true);
                    fail = true
                    break;
                }
            }
            if (!fail) {
                this.currentProject = new Project(this.renderer);
                this.currentProject.name = newName;
                this.drawing.setProject(this.currentProject);
                this.cutting.setProject(this.currentProject)
                this.preview.setProject(this.currentProject)
                this.projects.push(this.currentProject);
            }
        }
        if (this.currentProject) {
            UI.separator("ProjectSep " ,false);
            UI.separator("Model: " +this.currentProject.name );
            if (UI.LButton("Save Model")) {
                let s = this.currentProject.getSaveString();

                sendTextureToServer(this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"], "texture", this.currentProject.name,s).then(() => {
                   UI.logEvent("","saved!")

                }).catch(()=>{
                    UI.logEvent("","error saving",true)
                })

            }
            UI.separator("Tools")
            if (this.modelMainState == ModelMainState.draw) {
                UI.LButton("Draw Texture", "", false)
                if (UI.LButton("Cut Mesh")) this.modelMainState = ModelMainState.cut;
                UI.separator("ll", false)
                this.drawing.onUI()
            } else {
                if (UI.LButton("Draw Texture")) this.modelMainState = ModelMainState.draw;
                UI.LButton("Cut Mesh", "", false)
                UI.separator("ll", false)
                this.cutting.onUI()
            }
        }


    }

    private handleMouse() {
        this.remapMouse(this.mouseListener.mousePos)

        if(this.mouseListener.wheelDelta && !UI.needsMouse()){

            let local =this.modelRoot.getLocalPos(new Vector3(this.mouseListener.mousePos.x,this.renderer.height -this.mouseListener.mousePos.y,0));

            if(this.mouseListener.wheelDelta>0){
                this.zoomScale *= 1.03;
            }else{
                this.zoomScale *= 0.97;
            }
            this.modelRoot.setScaler(this.zoomScale)
            let newWorld  =this.modelRoot.getWorldPos(local);

            this.modelRoot.x +=this.mouseListener.mousePos.x -newWorld.x
            this.modelRoot.y -=newWorld.y-(this.renderer.height -this.mouseListener.mousePos.y)
   
           // this.modelRoot.x +=newWorld.x;
            //this.modelRoot.y -=newWorld.y;
        }
        if (this.mouseListener.isDownThisFrame&& this.mouseListener.shiftKey && !UI.needsMouse()){

            this.isDragging = true;
            this.prevDragMouse.from(this.mouseListener.mousePos)
        }
        if(this.isDragging){
            this.currentDragMouse.from(this.mouseListener.mousePos)
            this.currentDragMouse.subtract(this.prevDragMouse as NumericArray);

            this.prevDragMouse.from(this.mouseListener.mousePos)
            if(this.currentDragMouse.lengthSquared()!=0){

                this.modelRoot.x +=this.currentDragMouse.x
                this.modelRoot.y -=this.currentDragMouse.y
            }

        }
        if (this.mouseListener.isUpThisFrame && this.isDragging){

            this.isDragging = false;

        }

        if(this.isDragging)return;

            if (this.mouseListener.isDownThisFrame && !UI.needsMouse()) {
            //this.mouseListener.reset()
            if (this.mouseLocal.x > 1) {
                //rightPanel
                this.modelFocus = ModelFocus.viewPanel

            } else {
                if (this.modelMainState == ModelMainState.cut) {
                    //this.addVectorPoint(this.mouseLocal)
                    this.modelFocus = ModelFocus.cutPanel
                } else if (this.modelMainState == ModelMainState.draw) {
                    this.modelFocus = ModelFocus.drawPanel
                }
            }
        }
        if (this.modelFocus == ModelFocus.drawPanel) {
            this.drawing.setMouse(this.mouseLocal,this.mouseListener.pressure, this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame)
        }
        if (this.modelFocus == ModelFocus.cutPanel) {
            this.cutting.setMouse(this.mouseLocal, this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame)
        }

    }


    private setProjects(data: any) {
        for (let projData of data){
            let p =new Project(this.renderer)
            p.setData(projData);
            this.projects.push(p)

        }
        if(this.projects.length){
            this.currentProject =this.projects[0];
            this.drawing.setProject(this.currentProject);
            this.cutting.setProject(this.currentProject)
            this.preview.setProject(this.currentProject)
        }
    }
}
