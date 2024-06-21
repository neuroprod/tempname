import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import {CompareFunction, PrimitiveTopology} from "../../lib/WebGPUConstants.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {Vector4} from "@math.gl/core";
import Blend from "../../lib/material/Blend.ts";


export default class ShapeLineMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(0.5,0.5,0.5,1))



        this.topology =PrimitiveTopology.LineList;
        this.depthCompare = CompareFunction.Always;
        this.depthWrite =false;

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
    output.position =camera.viewProjectionMatrix*model.modelMatrix*vec4( aPos,1.0);


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
