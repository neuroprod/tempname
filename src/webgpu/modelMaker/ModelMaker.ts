import Renderer from "../lib/Renderer.ts";
import CanvasRenderPass from "../CanvasRenderPass.ts";
import MouseListener from "../lib/MouseListener.ts";
import UI from "../lib/UI/UI.ts";
import {Vector2, Vector3} from "@math.gl/core";
import ModelRenderer from "../lib/model/ModelRenderer.ts";
import Camera from "../lib/Camera.ts";


import Drawing from "./drawing/Drawing.ts";

import {sendTextureToServer} from "../lib/SaveUtils.ts";
import Project from "./Project.ts";

import Cutting from "./cutting/Cutting.ts";

import Timer from "../lib/Timer.ts";
import Model from "../lib/model/Model.ts";
import Quad from "../lib/mesh/geometry/Quad.ts";

import DrawingPreviewMaterial from "./drawing/DrawingPreviewMaterial.ts";

import Object3D from "../lib/model/Object3D.ts";
import {NumericArray} from "@math.gl/types";
import {popMainMenu, pushMainMenu} from "../UI/MainMenu.ts";
import {addMainMenuButton} from "../UI/MainMenuButton.ts";
import {Icons} from "../UI/Icons.ts";
import {addMainMenuDivider} from "../UI/MainMenuDivider.ts";
import {addMainMenuToggleButton} from "../UI/MainMenuToggleButton.ts";
import {addMainMenuText} from "../UI/MainMenuText.ts";
import {addMainMenuTextButton} from "../UI/MainMenuTextButton.ts";
import {addMenuColorButton} from "../UI/MenuColorButton.ts";
import {addMenuBrushButton} from "../UI/MenuBrushButton.ts";
import {setNewPopup} from "../UI/NewPopup.ts";
import {setItemsPopup} from "../UI/ItemsPopup.ts";
import AppState from "../AppState.ts";
import ShapeLineModel from "./cutting/ShapeLineModel.ts";


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


export enum ToolType {
    None,
    Paint,
    Select,
    Line,
    Bezier,
    Center,
    Edit,
    Move,


}

export default class ModelMaker {

    public projects: Array<Project> = []
    private cutting: Cutting;
    private drawing: Drawing


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
    private zoomScale: number = 1;
    private isDragging: boolean = false;
    private prevDragMouse: Vector2 = new Vector2();
    private currentDragMouse: Vector2 = new Vector2();

    private camera3D: Camera;
    private modelRenderer3D: ModelRenderer;
    private currentTool: ToolType = ToolType.Paint;

