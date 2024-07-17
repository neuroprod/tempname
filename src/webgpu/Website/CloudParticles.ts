import Renderer from "../lib/Renderer.ts";
import Model from "../lib/model/Model.ts";
import SceneData from "../data/SceneData.ts";

import GBufferCloudMaterial from "../render/GBuffer/GBufferCloudMaterial.ts";
import {Matrix4, Vector3, Vector4} from "@math.gl/core";

import gsap from "gsap";
import Timer from "../lib/Timer.ts";
class CloudParticle{
    private position: Vector3 =new Vector3();
    private positionTarget: Vector3 =new Vector3();
    private rotation: number=0;
    private scale:number =1
    private m:Matrix4 =new Matrix4()

    canDelete =false;

    constructor() {


        this.rotation =Math.random()*Math.PI
    }
    getMatrix(){
        this.m.identity()
        this.m.translate(this.position)
        this.m.rotateZ( this.rotation)
        this.m.scale(this.scale)
        return this.m;
    }

    hitFloor(position: Vector3) {

        let duration =Math.random()*0.2+0.4;

        let dir =Math.sign(Math.random()-0.5);
        this.canDelete =false;
        this.position.copy(position)
        this.scale =2+Math.random();
        let offX = dir*(0.01+Math.random()*0.05);
        this.position.x +=offX;
        this.position.y +=0.1+Math.random()*0.1;
        let zOff = 0.1+Math.random()*0.1
        this.position.z +=zOff;
        this.positionTarget.copy(this.position);
        this.positionTarget.x +=dir*(Math.random()*0.6+0.3)*0.3;
        this.positionTarget.y +=Math.random()*0.1+0.1;
        this.positionTarget.z +=zOff;

        gsap.to(this,{scale:0,duration:duration,onComplete:()=>{this.canDelete =true}} )
        gsap.to( this.position,{x:this.positionTarget.x,y:this.positionTarget.y,z:this.positionTarget.z,ease:"power3.out",duration:duration} )

    }

    walk(position: Vector3, vel: number) {
        this.canDelete =false;
        this.position.copy(position)
        this.position.y+=0.1
        this.position.z+=0

        this.positionTarget.copy(position)
        this.positionTarget.y+=Math.random()*0.1+0.1
        this.scale =Math.random()+2;
        let duration =0.5;
        gsap.to( this.position,{x:this.positionTarget.x,y:this.positionTarget.y,z:this.positionTarget.z,ease:"power3.out",duration:duration} )

        gsap.to(this,{scale:0,duration:duration,onComplete:()=>{this.canDelete =true}} )
    }
}

export default class CloudParticles{
    private particlesModel: Model ;

    private particles:Array<CloudParticle> =[]
    private particlesPool:Array<CloudParticle> =[]
    private walkRelease =0;
    constructor(renderer:Renderer) {

        this.particlesModel= SceneData.sceneModelsByName["cloudParticles"].model as Model;
        this.particlesModel.material =new GBufferCloudMaterial(renderer,"cloudMaterial")
        this.particlesModel.needCulling =false;
        this.particlesModel.visible =false;
        let charP = SceneData.projectsNameMap.get("character")

        if(charP){

            this.particlesModel.material.setTexture("colorTexture",    charP.baseTexture)
        }



    }

    addParticlesHitFloor(position: Vector3){
        for(let i=0;i<8;i++){
            let p =this.getParticle()
            p.hitFloor(position)
            this.particles.push(p)
        }

    }
    addParticleWalk(position:Vector3,vel:number){

        if(this.walkRelease>0) return;
        if(Math.abs(vel)<1) return;
        this.walkRelease =0.2+Math.random()*0.2;
                let p = this.getParticle()
                p.walk(position,vel)
                this.particles.push(p)




    }
    public update(){

        this.walkRelease -=Timer.delta
        for(let i =0;i<this.particles.length;i++){
            if(this.particles[i].canDelete){
                this.particlesPool.push(this.particles[i]);
                this.particles.splice(i,1)
            }


        }
        if(this.particles.length ==0){

            this.particlesModel.visible =false;
            return;
        }
        this.particlesModel.visible =true;
        this.particlesModel.numInstances =this.particles.length;
        let matrices0:Array<number> =[];
        let matrices1:Array<number> =[];
        let matrices2:Array<number> =[];
        let matrices3:Array<number> =[];

        for(let p of this.particles) {
            matrices0 =matrices0.concat(p.getMatrix().getColumn(0));
            matrices1 =matrices1.concat(p.getMatrix().getColumn(1));
            matrices2 =matrices2.concat(p.getMatrix().getColumn(2));
            matrices3 =matrices3.concat(p.getMatrix().getColumn(3));
        }


        this.particlesModel.createBuffer(new Float32Array(matrices0),"instancesMatrix0");
        this.particlesModel.createBuffer(new Float32Array(matrices1),"instancesMatrix1");
        this.particlesModel.createBuffer(new Float32Array(matrices2),"instancesMatrix2");
        this.particlesModel.createBuffer(new Float32Array(matrices3),"instancesMatrix3");

    }


    private getParticle() {
        if(this.particlesPool.length>0){
            return this.particlesPool.pop() as CloudParticle
        }
        return new CloudParticle()

    }
}
