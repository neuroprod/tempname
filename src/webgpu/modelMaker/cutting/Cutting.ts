import Renderer from "../../lib/Renderer.ts";
import Project from "../Project.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import Model from "../../lib/model/Model.ts";
import ModelPreviewMaterial from "../ModelPreviewMaterial.ts";
import ExtrudeMesh from "../../lib/mesh/ExtrudeMesh.ts";

import ProjectMesh from "../ProjectMesh.ts";
import PathEditor from "./PathEditor.ts";
import Camera from "../../lib/Camera.ts";
import {NumericArray} from "@math.gl/types";
import {ToolType} from "../ModelMaker.ts";

import Path from "../../lib/path/Path.ts";
import FatShapeLineModel from "./FatShapeLineModel.ts";


export default class Cutting {
    model3D: Model;
    shapeLineModelSelect: FatShapeLineModel;
    shapeLineModelAll: FatShapeLineModel;
    pathEditor: PathEditor;
    private readonly renderer: Renderer;
    private readonly mesh: ExtrudeMesh;
    private project!: Project;
    private currentMesh!: ProjectMesh | null;
    private toolType: ToolType =ToolType.None;
    private camera: Camera;
    private currentHitPoint!: Vector3 | null;
    private currentMousePoint: Vector2 = new Vector2();
    private prevMousePoint: Vector2 = new Vector2();
    private isDraggingPoint: boolean = false;
    private isDraggingMove: boolean = false;

    constructor(renderer: Renderer, camera: Camera) {

        this.camera = camera
        this.renderer = renderer
        this.shapeLineModelSelect = new FatShapeLineModel(this.renderer, "linesSelect",false);
        this.shapeLineModelAll= new FatShapeLineModel(this.renderer, "linesAll",true);

        this.model3D = new Model(renderer, "model3D")
        this.model3D.material = new ModelPreviewMaterial(renderer, "preview")

        this.mesh = new ExtrudeMesh(renderer, "3DMesh")
        this.model3D.mesh = this.mesh;
        this.model3D.visible = false;
        this.model3D.material.setTexture("colorTexture", this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"])

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

    setMouse(mouseLocal: Vector2, isDownThisFrame: boolean, isUpThisFrame: boolean) {
        if (!this.currentMesh) return;
        if (isDownThisFrame && !UI.needsMouse()) {
            if (this.toolType == ToolType.Center) {
                this.currentMesh.setCenter(mouseLocal);
                this.updateLine()
            }
            if (this.toolType == ToolType.Edit) {

                this.currentHitPoint = this.pathEditor.getHitPoint(new Vector3(mouseLocal.x, mouseLocal.y, 0))
                if (this.currentHitPoint) {
                    this.prevMousePoint.from(mouseLocal)
                    this.isDraggingPoint = true;
                }
            }
            if (this.toolType == ToolType.Move) {


                this.prevMousePoint.from(mouseLocal)
                this.isDraggingMove = true;

            }  if (this.toolType == ToolType.Select) {



                this.getPathFromMousePoint(mouseLocal);

            } else {
                this.addVectorPoint(mouseLocal);
            }
        } else if (this.isDraggingPoint && this.currentHitPoint) {
            this.currentMousePoint.from(mouseLocal);
            this.currentMousePoint.subtract(this.prevMousePoint as NumericArray);

            if (this.currentMousePoint.lengthSquared() > 0) {
                this.currentHitPoint.add([this.currentMousePoint.x, this.currentMousePoint.y, 0]);

                this.prevMousePoint.from(mouseLocal);
                this.updateLine()
            }
            if (isUpThisFrame) this.isDraggingPoint = false;
        } else if (this.isDraggingMove) {
            this.currentMousePoint.from(mouseLocal);
            this.currentMousePoint.subtract(this.prevMousePoint as NumericArray);

            if (this.currentMousePoint.lengthSquared() > 0) {

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

    onUI() {


        if (this.currentMesh) {

          /*  if (UI.LButton("Line", "", this.curveType != CurveType.Line)) {
                this.curveType = CurveType.Line
            }
            if (UI.LButton("Bezier", "", this.curveType != CurveType.Bezier)) {
                this.curveType = CurveType.Bezier
            }
            if (UI.LButton("Set Center", "", this.curveType != CurveType.Center)) {
                this.curveType = CurveType.Center;
            }
            if (this.currentMesh.path.numCurves > 0) {

                if (UI.LButton("Edit", "", this.curveType != CurveType.Edit)) {
                    this.curveType = CurveType.Edit;

                }
                if (UI.LButton("Move", "", this.curveType != CurveType.Move)) {
                    this.curveType = CurveType.Move;

                }
                if (UI.LButton("Remove Last Line")) {

                    this.currentMesh.path.removeLastCurve()
                    this.updateLine()
                }
            }

*/
            UI.separator("meshSep", false)
        }
        UI.pushLList("Meshes", 100);

        for (let m of this.project.meshes) {
            if (UI.LListItem(m.name, m == this.currentMesh)) {
                this.currentMesh = m;
                this.updateLine();
            }

        }
        UI.popList();
        let newName = UI.LTextInput("new Mesh", "")
        if (UI.LButton("+ Add Mesh")) {

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

    }

    update() {
        this.pathEditor.update()

        this.shapeLineModelAll.material.setUniform("ratio",this.renderer.ratio)
        this.shapeLineModelAll.material.setUniform("lineSize",3/this.renderer.height)

        this.shapeLineModelSelect.material.setUniform("ratio",this.renderer.ratio)
        this.shapeLineModelSelect.material.setUniform("lineSize",3/this.renderer.height)
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
        if (this.currentMesh.path.numCurves > 1) {
            this.model3D.visible = true;
            this.mesh.setExtrusion(this.positionsToVec2(this.shapeLineModelSelect.positions), 0.03, new Vector3())
        }
        this.pathEditor.setPath(this.currentMesh.path, this.currentMesh.center)


    }



    setTool(currentTool: ToolType) {
        this.toolType = currentTool
        if(this.toolType==ToolType.Select|| this.toolType==ToolType.Paint){
            let paths:Array<Path>  =[];
            for (let m of this.project.meshes) {
                paths.push(m.path)

            }
            this.shapeLineModelAll.setPaths(paths)

            this.shapeLineModelSelect.visible =(this.toolType==ToolType.Select);
            this.pathEditor.pointModel.visible =false;
        }else{
            this.shapeLineModelAll.visible =false
            this.shapeLineModelSelect.visible =true;
            this.pathEditor.pointModel.visible =true;

        }
    }

    private getPathFromMousePoint(mouseLocal: Vector2) {

        let dist = Number.MAX_VALUE
        let mouse3D = new Vector3(mouseLocal.x,mouseLocal.y,0);
        let pm:ProjectMesh|null =null

        for (let m of this.project.meshes) {
            let pDist = m.path.getDistance(mouse3D);

            if(pDist<dist){
                dist =pDist;
                pm =m;
            }


        }

        this.shapeLineModelAll.visible =true;
        this.shapeLineModelSelect.visible =true;
        this.setCurrentMesh(pm)
        this.pathEditor.pointModel.visible =false;


    }

    private setCurrentMesh(pm: ProjectMesh|null) {
        this.currentMesh =pm;
        this.updateLine()

    }
}
