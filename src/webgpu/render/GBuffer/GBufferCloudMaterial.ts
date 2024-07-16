import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import DefaultTextures from "../../lib/textures/DefaultTextures.ts";
import {VertexStepMode} from "../../lib/WebGPUConstants.ts";


export default class GBufferCloudMaterial extends Material{

    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aNormal", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addAttribute("instancesMatrix0", ShaderType.vec4,1,VertexStepMode.Instance);
        this.addAttribute("instancesMatrix1", ShaderType.vec4,1,VertexStepMode.Instance);
        this.addAttribute("instancesMatrix2", ShaderType.vec4,1,VertexStepMode.Instance);
        this.addAttribute("instancesMatrix3", ShaderType.vec4,1,VertexStepMode.Instance);

        this.addVertexOutput("normal", ShaderType.vec3 );
        this.addVertexOutput("uv", ShaderType.vec2 );

        this.addUniformGroup(DefaultUniformGroups.getCamera(this.renderer));
        this.addUniformGroup(DefaultUniformGroups.getModelTransform(this.renderer));


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);

        uniforms.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))
        uniforms.addSampler("mySampler")

        this.logShader =true;
    }
    getShader(): string {
        return /* wgsl */ `
///////////////////////////////////////////////////////////   
struct GBufferOutput {
  @location(0) color : vec4f,
  @location(1) normal : vec4f,
   
}
${this.getVertexOutputStruct()}   


${this.getShaderUniforms()}
@vertex
fn mainVertex( ${this.getShaderAttributes()} ) -> VertexOutput
{
    var output : VertexOutput;
    
let model= mat4x4<f32>(instancesMatrix0,instancesMatrix1,instancesMatrix2,instancesMatrix3);
    
    output.position =camera.viewProjectionMatrix*model* vec4(aPos,1.0);
    
    let normalMatrix= mat3x3<f32>(
      instancesMatrix0.xyz,
      instancesMatrix1.xyz,
      instancesMatrix2.xyz,
  
    );
    
    output.normal = normalize(normalMatrix*aNormal);
    output.uv =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  GBufferOutput
{
    var output : GBufferOutput;
    var color =textureSample(colorTexture, mySampler,  uv);
     color =color+ vec4(1.0,1.0,1.0,1.0)*(1.0-color.a);
     output.color =color;
    output.normal =vec4(normalize(normal)*vec3f(0.5) +vec3f(0.5),0.0);

    return output;
}
///////////////////////////////////////////////////////////
        `
    }


}
