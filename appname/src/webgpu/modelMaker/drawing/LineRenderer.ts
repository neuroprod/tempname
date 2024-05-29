import Renderer from "../../lib/Renderer.ts";
import Quad from "../../lib/mesh/geometry/Quad.ts";
import DrawLine from "./DrawLine.ts";
import RenderPass from "../../lib/RenderPass.ts";

import LineMaterial from "./LineMaterial.ts";

export default class LineRenderer{

    public lines:Array<DrawLine> =[];

    private renderer: Renderer;
    private quad: Quad;

    private material: LineMaterial;

    constructor(renderer:Renderer)
    {
        this.renderer =renderer;
        this.quad =new Quad(renderer);
        this.material =new LineMaterial(renderer,"lineMat")
    }
    draw(pass: RenderPass) {

        if(this.lines.length ==0){
            return;
        }
        const passEncoder = pass.passEncoder;

        this.material.makePipeLine(pass);
        passEncoder.setPipeline(this.material.pipeLine);

        for (let line of this.lines) {

            if(line.numInstances==0)continue;
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
