import Timer from "./Timer.ts";
import TextureHandler from "./TextureHandler.ts";
import ColorAttachment from "./textures/ColorAttachment.ts";
import UniformGroup from "./material/UniformGroup.ts";
import Model from "./model/Model.ts";
import UI from "./UI/UI.ts";


export default class Renderer {

    public pixelRatio: number =1;
    public ratio: number=1;
    public width: number = 1;
    public height: number = 1;



    canvas!: HTMLCanvasElement;


    public device!: GPUDevice;
    presentationFormat!: GPUTextureFormat;



    private context!: GPUCanvasContext;
    commandEncoder!: GPUCommandEncoder;
    private canvasTextureView!: GPUTexture;
    private canvasColorAttachment!: ColorAttachment;
    textureHandler!: TextureHandler;
    private uniformGroups: Array<UniformGroup> = [];

    models: Array<Model> = [];
    modelByLabel: { [label: string]: Model } = {};



    constructor() {
    }

    async setup(canvas: HTMLCanvasElement) {
        this.canvas = canvas;
        this.pixelRatio = window.devicePixelRatio;
        this.textureHandler = new TextureHandler();


        const adapter = await navigator.gpu.requestAdapter({powerPreference: "high-performance"});
        if(adapter) {

            for (let a of adapter.features.keys()) {
                console.log(a)
            }
            const requiredFeatures: Array<GPUFeatureName> = [];


            this.device = await adapter.requestDevice({requiredFeatures: requiredFeatures});
            console.log(this.device)
            this.context = this.canvas.getContext("webgpu") as GPUCanvasContext;
            this.presentationFormat = navigator.gpu.getPreferredCanvasFormat();

            this.context.configure({
                device: this.device,
                format: this.presentationFormat,
                alphaMode: "premultiplied",

            });



        }

    }
    public update(setCommands: () => void) {

        Timer.update();

        this.updateSize();
        this.updateModels();
        this.updateUniformGroups()
        //

        this.canvasTextureView = this.context.getCurrentTexture();
        this.canvasColorAttachment.setTarget(this.canvasTextureView.createView())
        this.commandEncoder = this.device.createCommandEncoder();



        setCommands();


        this.device.queue.submit([this.commandEncoder.finish()]);


    }
    addUniformGroup(uniformGroup: UniformGroup) {
        this.uniformGroups.push(uniformGroup)
    }
    private updateUniformGroups() {

        for (let u of this.uniformGroups) {
            u.update()
        }
    }
    public setCanvasColorAttachment(canvasColorAttachment: ColorAttachment) {
        this.canvasColorAttachment = canvasColorAttachment
    }

    private updateSize() {

        if (this.width != this.canvas.width || this.height != this.canvas.height) {
            this.width = this.canvas.width;
            this.height = this.canvas.height;
            this.ratio = this.width / this.height;
         //   this.size.x =this.width;
           // this.size.y =this.height;

            this.textureHandler.resize(this.width,this.height)



        }

    }

    addModel(model: Model) {
        this.modelByLabel[model.label] =model;
        this.models.push(model);
    }

    private updateModels() {
        for (let m of this.models) {
            m.update();

        }
    }
}

