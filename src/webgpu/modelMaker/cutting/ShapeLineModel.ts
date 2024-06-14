
import ShapeLineMaterial from "./ShapeLineMaterial.ts";

import Model from "../../lib/model/Model.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import Renderer from "../../lib/Renderer.ts";
import Path from "../../lib/path/Path.ts";



export default class ShapeLineModel extends Model{

    positions:Array<number>=[];

    private indices:Array<number>=[];




    constructor(renderer: Renderer,label:string) {
        super(renderer,label);
        this.mesh =new Mesh(this.renderer,label+"m")
        this.material = new ShapeLineMaterial(this.renderer,"ShapeLineMaterial")
        this.material.depthWrite =false;
        this.material.depthCompare ="always";
        this.visible =false;
    }




    setPath(path: Path) {

        if(path.numCurves<1)return;

        this.visible =true;
        this.positions=[]
        this.indices=[]
        path.setMeshData(this.indices,this.positions)

        this.mesh.setPositions(new Float32Array(this.positions))
        this.mesh.setIndices(new Uint16Array(this.indices))
    }
}
