import Renderer from "../../lib/Renderer.ts";
import TestMaterial from "../../lib/material/TestMaterial.ts";
import Box from "../../lib/mesh/geometry/Box.ts";
import Model from "../../lib/model/Model.ts";
import Ray from "../../lib/Ray.ts";
import KeyInput from "../KeyInput.ts";
import Timer from "../../lib/Timer.ts";
import GLTFLoader from "../GLTFLoader.ts";
import CharacterModel from "./CharacterModel.ts";
import {Vector4} from "@math.gl/core";
import Blend from "../../lib/material/Blend.ts";
import {CullMode} from "../../lib/WebGPUConstants.ts";

export default class CharacterController {

    public levelModels: Array<Model>=[];
    private renderer: Renderer;
    private ray = new Ray()
    public keyInput!: KeyInput;

     posX = 0;
     posY = 0;

    //vertical
    private ySpeed = 0;
    private isInAir = false;
    private gravity = 50;
    private jumpSpeed = 20;

    // horizontal
    private xSpeed = 0;
    private xAcc = 10;
    private xAirAcc = 10;
    private maxXspeed = 10;
    public models:Array<Model> = []
    private gltfLoader: GLTFLoader;
    //private legPos =0;
    public characterModel: CharacterModel;
    constructor(renderer: Renderer,gltfLoader:GLTFLoader) {
        this.renderer = renderer;


        let material = new TestMaterial(this.renderer, "testMaterial");
        material.setUniform("color",new Vector4(1,1,1,1))
       // material.blendModes =[Blend.add()];
       // material.depthWrite =false;
        //material.cullMode =CullMode.None
    /*    this.model = new Model(this.renderer, "test");
        this.model.material = material
        this.model.mesh = new Box(this.renderer,{depth:0.1,width:0.1,height:0.1})*/
        for(let m of gltfLoader.models)
        {
            m.material = material;
            this.models.push(m)

        }
        this.gltfLoader = gltfLoader;
        this.ray.rayStart.set(0, 2, 0)
        this.ray.rayDir.set(0, -1, 0);

        this.characterModel = new CharacterModel(renderer,gltfLoader.root)

    }

    update() {
        this.updateVertical();
        this.updateHorizontal();


        if (this.posY < -10) {
            this.posX = 0;
            this.posY = 5;
            this.ySpeed = 0;
            this.xSpeed = 0;
        }
       // this.model.setScaler
       /* let delta = Timer.delta;
        this.legPos +=Math.abs(this.xSpeed)*delta;
        let stepLength = 0.3
        this.legPos%=stepLength*2;
        let legV = this.legPos-stepLength;
        let yPos = 0
        if(legV<0){

            yPos =-Math.sin((legV/stepLength)*Math.PI)*stepLength*0.5;
        }

      */


        this.characterModel.setMoveData(this.posX, this.posY, this.xSpeed)
    }

    private updateVertical() {
        let delta = Timer.delta;
        //
        if (this.keyInput.getJump() && !this.isInAir) {
            this.ySpeed = this.jumpSpeed;
            this.isInAir = true;
        }
        this.posY += this.ySpeed * delta;



        if (this.ySpeed <= 0) { //falling down
            this.ray.rayStart.set(this.posX-0.4, this.posY+0.5, 0);
            this.ray.rayDir.set(0, -1, 0);
            let r1 = this.ray.intersectModels(this.levelModels);

            this.ray.rayStart.set(this.posX+0.4, this.posY+0.5, 0);
            let r2 = this.ray.intersectModels(this.levelModels);

            let floorDist = 1000
            if (r1.length > 0) {
                floorDist = r1[0].distance - 0.5
            }
            if (r2.length > 0) {
                floorDist =Math.min( r2[0].distance - 0.5,floorDist)
            }
            if (floorDist > 0.01) {
                this.isInAir = true;
            } else if (floorDist < 0.01) {
                this.ySpeed = 0
                this.posY -= floorDist;
                this.isInAir = false;
            } else {
                this.ySpeed = 0;
                this.isInAir = false;
            }
        }else{
            this.ray.rayStart.set(this.posX-0.4, this.posY, 0);
            this.ray.rayDir.set(0, 1, 0);
            let r1 = this.ray.intersectModels(this.levelModels);

            this.ray.rayStart.set(this.posX+0.4, this.posY, 0);
            let r2 = this.ray.intersectModels(this.levelModels);

            let ceilDist = 1000
            if (r1.length > 0) {
                ceilDist = r1[0].distance - 0.5
            }
            if (r2.length > 0) {
                ceilDist =Math.min( r2[0].distance - 0.5,ceilDist)
            }

            if(ceilDist<0){
                this.posY += ceilDist+0.01;
                this.ySpeed =  -this.ySpeed*0.2;
            }
        }

        if (this.isInAir) {
            this.ySpeed -= this.gravity * delta;
        }
}

    private updateHorizontal() {
        let delta = Timer.delta;
        let dirIn = this.keyInput.getHdir();
        if (dirIn == 0) {
            if (this.isInAir) {
                this.xSpeed *= 0.9
            } else {
                this.xSpeed *= 0.75
            }
        } else if (!this.isInAir) {
            this.xSpeed += this.keyInput.getHdir() * this.xAcc * delta;
        } else {
            this.xSpeed += this.keyInput.getHdir() * this.xAirAcc * delta;
        }

        this.xSpeed = Math.max(Math.min(this.xSpeed, this.maxXspeed), -this.maxXspeed);


        this.posX += this.xSpeed * delta;
        if (this.xSpeed == 0) return;

        let dir = -1;
        if (this.xSpeed > 0) {
            dir = 1;
        }

        this.ray.rayStart.set(this.posX, this.posY+0.3, 0);
        this.ray.rayDir.set(dir, 0, 0);
        let r = this.ray.intersectModels(this.levelModels);
        let wallDist = 1000;
        if (r.length > 0) {
            wallDist = r[0].distance - 0.5
        }
        if (wallDist < 0) {
           this.xSpeed = 0;
           this.posX += (wallDist+0.01) * dir;
        }

    }
}
