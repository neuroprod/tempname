import sceneHandler from "../../../data/SceneHandler.ts";
import SceneObject3D from "../../../data/SceneObject3D.ts";
import Timer from "../../../lib/Timer.ts";
import gsap from "gsap";
import {lerp} from "@math.gl/core";

export default class Kris {
    private kris!: SceneObject3D;
    private eyeLeftClosed!: SceneObject3D;
    private eyeRightClosed!: SceneObject3D;
    private eyeLeft!: SceneObject3D;
    private eyeRight!: SceneObject3D;

    private armLeft!: SceneObject3D;
    private armRight!: SceneObject3D;


    private eyeLeftTime = 0
    private eyeRightTime = 0

    private head!: SceneObject3D;
    private headAngle = 0

    private arm1Angle = 0
    private armLerp = 0
    private state = 0;

    private legLerp = 0
    private leg1!: SceneObject3D;
    private leg2!: SceneObject3D;

    private legRot=0;
    constructor() {

    }

    reset() {
        this.state = 0;
        this.kris = sceneHandler.getSceneObject("krisRoot")
        this.kris.setScaler(1.2)
        this.kris.x = 0.7;
        this.kris.y = 0
        this.kris.z = -0.1
        //headTopKris
        this.head = sceneHandler.getSceneObject("headTopKris")

        this.eyeLeftClosed = sceneHandler.getSceneObject("eyeLeftClosedKris")
        this.eyeLeftClosed.hide()
        this.eyeRightClosed = sceneHandler.getSceneObject("eyeRightClosedKris")
        this.eyeRightClosed.hide()
        this.eyeLeft = sceneHandler.getSceneObject("eyeLeftKris")
        this.eyeRight = sceneHandler.getSceneObject("eyeRightKris")

        this.eyeLeftTime = Math.random() * 4 + 3;
        this.eyeRightTime = Math.random() * 4 + 3;


        this.armLeft = sceneHandler.getSceneObject("krisArmLeft")
        this.armRight = sceneHandler.getSceneObject("krisArmRight")

        this.leg1= sceneHandler.getSceneObject( "krisLeg1");
        this.leg2= sceneHandler.getSceneObject( "krisLeg2");

    }

    update() {
        if (this.state == 0) this.updateIdle()

    }

    jump() {
        this.state = 2;
        let tl = gsap.timeline()

        tl.to(this.kris, {y: 3, duration: 0.5, ease: "back.in(1)"}, 0)
        tl.to(this.kris, {x: 0, duration: 0.3, ease: "power2.in"}, 0.2)
        tl.to(this.kris, {rz: 3, duration: 0.3, ease: "power2.in"}, 0.2)
    }

    public startWave() {
       
        gsap.to(this, {armLerp: 1, duration: 0.3})
        gsap.to(this, {legLerp: 0.5, duration: 0.3})
    }

    public stopWave() {
        gsap.to(this, {armLerp: 0, duration: 0.3})
        gsap.to(this, {legLerp: 0, duration: 0.3})
    }

    show() {
        let tl = gsap.timeline()
        this.kris.x = 0.7 + 2;
        this.armLerp = 0.5
        this.legLerp = 1
        tl.to(this.kris, {x: 0.7, duration: 2, ease: "power1.out"}, 1)
        tl.to(this, {armLerp: 0, duration: 0.3},3)
        tl.to(this, {legLerp: 0, duration: 0.3},3-0.3)
    }

    private updateIdle() {
        let delta = Timer.delta;

        this.legRot+=delta*30;
        let legSize =0.035
        this.leg1.y =lerp(0, Math.sin(this.legRot)*legSize+legSize,this.legLerp)
        this.leg2.y = lerp(0,Math.cos(this.legRot)*legSize+legSize,this.legLerp)

        this.headAngle += delta * (2+this.armLerp*9);
        this.head.y = 0.32 + Math.sin(this.headAngle) * 0.009

        this.arm1Angle += delta * 8
        this.armRight.rz = lerp(Math.PI - 0.5, Math.sin(this.arm1Angle) * 0.5 + Math.PI, this.armLerp)
        this.armLeft.rz = lerp(0.9, Math.sin(this.arm1Angle) * 0.5, this.armLerp)


        this.eyeLeftTime -= delta;
        this.eyeRightTime -= delta;
        if (this.eyeLeftTime < 0) {
            if (this.eyeLeft.isShowning()) {
                this.eyeLeft.hide();
                this.eyeLeftClosed.show();
                this.eyeLeftTime = 0.2;
            } else {
                this.eyeLeft.show();
                this.eyeLeftClosed.hide();
                this.eyeLeftTime = Math.random() * 4 + 3;
            }
        }

        if (this.eyeRightTime < 0) {
            if (this.eyeRight.isShowning()) {
                this.eyeRight.hide();
                this.eyeRightClosed.show();
                this.eyeRightTime = 0.2;
            } else {
                this.eyeRight.show();
                this.eyeRightClosed.hide();
                this.eyeRightTime = Math.random() * 4 + 3;
            }
        }

    }
}
