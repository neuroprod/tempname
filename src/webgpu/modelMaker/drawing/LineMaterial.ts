import Material from "../../lib/material/Material.ts";
import {ShaderType} from "../../lib/material/ShaderTypes.ts";
import {CompareFunction, VertexStepMode} from "../../lib/WebGPUConstants.ts";
import UniformGroup from "../../lib/material/UniformGroup.ts";
import {Vector4} from "@math.gl/core";
import Blend from "../../lib/material/Blend.ts";

export default class LineMaterial extends Material{
    public setup(){
        this.addAttribute("aPos", ShaderType.vec3);
        this.addAttribute("aUV0", ShaderType.vec2);
        this.addAttribute("instanceData", ShaderType.vec4, 1, VertexStepMode.Instance);

        this.addVertexOutput("uvEdge",ShaderType.vec3);


        let uniforms =new UniformGroup(this.renderer,"uniforms");
        this.addUniformGroup(uniforms,true);
        uniforms.addUniform("color",new Vector4(0.5,0.5,0.5,1))

        this.blendModes=[Blend.preMultAlpha()]
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
    var pos =vec2( aPos.x*instanceData.z +instanceData.x,aPos.y*instanceData.z +instanceData.y);
    pos*=2.0;
    pos-=vec2(1.0,1.0);
    
    output.position =vec4( pos,0.0,1.0);

    output.uvEdge =vec3(aUV0,instanceData.w);
     
    return output;
}


@fragment
fn mainFragment(${this.getFragmentInput()}) ->  @location(0) vec4f
{

   let uv =uvEdge.xy-vec2f(0.5,0.5);
   let l  =1.0-smoothstep(1.0-uvEdge.z,1.0,length(uv)*2.0);
   
    let color =    uniforms.color*l;
     

    return color;
}
///////////////////////////////////////////////////////////
        `


    }
}
