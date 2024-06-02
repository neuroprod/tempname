import Renderer from "../lib/Renderer.ts";
import Camera from "../lib/Camera.ts";
import MouseListener from "../lib/MouseListener.ts";
import Ray from "../lib/Ray.ts";
import {Quaternion, Vector2, Vector3} from "@math.gl/core";
import UI from "../lib/UI/UI.ts";


export default class EditCamera
{
    private renderer: Renderer;
    private camera: Camera;
    private mouseListener: MouseListener;
    private ray: Ray;
    private camQuat =new Quaternion();
    private camQuatStart =new Quaternion();
    private camQuatTempX =new Quaternion();
    private camQuatTempY =new Quaternion();

    private mouseStart:Vector2 =new Vector2()
    private mouseMove:Vector2 =new Vector2()

    private planePos:Vector3=new Vector3();
    private planeDir:Vector3=new Vector3();
    private planeIntersectStart=new Vector3();
    private planeIntersectOffset=new Vector3();
    private planeIntersectTemp=new Vector3();
    private camDistance =2
    private isDragging: boolean =false;

    private camUp: Vector3 =new Vector3();
    private camPos: Vector3 =new Vector3();
    private camTarget: Vector3 =new Vector3();
    private isRotating: boolean=false;
    private isPanning: boolean=true;

    constructor(renderer: Renderer, camera: Camera, mouseListener: MouseListener, ray: Ray) {
        this.mouseListener = mouseListener;
        this.ray = ray;
        this.renderer = renderer;
        this.camera = camera;
        this.setCamera()

    }


    checkMouse(){

        if(!UI.needsMouse() && this.mouseListener.wheelDelta){

            this.camDistance +=this.mouseListener.wheelDelta/40;
            if(this.camDistance<1) this.camDistance =1;
            this.setCamera()
        }


        if(this.mouseListener.isDownThisFrame && this.mouseListener.shiftKey && !UI.needsMouse()){

            this.camQuatStart.from(this.camQuat);
            this.mouseStart.from(this.mouseListener.mousePos);
            this.isRotating =true;
            this.isDragging =true;
            this.isPanning =false;
        }
       else if(this.mouseListener.isDownThisFrame && this.mouseListener.ctrlKey && !UI.needsMouse()){

            this.mouseStart.from(this.mouseListener.mousePos);
            this.planePos.from(this.camTarget);
            this.planeDir.from(this.camPos);
            this.planeDir.subtract(this.planePos);
            this.planeDir.normalize();

            this.planeIntersectStart =this.ray.intersectPlane(this.planePos,this.planeDir) as Vector3//should always intersect

            this.isRotating =false;
            this.isPanning =true;
            this.isDragging =true;
        }
        if(this.isDragging && this.isRotating){

            this.mouseMove.from(this.mouseListener.mousePos);
            this.mouseMove.subtract(this.mouseStart)

            //seems like this can be done better, but it works like intended
            this.camQuatTempX.identity();
            this.camQuatTempX.rotateY(this.mouseMove.x/600)

            this.camQuatTempY.identity();
            this.camQuatTempY.rotateX(this.mouseMove.y/600)

            this.camQuat.from(this.camQuatStart)

            //keep y vertical
            this.camQuat.multiplyRight(this.camQuatTempY)
            this.camQuat.multiplyLeft(this.camQuatTempX)


            this.setCamera();

        }
        else if(this.isDragging && this.isPanning){

            console.log("panning")
            this.planeIntersectOffset =this.ray.intersectPlane(this.planePos,this.planeDir) as Vector3//should always intersect



            this.setCamera();
            console.log(">>>")

        }
        if(this.mouseListener.isUpThisFrame && this.isDragging){
            this.isRotating =false;
            this.isDragging =false;
            this.isPanning =false;
        }




        return this.isDragging;
    }

    setCamera(){
        this.camPos.set(0,0,this.camDistance);
        this.camPos.transformByQuaternion(this.camQuat)
        this.camPos.add(this.camTarget)
        this.camUp.set(0,1,0);
        this.camUp.transformByQuaternion(this.camQuat)
        this.camera.cameraUp.from(this.camUp)
        this.camera.cameraWorld.from(this.camPos);
        this.camera.cameraLookAt.from(this.camTarget)
    }



}
