import Renderer from "../lib/Renderer.ts";
import MouseListener from "../lib/MouseListener.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import Camera from "../lib/Camera.ts";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Object3D from "../lib/model/Object3D.ts";
import ModelPool from "./ModelPool.ts";
import {ModelNames} from "../data/ModelNames.ts";
import UI from "../lib/UI/UI.ts";
import Ray from "../lib/Ray.ts";
import {Vector2} from "@math.gl/core";
import Model from "../lib/model/Model.ts";
import Outline from "./outline/Outline.ts";
import EditCursor from "./editCursor/EditCursor.ts";
import EditCamera from "./EditCamera.ts";
import SceneObject3D from "../shared/SceneObject3D.ts";

export enum ToolState {

    translate,
    rotate,
    scale,

}
export default class Scene{


    private renderer: Renderer;
    private camera: Camera;
    private modelRenderer: ModelRenderer;
    private root :SceneObject3D
    private modelPool: ModelPool;
    private mouseListener: MouseListener;
    private ray:Ray =new Ray();
    private currentModel: Object3D|null =null;
    private outline: Outline;
    private editCursor: EditCursor;
    private editCamera:EditCamera;

    private currentToolState:ToolState=ToolState.translate;
    constructor(renderer: Renderer, mouseListener: MouseListener, data: any) {
        this.renderer = renderer;
        this.mouseListener =mouseListener;
        this.camera =new Camera(renderer);
        this.camera.cameraWorld.set(0.5,0.3,2)
        this.camera.cameraLookAt.set(0,0.2,0)
        this.camera.near =0.1
        this.camera.fovy =0.5
        this.modelPool =new ModelPool(renderer,data);
        this.modelRenderer =new ModelRenderer(renderer,"mainModels",this.camera)

        this.outline =new Outline(renderer,this.camera)
        this.editCursor =new EditCursor(renderer,this.camera,mouseListener,this.ray)
        this.editCamera = new EditCamera(renderer,this.camera,mouseListener,this.ray)
        this.root =new SceneObject3D(this.renderer,"root")
        this.root.setCurrentModel=this.setCurrentModel.bind(this);
        this.makeScene()
        this.setCurrentToolState(ToolState.translate)
    }

    update() {
        this.camera.ratio = this.renderer.ratio

        //setScreenRay
        this.ray.setFromCamera(this.camera, this.mouseListener.getMouseNorm())

        //checkCameraInteraction
        let cursorNeeded = false
        cursorNeeded =this.editCamera.checkMouse();
        //check edit cursor
        if (!cursorNeeded) {
            cursorNeeded = this.editCursor.checkMouse()
        }
        //check modelSelect
        if(!cursorNeeded && this.mouseListener.isDownThisFrame && !UI.needsMouse()){
            let intersections  =this.ray.intersectModels(this.modelRenderer.models)
            if(intersections.length){
                let m = intersections[0].model;
                this.setCurrentModel(m.parent as SceneObject3D)

            }else{
                this.setCurrentModel(null);
            }
        }

        this.editCursor.update()

    }
    public onUI() {
        this.editCursor.localSpace = UI.LBool("Translate local",true);
        if (UI.LButton("Translate", "", this.currentToolState!= ToolState.translate)) this.setCurrentToolState(ToolState.translate);
        if (UI.LButton("Rotate", "", this.currentToolState!= ToolState.rotate)) this.setCurrentToolState(ToolState.rotate);
       // if (UI.LButton("Scale", "", this.currentToolState!= ToolState.scale)) this.setCurrentToolState(ToolState.scale);



    }
    public onObjectUI(){
        UI.pushWindow("scene")
        this.root.onUI()
        UI.separator("Objseperator",false)
        if(this.currentModel)
            this.currentModel.onDataUI()

        UI.popWindow()
    }
    setCurrentModel(value: SceneObject3D | null) {
        if(value) {
            this.currentModel = value;
            this.outline.setCurrentModel( value.model)
            this.editCursor.setCurrentModel(this.currentModel);
        }else{
            this.currentModel = null;
            this.outline.setCurrentModel( null)
            this.editCursor.setCurrentModel(null);
        }

    }
    draw() {
        this.outline.draw()
        this.editCursor.draw();
    }

    drawInCanvas(pass: CanvasRenderPass) {
        this.modelRenderer.draw(pass);
       this.outline.drawFinal(pass);
       this.editCursor.drawFinal(pass);
    }

    private makeScene() {




        let cloud1 =this.modelPool.getModelByName(ModelNames.TESTOBJECTS_CLOUD1);
        cloud1.setPosition(0.2,0.2,-0.1)
        cloud1.setCurrentModel =this.setCurrentModel.bind(this);
        this.root.addChild(cloud1)


        let cloud2 =this.modelPool.getModelByName(ModelNames.TESTOBJECTS_CLOUD2);
        cloud2.setPosition(-0.3,0.3,-0.1)
        cloud2.setCurrentModel =this.setCurrentModel.bind(this);
        this.root.addChild(cloud2)

        let body =this.modelPool.getModelByName(ModelNames.TESTOBJECTS_BODY);
        body.setCurrentModel =this.setCurrentModel.bind(this);
        let eye1 =this.modelPool.getModelByName(ModelNames.TESTOBJECTS_EYE,"eyeLeft");
        let eye2 =this.modelPool.getModelByName(ModelNames.TESTOBJECTS_EYE,"eyeRight");
        eye1.setPosition(0.1,0,0.1)
        eye2.setPosition(-0.1,0,0.1)
        eye2.setCurrentModel =this.setCurrentModel.bind(this);
        eye1.setCurrentModel =this.setCurrentModel.bind(this);
        body.addChild(eye1)
        body.addChild(eye2)
        this.root.addChild(body)
       // body.setPosition(-0.1,0,0.1)
        //body.setEuler(0,1,0.2)
        this.modelRenderer.addModel(cloud1.children[0] as Model)
        this.modelRenderer.addModel(cloud2.children[0] as Model)
        this.modelRenderer.addModel(body.children[0] as Model)
        this.modelRenderer.addModel(eye1.children[0] as Model)
        this.modelRenderer.addModel(eye2.children[0] as Model)


    }

    private setCurrentToolState(toolState: ToolState) {
        this.currentToolState =toolState;
        this.editCursor.setToolState(this.currentToolState);
    }
}
