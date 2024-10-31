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

    private cameraLookAt: Vector3 =new Vector3();
    private camPos: Vector3 =new Vector3();
    private cameraWorld: Vector3 =new Vector3();

    private cameraState:CameraState =CameraState.Locked

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
       charPos.y+=0.5

        this.cameraLookAt.lerp( charPos,1 - Math.pow(0.01 ,delta))
        this.camPos.copy(this.cameraLookAt);
        this.camPos.z+=2.5;
        this.camPos.y+=0;

        this.cameraWorld.lerp( this.camPos as NumericArray,lerpValueDelta(0.01 ,delta))
    }


    setLockedView(camLookAt: Vector3, camPosition: Vector3) {
        this.cameraWorld.copy(camPosition as NumericArray)
        this.cameraLookAt.copy(camLookAt as NumericArray)
        this.cameraState  =CameraState.Locked
    }
}
