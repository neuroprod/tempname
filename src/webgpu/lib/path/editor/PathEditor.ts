import Renderer from "../../Renderer.ts";
import Path from "../Path.ts";
import Model from "../../model/Model.ts";
import Quad from "../../mesh/geometry/Quad.ts";
import PathPointMaterial from "./PathPointMaterial.ts";
import Bezier from "../Bezier.ts";
import {Vector2, Vector3} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";

export default class PathEditor{
    pointModel: Model;
    private renderer: Renderer;
    private positionBuffer!:GPUBuffer;
private points:Array<Vector3> =[]
    constructor(renderer:Renderer) {
        this.renderer =renderer;
        this.pointModel = new Model(renderer,"pointModel")
        this.pointModel.visible =false
        this.pointModel.mesh =new Quad(renderer)
        this.pointModel.material = new PathPointMaterial(renderer,"PathPointMaterial");



    }
    setPath(path:Path,center:Vector2|null){

        if(!path.started){
            this.pointModel.visible =false
            return;
        }
        this.points=[]
        let curves =path.curves;

        let pointDrawData=[]
        for (let c of path.curves){
           let p = c.getP1();
            this.points.push(p)
           pointDrawData.push(p.x,p.y,p.z,0)
            if(c.type  ==2){
                let c1 =(c as Bezier).c1
                this.points.push(c1)
                pointDrawData.push(c1.x,c1.y,c1.z,1)

                let c2 =(c as Bezier).c2
                this.points.push(c2)
                pointDrawData.push(c2.x,c2.y,c2.z,1)
            }

        }
        this.points.push(path.currentPoint)
        pointDrawData.push(path.currentPoint.x,path.currentPoint.y,path.currentPoint.z,0)
        if(center){
            pointDrawData.push(center.x,center.y,0,0.5)
        }
        this.pointModel.visible =true
        this.createBuffer(new Float32Array(pointDrawData))
        this.pointModel.addBuffer("positionData" ,this.positionBuffer)
        this.pointModel.numInstances =pointDrawData.length/4;

    }
    getHitPoint(mouseLocal:Vector3){

        let ps:Vector3
        let dist  =Number.MAX_VALUE
        for(let p of this.points){
            let ds = p.distanceSquared(mouseLocal as NumericArray)
            if(ds<dist){
                dist =ds;
                ps = p;

            }
        }

        let psTest =ps.clone()
        let mstest =mouseLocal.clone()
        psTest.transform(this.pointModel.worldMatrix as NumericArray)
        mstest.transform(this.pointModel.worldMatrix as NumericArray)
        let screenDist  = psTest.distance(mstest as NumericArray)/this.renderer.pixelRatio
        if(screenDist<6){
            return ps;
        }
        return null

    }

    createBuffer(data: Float32Array) {

        if (this.positionBuffer) {

            this.positionBuffer.destroy()
        }

        this.positionBuffer = this.renderer.device.createBuffer({
            size: data.byteLength,
            usage: GPUBufferUsage.VERTEX,
            mappedAtCreation: true,
        });
        const dst = new Float32Array(  this.positionBuffer.getMappedRange());
        dst.set(data);

        this.positionBuffer.unmap();
        this.positionBuffer .label = "instancePositionBuffer" ;


    }
    update(){
    this.pointModel.material.setUniform("scale",this.renderer.inverseSizePixelRatio)
    }






}
