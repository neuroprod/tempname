import Camera from "../lib/Camera.ts";
import Renderer from "../lib/Renderer.ts";
import SceneData from "../data/SceneData.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import {NumericArray} from "@math.gl/types";
import {Vector3} from "@math.gl/core";
import Timer from "../lib/Timer.ts";
import {lerpValueDelta} from "../lib/MathUtils.ts";
import gsap from "gsap";
export default class GameCamera{
    camera: Camera;
    private renderer: Renderer;
    private charRoot: SceneObject3D;
    private charPos: Vector3 =new Vector3();
    private camTarget: Vector3 =new Vector3();
    private camPos: Vector3 =new Vector3();
    constructor(renderer:Renderer,camera:Camera) {
        this.renderer =renderer;
        this.camera = camera;
        this.charRoot = SceneData.sceneModelsByName["charRoot"];
    }


    update() {
        let delta = Timer.delta;

        this.camera.ratio = this.renderer.ratio
        this.charPos = this.charRoot.getWorldPos()
        this.charPos.y+=0.5

        this.camTarget.lerp( this.charPos,1 - Math.pow(0.01 ,delta))
        this.camPos.copy(this.camTarget);
        this.camPos.z+=3;
        this.camPos.y+=0;


        this.camera.cameraLookAt.copy(this.camTarget as NumericArray);
        this.camera.cameraWorld.lerp( this.camPos as NumericArray,lerpValueDelta(0.01 ,delta))

        this.camera.cameraUp.set(0,1,0)

        this.camera.update()



    }
    updateForScene(){
        this.camera.update()
    }

    tweenToDefaultPos() {
        this.charPos = this.charRoot.getWorldPos()
        this.charPos.y+=0.5;

        this.camTarget.copy(this.charPos);
        this.camPos.copy(this.camTarget);
        this.camPos.z+=3;
        this.camPos.y+=0;

        let tl =gsap.timeline()
        tl.to(  this.camera.cameraLookAt,{x:this.charPos.x,y:this.charPos.y,z:this.charPos.z, duration:1},0)
        tl.to(  this.camera.cameraWorld,{x:this.camPos.x,y:this.camPos.y,z:this.camPos.z, duration:1},0)

    }


}
