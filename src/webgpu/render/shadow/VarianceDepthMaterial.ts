import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";

export default class VarianceDepthMaterial extends Material{

    setup() {
        this.addAttribute("aPos", ShaderType.vec3);

        this.addVertexOutput("world",ShaderType.vec3)


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));


    }

    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   
${this.getShaderUniforms()}

fn computeMoment( depth:f32)->f32 {

    let dx = dpdx(depth);
    let dy = dpdy(depth);
    return depth * depth +0.25 * (dx * dx + dy * dy);
}



@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( aPos,1.0);
    output.world = (model.modelMatrix* vec4( aPos,1.0)).xyz;
 
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()})  -> @location(0) vec4f
{
    let d =distance(camera.worldPosition.xyz, world)-4.0;
    return vec4f(d,computeMoment(d),0.0,0.0);

}
///////////////////////////////////////////////////////////
        `
    }





}
