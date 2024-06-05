import Renderer from "../../lib/Renderer.ts";
import Camera from "../../lib/Camera.ts";
import {Vector3, Vector4} from "@math.gl/core";

export default class DirectionalLight{
    public shadowCamera: Camera;
    public lightColor: Vector4;
    public lightDir: Vector3;


    constructor(renderer:Renderer) {

        this.lightColor =new Vector4(1,1,1,5)
        this.lightDir = new Vector3(0,-2,0)

        this.shadowCamera =new Camera(renderer);

        //this.shadowCamera.setOrtho(-2,2,2,-2);
        this.shadowCamera.near=0.1;
        this.shadowCamera.far=100;
        let lookAt =new Vector3()

        this.shadowCamera.cameraLookAt.from(lookAt)

        this.shadowCamera.cameraWorld.set(1,2,3)
    }


}
