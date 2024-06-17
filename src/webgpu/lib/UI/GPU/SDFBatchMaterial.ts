export default class SDFBatchMaterial {
    private device: GPUDevice;
    private shader: GPUShaderModule;
    public pipeLine!: GPURenderPipeline;
    private pipelineLayout: GPUPipelineLayout;
    private presentationFormat: GPUTextureFormat;
    private needsDepth: boolean = true;

    constructor(
        device: GPUDevice,
        presentationFormat: GPUTextureFormat,
        mvpBindGroupLayout: GPUBindGroupLayout,
        fontBindGroupLayout: GPUBindGroupLayout
    ) {
        this.device = device;
        this.presentationFormat = presentationFormat;
        this.shader = this.device.createShaderModule({
            label: "UI_Shader_TextBatchMaterial",
            code: this.getShader(),
        });
        this.pipelineLayout = this.device.createPipelineLayout({
            label: "UI_PipelineLayout_TextBatchMaterial",
            bindGroupLayouts: [mvpBindGroupLayout, fontBindGroupLayout],
        });
    }

    makePipeline(needsDepth: boolean) {
        if (this.pipeLine && this.needsDepth == needsDepth) return;

        this.needsDepth = needsDepth;

        let desc: GPURenderPipelineDescriptor = {
            label: "UI_Pipeline_TextBatchMaterial",
            layout: this.pipelineLayout,
            vertex: {
                module: this.shader,
                entryPoint: "mainVertex",
                buffers: [
                    {
                        arrayStride: 32,
                        attributes: [
                            {
                                // position
                                shaderLocation: 0,
                                offset: 0,
                                format: "float32x2",
                            },
                            {
                                // uv
                                shaderLocation: 1,
                                offset: 8,
                                format: "float32x2",
                            },
                            {
                                // color
                                shaderLocation: 2,
                                offset: 16,
                                format: "float32x4",
                            },
                        ],
                    },
                ],
            },
            fragment: {
                module: this.shader,
                entryPoint: "mainFragment",
                targets: [
                    {
                        format: this.presentationFormat,
                        blend: {
                            color: {
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                                operation: "add",
                            },
                            alpha: {
                                srcFactor: "one",
                                dstFactor: "one-minus-src-alpha",
                                operation: "add",
                            },
                        },
                    },
                ],
            },
            primitive: {
                topology: "triangle-list",
            },

            multisample: {
                count: 4,
            },
        };
        if (needsDepth) {
            desc.depthStencil = {
                depthWriteEnabled: false,
                depthCompare: "always",

                format: "depth16unorm",
            };
        }
        this.pipeLine = this.device.createRenderPipeline(desc);
    }

    getShader() {
        return /* wgsl */ `
///////////////////////////////////////////////////////////      
struct VertexOutput{
    @builtin(position) position : vec4f,
     @location(0) uv : vec2f,
    @location(1) color : vec4f,
}

@group(0) @binding(0) var<uniform> mvp :  mat4x4 <f32>;

@group(1) @binding(0) var fontTexture: texture_2d<f32>;
@group(1) @binding(1) var mySampler: sampler;
@vertex
fn mainVertex( 
    @location(0) position : vec2f,
     @location(1) uv : vec2f,
    @location(2) color : vec4f, 
) -> VertexOutput
{
    var output : VertexOutput;
    output.position = mvp*vec4( position,0.0,1.0);
    output.uv =vec2f (uv.x,1.0-uv.y);
    output.color =color;

    return output;
}


@fragment
fn mainFragment(
    @location(0) uv: vec2f,
     @location(1) color: vec4f,
) -> @location(0) vec4f
{

   var text= textureSample(fontTexture, mySampler,  uv);//textureLoad(fontTexture,  mySampler,0);
    let dist = max(min(text.r, text.g), min(max(text.r, text.g), text.b));


let unitRange = vec2(4.0)/vec2(512.0);
let screenTexSize = vec2(1.0)/fwidth(uv);
let screenPxDistance = max(0.5*dot(unitRange, screenTexSize), 1.0);

let a = clamp(screenPxDistance *(dist - 0.5) + 0.5, 0., 1.);


    let c  =color *a;
     return c;
}
///////////////////////////////////////////////////////////
`;
    }
}
