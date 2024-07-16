import Renderer from "../lib/Renderer.ts";
import SceneData from "../data/SceneData.ts";
import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import gsap from "gsap";
import {Vector3} from "@math.gl/core";
import Ray from "../lib/Ray.ts";
import DebugDraw from "./DebugDraw.ts";

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

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.charRoot = SceneData.sceneModelsByName["charRoot"];

        this.downRay = new Ray()

    }


    update(delta: number, hInput: number, jump: boolean) {
        this.jumpDown =jump;
        if (this.isGrounded) {
            this.velocity.x += hInput * delta *this.moveForceX;
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxVelX), -this.maxVelX);

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

        this.positionAdjustment.copy(this.velocity)
        this.positionAdjustment.scale(delta);

        this.targetPos.copy(this.charRoot.getPosition())
        this.targetPos.add( this.positionAdjustment);


        this.downRay.rayDir.set(0,-1,0);
        this.downRay.rayStart.copy(this.charRoot.getPosition());
        this.downRay.rayStart.y+=0.1


        let int = this.downRay.intersectModels(SceneData.hitTestModels);
        if(int.length==0){
            this.setGrounded(false)

        }else{
            let yFloor = int[0].point.y;

            if(yFloor>this.targetPos.y-0.05){
                this.velocity.y =0;
                this.setGrounded(true)
                this.targetPos.y =yFloor;
            }else{
                this.setGrounded(false)
            }

        }

        if(int.length>0){
        DebugDraw.path.moveTo(this.downRay.rayStart)
        DebugDraw.path.lineTo(int[0].point)
        }
       //
        //console.log(SceneData.hitTestModels)


        this.charRoot.setPositionV(this.targetPos)

        this.setCharacterDir(hInput);

    }
    private setGrounded(value: boolean) {
        if(this.isGrounded ==value)return;

        if(this.isGrounded && !value){
            console.log("leaveGround")



        } else{
            console.log("hitGround")
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


}
