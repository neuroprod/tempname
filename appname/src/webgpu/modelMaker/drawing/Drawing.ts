import Renderer from "../../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import DrawLine from "./DrawLine.ts";
import DrawBufferTempPass from "./DrawBufferTempPass.ts";
import ColorV from "../../lib/ColorV.ts";
import {getImageBlob, sendTextureToServer} from "../../lib/SaveUtils.ts";


export default class Drawing {
    private lineSize = 20;
    private lineColor = new ColorV(1, 0, 0, 1)
    private currentLine!: DrawLine;
    private lines: Array<DrawLine> = [];
    private isDrawing: boolean = false;


    private renderer: Renderer;


    private bufferNeedsClearing = true;

    /*private mixPass:DrawingMixPass
    private bufferTexture: RenderTexture;
    private drawBufferClearPass: DrawBufferClearPass;
    private drawBufferStorePass: DrawBufferStorePass;*/
    private drawBufferTempPass: DrawBufferTempPass;


    constructor(renderer: Renderer) {
        this.renderer = renderer;
        //TODO update passes
        /* this.mixPass=new DrawingMixPass(renderer);

         this.bufferTexture = new RenderTexture(renderer, "drawingBufferColor", {
             format: renderer.presentationFormat,
             sampleCount: 1,
             scaleToCanvas: false,
             width:2024,
             height:2024,
             usage: GPUTextureUsage.RENDER_ATTACHMENT|GPUTextureUsage.TEXTURE_BINDING
         });

         this.drawBufferClearPass = new DrawBufferClearPass(this.renderer,this.bufferTexture)
         this.drawBufferStorePass = new DrawBufferStorePass(this.renderer,this.bufferTexture)*/
        this.drawBufferTempPass = new DrawBufferTempPass(this.renderer)
    }

    draw() {

        if (this.bufferNeedsClearing) {
            //   this.drawBufferClearPass.add();
            this.drawBufferTempPass.add();
            this.bufferNeedsClearing = false;
        }
        if (this.isDrawing) {
            this.drawBufferTempPass.add();
        }
        // this.mixPass.add();

    }

    onUI() {
        if(UI.LButton("save")){
            sendTextureToServer(this.renderer.textureHandler.texturesByLabel["drawingBufferTemp"],"texture","textures").then(()=>{
                console.log("saveOK")

            })

        }
        UI.LText("drawing")
        UI.LFloatSlider(this, "lineSize", 1, 100);
        UI.LColor("LineColor", this.lineColor)
    }



    setMouse(mouseLocal: Vector2, mouseDown: boolean, mouseUp: boolean) {
        if (mouseDown) {
            console.log("startdraw")


            this.currentLine = new DrawLine(this.renderer, this.lineColor)
            this.currentLine.drawSize = this.lineSize / 1000;

            this.lines.push(this.currentLine);

            this.isDrawing = true;
            this.updateDrawing()
        }
        if (this.isDrawing) {
            this.currentLine.addPoint(mouseLocal.clone());
            this.updateDrawing()
        }
        if (mouseUp) {
            if (this.isDrawing) {

                this.isDrawing = false;
                this.currentLine.smoothing()
                this.currentLine.smoothing()

                this.updateDrawing()

            }
        }
    }

    private updateDrawing() {
        this.drawBufferTempPass.lineRenderer.lines = this.lines;
    }
}
