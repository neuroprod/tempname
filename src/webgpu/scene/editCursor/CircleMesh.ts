import Renderer from "../../lib/Renderer.ts";
import Mesh from "../../lib/mesh/Mesh.ts";
import {Vector3} from "@math.gl/core";


export default class CircleMesh{
    private numDiv: number;
    private basePoint:Array<Vector3>=[]
    mesh: Mesh;
    constructor(renderer:Renderer, numDiv:number) {
        this.numDiv =numDiv;
        let angleStep = Math.PI*2/this.numDiv;


        for(let i=0;i<=numDiv;i++){

            let angle = i* angleStep;
            this.basePoint.push(new Vector3(Math.sin(angle),Math.cos(angle),0))
        }
        const dir = [];
        const vertices = [];
        const verticesPrev = [];
        const verticesNext = [];
        for(let i=0;i<=numDiv;i++){
            dir.push(1,i,-1,i);

            let v =  this.basePoint[this.getIndex(i)]
            vertices.push(v.x,v.y,v.z)
            vertices.push(v.x,v.y,v.z)

            let vp =  this.basePoint[this.getIndex(i-1)]
            verticesPrev.push(vp.x,vp.y,v.z)
            verticesPrev.push(vp.x,vp.y,v.z)

            let vn =  this.basePoint[this.getIndex(i+1)]
            verticesNext.push(vn.x,vn.y,v.z)
            verticesNext.push(vn.x,vn.y,v.z)
        }

        const indices = [];
        let indexCount =0
        for(let i=0;i<numDiv;i++){
            indices.push(indexCount,indexCount+2,indexCount+1)
            indices.push(indexCount+1,indexCount+2,indexCount+3)
            indexCount+=2;
        }
       // indices.push(indexCount,0,indexCount+1)
        //indices.push(indexCount+1,0,1)

       this.mesh =new Mesh(renderer,"circleMesh")
        this.mesh.setAttribute("aDir",new Float32Array(dir));
        this.mesh.setAttribute("aPos",new Float32Array(vertices));
        this.mesh.setAttribute("aPosPrev",new Float32Array(verticesPrev));
        this.mesh.setAttribute("aPosNext",new Float32Array(verticesNext));
        this.mesh.setIndices(new Uint16Array(indices))
    }

    getIndex(index:number){
        if(index<0) index+=   this.numDiv;
        if(index>=this.numDiv) index -=this.numDiv;
        return index;

    }


}
