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
import {Matrix4, Quaternion, Vector2, Vector3, Vector4} from "@math.gl/core";
import CircleMesh from "./CircleMesh.ts";
import CircleLineMaterial from "./CircleLineMaterial.ts";
import ColorV from "../../lib/ColorV.ts";
import {ToolState} from "../Scene.ts";


export default class EditCursor {
    private renderer: Renderer;
    private currentModel: Model | null = null;
    private root: Object3D;
    private arrowMesh: Mesh

    private mouseStart=new Vector2();
    private objectScreen=new Vector2();
    private startQuat: Quaternion =new Quaternion();
    private rotQuat: Quaternion =new Quaternion();

    private modelRenderer: ModelRenderer;
    private arrowX: Model;
    private arrowY: Model;
    private arrowZ: Model;

    private scaleX: Model;
    private scaleY: Model;
    private scaleZ: Model;

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

    private red: ColorV = new ColorV();
    private green: ColorV = new ColorV();
    private blue: ColorV = new ColorV();
    private currentToolState!: ToolState;
    private scaleMesh: RevolveMesh;
    private cursorSize: number=0.2;
    private scaleStart: Vector3 =new Vector3();


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


        this.scaleMesh = new RevolveMesh(this.renderer, "arrow", 8, [0, 0.01, 0.01, 0.08, 0.08, 0], [0, 0, 0.87, 0.87, 1, 1])

        this.scaleX = new Model(this.renderer, "sx")
        this.scaleX.mesh = this.scaleMesh
        this.scaleX.setEuler(0, 0, -Math.PI / 2)
        this.scaleX.material = new SolidMaterial(renderer, "up")
        this.scaleX.material.setUniform("color", this.red)
        this.scaleX.material.depthCompare = "always"
        this.root.addChild(this.scaleX)


        this.scaleY = new Model(this.renderer, "sy")
        this.scaleY.mesh = this.scaleMesh
        this.scaleY.material = new SolidMaterial(renderer, "up")
        this.scaleY.material.setUniform("color", this.green)
        this.scaleY.material.depthCompare = "always"
        this.root.addChild(this.scaleY)


        this.scaleZ = new Model(this.renderer, "sz")
        this.scaleZ.mesh = this.scaleMesh
        this.scaleZ.setEuler(Math.PI / 2, 0, 0)
        this.scaleZ.material = new SolidMaterial(renderer, "up")
        this.scaleZ.material.depthCompare = "always"
        this.scaleZ.material.setUniform("color", this.blue)
        this.root.addChild(this.scaleZ)


        this.circleMesh = new CircleMesh(this.renderer, 64);
        this.circleX = new Model(this.renderer, "cx")
        this.circleX.mesh = this.circleMesh.mesh;
        this.circleX.setEuler(0, Math.PI / 2, 0);
        this.circleX.material = new CircleLineMaterial(this.renderer, "CircleLineMaterial")
        this.circleX.material.setUniform("color", this.red);
        this.root.addChild(this.circleX)


        this.circleY = new Model(this.renderer, "cx")
        this.circleY.mesh = this.circleMesh.mesh;
        this.circleY.setEuler(Math.PI / 2, 0, 0);
        this.circleY.material = new CircleLineMaterial(this.renderer, "CircleLineMaterial")
        this.circleY.material.setUniform("color", this.green);
        this.root.addChild(this.circleY)

        this.circleZ = new Model(this.renderer, "cx")
        this.circleZ.mesh = this.circleMesh.mesh;
        this.circleZ.material = new CircleLineMaterial(this.renderer, "CircleLineMaterial")
        this.circleZ.material.setUniform("color", this.blue);
        this.root.addChild(this.circleZ)


        this.modelRenderer = new ModelRenderer(this.renderer, "render", camera)

