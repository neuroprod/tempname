import Renderer from "../../lib/Renderer.ts";
import Camera from "../../lib/Camera.ts";
import {Vector3, Vector4} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";

export default class DirectionalLight{
    public shadowCamera: Camera;
    public lightColor: Vector4;
    public lightDir: Vector3;


    constructor(renderer:Renderer) {

        this.lightColor =new Vector4(1,0.7,0.4,8)
        this.lightDir = new Vector3(1,3,2)
        this.lightDir.normalize();
        this.shadowCamera =new Camera(renderer);
        this.shadowCamera.fovy=1;
        //this.shadowCamera.setOrtho(-2,2,2,-2);
        this.shadowCamera.near=1;
        this.shadowCamera.far=10;
        let lookAt =new Vector3()

        this.shadowCamera.cameraLookAt.from(lookAt)

        this.shadowCamera.cameraWorld.set(1,3,2)
        //this.shadowCamera.cameraWorld.scale(2.5)
    }


}
