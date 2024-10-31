import Renderer from "../lib/Renderer.ts";

import SceneObject3D from "../data/SceneObject3D.ts";
import gsap from "gsap";
import {lerp, Vector3} from "@math.gl/core";
import Ray from "../lib/Ray.ts";
import DebugDraw from "./DebugDraw.ts";
import CloudParticles from "./CloudParticles.ts";
import {lerpValueDelta, smoothstep} from "../lib/MathUtils.ts";
import {NumericArray} from "@math.gl/types";
import SoundHandler from "./SoundHandler.ts";
import SceneHandler from "../data/SceneHandler.ts";
import Timer from "../lib/Timer.ts";

export default class CharacterController {
    charRoot!: SceneObject3D;
    targetPos: Vector3 = new Vector3()
    public charHitRadius = 0.2
    public charHitBottomWorld: Vector3 = new Vector3(0, 0, 0)
    public charHitTopWorld: Vector3 = new Vector3(0, 0, 0)
    private facingRight = true;
    private renderer: Renderer;
    private rotateTimeLine!: gsap.core.Timeline;
    private velocity: Vector3 = new Vector3()
    private positionAdjustment: Vector3 = new Vector3()
    private gravity = 40;
    private maxVelX = 3;
    private moveForceX = 6;
    private jumpForceX = 3;
    private isGrounded = true;
    private jumpPulse: number = 6;
    private downRay: Ray;
    private startWithJump: boolean = false;
    private jumpDown: boolean = false;
    private charBody!: SceneObject3D;
    private bodyBasePos!: Vector3;
    private sideRay: Ray;
    private canJump: boolean = true;
    private cross1 = new Vector3()
    private cross2 = new Vector3()
    private cross3 = new Vector3()
    private cross4 = new Vector3()
    private stepLength = 0.2;
    private feetStep = 0
    private feetPos2 = new Vector3()
    private feetPos1 = new Vector3()
    private leftLeg!: SceneObject3D;
    private rightLeg!: SceneObject3D;
    private distanceToFloor: number = 0;
    private charHitBottom = new Vector3(-0.02, 0.15, 0)
    private charHitTop = new Vector3(0.01, 0.42, 0)
    private feetStepPrev: number = 0;
    private idleTime = 0;
     cloudParticles: CloudParticles;

    constructor(renderer: Renderer) {
        this.renderer = renderer;


        /* this.charRoot = SceneData.sceneModelsByName["charRoot"];
         this.charBody = SceneData.sceneModelsByName["body"];
         this.leftLeg = SceneData.sceneModelsByName["legLeft"];
         this.rightLeg = SceneData.sceneModelsByName["legRight"];
         this.bodyBasePos = this.charBody.getPosition().clone()


         //this.charHat = SceneData.sceneModelsByName["piratehat"];
         //this.hatBasePos = this.charHat.getPosition().clone()
 */

        this.cloudParticles = new CloudParticles(renderer)
        this.downRay = new Ray()
        this.sideRay = new Ray()

    }

    setCharacter() {
        this.charRoot = SceneHandler.getSceneObject("charRoot");
        this.charBody = SceneHandler.getSceneObject("body");
        this.leftLeg = SceneHandler.getSceneObject("legLeft");
        this.rightLeg = SceneHandler.getSceneObject("legRight");
        this.bodyBasePos = this.charBody.getPosition().clone()

       this.cloudParticles.init()

    }

    updateIdle() {
        this.idleTime += Timer.delta;

    }

    update(delta: number, hInput: number, jump: boolean) {

        this.cloudParticles.update()

        if (!jump) this.canJump = true; //release button for a second jump

        if (jump || hInput != 0) {
            this.idleTime = 0
        } else {
            this.idleTime += delta;
        }


        this.jumpDown = jump;
        if (this.isGrounded) {
            this.velocity.x += hInput * delta * this.moveForceX;
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxVelX), -this.maxVelX);
            this.cloudParticles.addParticleWalk(this.targetPos, this.velocity.x)


