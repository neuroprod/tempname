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
import {Matrix3, Quaternion, Vector2, Vector3, Vector4} from "@math.gl/core";
import CircleMesh from "./CircleMesh.ts";
import CircleLineMaterial from "./CircleLineMaterial.ts";
import ColorV from "../../lib/ColorV.ts";
import {ToolState} from "../Scene.ts";
import SceneObject3D from "../SceneObject3D.ts";


export default class EditCursor {
    private renderer: Renderer;
    private currentModel: SceneObject3D | null = null;
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
    private startDragPos: Vector3= new Vector3();
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
    public localSpace: boolean =false;
    private planePos: Vector3=new Vector3();
    private movePos: Vector3 =new Vector3();
    private rootScale: number =1;
    private rootRot: Quaternion =new Quaternion();
    private rotDir: number =1;

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

            this.circleX.material.setUniform("ratio", 1/this.renderer.ratio)
            this.circleX.material.setUniform("maxDist", camDistance)
            this.circleX.material.setUniform("thickness", 3*this.renderer.pixelRatio / this.renderer.height)

            this.circleY.material.setUniform("ratio", 1/this.renderer.ratio)
            this.circleY.material.setUniform("maxDist", camDistance)
            this.circleY.material.setUniform("thickness", 3*this.renderer.pixelRatio / this.renderer.height)

            this.circleZ.material.setUniform("ratio", 1/this.renderer.ratio)
            this.circleZ.material.setUniform("maxDist", camDistance)
            this.circleZ.material.setUniform("thickness", 3*this.renderer.pixelRatio / this.renderer.height)
        }

        let p = this.currentModel.getWorldPos();

        this.root.setPositionV(p)

        if(!this.localSpace && this.currentToolState ==ToolState.translate) {

            this.root.setRotation(0,0,0,1)
        }
       else {

            let m =new Matrix3()
            this.currentModel.worldMatrix.getRotationMatrix3(m)
            this.rootRot.fromMatrix3(m)
            this.root.setRotationQ(this.rootRot)
        }


       //calculate screen size of tool
        let pUp = p.clone().add(this.camera.cameraUp)
        p.transformAsPoint(this.camera.viewProjection)
        pUp.transformAsPoint(this.camera.viewProjection)
        let scale = 1 / p.distance(pUp);

       this.rootScale = scale * this.cursorSize;
        this.root.setScaler(this.rootScale)


    }

    setCurrentModel(model: SceneObject3D | null) {
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



            if(this.localSpace){

                this.startDragPos.from( this.currentModel.getPosition())
                //we are going to transform the ray to the cursor local space
                this.intersectionPlanePos.set(0,0,0)
            }else{
                this.startDragPos.from( this.currentModel.getWorldPos())
                //we are going to check in world
                this.intersectionPlanePos.from(this.root.getPosition())
            }


            if (intersections[0].model.label == "x") {
                this.intersectionPlaneDir.set(0, 0, 1);
                this.move = "x"
            }
            if (intersections[0].model.label == "y") {
                this.intersectionPlaneDir.set(0, 0, 1);
                this.move = "y"
            }
            if (intersections[0].model.label == "z") {
                this.intersectionPlaneDir.set(1, 0, 0);
                this.move = "z"
            }
            let pos:Vector3|null
            if(this.localSpace){
                //we are going to transform the ray to the cursor local space
                pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir,this.root.worldMatrixInv)
            }else{
                //we are going to check in world
                pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir)
            }


            if (pos) {
                this.planePos = pos;
                this.isDragging = true;
            }
        }

        //move/rotate/scale
        if (this.isDragging) {
            let pos:Vector3|null
            if(this.localSpace){
                //we are going to transform the ray to the cursor local space
                pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir,this.root.worldMatrixInv)
            }else{
                //we are going to check in world
                pos = this.ray.intersectPlane(this.intersectionPlanePos, this.intersectionPlaneDir)
            }
            if (pos) {

                //TODO replace with mask vector
                if (this.move == "x") {
                    let dist = this.planePos.x - pos.x;
                    this.movePos.set(this.startDragPos.x+dist,this.startDragPos.y,this.startDragPos.z);
                }
                if (this.move == "y") {
                    let dist = this.planePos.y - pos.y;
                    this.movePos.set(this.startDragPos.x,this.startDragPos.y+dist,this.startDragPos.z);
                }
                if (this.move == "z") {
                    let dist = this.planePos.z - pos.z;
                    this.movePos.set(this.startDragPos.x,this.startDragPos.y,this.startDragPos.z+dist);
                }


                if(this.localSpace || !this.currentModel.parent){
                    this.currentModel.setPositionV(this.movePos)
                }else{
                    let lp = this.currentModel.parent?.getLocalPos(this.movePos);
                    if(lp) this.currentModel.setPositionV(lp)

                }
            }

        }

        if (this.mouseListener.isUpThisFrame && this.isDragging) {
            this.isDragging = false
        }
    }

    //alwaysLocal
    private checkMouseRotate() {
        if(!this.currentModel)return;
        if (this.mouseListener.isDownThisFrame) {
            let objWorld = this.root.getWorldPos();


            let pos =this.ray.intersectSphere(objWorld,this.cursorSize*0.5)


            if(pos){
                pos.subtract(objWorld)
                pos.normalize();

                pos.transformByQuaternion(   this.rootRot.invert())


                let poss=new Vector3()
                poss.x =Math.abs(pos.x);
                poss.y =Math.abs(pos.y);
                poss.z =Math.abs(pos.z);
                if(poss.x<poss.y && poss.x<poss.z){
                    this.move = "x"
                    this.rotDir = Math.sign(pos.z)
                }else  if(poss.y<poss.x && poss.y<poss.z){
                    this.move = "y"
                    this.rotDir = Math.sign(pos.z)
                }else  if(poss.z<poss.y && poss.z<poss.x){
                    this.move = "z"
                    this.rotDir = Math.sign(pos.z)
                }
                this.rotDir =1;
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
            angle*=this.rotDir
            this.rotQuat.identity()
           // console.log("scale",this.move)
            if(this.move=="x"){
                this.rotQuat.rotateX(angle)

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
        if(!this.currentModel.model)return;
        if (this.mouseListener.isDownThisFrame) {

            let intersections = this.ray.intersectModels([this.scaleX, this.scaleY, this.scaleZ])
            if (intersections.length == 0) return false;

            this.scaleStart.from(this.currentModel.model.getScale());
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

                if (this.move == "x") {
                    this.currentModel.model.setScale(this.scaleStart.x * scale, this.scaleStart.y, this.scaleStart.z);
                } else if (this.move == "y") {
                    this.currentModel.model.setScale(this.scaleStart.x, this.scaleStart.y * scale, this.scaleStart.z);
                } else if (this.move == "z") {
                    this.currentModel.model.setScale(this.scaleStart.x, this.scaleStart.y, this.scaleStart.z * scale);
                }

        }

        if (this.mouseListener.isUpThisFrame) {
            this.isDragging = false;
        }

    }
}
