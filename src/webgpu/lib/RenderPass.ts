import ObjectGPU from "./ObjectGPU";
import Renderer from "./Renderer";

import ColorAttachment from "./textures/ColorAttachment";
import DepthStencilAttachment from "./textures/DepthStencilAttachment";

export default class RenderPass extends ObjectGPU {

    public colorAttachments: Array<ColorAttachment> = [];
    public depthStencilAttachment!: DepthStencilAttachment;
    public passEncoder!: GPURenderPassEncoder;
    public sampleCount: 1 | 4 = 1;

    protected renderPassDescriptor!: GPURenderPassDescriptor;
    private isDirty: boolean = true;

    constructor(renderer: Renderer, label: string) {
        super(renderer, label);
    }

    public setDirty() {
        this.isDirty = true;
    }

    add(timestamp:GPURenderPassTimestampWrites|null =null) {
        this.updateDescriptor(timestamp)

        this.passEncoder = this.renderer.commandEncoder.beginRenderPass(
            this.renderPassDescriptor
        );

        this.draw()

        this.passEncoder.end();
    }
    addToCommandEncoder(commandEncoder:GPUCommandEncoder) {

        this.updateDescriptor(null);
        this.passEncoder = commandEncoder.beginRenderPass(
            this.renderPassDescriptor
        );

        this.draw()

        this.passEncoder.end();
    }

    protected draw() {

    }


    private updateDescriptor(timeStamp:GPURenderPassTimestampWrites|null ) {
        let dirty = this.isDirty;

        //TODO: check if textures are updated when this pass wasn't in use
        if (this.depthStencilAttachment && this.depthStencilAttachment.isDirty()) {
            dirty = true;


        }
        for (let c of this.colorAttachments) {
            if (c.isDirty()) {
                dirty = true;

            }

        }
        if (!dirty) return;

        let attachments = []
        for (let c of this.colorAttachments) {
            attachments.push(c.getAttachment())
        }

        this.renderPassDescriptor = {
            label: this.label,
            colorAttachments: attachments,

        };
        if(timeStamp){
            this.renderPassDescriptor.timestampWrites =timeStamp;
            console.log(this.renderPassDescriptor)
        }

        if (this.depthStencilAttachment)
            this.renderPassDescriptor.depthStencilAttachment = this.depthStencilAttachment.getAttachment()

        this.isDirty = false;

    }


}
