import Renderer from "../../lib/Renderer.ts";
import Project from "../Project.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import Model from "../../lib/model/Model.ts";
import ModelPreviewMaterial from "../ModelPreviewMaterial.ts";
import ExtrudeMesh from "../../lib/mesh/ExtrudeMesh.ts";
import ShapeLineModel from "./ShapeLineModel.ts";
import ProjectMesh from "../ProjectMesh.ts";
import Path from "../../lib/path/Path.ts";
import PathEditor from "../../lib/path/editor/PathEditor.ts";


enum CurveType{
    Line,
    Bezier

}

export default class Cutting{
    private readonly renderer: Renderer;
    model3D: Model;
    shapeLineModel:ShapeLineModel;

    private readonly mesh: ExtrudeMesh;

    private project!: Project;
    private currentMesh!: ProjectMesh|null;
    private setCenter: boolean =false;


    private curveType:CurveType =CurveType.Line;
    pathEditor: PathEditor;

    constructor(renderer:Renderer) {





        this.renderer =renderer
        this.shapeLineModel = new ShapeLineModel(this.renderer,"lines1");

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
        if(this.project.meshes.length){
            this.currentMesh = this.project.meshes[0];
        }else{
            this.currentMesh =null;
        }

        this.updateLine();
    }

    setMouse(mouseLocal: Vector2, isDownThisFrame: boolean, isUpThisFrame: boolean) {
        if(!this.currentMesh)return;
        if (isDownThisFrame && !UI.needsMouse()) {
            if(this.setCenter){
                this.currentMesh.setCenter(mouseLocal);
                this.setCenter =false;
                this.updateLine()
            }else {


                this.addVectorPoint(mouseLocal);
            }
        }
    }

    private addVectorPoint(point: Vector2) {
        if(this.currentMesh){

            if(!this.currentMesh.path.started){
                this.currentMesh.path.moveTo(point)

            }
            else {
                if(this.curveType ==CurveType.Line){

                    this.currentMesh.path.lineTo(point)
                }
                else if(this.curveType ==CurveType.Bezier){
                    this.currentMesh.path.autoBezier(point);
                }

            }

            this.updateLine();

        }
    }

    private updateLine() {

        if(!this.currentMesh)return;
        this.shapeLineModel.setPath(this.currentMesh.path)
        if(this.currentMesh.path.numCurves>1) {
            this.model3D.visible =true;
            this.mesh.setExtrusion(this.positionsToVec2(this.shapeLineModel.positions), 0.03, new Vector3())
        }
        this.pathEditor.setPath(this.currentMesh.path)


    }
    positionsToVec2(positions:Array<number>):Array<Vector2>{

        let arr:Array<Vector2> =[]
        for(let i=0;i<positions.length;i+=3){
            let p =new Vector2(positions[i],positions[i+1])
            arr.push(p);


        }



        return arr;
    }
    onUI() {
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
        UI.separator("meshSep",false)
        if(UI.LButton("Line"))
        {
            this.curveType =CurveType.Line
        }
        if(UI.LButton("Bezier"))
        {
            this.curveType =CurveType.Bezier
        }
        if( this.currentMesh){
           /* if(this.currentMesh.points.length>0){
                if(UI.LButton("Remove last point"))
                {
                    this.currentMesh.points.pop()
                    this.updateLine();
                }

            }*/
            if(UI.LButton("Set Center"))
            {
                this.setCenter =true;
            }

        }
    }

    update() {
        this.pathEditor.update()
    }
}
