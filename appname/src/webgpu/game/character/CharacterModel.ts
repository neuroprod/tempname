import Renderer from "../../lib/Renderer.ts";
import Bone from "./Bone.ts";
import Leg from "./Leg.ts";
import Model from "../../lib/model/Model.ts";
import UI from "../../lib/UI/UI.ts";
import TestMaterial from "../../lib/material/TestMaterial.ts";
import Sphere from "../../lib/mesh/geometry/Sphere.ts";
import ColorV from "../../lib/ColorV.ts";
import Timer from "../../lib/Timer.ts";
import Object3D from "../../lib/model/Object3D.ts";

export default class CharacterModel{
    public debugModels:Array<Model> =[];
    private rootBone: Bone;
    private hipBone: Bone;
    private legLeft: Leg;
    private legRight: Leg;
    private sphere: Model;
    private sphere2: Model;
    private legPos: number =0;
private baseHeight =0.5;


    constructor(renderer:Renderer,headRoot:Object3D)
    {
        this.rootBone = new Bone(renderer,"root",this.debugModels)


        this.sphere = new Model(renderer,"testSphere")
        this.sphere.mesh =new Sphere(renderer,0.05,16,12);
        this.sphere.material =new TestMaterial(renderer,"testMaterial");
        this.sphere.material.setUniform("color",new ColorV(1,0,1,1));
        this.sphere.setPosition(-0.2,0,0.3)
        this.rootBone.addChild(this.sphere)
        this.debugModels.push(this.sphere)

        this.sphere2 = new Model(renderer,"testSphere")
        this.sphere2.mesh =new Sphere(renderer,0.05,16,12);
        this.sphere2.material =new TestMaterial(renderer,"testMaterial");
        this.sphere2.material.setUniform("color",new ColorV(1,0,1,1));
        this.sphere2.setPosition(-0.2,0,0.3)
        this.rootBone.addChild(this.sphere2)
        this.debugModels.push(this.sphere2)








        this.hipBone = new Bone(renderer,"hip",this.debugModels)
        this.hipBone.addChild(headRoot)
        this.rootBone.addChild(this.hipBone)

        this.hipBone.setPosition(0.0, this.baseHeight,0)
        this.hipBone.setEuler(0.0,0.5,0)

        this.legLeft =new Leg(renderer,"legLeft",1,this.hipBone,this.debugModels);
        this.legRight =new Leg(renderer,"legRight",-1,this.hipBone,this.debugModels);
    }




    setMoveData(posX: number, posY: number,xSpeed:number) {

        if(xSpeed>=0){
            this.hipBone.setEuler(0.0,0.5,0)
        }else{
            this.hipBone.setEuler(0.0,-0.5,0)
        }


       let floorPosLeft =   this.rootBone.getLocalPos(this.hipBone.getWorldPos(this.legLeft.hipPos))
        let floorPosRight =  this.rootBone.getLocalPos(this.hipBone.getWorldPos(this.legRight.hipPos))
        console.log(floorPosLeft)

        floorPosLeft.y=0
        floorPosRight.y=0
        this.sphere.setPositionV( floorPosLeft)
        this.sphere2.setPositionV( floorPosRight)
        this.legLeft.setTargetWorld(this.rootBone.getWorldPos(floorPosLeft))
        this.legRight.setTargetWorld(this.rootBone.getWorldPos(floorPosRight))
        this.rootBone.setPosition(posX,posY,0);


        let delta = Timer.delta;
        this.legPos +=Math.abs(xSpeed)*delta;




        let stepLength = 0.8
        this.legPos%=stepLength*2;
        let xPos = this.legPos-stepLength;
        let yPos = 0
        if(xPos>0){

            yPos =Math.sin((xPos/stepLength)*Math.PI)*stepLength*0.5;

        }

        xPos =Math.abs(xPos)-stepLength/2


        //floorPosLeft


        this.sphere.setPosition(-0.17+xPos,yPos,0.26)
        let sphereWorld = this.sphere.getWorldPos();
        this.legLeft.setTargetWorld(sphereWorld)
        //this.legRight.setTargetWorld(sphereWorld)
    }
}
