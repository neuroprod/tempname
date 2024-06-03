import Material from "../Material.ts";
import {ShaderType} from "../ShaderTypes.ts";

import {CompareFunction} from "../../WebGPUConstants.ts";
import DefaultUniformGroups from "../DefaultUniformGroups.ts";
import UniformGroup from "../UniformGroup.ts";
import {Vector4} from "@math.gl/core";

export default class SolidMaterial extends Material
{
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(1,0,0,1))
        this.depthWrite = false
        this.depthCompare = CompareFunction.Always

    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   

${this.getVertexOutputStruct()}   

${this.getShaderUniforms()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    output.position =camera.viewProjectionMatrix*model.modelMatrix* vec4( aPos,1.0);
 
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return uniforms.color;
}
///////////////////////////////////////////////////////////
        `
    }





}
