import Material from "../Material.ts";
import {ShaderType} from "../ShaderTypes.ts";
import UniformGroup from "../UniformGroup.ts";
import DefaultUniformGroups from "../DefaultUniformGroups.ts";
import {CullMode} from "../../WebGPUConstants.ts";
import {Vector4} from "@math.gl/core";

export default class TestMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addVertexOutput("normal", ShaderType.vec3 );
        this.addVertexOutput("uv", ShaderType.vec2 );

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer), true);
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer), true);


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(0.5,0.5,0.5,1))
        //this.cullMode =CullMode.Back;
        //this.logShader =true;
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
    output.normal = model.normalMatrix*aNormal;
    output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{

    let dif  =vec3(uv,0.0)* (dot(normal,normalize(vec3(0,0,1)))*0.5 +0.5);

    return vec4f(dif,uniforms.color.w);
}
///////////////////////////////////////////////////////////
        `
}


}
