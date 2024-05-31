import Renderer from "../../lib/Renderer.ts";
import Project from "../Project.ts";
import {Vector2, Vector3} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import Model from "../../lib/model/Model.ts";
import ModelPreviewMaterial from "../ModelPreviewMaterial.ts";
import ExtrudeMesh from "../../lib/mesh/ExtrudeMesh.ts";
import ShapeLineModel from "./ShapeLineModel.ts";
import ProjectMesh from "../ProjectMesh.ts";

export default class Cutting{
    private readonly renderer: Renderer;
    model3D: Model;
    shapeLineModel:ShapeLineModel;
    private readonly mesh: ExtrudeMesh;

    private project!: Project;
    private currentMesh!: ProjectMesh|null;
    constructor(renderer:Renderer) {



        this.renderer =renderer
        this.shapeLineModel = new ShapeLineModel(this.renderer);

        this.model3D = new Model(renderer, "model3D")
        this.model3D.material = new ModelPreviewMaterial(renderer, "preview")

        this.mesh = new ExtrudeMesh(renderer, "3DMesh")
        this.model3D.mesh = this.mesh;
        this.model3D.visible = false;
        this.model3D.material.setTexture("colorTexture", this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"])
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
            this.addVectorPoint(mouseLocal);

        }
    }

    private addVectorPoint(point: Vector2) {
        if(this.currentMesh){
            this.currentMesh.points.push(point.clone())
            this.updateLine();
        }
    }

    private updateLine() {

        if(this.currentMesh){
            this.currentMesh.updateCenter()
            this.shapeLineModel.setLine(this.currentMesh.points,this.currentMesh.center)
            if (this.currentMesh.points.length >= 3) {
                this.model3D.visible = true;
                this.mesh.setExtrusion(this.currentMesh.points, 0.03, new Vector3(this.currentMesh.center.x, this.currentMesh.center.y, 0))
            } else {
                this.model3D.visible = false;
            }
        }else{

            this.shapeLineModel.setLine([],new Vector2(0.5,0.5));
            this.model3D.visible = false;
        }




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
        if( this.currentMesh){
            if(this.currentMesh.points.length>0){
                if(UI.LButton("Remove last point"))
                {
                    this.currentMesh.points.pop()
                    this.updateLine();
                }

            }


        }
    }
}
