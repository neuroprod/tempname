import Rect from "../math/Rect";
import DrawBatch from "../draw/DrawBatch";
import FillBatchGPU from "./FillBatchGPU";
import TextBatchGPU from "./TextBatchGPU";
import SDFBatchGPU from "./SDFBatchGPU.ts";
import TextureBatch from "../draw/TextureBatch.ts";

export default class DrawBatchGPU {
    public id: number;

    public fillBatchGPU!: FillBatchGPU;
    public textBatchGPU!: TextBatchGPU;
    public sdfBatchGPU!: SDFBatchGPU;
    public textureBatch!: TextureBatch;
    public clipRect!: Rect | null;
    public needsClipping: boolean = false;
    public useThisUpdate: boolean = true;

    private device: GPUDevice;



    constructor(id: number, device: GPUDevice) {
        this.device = device;
        this.id = id;
    }

    setBatchData(batch: DrawBatch) {
        this.clipRect = batch.clipRect;

        this.needsClipping = batch.needsClipping;
        if (batch.fillBatch) {
            if (!this.fillBatchGPU) this.fillBatchGPU = new FillBatchGPU(this.device);
            this.fillBatchGPU.setRenderData(batch.fillBatch);
        }
        if (batch.textBatch) {
            if (!this.textBatchGPU) this.textBatchGPU = new TextBatchGPU(this.device);
            this.textBatchGPU.setRenderData(batch.textBatch);
        }
        if (batch.sdfBatch) {
            if (!this.sdfBatchGPU) this.sdfBatchGPU = new SDFBatchGPU(this.device);
            this.sdfBatchGPU.setRenderData(batch.sdfBatch);
        }

        if(batch.textureBatch.textureData.length>0){
            this.textureBatch =batch.textureBatch;
        }

    }

    destroy() {
        if (this.fillBatchGPU) {
            this.fillBatchGPU.destroy();
        }
        if (this.textBatchGPU) {
            this.textBatchGPU.destroy();
        }
        if (this.sdfBatchGPU) {
            this.sdfBatchGPU.destroy();
        }
        if(this.textureBatch){
            this.textureBatch.destroy();
        }

    }
}
