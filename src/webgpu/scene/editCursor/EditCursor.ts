import Renderer from "../../lib/Renderer.ts";
import Model from "../../lib/model/Model.ts";
import CanvasRenderPass from "../../CanvasRenderPass.ts";
import Object3D from "../../lib/model/Object3D.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import SolidMaterial from "../../lib/material/materials/SolidMaterial.ts";
import ModelRenderer from "../../lib/model/ModelRenderer.ts";
import Camera from "../../lib/Camera.ts";
import RevolveMesh from "../../lib/mesh/geometry/RevolveMesh.ts";
import MouseListener from "../../lib/MouseListener.ts";
import Ray from "../../lib/Ray.ts";
import {Vector3, Vector4} from "@math.gl/core";
import CircleMesh from "./CircleMesh.ts";
import SolidLineMaterial from "../../lib/material/materials/SolidLineMaterial.ts";
import CircleLineMaterial from "./CircleLineMaterial.ts";
import ColorV from "../../lib/ColorV.ts";
import Color from "../../lib/UI/math/Color.ts";


export default class EditCursor {
    private renderer: Renderer;
    private currentModel: Model | null = null;
    private root: Object3D;
    private arrowMesh: Mesh

    private arrowY: Model;
    private modelRenderer: ModelRenderer;
    private arrowX: Model;
    private arrowZ: Model;
    private camera: Camera;
    private mouseListener: MouseListener;
    private ray: Ray;
    private intersectionPlanePos: Vector3 = new Vector3();
    private intersectionPlaneDir: Vector3 = new Vector3();
    private startDragPos!: Vector3;
    private isDragging: boolean = false;
    private move!: string;

    private circleMesh: CircleMesh;
    private circleX: Model;
    private circleY: Model;
    private circleZ: Model;

    private red:ColorV =new ColorV();
    private green:ColorV=new ColorV();
    private blue:ColorV=new ColorV();
    constructor(renderer: Renderer, camera: Camera, mouseListener: MouseListener, ray: Ray) {

        this.red.setHex("#dc4d58")
        this.green.setHex("#93c849")
        this.blue.setHex("#5e93ec")
        this.mouseListener = mouseListener;
        this.ray = ray;
        this.renderer = renderer;
        this.camera = camera;
        this.root = new Object3D(renderer, "rootCursor");
        this.root.setScaler(0.2)

        this.arrowMesh = new RevolveMesh(this.renderer, "arrow", 8, [0, 0.01, 0.01, 0.05, 0], [0, 0, 0.8, 0.8, 1])

        this.arrowX = new Model(this.renderer, "x")
        this.arrowX.mesh = this.arrowMesh
        this.arrowX.setEuler(0, 0, -Math.PI / 2)
        this.arrowX.material = new SolidMaterial(renderer, "up")
        this.arrowX.material.setUniform("color", this.red)
        this.arrowX.material.depthCompare = "always"
        this.root.addChild(this.arrowX)


        this.arrowY = new Model(this.renderer, "y")
        this.arrowY.mesh = this.arrowMesh
        this.arrowY.material = new SolidMaterial(renderer, "up")
        this.arrowY.material.setUniform("color", this.green)
        this.arrowY.material.depthCompare = "always"
        this.root.addChild(this.arrowY)


        this.arrowZ = new Model(this.renderer, "z")
        this.arrowZ.mesh = this.arrowMesh
        this.arrowZ.setEuler(Math.PI / 2, 0, 0)
        this.arrowZ.material = new SolidMaterial(renderer, "up")
        this.arrowZ.material.depthCompare = "always"
        this.arrowZ.material.setUniform("color", this.blue)
        this.root.addChild(this.arrowZ)


        this.circleMesh = new CircleMesh(this.renderer,64);
        this.circleX = new Model(this.renderer, "cx")
        this.circleX.mesh =this.circleMesh.mesh;
        this.circleX.setEuler(0,Math.PI/2,0);
        this.circleX.material = new CircleLineMaterial(this.renderer,"CircleLineMaterial")
        this.circleX.material.setUniform("color",this.red);
        this.root.addChild(this.circleX)


        this.circleY = new Model(this.renderer, "cx")
        this.circleY.mesh =this.circleMesh.mesh;
        this.circleY.setEuler(Math.PI/2,0,0);
        this.circleY.material = new CircleLineMaterial(this.renderer,"CircleLineMaterial")
        this.circleY.material.setUniform("color",this.green);
        this.root.addChild(this.circleY)

        this.circleZ = new Model(this.renderer, "cx")
        this.circleZ.mesh =this.circleMesh.mesh;
        this.circleZ.material = new CircleLineMaterial(this.renderer,"CircleLineMaterial")
        this.circleZ.material.setUniform("color",this.blue);
        this.root.addChild(this.circleZ)


        this.modelRenderer = new ModelRenderer(this.renderer, "render", camera)

        this.modelRenderer.addModel(this.arrowY)
        this.modelRenderer.addModel(this.arrowX)
        this.modelRenderer.addModel(this.arrowZ)
        this.modelRenderer.addModel( this.circleX)
        this.modelRenderer.addModel( this.circleY)
        this.modelRenderer.addModel( this.circleZ)
    }

