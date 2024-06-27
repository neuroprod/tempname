import Renderer from "../Renderer.ts";
import UniformGroup from "../material/UniformGroup.ts";
import Material from "../material/Material.ts";
import Quad from "../mesh/geometry/Quad.ts";
import RenderPass from "../RenderPass.ts";

export default class Blit {
    material: Material;
    private mesh: Quad;
    private renderer: Renderer;


    constructor(renderer: Renderer, label: string, material: Material) {
        this.renderer = renderer;
        this.material = material;

        this.mesh = new Quad(renderer)
    }

    draw(pass: RenderPass) {
        const passEncoder = pass.passEncoder;
        this.material.makePipeLine(pass);

        passEncoder.setPipeline(this.material.pipeLine);
        for (let i = 0; i < this.material.uniformGroups.length; i++) {
            let label = this.material.uniformGroups[i].label;
            let uniformGroup: UniformGroup;


                uniformGroup = this.material.uniformGroups[i];

            //fix if need extra groups


            passEncoder.setBindGroup(i, uniformGroup.bindGroup);

        }


        for (let attribute of this.material.attributes) {

            let buffer = this.mesh.getBufferByName(attribute.name)
            if (buffer) {
                passEncoder.setVertexBuffer(
                    attribute.slot,
                    buffer
                );
            }
        }


        passEncoder.setIndexBuffer(this.mesh.indexBuffer, this.mesh.indexFormat);
        passEncoder.drawIndexed(
            this.mesh.numIndices,
            1,
            0,
            0
        );

    }
}