    constructor(renderer: Renderer, mouseListener: MouseListener, data: any) {
        this.renderer = renderer;
        this.mouseListener = mouseListener;
        this.camera2D = new Camera(this.renderer)

        this.camera2D.cameraWorld.set(0, 0, 5)
        this.camera2D.cameraLookAt.set(0, 0, 0);
        this.camera2D.far = 10;
        this.camera2D.near = -1;


        this.modelRenderer2D = new ModelRenderer(this.renderer, "lines", this.camera2D)


        this.camera3D = new Camera(this.renderer);
        this.camera3D.cameraWorld.set(0, 0, 5)
        this.camera3D.cameraLookAt.set(0, 0, 0);
        this.camera3D.far = 10;
        this.camera3D.near = -1;

        this.drawing = new Drawing(renderer);
        this.cutting = new Cutting(renderer, this.camera2D);


        this.textureModel = new Model(renderer, "textureModel");
        this.textureModel.mesh = new Quad(renderer)

        this.drawingPreviewMaterial = new DrawingPreviewMaterial(renderer, "materprev");
        this.drawingPreviewMaterial.setTexture("colorTexture", this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"]);
        this.textureModel.material = this.drawingPreviewMaterial;
        this.textureModel.setScaler(0.5)
        this.textureModel.x = 0.5;
        this.textureModel.y = 0.5;

        this.modelRoot = new Object3D(renderer, "drawingModelRoot");
        this.modelRoot.addChild(this.textureModel)
        this.modelRoot.addChild(this.cutting.shapeLineModelAll)
        this.modelRoot.addChild(this.cutting.shapeLineModelSelect)
        this.modelRoot.addChild(this.cutting.shapeLineModelSelectControl)

        this.modelRoot.addChild(this.cutting.pathEditor.pointModel)
        this.modelRoot.setScaler(100)
        this.modelRenderer2D.addModel(this.textureModel)
        this.modelRenderer2D.addModel(this.cutting.shapeLineModelAll);
        this.modelRenderer2D.addModel(this.cutting.shapeLineModelSelect);
        this.modelRenderer2D.addModel(this.cutting.shapeLineModelSelectControl);
        this.modelRoot.addChild(this.cutting.shapeLineModelSelect)
        this.modelRenderer2D.addModel(this.cutting.pathEditor.pointModel);


        this.modelRenderer3D = new ModelRenderer(this.renderer, "3D", this.camera3D);
        this.modelRenderer3D.addModel(this.cutting.model3D)

        this.setProjects(data);
        this.scaleToFit()
        setTimeout(this.scaleToFit.bind(this), 10)
    }

    public scaleToFit() {
        this.zoomScale = this.renderer.height;
        this.modelRoot.setScaler(this.zoomScale)
        this.modelRoot.x = (this.renderer.width - this.renderer.height) / 2
    }

    update() {
        //this.camera2D.setOrtho(10, 0, 10, 0)
        this.camera2D.setOrtho(this.renderer.width, 0, this.renderer.height, 0)
        this.camera3D.ratio = this.renderer.ratio;
        if (this.cutting.model3D) {
            this.cutting.model3D.setEuler(Math.sin(Timer.time / 3) * 0.2, Math.sin(Timer.time) * 0.8, 0)
        }


        this.cutting.update()

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
        this.modelRenderer3D.draw(pass);

    }

    public remapMouse(pos: Vector2) {

        let posR = this.cutting.shapeLineModelSelect.getLocalPos(new Vector3(pos.x, this.renderer.height - pos.y, 0));
        this.mouseLocal.x = posR.x;
        this.mouseLocal.y = posR.y;
    }

    onUINice() {
        pushMainMenu("paint", 800, 134);
        if (addMainMenuTextButton("Save", true)) {
            this.saveAll();
        }
        addMainMenuDivider("tooldDiv1")
        if (addMainMenuButton("NewImage", Icons.NEW_IMAGE, true)) {
            setNewPopup("+ Add new Image", "new_image", (name: string) => {
                this.makeNewProject(name);
            })
        }
        if (addMainMenuButton("DeleteImage", Icons.DELETE_IMAGE, true)) {
            this.deleteCurrentProject();
        }
        if (addMainMenuButton("Open", Icons.FOLDER, true)) {

            setItemsPopup("Open Image", this.projects, (project: Project) => {
                this.openProject(project)

            })

        }


        addMainMenuDivider("tooldDiv2")
        addMainMenuText("DRAW")

        if (addMainMenuToggleButton("Brush", Icons.PAINT, this.currentTool == ToolType.Paint)) (this.setTool(ToolType.Paint))
        addMenuBrushButton(4)
        addMenuColorButton("#FF0000")
        addMainMenuDivider("tooldDiv3")
        //addMainMenuButton("Trash", Icons.TRASH,false)
        addMainMenuText("CUT MESH")
        if (addMainMenuButton("Add", Icons.PLUS_CUBE, false)) {

        }
        if (addMainMenuButton("Remove", Icons.MIN_CUBE, false)) {

        }
        addMainMenuDivider("tooldDiv4")
        if (addMainMenuToggleButton("Select", Icons.SELECT, this.currentTool == ToolType.Select)) (this.setTool( ToolType.Select))
        if (addMainMenuToggleButton("Edit", Icons.SELECT_FULL, this.currentTool == ToolType.Edit)) (this.setTool(ToolType.Edit))
        if (addMainMenuToggleButton("Line", Icons.LINE, this.currentTool == ToolType.Line)) (this.setTool(ToolType.Line))
        if (addMainMenuToggleButton("Bezier", Icons.BEZIER, this.currentTool == ToolType.Bezier)) (this.setTool(ToolType.Bezier))
        if (addMainMenuToggleButton("Move", Icons.MOVE, this.currentTool == ToolType.Move)) (this.setTool(ToolType.Move))
        if (addMainMenuToggleButton("setCenter", Icons.CENTER, this.currentTool == ToolType.Center)) (this.setTool(ToolType.Center))

        //addMainMenuButton("Trash", Icons.TRASH,false)
        //     if (addMainMenuButton("Game", Icons.GAME, this.currentMainState == MainState.game)) this.setMainState(MainState.game);
        //   if (addMainMenuButton("Scene Editor", Icons.CUBE, this.currentMainState == MainState.editor)) this.setMainState(MainState.editor);
        //  if (addMainMenuButton("Model Maker",  Icons.PAINT, this.currentMainState == MainState.modelMaker)) this.setMainState(MainState.modelMaker);

        popMainMenu()
    }


    public onUI() {

        UI.pushLList("Models", 100);
        let count = 0;
        for (let p of this.projects) {
            if (UI.LListItem(p.name, p == this.currentProject)) {
                this.currentProject = p;
                this.drawing.setProject(this.currentProject);
                this.cutting.setProject(this.currentProject)

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

                this.projects.push(this.currentProject);
            }
        }
        if (this.currentProject) {
            UI.separator("ProjectSep ", false);
            UI.separator("Model: " + this.currentProject.name);
            if (UI.LButton("Save Model")) {
                let s = this.currentProject.getSaveString();

                sendTextureToServer(this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"], "texture", this.currentProject.name, s).then(() => {
                    UI.logEvent("", "saved!")

                }).catch(() => {
                    UI.logEvent("", "error saving", true)
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

        if (this.mouseListener.wheelDelta && !UI.needsMouse()) {

            let local = this.modelRoot.getLocalPos(new Vector3(this.mouseListener.mousePos.x, this.renderer.height - this.mouseListener.mousePos.y, 0));

            if (this.mouseListener.wheelDelta > 0) {
                this.zoomScale *= 1.03;
            } else {
                this.zoomScale *= 0.97;
            }
            this.modelRoot.setScaler(this.zoomScale)
            let newWorld = this.modelRoot.getWorldPos(local);

            this.modelRoot.x += this.mouseListener.mousePos.x - newWorld.x
            this.modelRoot.y -= newWorld.y - (this.renderer.height - this.mouseListener.mousePos.y)

            // this.modelRoot.x +=newWorld.x;
            //this.modelRoot.y -=newWorld.y;
        }
        if (this.mouseListener.isDownThisFrame && this.mouseListener.shiftKey && !UI.needsMouse()) {

            this.isDragging = true;
            this.prevDragMouse.from(this.mouseListener.mousePos)
        }
        if (this.isDragging) {
            this.currentDragMouse.from(this.mouseListener.mousePos)
            this.currentDragMouse.subtract(this.prevDragMouse as NumericArray);

            this.prevDragMouse.from(this.mouseListener.mousePos)
            if (this.currentDragMouse.lengthSquared() != 0) {

                this.modelRoot.x += this.currentDragMouse.x
                this.modelRoot.y -= this.currentDragMouse.y
            }

        }
        if (this.mouseListener.isUpThisFrame && this.isDragging) {

            this.isDragging = false;

        }

        if (this.isDragging) return;

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
            this.drawing.setMouse(this.mouseLocal, this.mouseListener.pressure, this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame)
        }
        if (this.modelFocus == ModelFocus.cutPanel) {
            this.cutting.setMouse(this.mouseLocal, this.mouseListener.isDownThisFrame, this.mouseListener.isUpThisFrame)
        }

    }


    private setProjects(data: any) {
        for (let projData of data) {
            let p = new Project(this.renderer)
            p.setData(projData);
            this.projects.push(p)

        }
        if (this.projects.length) {

            let newName = AppState.getState("currentImage");
            for (let p of this.projects) {
                if (p.name == newName) {
                    this.openProject(p)
                    return;
                }
            }
            this.openProject(this.projects[0])


        }
    }

    private makeNewProject(newName: string) {
        let fail = false;
        if (newName.length == 0) {
            UI.logEvent("x", "Model needs a name", true);
            fail = true
        }
        for (let p of this.projects) {
            if (p.name == newName) {
                UI.logEvent("xxx", "Model needs unique name", true);
                fail = true
                break;
            }
        }
        if (!fail) {
            let newProject = new Project(this.renderer);
            newProject.name = newName;
            this.projects.push(newProject);
            this.openProject(newProject)

        }
    }

    private openProject(project: Project) {
        this.currentProject = project;
        this.drawing.setProject(this.currentProject);
        this.cutting.setProject(this.currentProject);
        AppState.setState("currentImage", this.currentProject.name)
        this.setTool(ToolType.Paint);
    }

    private deleteCurrentProject() {
        let index = this.projects.indexOf(this.currentProject);
        if (index >= 0) {
            this.projects.splice(index, 1);
            if (this.projects.length) {
                this.openProject(this.projects[0])
            } else {
                //   this.openProject(null)
            }
        }

    }

    private saveAll() {
        let s = this.currentProject.getSaveString();

        sendTextureToServer(this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"], "texture", this.currentProject.name, s).then(() => {
            UI.logEvent("", "saved!")

        }).catch(() => {
            UI.logEvent("", "error saving", true)
        })
    }


    private setTool(toolType: ToolType) {
        this.currentTool = toolType;

        if(toolType==ToolType.Paint){
            this.modelMainState = ModelMainState.draw;
        }else{
            this.modelMainState = ModelMainState.cut;
        }

        this.cutting.setTool( this.currentTool)

    }
}
