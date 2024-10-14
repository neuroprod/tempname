import Renderer from "../../lib/Renderer.ts";
import Project from "../../data/Project.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import Model from "../../lib/model/Model.ts";
import ModelPreviewMaterial from "../preview/ModelPreviewMaterial.ts";
import ExtrudeMesh from "../ExtrudeMesh.ts";

import ProjectMesh, {MeshType} from "../../data/ProjectMesh.ts";
import PathEditor from "./PathEditor.ts";
import Camera from "../../lib/Camera.ts";
import {NumericArray} from "@math.gl/types";
import {ToolType} from "../ModelMaker.ts";

import Path from "../../lib/path/Path.ts";
import FatShapeLineModel from "./FatShapeLineModel.ts";
import ShapeLineModel from "./ShapeLineModel.ts";


export default class Cutting {
    model3D: Model;
    shapeLineModelSelect: FatShapeLineModel;
    shapeLineModelSelectControl: ShapeLineModel;
    shapeLineModelAll: FatShapeLineModel;
    pathEditor: PathEditor;
    public currentMesh!: ProjectMesh | null;
    private readonly renderer: Renderer;
    private readonly mesh: ExtrudeMesh;
    private project!: Project;
    private toolType: ToolType = ToolType.None;
    private camera: Camera;
    private currentMousePoint: Vector2 = new Vector2();
    private prevMousePoint: Vector2 = new Vector2();
    private isDraggingMove: boolean = false;

    constructor(renderer: Renderer, camera: Camera) {

        this.camera = camera
        this.renderer = renderer
        this.shapeLineModelSelect = new FatShapeLineModel(this.renderer, "linesSelect", false);
        this.shapeLineModelSelectControl = new ShapeLineModel(this.renderer, "linesControll")
        this.shapeLineModelAll = new FatShapeLineModel(this.renderer, "linesAll", true);

        this.model3D = new Model(renderer, "model3D")
        this.model3D.material = new ModelPreviewMaterial(renderer, "preview")

        this.mesh = new ExtrudeMesh(renderer, "3DMesh")
        this.model3D.mesh = this.mesh;
        this.model3D.visible = false;
        this.model3D.material.setTexture("colorTexture", this.renderer.getTexture("drawingBufferTemp"));

        this.pathEditor = new PathEditor(renderer)


    }


    setProject(project: Project) {
        this.project = project;
        if (this.project.meshes.length) {
            this.currentMesh = this.project.meshes[0];
        } else {
            this.currentMesh = null;
        }

        this.updateLine();
    }

    setMouse(mouseLocal: Vector2, isDownThisFrame: boolean, isUpThisFrame: boolean, ctrlDown: boolean) {
        if (!this.currentMesh) return;
        if (isDownThisFrame && !UI.needsMouse()) {
            if (this.toolType == ToolType.Center) {
                this.currentMesh.setCenter(mouseLocal);
                this.updateLine()
            }
            if (this.toolType == ToolType.Edit) {
                this.pathEditor.onMouseDown(new Vector3(mouseLocal.x, mouseLocal.y, 0), ctrlDown)

            }
            if (this.toolType == ToolType.Move) {


                this.prevMousePoint.from(mouseLocal)
                this.isDraggingMove = true;

            }
            if (this.toolType == ToolType.Select) {


                this.getPathFromMousePoint(mouseLocal);

            } else {
                this.addVectorPoint(mouseLocal);
            }
        } else if (this.toolType == ToolType.Edit) {

            if (this.pathEditor.onMouseMove(new Vector3(mouseLocal.x, mouseLocal.y, 0), isUpThisFrame)) this.updateLine()

        } else if (this.isDraggingMove) {
            this.currentMousePoint.from(mouseLocal);
            this.currentMousePoint.subtract(this.prevMousePoint as NumericArray);

            if (this.currentMousePoint.lengthSquared() > 0) {

                this.currentMesh.center.add(new Vector3(this.currentMousePoint.x, this.currentMousePoint.y, 0) as NumericArray)
                this.pathEditor.moveAllPoints(new Vector3(this.currentMousePoint.x, this.currentMousePoint.y, 0))
                this.prevMousePoint.from(mouseLocal);
                this.updateLine()
            }
            if (isUpThisFrame) this.isDraggingMove = false;
        }
    }

    positionsToVec2(positions: Array<number>): Array<Vector2> {

        let arr: Array<Vector2> = []
        for (let i = 0; i < positions.length; i += 3) {
            let p = new Vector2(positions[i], positions[i + 1])
            arr.push(p);
        }
        return arr;
    }

    removeCurrentMesh() {

        if (!this.currentMesh) return;
        let i = this.project.meshes.indexOf(this.currentMesh)
        this.project.meshes.splice(i, 1);
        if (this.project.meshes.length) {
            this.setCurrentMesh(this.project.meshes[0]);

        } else {
            this.setCurrentMesh(null);
        }
        this.updateLine()
        this.updateAllLines()
    }

