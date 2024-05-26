import Object3D from "../../lib/model/Object3D.ts";
import Renderer from "../../lib/Renderer.ts";

import TestMaterial from "../../lib/material/TestMaterial.ts";

import Model from "../../lib/model/Model.ts";
import Sphere from "../../lib/mesh/geometry/Sphere.ts";
import {Vector4} from "@math.gl/core";
import ColorV from "../../lib/ColorV.ts";
import BoneMesh from "../../lib/mesh/geometry/BoneMesh.ts";

export default class Bone extends Object3D{
    private sphere: Model;
    private bone: Model;



    constructor(renderer:Renderer,label:string,debugModels:Array<Model>,length=0.5) {
        super(renderer,label);
        this.sphere = new Model(renderer,label)
        this.sphere.mesh =new Sphere(renderer,0.02,16,12);
        this.sphere.material =new TestMaterial(renderer,"testMaterial");
        this.sphere.material.setUniform("color",new ColorV(1,1,1,1));
        debugModels.push(this.sphere)
        this.addChild(this.sphere)

        this.bone = new Model(renderer,label)
        this.bone.mesh =new BoneMesh(renderer,0.05,length);
        this.bone.material =new TestMaterial(renderer,"testMaterial");
        this.bone.material.setUniform("color",new ColorV(1,1,1,1));

        debugModels.push(this.bone)
        this.addChild(this.bone)

    }



}