    checkMouse() {
        if (!this.currentModel) return false;


        if (this.mouseListener.isDownThisFrame) {
            let intersections = this.ray.intersectModels([this.arrowX, this.arrowY, this.arrowZ])
            if (intersections.length == 0) return false;

            if (intersections[0].model.label == "x") {
                this.intersectionPlanePos = this.currentModel.getWorldPos();

                //let dir1  =this.ray.rayDir.dot([0,0,1])
                //let dir2  =this.ray.rayDir.dot([0,1,0])
                //console.log(dir1,dir2)

                this.intersectionPlaneDir.set(0, 0, 1);
                this.move = "x"
            }
            if (intersections[0].model.label == "y") {
                this.intersectionPlanePos = this.currentModel.getWorldPos();
               /* let dir1  =this.ray.rayDir.dot([0,0,1])
                let dir2  =this.ray.rayDir.dot([1,0,0])
                console.log(dir1,dir2)*/
                this.intersectionPlaneDir.set(0, 0, 1);
                this.move = "y"
            }
            if (intersections[0].model.label == "z") {
                this.intersectionPlanePos = this.currentModel.getWorldPos();
               /* let dir1  =this.ray.rayDir.dot([1,0,0])
                let dir2  =this.ray.rayDir.dot([0,1,0])
                console.log(dir1,dir2)*/
                this.intersectionPlaneDir.set(1, 0, 0);
                this.move = "z"
            }
            let pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir)
            if (pos) {
                this.startDragPos = pos;
                this.isDragging = true;
            }
        }

        //move/rotate/scale
        if (this.isDragging) {
            let pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir);

            if (pos) {
                if (this.move == "x") {
                    let dist = this.startDragPos.x - pos.x;
                    this.currentModel.setPosition(this.intersectionPlanePos.x + dist, this.intersectionPlanePos.y, this.intersectionPlanePos.z)
                }
                if (this.move == "y") {
                    let dist = this.startDragPos.y - pos.y;
                    this.currentModel.setPosition(this.intersectionPlanePos.x, this.intersectionPlanePos.y + dist, this.intersectionPlanePos.z)
                }
                if (this.move == "z") {
                    let dist = this.startDragPos.z - pos.z;
                    this.currentModel.setPosition(this.intersectionPlanePos.x, this.intersectionPlanePos.y, this.intersectionPlanePos.z + dist)
                }
            }

        }

        if (this.mouseListener.isUpThisFrame && this.isDragging) {
            this.isDragging = false
        }
        return this.isDragging;
    }

    public update() {

        if (!this.currentModel) return;

        let camDistance =this.currentModel.getWorldPos().distance(this.camera.cameraWorld)
        this.circleX.material.setUniform("ratio",this.renderer.ratio)
        this.circleX.material.setUniform("maxDist",camDistance)
        this.circleX.material.setUniform("thickness",4/this.renderer.height)

        this.circleY.material.setUniform("ratio",this.renderer.ratio)
        this.circleY.material.setUniform("maxDist",camDistance)
        this.circleY.material.setUniform("thickness",4/this.renderer.height)

        this.circleZ.material.setUniform("ratio",this.renderer.ratio)
        this.circleZ.material.setUniform("maxDist",camDistance)
        this.circleZ.material.setUniform("thickness",4/this.renderer.height)

        let p = this.currentModel.getWorldPos();
        this.root.setPositionV(p);

        let pUp = p.clone().add(this.camera.cameraUp)
        p.transformAsPoint(this.camera.viewProjection)
        pUp.transformAsPoint(this.camera.viewProjection)
        let scale = 1 / p.distance(pUp);
        this.root.setScaler(scale * 0.2)


    }

    setCurrentModel(model: Model | null) {
        this.currentModel = model;
        if (!this.currentModel) return


    }

    drawFinal(pass: CanvasRenderPass) {
        if (!this.currentModel) return
        this.modelRenderer.draw(pass);

    }

    draw() {

    }


}
