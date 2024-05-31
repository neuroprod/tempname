
import {Vector4} from "@math.gl/core";
import Material from "../lib/material/Material.ts";
import {ShaderType} from "../lib/material/ShaderTypes.ts";
import DefaultUniformGroups from "../lib/material/DefaultUniformGroups.ts";
import UniformGroup from "../lib/material/UniformGroup.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";

export default class ModelPreviewMaterial extends Material{

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

        uniforms.addTexture("colorTexture",DefaultTextures.getWhite(this.renderer))
        uniforms.addSampler("mySampler")

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

    let dif  =textureSample(colorTexture, mySampler,  uv).xyz * (dot(normalize(normal),normalize(vec3(0,1,1)))*0.5 +0.5);

    return vec4f(dif,1.0);
}
///////////////////////////////////////////////////////////
        `
    }


}