            if (hInput == 0) {
                this.velocity.x *= 0.5;
            }
            if (jump && this.canJump) {
                this.velocity.y = this.jumpPulse;
                this.canJump = false;
                this.setGrounded(false)
                this.startWithJump = true;

            }
        } else {

            this.velocity.x += hInput * delta * this.jumpForceX;
            this.velocity.x = Math.max(Math.min(this.velocity.x, this.maxVelX), -this.maxVelX);

            if (hInput == 0) {
                this.velocity.x *= 0.5;
            }
            if (this.startWithJump && this.jumpDown && this.velocity.y > 0) {

                this.velocity.y -= this.gravity * 0.3 * delta;
            } else {
                this.velocity.y -= this.gravity * delta;
                this.startWithJump = false;
            }


        }

        this.positionAdjustment.copy(this.velocity as NumericArray)
        this.positionAdjustment.scale(delta);

        this.targetPos.copy(this.charRoot.getPosition() as NumericArray)
        this.targetPos.add(this.positionAdjustment as NumericArray);

//checkDown
        this.downRay.rayDir.set(0, -1, 0);
        this.downRay.rayStart.copy(this.charRoot.getPosition() as NumericArray);
        this.downRay.rayStart.y += 0.1

        let distDown = this.checkRay(this.downRay)
        let yFloor = this.downRay.rayStart.y - distDown;
        this.distanceToFloor = distDown - 0.1;


        if (this.distanceToFloor < 0.1 && this.isGrounded) {
            this.setGrounded(true)
            this.velocity.y = 0;
            this.targetPos.y = yFloor;

        } else if (this.distanceToFloor < -this.positionAdjustment.y && this.velocity.y < 0.01) {

            this.setGrounded(true)
            this.velocity.y = 0;
            this.targetPos.y = yFloor;


        } else {

            this.setGrounded(false)

        }


        this.sideRay.rayDir.set(Math.sign(this.velocity.x), 0, 0);
        this.sideRay.rayStart.copy(this.charRoot.getPosition() as NumericArray);
        this.sideRay.rayStart.y += 0.1
        let sideDist = this.checkRay(this.sideRay);
        if (sideDist < 0.22) {
            let adj = (sideDist - 0.22) * Math.sign(this.velocity.x);
            this.targetPos.x += adj;
            this.velocity.x = 0;

        }

        //
        //console.log(SceneData.hitTestModels)


        this.charRoot.setPositionV(this.targetPos)
        this.setFeet(delta)
        this.setCharacterDir(hInput);

        this.charBody.rz = -Math.abs(this.velocity.x) / 20;
        //this.charHat.rz = -Math.abs(this.velocity.x) / 30;
        this.charBody.y = lerp(this.charBody.y, this.bodyBasePos.y, lerpValueDelta(0.002, delta))
        this.charBody.y += Math.sin(this.idleTime) * 0.001
        //this.charHat.y = lerp(this.charHat.y, this.hatBasePos.y, lerpValueDelta(0.002, delta))
        this.charBody.sy = lerp(this.charBody.sy, 1, lerpValueDelta(0.001, delta))

        this.charHitTopWorld = this.charBody.getWorldPos(this.charHitTop)
        this.charHitBottomWorld = this.charRoot.getWorldPos(this.charHitBottom)
        DebugDraw.drawCircle(this.charHitTopWorld, this.charHitRadius);
        DebugDraw.drawCircle(this.charHitBottomWorld, this.charHitRadius);
    }

    drawCross(position: Vector3) {
        let size = 0.1;
        this.cross1.copy(position as NumericArray)
        this.cross1.x -= size
        this.cross1.y -= size
        this.cross2.copy(position as NumericArray)
        this.cross2.x += size
        this.cross2.y += size


        this.cross3.copy(position as NumericArray)
        this.cross3.x -= size
        this.cross3.y += size
        this.cross4.copy(position as NumericArray)
        this.cross4.x += size
        this.cross4.y -= size
        DebugDraw.path.moveTo(this.cross1)
        DebugDraw.path.lineTo(this.cross2)

        DebugDraw.path.moveTo(this.cross3)
        DebugDraw.path.lineTo(this.cross4)
    }

    private setGrounded(value: boolean) {
        if (this.isGrounded == value) return;

        if (this.isGrounded && !value) {
            //console.log("leaveGround")


        } else {
//hit ground animation
            if (this.velocity.y < -5) {
                let vEf = Math.abs(this.velocity.y) - 5;
                this.charBody.y = this.bodyBasePos.y - 0.07
                this.charBody.sy = 1 - smoothstep(1, 9, vEf) * 0.4;
                this.cloudParticles.addParticlesHitFloor(this.targetPos)
            }
            SoundHandler.playHitFloor(Math.abs(this.velocity.y))

        }
        this.isGrounded = value;
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

    private checkRay(ray: Ray) {
        let intSide = ray.intersectModels(SceneHandler.hitTestModels);
        if (intSide.length > 0) {
            DebugDraw.path.moveTo(this.sideRay.rayStart.clone())
            DebugDraw.path.lineTo(intSide[0].point.clone())
            return intSide[0].distance;

        }
        return 1000;
    }

    private setFeet(delta: number) {
        let tScale = Math.sign(this.leftLeg.x - this.rightLeg.x);
        if (this.distanceToFloor > 0.3 && this.velocity.y > 0) {


            this.leftLeg.rz = lerp(this.leftLeg.rz, 1.2 * tScale, lerpValueDelta(0.01, delta));
            this.rightLeg.rz = lerp(this.rightLeg.rz, -1.2 * tScale, lerpValueDelta(0.01, delta));
        } else {
            this.leftLeg.rz = lerp(this.leftLeg.rz, 0, lerpValueDelta(0.001, delta));
            this.rightLeg.rz = lerp(this.rightLeg.rz, 0, lerpValueDelta(0.001, delta));
        }
        if (Math.abs(this.velocity.x) < 0.01 || !this.isGrounded) {
            let lerpVal = lerpValueDelta(0.002, delta)

            this.feetPos1.x = lerp(this.feetPos1.x, tScale * (this.stepLength / 2) - 0.02, lerpVal);
            this.feetPos1.y = lerp(this.feetPos1.y, 0.17, lerpVal)

            this.feetPos2.x = lerp(this.feetPos2.x, tScale * (-this.stepLength / 2) - 0.02, lerpVal);
            this.feetPos2.y = lerp(this.feetPos2.y, 0.17, lerpVal)

            this.leftLeg.setPositionV(this.feetPos1)
            this.rightLeg.setPositionV(this.feetPos2)
            this.feetStep = 0;
        } else {

            this.stepLength = 0.20 + Math.abs(this.velocity.x) / 30
            this.feetStep += Math.abs(this.velocity.x) * delta;
            this.feetStep %= this.stepLength * 2;


            let feetStepLocal = this.feetStep / this.stepLength //0-2

            if (feetStepLocal > 1 && this.feetStepPrev < 1) {
                SoundHandler.playStep()

            }
            if (feetStepLocal < 1 && this.feetStepPrev > 1) {
                SoundHandler.playStep()

            }
            this.feetStepPrev = feetStepLocal;

            let x = Math.sin(feetStepLocal * Math.PI + Math.PI / 2) * this.stepLength / 2
            let y = Math.cos(feetStepLocal * Math.PI + Math.PI / 2) * this.stepLength / 4;

            this.feetPos1.x = x - 0.02;
            this.feetPos1.y = Math.max(y, 0) + 0.17;

            let x2 = Math.sin(feetStepLocal * Math.PI - Math.PI + Math.PI / 2) * this.stepLength / 2
            let y2 = Math.cos(feetStepLocal * Math.PI - Math.PI + Math.PI / 2) * this.stepLength / 4;

            this.feetPos2.x = x2 - 0.02;
            this.feetPos2.y = Math.max(y2, 0) + 0.17;


            this.charBody.y = Math.max(y, y2) / 4 + 0.2


            this.leftLeg.setPositionV(this.feetPos1)
            this.rightLeg.setPositionV(this.feetPos2)
        }
    }
}
