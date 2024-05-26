import Renderer from "../../lib/Renderer.ts";
import CharacterModel from "./CharacterModel.ts";
import Bone from "./Bone.ts";
import Model from "../../lib/model/Model.ts";
import {Vector2, Vector3} from "@math.gl/core";
import Sphere from "../../lib/mesh/geometry/Sphere.ts";
import TestMaterial from "../../lib/material/TestMaterial.ts";
import ColorV from "../../lib/ColorV.ts";

export default class Leg{
    private hip: Bone;
    private leg: Bone;
    private knee: Bone;
    private root: Bone;

    private legDistance = 0.3
    private legLength =0.5
    private kneeLength =0.5
    private sphere: Model;
    private sphere2: Model;
    public hipPos: Vector3;
    constructor(renderer:Renderer,label:string,dir:number,root:Bone,debugModels:Array<Model>)
    {
        this.root =root;
        this.hip =new Bone(renderer,label+"hip",debugModels,0.5);
        this.hipPos = new Vector3(this.legDistance*dir,0.0,0);
        this.hip.setPositionV(this.hipPos);
        this.hip.setEuler(0,-Math.PI/2,0);
        root.addChild(this.hip)



        this.leg =new Bone(renderer,label+"hip",debugModels,this.legLength);
        this.leg.setPosition(0.0,0,0)
        this.leg.setEuler(0,0,-Math.PI/2);
        this.hip.addChild(this.leg)

        this.knee =new Bone(renderer,label+"hip",debugModels,this.kneeLength);
        this.knee.setPosition(this.legLength,0,0)
        this.knee.setEuler(0,0,0);
        this.leg.addChild(this.knee)


        this.sphere = new Model(renderer,"testSphere")
        this.sphere.mesh =new Sphere(renderer,0.03,16,12);
        this.sphere.material =new TestMaterial(renderer,"testMaterial");
        this.sphere.material.setUniform("color",new ColorV(1,0,0,1));
        this.sphere.setPosition(-0.2,0,0.3)
        debugModels.push(this.sphere)
        this.hip.addChild(this.sphere)



        this.sphere2 = new Model(renderer,"testSphere")
        this.sphere2.mesh =new Sphere(renderer,0.03,16,12);
        this.sphere2.material =new TestMaterial(renderer,"testMaterial");
        this.sphere2.material.setUniform("color",new ColorV(1,0,0,1));
        this.sphere2.setPosition(-0.2,0,0.3)
        debugModels.push(this.sphere2)
        this.hip.addChild(this.sphere2)
    }

    update(){

    }


    setTargetWorld(sphereWorld: Vector3) {
       let localRoot=this.hip.getPosition().clone().subtract(this.root.getLocalPos(sphereWorld.clone()));

        let angle = Math.atan2(localRoot.y,localRoot.z)

        this.hip.setEuler(0,angle+Math.PI/2,Math.PI/2);
        let hipLocalPos = this.hip.getLocalPos(sphereWorld.clone())



        //reduce to 2D problem
        let posJoint = new Vector2(0.0, 0);//0
        let r0 = this.legLength;
        let posTarget = new Vector2(hipLocalPos.x, hipLocalPos.y);//1
         let r1 =this.kneeLength;
        // intersection 2 circles

       let dx = posTarget.x - posJoint.x;
        let dy = posTarget.y - posJoint.y;
        // Determine the straight-line distance between the centers.
        let d = Math.sqrt((dy*dy) + (dx*dx));

        if (d > (r0 + r1)) {
            // no solution. circles do not intersect.
console.log("fail")
            return;
        }
        if (d < Math.abs(r0 - r1)) {
            // no solution. one circle is contained in the other
            console.log("fail")
            return;
        }
        /* 'point 2' is the point where the line through the circle
        * intersection points crosses the line between the circle
        * centers.
        */

        //Determine the distance from point 0 to point 2.
        let a = ((r0*r0) - (r1*r1) + (d*d)) / (2.0 * d);

        //Determine the coordinates of point 2.
        let x2 = posJoint.x + (dx * a / d);
        let y2 = posJoint.y + (dy * a / d);

        //Determine the distance from point 2 to either of the intersection points.

        let h = Math.sqrt((r0*r0) - (a*a));


        //Now determine the offsets of the intersection points from point 2.

        let rx = -dy * (h / d);
        let ry = dx * (h / d);

        let solution1 =new Vector2()
        let solution2 =new Vector2()
        let solution:Vector2
        //Determine the absolute intersection points. 2 solutions

        solution1.x = x2 + rx;
        solution2.x = x2 - rx;

        solution1.y = y2 + ry;
        solution2.y = y2 - ry;

        //we want the front solution
        if (solution2.y< solution1.y)
        {
            solution = solution2;
        }
        else
        {
            solution = solution1;
        }


        this.sphere.setPosition( solution.x, solution.y,0)
        this.sphere2.setPosition( posTarget.x, posTarget.y,0)
        //final angles

        let legAngle = Math.atan2(solution.y - posJoint.y, solution.x - posJoint.x) ;
        //if flip? legAngle *= -1;
        let kneeAngle = Math.atan2( posTarget.y-solution.y,   posTarget.x-solution.x) -legAngle
        //kneeAngle =Math.PI-kneeAngle

        this.leg.setEuler(0,0,legAngle);
        this.knee.setEuler(0,0,kneeAngle);


    }
}
