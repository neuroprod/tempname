import Material from "./lib/material/Material.ts";
import {ShaderType} from "./lib/material/ShaderTypes.ts";
import UniformGroup from "./lib/material/UniformGroup.ts";
import DefaultUniformGroups from "./lib/material/DefaultUniformGroups.ts";

export default class TestMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );
        this.addVertexOutput("normal", ShaderType.vec3 );


        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms);
        uniforms.addUniform("test",1)

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
    output.uv0 =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
    return vec4f(normal,1.0);
}
///////////////////////////////////////////////////////////
        `
}


}
