import Renderer from "../../lib/Renderer.ts";
import Quad from "../../lib/mesh/geometry/Quad.ts";
import DrawLine from "./DrawLine.ts";
import RenderPass from "../../lib/RenderPass.ts";

import LineMaterial from "./LineMaterial.ts";
import Blend from "../../lib/material/Blend.ts";

export default class LineRenderer{

    public lines:Array<DrawLine> =[];

    private renderer: Renderer;
    private quad: Quad;

    private material: LineMaterial;
    private materialEraser: LineMaterial;
private isEraser =false;
    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.quad =new Quad(renderer);
        this.material =new LineMaterial(renderer,"lineMat")
        this.materialEraser =new LineMaterial(renderer,"lineMatEraser");
        this.materialEraser.blendModes=[Blend.getErase()]
    }
    draw(pass: RenderPass) {

        if(this.lines.length ==0){
            return;
        }
        const passEncoder = pass.passEncoder;

        this.material.makePipeLine(pass);
        this.materialEraser.makePipeLine(pass);
        passEncoder.setPipeline(this.material.pipeLine);

        for (let line of this.lines) {

            if(line.numInstances==0)continue;

            if(line.isEraser && !this.isEraser){
                this.isEraser =true;
                passEncoder.setPipeline(this.materialEraser.pipeLine);
            }
            else if(!line.isEraser && this.isEraser){
                this.isEraser =false;
                passEncoder.setPipeline(this.material.pipeLine);
            }



            passEncoder.setBindGroup(0,line.uniformGroup.bindGroup);



            for (let attribute of this.material.attributes) {
                let buffer = this.quad.getBufferByName(attribute.name);
                if (!buffer) buffer = line.buffer;
                if (buffer) {
                    passEncoder.setVertexBuffer(
                        attribute.slot,
                        buffer,
                    )
                } else {

                    console.log("buffer not found", attribute.name)
                }
            }


                passEncoder.setIndexBuffer(this.quad.indexBuffer, this.quad.indexFormat);
                passEncoder.drawIndexed(
                    this.quad.numIndices,
                    line.numInstances,
                    0,
                    0
                );


        }
    }

}
