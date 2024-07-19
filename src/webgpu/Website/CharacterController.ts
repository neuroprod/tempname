import Renderer from "../lib/Renderer.ts";
import SceneData from "../data/SceneData.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import gsap from "gsap";
import {lerp, Vector3} from "@math.gl/core";
import Ray from "../lib/Ray.ts";
import DebugDraw from "./DebugDraw.ts";
import CloudParticles from "./CloudParticles.ts";
import {lerpValueDelta, smoothstep} from "../lib/MathUtils.ts";
import {NumericArray} from "@math.gl/types";

export default class CharacterController {
    private charRoot: SceneObject3D;
    private facingRight = true;
    private renderer: Renderer;
    private rotateTimeLine!: gsap.core.Timeline;
    private velocity: Vector3 = new Vector3()
    private positionAdjustment: Vector3 = new Vector3()
    private targetPos: Vector3 = new Vector3()

    private gravity =40;
    private maxVelX = 2;
    private moveForceX = 6;
    private jumpForceX = 3;
    private isGrounded = true;
    private jumpPulse: number =6;
    private downRay: Ray;
    private startWithJump: boolean =false;
    private jumpDown: boolean =false;
    private cloudParticles: CloudParticles;
    private charBody: SceneObject3D;
    private bodyBasePos: Vector3;
    private charHat: SceneObject3D;
    private hatBasePos: Vector3;
    private sideRay: Ray;

    constructor(renderer: Renderer, cloudParticles: CloudParticles) {
        this.renderer = renderer;
        this.charRoot = SceneData.sceneModelsByName["charRoot"];
        this.charBody = SceneData.sceneModelsByName["body"];
        this.bodyBasePos = this.charBody.getPosition().clone()


        this.charHat = SceneData.sceneModelsByName["hat"];
        this.hatBasePos = this.charHat.getPosition().clone()

        this.cloudParticles  =cloudParticles;
        this.downRay = new Ray()
        this.sideRay = new Ray()

    }


    update(delta: number, hInput: number, jump: boolean) {
        this.jumpDown =jump;
        if (this.isGrounded) {
            this.velocity.x += hInput * delta *this.moveForceX;
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxVelX), -this.maxVelX);
            this.cloudParticles.addParticleWalk(this.targetPos,this.velocity.x)

            if (hInput == 0) {
                this.velocity.x *= 0.5;
            }
            if(jump)  {
                this.velocity.y =this.jumpPulse;
               this.setGrounded(false)
                this.startWithJump =true;

            }
        }else{

            this.velocity.x += hInput * delta *this.jumpForceX;
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxVelX), -this.maxVelX);

            if (hInput == 0) {
                this.velocity.x *= 0.5;
            }
            if(this.startWithJump && this.jumpDown &&    this.velocity.y>0){

                this.velocity.y -=this.gravity*0.3*delta;
            }else{
                this.velocity.y -=this.gravity*delta;
                this.startWithJump =false;
            }



        }

        this.positionAdjustment.copy(this.velocity as NumericArray)
        this.positionAdjustment.scale(delta);

        this.targetPos.copy(this.charRoot.getPosition()as NumericArray)
        this.targetPos.add( this.positionAdjustment as NumericArray);

//checkDown
        this.downRay.rayDir.set(0,-1,0);
        this.downRay.rayStart.copy(this.charRoot.getPosition() as NumericArray);
        this.downRay.rayStart.y+=0.1

        let distDown  = this.checkRay(this.downRay)
        let yFloor =  this.downRay.rayStart.y-distDown;

        if(yFloor>this.targetPos.y-0.001){
                this.setGrounded(true)
                this.velocity.y =0;
                this.targetPos.y =yFloor;
        }else{
                this.setGrounded(false)
        }






        this.sideRay.rayDir.set(Math.sign(this.velocity.x),0,0);
        this.sideRay.rayStart.copy(this.charRoot.getPosition() as NumericArray);
        this.sideRay.rayStart.y+=0.1
        let sideDist = this.checkRay(this.sideRay);
        if(sideDist <0.22){
            let adj  =(sideDist -0.22)*Math.sign(this.velocity.x);
            this.targetPos.x+=adj;
            this.velocity.x =0;

        }

       //
        //console.log(SceneData.hitTestModels)


        this.charRoot.setPositionV(this.targetPos)

        this.setCharacterDir(hInput);


        this.charBody.y  =lerp(    this.charBody.y ,this.bodyBasePos.y,lerpValueDelta(0.002,delta))
        this.charHat.y  =lerp(    this.charHat.y ,this.hatBasePos.y,lerpValueDelta(0.002,delta))
        this.charBody.sy  =lerp(    this.charBody.sy ,1,lerpValueDelta(0.001,delta))
    }
    private setGrounded(value: boolean) {
        if(this.isGrounded ==value)return;

        if(this.isGrounded && !value){
            console.log("leaveGround")



        } else{
//hit ground animation
            if(this.velocity.y<-5){
                let vEf  =Math.abs(this.velocity.y)-5;
                this.charBody.y = this.bodyBasePos.y-0.07
                this.charBody.sy =1-smoothstep(1,9,vEf)*0.4;
                this.cloudParticles.addParticlesHitFloor(this.targetPos)
            }


        }
        this.isGrounded =value;
    }
    private setCharacterDir(horizontalDir: number) {
        if (horizontalDir > 0 && !this.facingRight) {
            this.facingRight = true;
            if (this.rotateTimeLine) this.rotateTimeLine.clear()
            this.rotateTimeLine = gsap.timeline();
            this.rotateTimeLine.set(this.charRoot, {ry: -1}, 0);
            this.rotateTimeLine.to(this.charRoot, {ry: 0, duration: 0.2}, 0);

        } else if (horizontalDir < 0 && this.facingRight) {
            this.facingRight = false;
            if (this.rotateTimeLine) this.rotateTimeLine.clear()
            this.rotateTimeLine = gsap.timeline();
            this.rotateTimeLine.set(this.charRoot, {ry: Math.PI + 1}, 0);
            this.rotateTimeLine.to(this.charRoot, {ry: Math.PI, duration: 0.2}, 0);
        }

    }
    private checkRay(ray:Ray){
        let intSide =  ray.intersectModels(SceneData.hitTestModels);
        if(intSide.length>0){
            DebugDraw.path.moveTo(this.sideRay.rayStart)
            DebugDraw.path.lineTo(intSide[0].point)
            return intSide[0].distance;

        }
        return 1000;
    }
}
