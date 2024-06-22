


import Model from "../../lib/model/Model.ts";

import Renderer from "../../lib/Renderer.ts";
import Path from "../../lib/path/Path.ts";
import ColorV from "../../lib/ColorV.ts";
import FatShapeLineMaterial from "./FatShapeLineMaterial.ts";

import FatLineMesh from "../../lib/mesh/geometry/FatLineMesh.ts";



export default class FatShapeLineModel extends Model{

    positions:Array<number>=[];

    private indices:Array<number>=[];




    constructor(renderer: Renderer,label:string,all:boolean) {
        super(renderer,label);
        this.mesh =new FatLineMesh(this.renderer)
        this.material = new FatShapeLineMaterial(this.renderer,"FatShapeLineMaterial")
        if(all){
            this.material.setUniform("color",new ColorV().setHex("#ff8800"))
        }else{
            this.material.setUniform("color",new ColorV().setHex("#0066ff"))
        }


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
        this.makeBuffers()
       // this.mesh.setPositions(new Float32Array(this.positions))
        //this.mesh.setIndices(new Uint16Array(this.indices))
    }
    setPaths(paths:Array<Path> ){
        if(paths.length ==0){
            this.visible =false;
            return;
        }

        this.positions=[];
        this.indices=[];
        let indexPos =0;
        for(let path of paths){
            let positionsTemp:Array<number>=[]
            let indicesTemp:Array<number>=[]
            path.setMeshData(indicesTemp,positionsTemp)
            for(let i=0;i<indicesTemp.length;i++){
                indicesTemp[i]+=indexPos;

            }

            this.positions =this.positions.concat(positionsTemp)
            this.indices=this.indices.concat(indicesTemp)

            indexPos+=positionsTemp.length/3;

        }

        if(indexPos==0) {
            this.visible =false;
            return;
        }
        this.visible =true;
        this.makeBuffers()
        //this.mesh.setPositions(new Float32Array(this.positions))
        //this.mesh.setIndices(new Uint16Array(this.indices))


    }

    private makeBuffers() {

        this.numInstances  =this.indices.length/2;

        let bufferData1 = new Float32Array( this.numInstances *3);
        let bufferData2 = new Float32Array(this.numInstances *3);
        let bufferPos =0;
        for(let i=0;i<this.indices.length-1;i+=2){
            let i1=this.indices[i]*3;
            let i2 =this.indices[(i+1)]*3;
            bufferData1[bufferPos] = this.positions[i1++]
            bufferData2[bufferPos++] = this.positions[i2++]

            bufferData1[bufferPos] = this.positions[i1++]
            bufferData2[bufferPos++] = this.positions[i2++]

            bufferData1[bufferPos] = this.positions[i1]
            bufferData2[bufferPos++] = this.positions[i2]
        }
       this.createBuffer(bufferData1,"aInstPos0")
        this.createBuffer(bufferData2,"aInstPos1")
    }
}
