import Renderer from "../../lib/Renderer.ts";
import Project from "../Project.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import Model from "../../lib/model/Model.ts";
import ModelPreviewMaterial from "../ModelPreviewMaterial.ts";
import ExtrudeMesh from "../../lib/mesh/ExtrudeMesh.ts";
import ShapeLineModel from "./ShapeLineModel.ts";
import ProjectMesh from "../ProjectMesh.ts";
import PathEditor from "../../lib/path/editor/PathEditor.ts";
import Camera from "../../lib/Camera.ts";
import {NumericArray} from "@math.gl/types";


enum CurveType {
    Line,
    Bezier,
    Center,
    Edit,

}

export default class Cutting {
    model3D: Model;
    shapeLineModel: ShapeLineModel;
    pathEditor: PathEditor;
    private readonly renderer: Renderer;
    private readonly mesh: ExtrudeMesh;
    private project!: Project;
    private currentMesh!: ProjectMesh | null;
    private curveType: CurveType = CurveType.Line;
    private camera: Camera;
    private currentHitPoint: Vector3 | null;
    private currentMousePoint: Vector2 =new Vector2();
    private prevMousePoint: Vector2 =new Vector2();
    private isDraggingPoint: boolean =false;

    constructor(renderer: Renderer,camera:Camera) {

        this.camera =camera
        this.renderer = renderer
        this.shapeLineModel = new ShapeLineModel(this.renderer, "lines1");

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
            if (this.curveType == CurveType.Center) {
                this.currentMesh.setCenter(mouseLocal);
                this.updateLine()
            }  if (this.curveType == CurveType.Edit) {

               this.currentHitPoint =this.pathEditor.getHitPoint(new Vector3(mouseLocal.x,mouseLocal.y,0))
                if(this.currentHitPoint){
                   this.prevMousePoint.from(mouseLocal)
                   this.isDraggingPoint =true;
                }
            }

            else {


                this.addVectorPoint(mouseLocal);
            }
        }
        else if(this.isDraggingPoint && this.currentHitPoint){
            this.currentMousePoint.from(mouseLocal);
            this.currentMousePoint.subtract(this.prevMousePoint as NumericArray);

            if(this.currentMousePoint.lengthSquared()>0) {
                this.currentHitPoint.add([this.currentMousePoint.x,this.currentMousePoint.y,0]);

                this.prevMousePoint.from(mouseLocal);
                this.updateLine()
            }
            if(isUpThisFrame)this.isDraggingPoint =false;
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

            if (UI.LButton("Line", "", this.curveType != CurveType.Line)) {
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

                if (UI.LButton("Remove Last Line")) {

                    this.currentMesh.path.removeLastCurve()
                    this.updateLine()
                }
            }


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
    }

    private addVectorPoint(point: Vector2) {
        if (this.currentMesh) {

            if (!this.currentMesh.path.started) {
                this.currentMesh.path.moveTo(point)

            } else {
                if (this.curveType == CurveType.Line) {

                    this.currentMesh.path.lineTo(point)
                } else if (this.curveType == CurveType.Bezier) {
                    this.currentMesh.path.autoBezier(point);
                }

            }

            this.updateLine();

        }
    }

    private updateLine() {

        if (!this.currentMesh) return;
        this.shapeLineModel.setPath(this.currentMesh.path)
        if (this.currentMesh.path.numCurves > 1) {
            this.model3D.visible = true;
            this.mesh.setExtrusion(this.positionsToVec2(this.shapeLineModel.positions), 0.03, new Vector3())
        }
        this.pathEditor.setPath(this.currentMesh.path, this.currentMesh.center)


    }

    private getClosestCurvePoint(mouseLocal: Vector2) {

    }
}
