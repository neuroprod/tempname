import Renderer from "./lib/Renderer.ts";
import TestMaterial from "./TestMaterial.ts";
import Box from "./lib/mesh/geometry/Box.ts";
import Model from "./lib/model/Model.ts";
import Ray from "./lib/Ray.ts";
import KeyInput from "./KeyInput.ts";
import Timer from "./lib/Timer.ts";
import GLTFLoader from "./GLTFLoader.ts";

export default class CharacterController {
    public model: Model;
    public levelModels: Array<Model>;
    private renderer: Renderer;
    private ray = new Ray()
    private keyInput: KeyInput;

    private posX = 0;
    private posY = 0;

    //vertical
    private ySpeed = 0;
    private isInAir = false;
    private gravity = 50;
    private jumpSpeed = 15;

    // horizontal
    private xSpeed = 0;
    private xAcc = 20;
    private xAirAcc = 10;
    private maxXspeed = 7;
  public models:Array<Model> = []
    private gltfLoader: GLTFLoader;

    constructor(renderer: Renderer,gltfLoader:GLTFLoader) {
        this.renderer = renderer;
        this.keyInput = new KeyInput()

        let material = new TestMaterial(this.renderer, "testMaterial");

        this.model = new Model(this.renderer, "test");
        this.model.material = material
        this.model.mesh = new Box(this.renderer,{depth:0.1})
        for(let m of gltfLoader.models)
        {
            m.material = material;
            this.models.push(m)

        }
    this.gltfLoader = gltfLoader;
        this.ray.rayStart.set(0, 2, 0)
        this.ray.rayDir.set(0, -1, 0);
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
       // this.model.setScaler(0)
        this.model.setPosition(this.posX, this.posY, 0);
        this.gltfLoader.root.setPosition(this.posX, this.posY-0.5, 0);
        this.gltfLoader.root.setScaler( 0.3);
        this.gltfLoader.root.setEuler(0,Math.PI/2,0)
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
            this.ray.rayStart.set(this.posX-0.4, this.posY, 0);
            this.ray.rayDir.set(0, -1, 0);
            let r1 = this.ray.intersectModels(this.levelModels);

            this.ray.rayStart.set(this.posX+0.4, this.posY, 0);
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

        this.ray.rayStart.set(this.posX, this.posY, 0);
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