        this.modelRenderer.addModel(this.arrowY);
        this.modelRenderer.addModel(this.arrowX);
        this.modelRenderer.addModel(this.arrowZ);
        this.modelRenderer.addModel(this.circleX);
        this.modelRenderer.addModel(this.circleY);
        this.modelRenderer.addModel(this.circleZ);
        this.modelRenderer.addModel(this.scaleX);
        this.modelRenderer.addModel(this.scaleY);
        this.modelRenderer.addModel(this.scaleZ);
    }

    checkMouse() {
        if (!this.currentModel) return false;

        if(this.currentToolState==ToolState.translate)this.checkMouseTranslate();
        if(this.currentToolState==ToolState.scale)this.checkMouseScale();
        if(this.currentToolState==ToolState.rotate) this.checkMouseRotate();
        return this.isDragging;
    }

    public update() {

        if (!this.currentModel) return;

        let camDistance = this.currentModel.getWorldPos().distance(this.camera.cameraWorld)

        if(this.currentToolState==ToolState.rotate) {

            this.circleX.material.setUniform("ratio", this.renderer.ratio)
            this.circleX.material.setUniform("maxDist", camDistance)
            this.circleX.material.setUniform("thickness", 4 / this.renderer.height)

            this.circleY.material.setUniform("ratio", this.renderer.ratio)
            this.circleY.material.setUniform("maxDist", camDistance)
            this.circleY.material.setUniform("thickness", 4 / this.renderer.height)

            this.circleZ.material.setUniform("ratio", this.renderer.ratio)
            this.circleZ.material.setUniform("maxDist", camDistance)
            this.circleZ.material.setUniform("thickness", 4 / this.renderer.height)
        }

        let p = this.currentModel.getWorldPos();

        this.root.setPositionV(p);
        if(this.currentToolState==ToolState.translate ){
            this.root.setRotation(0,0,0,1)
        }else{
            this.root.setRotationQ(this.currentModel.getRotation())
        }

        let pUp = p.clone().add(this.camera.cameraUp)
        p.transformAsPoint(this.camera.viewProjection)
        pUp.transformAsPoint(this.camera.viewProjection)
        let scale = 1 / p.distance(pUp);

        this.root.setScaler(scale * this.cursorSize)


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

    setToolState(currentToolState: ToolState) {
        this.currentToolState = currentToolState;

        this.arrowX.visible = false;
        this.arrowY.visible = false;
        this.arrowZ.visible = false;
        this.circleX.visible = false;
        this.circleY.visible = false;
        this.circleZ.visible = false;
        this.scaleX.visible = false;
        this.scaleY.visible = false;
        this.scaleZ.visible = false;

        if (this.currentToolState == ToolState.translate) {
            this.arrowX.visible = true;
            this.arrowY.visible = true;
            this.arrowZ.visible = true;
        } else if (this.currentToolState == ToolState.rotate) {
            this.circleX.visible = true;
            this.circleY.visible = true;
            this.circleZ.visible = true;
        } else if (this.currentToolState == ToolState.scale) {
            this.scaleX.visible = true;
            this.scaleY.visible = true;
            this.scaleZ.visible = true;
        }

    }

    private checkMouseTranslate() {

        if(!this.currentModel)return;
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
                    // @ts-ignore
                    this.currentModel.setPosition(this.intersectionPlanePos.x + dist, this.intersectionPlanePos.y, this.intersectionPlanePos.z)
                }
                if (this.move == "y") {
                    let dist = this.startDragPos.y - pos.y;
                    // @ts-ignore
                    this.currentModel.setPosition(this.intersectionPlanePos.x, this.intersectionPlanePos.y + dist, this.intersectionPlanePos.z)
                }
                if (this.move == "z") {
                    let dist = this.startDragPos.z - pos.z;
                    // @ts-ignore
                    this.currentModel.setPosition(this.intersectionPlanePos.x, this.intersectionPlanePos.y, this.intersectionPlanePos.z + dist)
                }
            }

        }

        if (this.mouseListener.isUpThisFrame && this.isDragging) {
            this.isDragging = false
        }
    }
    private checkMouseRotate() {
        if(!this.currentModel)return;
        if (this.mouseListener.isDownThisFrame) {
            let objWorld = this.currentModel.getWorldPos()

            let q =   this.currentModel.getRotation()
            let m = new Matrix4()
            m.fromQuaternion(q);
            m.invert()
            let pos =this.ray.intersectSphere(objWorld, this.cursorSize/2*1.1,m)

            if(pos){
                pos.normalize();
                pos.x =Math.abs(pos.x);
                pos.y =Math.abs(pos.y);
                pos.z =Math.abs(pos.z);
                if(pos.x<pos.y && pos.x<pos.z){
                    this.move = "x"
                }else  if(pos.y<pos.x && pos.y<pos.z){
                    this.move = "y"
                }else  if(pos.z<pos.y && pos.z<pos.x){
                    this.move = "z"
                }

                this.mouseStart.from(this.mouseListener.mousePos)
                let world=new Vector4(objWorld.x,objWorld.y,objWorld.z,1.0);
                world.transform(  this.camera.viewProjection)

                this.objectScreen.set(world.x+1.0,2.0-(world.y+1.0))
                this.objectScreen.scale([this.renderer.width/2,this.renderer.height/2])
                this.startQuat.from(this.currentModel.getRotation())
                this.isDragging = true;
            }


        }
        if(this.isDragging){

            let v1 =new Vector2(this.mouseListener.mousePos).subtract(this.objectScreen)
            let v2 =new Vector2( this.mouseStart).subtract(this.objectScreen)
            let angle =v2.horizontalAngle()-v1.horizontalAngle()

            this.rotQuat.identity()
           // console.log("scale",this.move)
            if(this.move=="x"){
                this.rotQuat.rotateX(-angle)

        }
            if(this.move=="y"){
                this.rotQuat.rotateY(angle)

            }
            if(this.move=="z"){
                this.rotQuat.rotateZ(angle)

            }

            this.rotQuat.multiplyLeft(this.startQuat)
            this.currentModel.setRotationQ(this.rotQuat)

        }

        if (this.mouseListener.isUpThisFrame) {
            this.isDragging = false;
        }

    }
    private checkMouseScale() {
        if(!this.currentModel)return;
        if (this.mouseListener.isDownThisFrame) {

            let intersections = this.ray.intersectModels([this.scaleX, this.scaleY, this.scaleZ])
            if (intersections.length == 0) return false;

            this.scaleStart.from(this.currentModel.getScale());
            if (intersections[0].model.label == "sx") {

                this.move = "x"
            }
            if (intersections[0].model.label == "sy") {

                this.move = "y"
            }
            if (intersections[0].model.label == "sz") {

                this.move = "z"
            }
            let objWorld = this.currentModel.getWorldPos();
            this.mouseStart.from(this.mouseListener.mousePos);
            let world=new Vector4(objWorld.x,objWorld.y,objWorld.z,1.0);
            world.transform(  this.camera.viewProjection)
            this.objectScreen.set(world.x+1.0,2.0-(world.y+1.0))
            this.objectScreen.scale([this.renderer.width/2,this.renderer.height/2])
              //  this.startDragPos = pos;
            this.isDragging = true;

        }
        if(this.isDragging){


            let dis =this.mouseListener.mousePos.distance(this.objectScreen)
            let disStart = this.mouseStart.distance(this.objectScreen)
            let scale = dis/disStart;

            if(this.move=="x"){
                this.currentModel.setScale(this.scaleStart.x*scale,this.scaleStart.y,this.scaleStart.z);
            }else  if(this.move=="y"){
                this.currentModel.setScale(this.scaleStart.x,this.scaleStart.y*scale,this.scaleStart.z);
            }else  if(this.move=="z"){
                this.currentModel.setScale(this.scaleStart.x,this.scaleStart.y,this.scaleStart.z*scale);
            }
        }

        if (this.mouseListener.isUpThisFrame) {
            this.isDragging = false;
        }

    }
}
