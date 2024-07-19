import Camera from "../lib/Camera.ts";
import Renderer from "../lib/Renderer.ts";
import SceneData from "../data/SceneData.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import {NumericArray} from "@math.gl/types";
import {Vector3} from "@math.gl/core";
import Timer from "../lib/Timer.ts";
import {lerpValueDelta} from "../lib/MathUtils.ts";

export default class GameCamera{
    private camera: Camera;
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
        this.camPos.z+=5;
        this.camPos.y+=1;

        this.camera.cameraLookAt.copy(this.camTarget as NumericArray);
        this.camera.cameraWorld.lerp( this.camPos as NumericArray,lerpValueDelta(0.01 ,delta))



        this.camera.update()



    }
}
