import Renderer from "../lib/Renderer.ts";
import Bone from "./Bone.ts";
import Leg from "./Leg.ts";
import Model from "../lib/model/Model.ts";
import UI from "../lib/UI/UI.ts";
import TestMaterial from "../lib/material/TestMaterial.ts";
import Sphere from "../lib/mesh/geometry/Sphere.ts";
import ColorV from "../lib/ColorV.ts";
import Timer from "../lib/Timer.ts";

export default class CharacterModel{
    public debugModels:Array<Model> =[];
    private rootBone: Bone;
    private hipBone: Bone;
    private legMidR: Leg;
    private sphere: Model;
    private legPos: number =0;



    constructor(renderer:Renderer)
    {
        this.rootBone = new Bone(renderer,"root",this.debugModels)


        this.sphere = new Model(renderer,"testSphere")
        this.sphere.mesh =new Sphere(renderer,0.03,16,12);
        this.sphere.material =new TestMaterial(renderer,"testMaterial");
        this.sphere.material.setUniform("color",new ColorV(1,0,1,1));
        this.sphere.setPosition(-0.2,0,0.3)
        this.rootBone.addChild(this.sphere)

        this.debugModels.push(this.sphere)




        this.hipBone = new Bone(renderer,"hip",this.debugModels)
        this.rootBone.addChild(this.hipBone)

        this.hipBone.setPosition(-0.3,0.5,0)


        this.legMidR =new Leg(renderer,"legMidR",this.hipBone,this.debugModels);
    }




    setMoveData(posX: number, posY: number,xSpeed:number) {

        let delta = Timer.delta;
        this.legPos +=Math.abs(xSpeed)*delta;




        let stepLength = 0.4
        this.legPos%=stepLength*2;
        let xPos = this.legPos-stepLength;
        let yPos = 0
        if(xPos>0){

            yPos =Math.sin((xPos/stepLength)*Math.PI)*stepLength*0.4;

        }

        xPos =Math.abs(xPos)-stepLength/2


        this.rootBone.setPosition(posX,posY,0);


        this.sphere.setPosition(-0.17+xPos,yPos,0.26-yPos*0.1)
        let sphereWorld = this.sphere.getWorldPos();
        this.legMidR.setTargetWorld(sphereWorld)
    }
}
