import Camera from "../lib/Camera.ts";
import Renderer from "../lib/Renderer.ts";

import SceneObject3D from "../data/SceneObject3D.ts";
import {NumericArray} from "@math.gl/types";
import {Vector3} from "@math.gl/core";
import Timer from "../lib/Timer.ts";
import {lerpValueDelta} from "../lib/MathUtils.ts";
import gsap from "gsap";
import SceneHandler from "../data/SceneHandler.ts";


enum CameraState {
    Locked,
    CharCamera
}


export default class GameCamera{
    camera: Camera;
    private renderer: Renderer;
    private charRoot: SceneObject3D;

   public cameraLookAt: Vector3 =new Vector3();
    public cameraWorld: Vector3 =new Vector3();

public camDistance =2.5
    public heightOffset =0.5
    private camPos: Vector3 =new Vector3();


    private cameraState:CameraState =CameraState.Locked
    private shakeY: number=0;
    private minX: number=-100;
    private maxX: number=100;
    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.camera = camera;
        this.charRoot = SceneHandler.root
    }


    update() {



//
        if(this.cameraState ==CameraState.CharCamera) this.updateCharCamera()


        this.camera.ratio = this.renderer.ratio
        this.camera.cameraLookAt.copy(this.cameraLookAt as NumericArray);
        this.camera.cameraWorld.copy(this.cameraWorld as NumericArray);
        this.camera.cameraWorld.y+=this.shakeY;
        this.camera.cameraLookAt.y+=this.shakeY*0.5
        this.camera.cameraUp.set(0,1,0)
        this.camera.update()



    }

    setCharacter() {
        this.charRoot = SceneHandler.getSceneObject("charRoot");
        this.cameraState  =CameraState.CharCamera



    }



    updateCharCamera(){
        let delta = Timer.delta;
        let charPos = this.charRoot.getWorldPos()
       charPos.y+=this.heightOffset
        if(charPos.x<this.minX)charPos.x=this.minX
        if(charPos.x>this.maxX)charPos.x=this.maxX
        this.cameraLookAt.lerp( charPos,1 - Math.pow(0.01 ,delta))
        this.camPos.copy(this.cameraLookAt);
        this.camPos.z+=this.camDistance;
        this.camPos.y+=0;

        this.cameraWorld.lerp( this.camPos as NumericArray,lerpValueDelta(0.001 ,delta))
    }
    setCharView(){
        this.cameraState  =CameraState.CharCamera
    }

    setLockedView(camLookAt: Vector3|null=null, camPosition: Vector3|null=null) {
        if(camPosition) this.cameraWorld.copy(camPosition as NumericArray);
        if(camLookAt) this.cameraLookAt.copy(camLookAt as NumericArray);
        this.cameraState  =CameraState.Locked;
    }

    TweenToLockedView(camLookAt: Vector3, camPosition: Vector3,duration=1.5) {
        let tl=gsap.timeline()
        tl.to(this.cameraWorld,{x:camPosition.x,y:camPosition.y,z:camPosition.z,duration:duration,ease:"power2.out"},0)
        tl.to(this.cameraLookAt,{x:camLookAt.x,y:camLookAt.y,z:camLookAt.z,duration:duration,ease:"power2.out"},0)
        this.cameraState  =CameraState.Locked;
    }

    screenShakeCookie(value: number) {
        gsap.delayedCall(0.1, () => {
            this.shakeY = value

            gsap.to(this, {
                shakeY: 0,
                ease: "rough({template:none.out,strength: 10,points:20,taper:none,randomize:true,clamp:false})",
                duration: 0.3
            })
        })

    }

    setMinMaxX(minX: number, maxX: number) {
        this.minX = minX
        this.maxX = maxX
    }
}
