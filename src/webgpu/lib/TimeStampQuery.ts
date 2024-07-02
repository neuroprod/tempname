import Renderer from "./Renderer";

export default class TimeStampQuery {
    public totalTime: number = 0;
    public timeArray: Array<number>;
    public names: Array<string> = []


    private capacity: number = 2;
    private device: GPUDevice;

    private renderer: Renderer;
    private useTimeStampQuery: boolean;

    private querySet!: GPUQuerySet;
    private resolveBuffer!: GPUBuffer;
    private resultBuffer!: GPUBuffer;
    private bufferSize!: number;
    private done: boolean = true;


    constructor(renderer: Renderer, numStamps: number) {

        this.renderer = renderer;
        this.device = this.renderer.device;
        this.capacity = numStamps;//Max number of timestamps we can store
        this.timeArray = new Array<number>(numStamps);
        this.timeArray.fill(0);
        this.useTimeStampQuery = this.renderer.useTimeStampQuery
        if (this.useTimeStampQuery) {
            this.querySet = this.device.createQuerySet({
                type: "timestamp",
                count: this.capacity,
            });
            this.bufferSize = numStamps * BigInt64Array.BYTES_PER_ELEMENT;
            this.resolveBuffer = this.device.createBuffer({
                size: this.bufferSize,
                usage: GPUBufferUsage.QUERY_RESOLVE | GPUBufferUsage.COPY_SRC,
            });

            this.resultBuffer = this.device.createBuffer({
                size: this.bufferSize,
                usage: GPUBufferUsage.COPY_DST | GPUBufferUsage.MAP_READ,
            });


        }
    }

    getSet(start: number, stop: number) {
        if (!this.useTimeStampQuery) return null;

        let timestampWrites: GPURenderPassTimestampWrites = {
            querySet: this.querySet,
            beginningOfPassWriteIndex: start, // Write timestamp in index 0 when pass begins.
            endOfPassWriteIndex: stop, // Write timestamp in index 1 when pass ends.
        };
        return timestampWrites;
    }


    readback() {
        if (!this.useTimeStampQuery) return;
        if (this.done) {
            this.done = false;
            this.read().then(() => {
                this.done = true
            })
        }
        // console.log(  this.timeArray)


    }


    getData() {
        if (!this.useTimeStampQuery) return;
        if (this.done) {
            this.renderer.commandEncoder.resolveQuerySet(this.querySet, 0,  this.capacity, this.resolveBuffer, 0);

// Read GPUBuffer memory.
            this.renderer.commandEncoder.copyBufferToBuffer(this.resolveBuffer, 0, this.resultBuffer, 0, this.bufferSize);
        }


    }

    async read() {
        await this.resultBuffer.mapAsync(GPUMapMode.READ);
        const times = new BigInt64Array(this.resultBuffer.getMappedRange());
        let t1 = Number(times[1] - times[0]) / 1000000;
        let t2 = Number(times[3] - times[2]) / 1000000;
        console.log(`times` ,t1,"---",t2);
        this.resultBuffer.unmap();
    }


}
