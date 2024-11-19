import Renderer from "../../lib/Renderer.ts";
import Camera from "../../lib/Camera.ts";
import {Vector3, Vector4} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";

export default class DirectionalLight{
    public shadowCamera: Camera;
    public lightColor: Vector4;
    public lightDir: Vector3;
    private mainCam: Camera;
    private camOffset: Vector3;


    constructor(renderer:Renderer,mainCam:Camera) {

        this.mainCam = mainCam;
        this.lightColor =new Vector4(1,0.8,0.5,6)
        this.lightDir = new Vector3(1,3,2)
        this.lightDir.normalize();
        this.camOffset=this.lightDir.clone()
        this.camOffset.scale(-3)
        this.shadowCamera =new Camera(renderer);
        //this.shadowCamera.fovy=0.5;
        this.shadowCamera.setOrtho(4,-4,4,-2);
        this.shadowCamera.setOrtho(1,-1,1,-1);
        this.shadowCamera.near=-10;
        this.shadowCamera.far=10;



        //this.shadowCamera.cameraWorld.scale(2.5)
    }


    update(){

        this.shadowCamera.cameraLookAt.from( this.mainCam.cameraLookAt)

        this.shadowCamera.cameraWorld.from( this.shadowCamera.cameraLookAt)
        this.shadowCamera.cameraWorld.subtract(this.camOffset)
        this.shadowCamera.update()
    }

}
