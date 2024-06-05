import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";

import UniformGroup from "../../lib/material/UniformGroup.ts";
import {TextureSampleType} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";

export default class LightMaterial extends Material {
    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addVertexOutput("uv0", ShaderType.vec2 );


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);


        uniforms.addTexture("gColor",this.renderer.getTexture(Textures.GCOLOR), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("gNormal",this.renderer.getTexture(Textures.GNORMAL), {sampleType:TextureSampleType.UnfilterableFloat})
        uniforms.addTexture("gDepth",this.renderer.getTexture(Textures.GDEPTH), {sampleType:TextureSampleType.UnfilterableFloat})

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
    output.position =vec4( aPos,1.0);
    output.uv0 =aUV0;
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) -> @location(0) vec4f
{
   
      let textureSize =vec2<f32>( textureDimensions(gColor));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
      let color=textureLoad(gColor,  uvPos ,0); ;
      let normal=textureLoad(gNormal,  uvPos ,0); 
     return vec4(color.xyz+normal.xyz,1.0) ;
}
///////////////////////////////////////////////////////////
        `
    }






}
