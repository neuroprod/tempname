import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";

import {CompareFunction} from "../../lib/WebGPUConstants.ts";
import {Textures} from "../../data/Textures.ts";

export default class ShadowBlurMaterial extends Material{





    setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);

        this.addVertexOutput("uv0", ShaderType.vec2 );

        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addTexture("inTexture",this.renderer.getTexture(Textures.SHADOW_DEPTH));


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
    output.position =vec4( aPos,1.0);
    output.uv0 = aUV0;

    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{
       let textureSize =vec2<f32>( textureDimensions(inTexture));
      let uvPos = vec2<i32>(floor(uv0*textureSize));
     var p =vec2f(0.0);
     var d =2;
      for(var x=-d;x<=d;x+=1){
        for(var y=-d;y<=d;y+=1){
            p+=textureLoad(inTexture,  uvPos+vec2i(x,y) ,0).xy; 
        }
      }
  
      p/=25.0;
      
    return vec4(p,0.0,0.0) ;
}
///////////////////////////////////////////////////////////
        `
    }

}