    addMesh(newName: string) {
        let fail = false;
        if (newName.length == 0) {
            UI.logEvent("", "Mesh needs a name", true);
            fail = true
        }
        for (let m of this.project.meshes) {
            if (m.name == newName) {
                UI.logEvent("", "Mesh needs unique name", true);
                fail = true
                break;
            }
        }
        if (!fail) {
            this.currentMesh = new ProjectMesh(this.renderer);
            this.currentMesh.name = newName;
            this.updateLine()
            this.project.meshes.push(this.currentMesh)
        }

    }


    update() {
        this.pathEditor.update()

        this.shapeLineModelAll.material.setUniform("ratio", this.renderer.ratio)
        this.shapeLineModelAll.material.setUniform("lineSize", 3 / this.renderer.height)

        this.shapeLineModelSelect.material.setUniform("ratio", this.renderer.ratio)
        this.shapeLineModelSelect.material.setUniform("lineSize", 3 / this.renderer.height)
    }

    updateAllLines() {
        let paths: Array<Path> = [];
        for (let m of this.project.meshes) {
            paths.push(m.path)

        }
        this.shapeLineModelAll.setPaths(paths)
    }

    setTool(currentTool: ToolType) {
        this.toolType = currentTool
        if (this.toolType == ToolType.Select || this.toolType == ToolType.Paint || this.toolType == ToolType.Eraser) {
            this.updateAllLines()

            this.shapeLineModelSelect.visible = (this.toolType == ToolType.Select);
            this.pathEditor.pointModel.visible = false;
            this.shapeLineModelSelectControl.visible = false;
        } else {
            this.shapeLineModelAll.visible = false
            this.shapeLineModelSelect.visible = true;
            this.shapeLineModelSelectControl.visible = true;
            this.pathEditor.pointModel.visible = true;
            if (this.toolType == ToolType.Edit || this.toolType == ToolType.Move) {

                this.pathEditor.createEditStruct()
            }

        }
    }

    removeLastPoint() {
        if (this.currentMesh?.path) {
            this.currentMesh.path.removeLastCurve()
            this.updateLine()
        }
    }

    setMeshType(meshType: MeshType) {
        if (this.currentMesh) {
            this.currentMesh.meshType = meshType;
            this.setMesh()

        }

    }

    private addVectorPoint(point: Vector2) {
        if (this.currentMesh) {

            if (!this.currentMesh.path.started) {
                this.currentMesh.path.moveTo(point)

            } else {
                if (this.toolType == ToolType.Line) {

                    this.currentMesh.path.lineTo(point)
                } else if (this.toolType == ToolType.Bezier) {
                    this.currentMesh.path.autoBezier(point);
                }

            }

            this.updateLine();

        }
    }

    private updateLine() {

        if (!this.currentMesh) return;
        this.shapeLineModelSelect.setPath(this.currentMesh.path)
        this.shapeLineModelSelectControl.setPathControlPoints(this.currentMesh.path);
        if (this.currentMesh.path.numCurves > 1) {
            this.model3D.visible = true;
            this.setMesh()
        }
        this.pathEditor.setPath(this.currentMesh.path, this.currentMesh.center)


    }

    private getPathFromMousePoint(mouseLocal: Vector2) {

        let dist = Number.MAX_VALUE
        let mouse3D = new Vector3(mouseLocal.x, mouseLocal.y, 0);
        let pm: ProjectMesh | null = null

        for (let m of this.project.meshes) {
            let pDist = m.path.getDistance(mouse3D);

            if (pDist < dist) {
                dist = pDist;
                pm = m;
            }


        }

        this.shapeLineModelAll.visible = true;
        this.shapeLineModelSelect.visible = true;
        this.setCurrentMesh(pm)

        this.pathEditor.pointModel.visible = false;
        this.shapeLineModelSelectControl.visible = false;


    }

    private setCurrentMesh(pm: ProjectMesh | null) {
        this.currentMesh = pm;
        if(pm){
           if(pm.meshType ==MeshType.TRANS_PLANE){
               this.model3D.material.setUniform("transparent" ,1)
           }{
                this.model3D.material.setUniform("transparent" ,0)
            }
            this.model3D.visible =true
        }else{
            this.model3D.visible =false
        }
        this.updateLine()

    }

    private setMesh() {
        if (!this.currentMesh) return;


        if(this.currentMesh.meshType  ==MeshType.TRANS_PLANE){

            this.model3D.material.setUniform("transparent" ,1)
        }else {
            this.model3D.material.setUniform("transparent" ,0)
        }

        if (this.currentMesh.meshType == MeshType.REVOLVE) {
            this.mesh.setResolve(this.positionsToVec2(this.shapeLineModelSelect.positions), new Vector3(this.currentMesh.center.x, this.currentMesh.center.y, 0));

        } else {


            this.mesh.setExtrusion(this.positionsToVec2(this.shapeLineModelSelect.positions), this.currentMesh.meshType, 0.03, new Vector3(this.currentMesh.center.x, this.currentMesh.center.y, 0));

        }

    }
}
