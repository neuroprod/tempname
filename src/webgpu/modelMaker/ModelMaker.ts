import Renderer from "../lib/Renderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import MouseListener from "../lib/MouseListener.ts";
import UI from "../lib/UI/UI.ts";
import {Vector2, Vector3} from "@math.gl/core";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";

import Model from "../lib/model/Model.ts";
import ExtrudeMesh from "../lib/mesh/ExtrudeMesh.ts";
import Drawing from "./drawing/Drawing.ts";
import Blit from "../lib/blit/Blit.ts";
import BaseBlitMaterial from "../lib/blit/BaseBlitMaterial.ts";
import {sendTextureToServer} from "../lib/SaveUtils.ts";
import Project from "./Project.ts";
import ShapeLineModel from "./cutting/ShapeLineModel.ts";
import Cutting from "./cutting/Cutting.ts";
import Preview from "./preview/Preview.ts";

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

    private modelRenderer3D: ModelRenderer;
    private camera3D: Camera;

    private previewWidth = 0;


    private modelMainState = ModelMainState.draw;
    private modelFocus = ModelFocus.none
    private blitTextureMaterial: BaseBlitMaterial;
    private backgroundBlit: Blit;
    private currentProject!: Project;


    constructor(renderer: Renderer, mouseListener: MouseListener, data: any) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera2D = new Camera(this.renderer)
        this.camera2D.setOrtho(1, 0, 1, 0)

        this.preview = new Preview(renderer)

        this.modelRenderer2D = new ModelRenderer(this.renderer, "lines", this.camera2D)


        this.camera3D = new Camera(this.renderer);
        this.camera3D.cameraWorld.set(0, 0, 2)
        this.camera3D.far = 10;
        this.camera3D.near = 1;

        this.drawing = new Drawing(renderer);
        this.cutting = new Cutting(renderer);

        this.modelRenderer2D.addModel(this.cutting.shapeLineModel);

        this.modelRenderer3D = new ModelRenderer(this.renderer, "3D", this.camera3D);


        this.modelRenderer3D.addModel(this.cutting.model3D)


        this.blitTextureMaterial = new BaseBlitMaterial(renderer, "blitTexture")
        this.blitTextureMaterial.setTexture("colorTexture", this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"]);
        this.backgroundBlit = new Blit(renderer, "bgBlit", this.blitTextureMaterial)
        this.setProjects(data);
    }


    update() {

        this.previewWidth = Math.min(this.renderer.width - this.renderer.height)
        this.camera3D.ratio = this.previewWidth / this.renderer.height
        this.handleMouse();
        this.onUI();


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
        UI.pushLList("Projects", 100);
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
        let newName = UI.LTextInput("new Project Name", "test")
        if (UI.LButton("+ Add Project")) {

            let fail = false;
            if (newName.length == 0) {
                UI.logEvent("", "Project needs a name", true);
                fail = true
            }
            for (let p of this.projects) {
                if (p.name == newName) {
                    UI.logEvent("", "Project needs unique name", true);
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
            UI.separator("Project: " +this.currentProject.name );
            if (UI.LButton("Save Project")) {
                let s = this.currentProject.getSaveString();

                sendTextureToServer(this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"], "texture", this.currentProject.name,s).then(() => {
                    console.log("saveOK")

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
        UI.popWindow()

    }

    private handleMouse() {
        this.remapMouse(this.mouseListener.mousePos)

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
            this.drawing.setMouse(this.mouseLocal, this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame)
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
