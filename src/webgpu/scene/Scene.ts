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

export default class Scene{


    private renderer: Renderer;
    private camera: Camera;
    private modelRenderer: ModelRenderer;
    private root :Object3D
    private modelPool: ModelPool;
    private mouseListener: MouseListener;
    private ray:Ray =new Ray();
    private currentModel: Model|null =null;
    private outline: Outline;
    private editCursor: EditCursor;
    private editCamera:EditCamera;
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
        this.root =new Object3D(renderer,"root");
        this.outline =new Outline(renderer,this.camera)
        this.editCursor =new EditCursor(renderer,this.camera,mouseListener,this.ray)
        this.editCamera = new EditCamera(renderer,this.camera,mouseListener,this.ray)
        this.makeScene()

    }

    update() {
        this.camera.ratio = this.renderer.ratio

        //setScreenRay
        let mouseIn = new Vector2()
        mouseIn.from(this.mouseListener.mousePos)
        mouseIn.scale([2 / this.renderer.width, -2 / this.renderer.height]);
        mouseIn.subtract([1, -1]);
        this.ray.setFromCamera(this.camera, mouseIn)

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
                this.setCurrentModel(intersections[0].model)

            }else{
                this.setCurrentModel(null);
            }
        }

        this.editCursor.update()

    }
    setCurrentModel(value: Model | null) {
        this.currentModel = value;
        this.outline.setCurrentModel( this.currentModel)
        this.editCursor.setCurrentModel(this.currentModel);
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

        let model =this.modelPool.getModelByName(ModelNames.TEST_TREE);
        model.setPosition(-0.8,0.5,-2)
        model.setScale(2,2,0.02)


        this.modelRenderer.addModel(model)


        let model2 =this.modelPool.getModelByName(ModelNames.TESTCHARACTERS_PINK);
        model2.setPosition(0.0,0,0)
      model2.setScale(1,1,0.04)
        this.modelRenderer.addModel(model2)
    }
}
