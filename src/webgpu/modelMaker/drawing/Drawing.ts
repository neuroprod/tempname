import Renderer from "../../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import DrawLine from "./DrawLine.ts";
import DrawBufferTempPass from "./DrawBufferTempPass.ts";
import ColorV from "../../lib/ColorV.ts";
import Project from "../Project.ts";


export default class Drawing {
    private lineSize = 1;
    private lineColor = new ColorV(1, 0, 0, 1)
    private currentLine!: DrawLine;

    private isDrawing: boolean = false;


    private renderer: Renderer;


    private bufferNeedsClearing = true;

    /*private mixPass:DrawingMixPass
    private bufferTexture: RenderTexture;
    private drawBufferClearPass: DrawBufferClearPass;
    private drawBufferStorePass: DrawBufferStorePass;*/
    private drawBufferTempPass: DrawBufferTempPass;
    private needsRedraw: boolean=false;
    private project!: Project;


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
    setProject(project: Project) {
        this.project =project;
        this.drawBufferTempPass.blitMat.setTexture("colorTexture", project.baseTexture)
        this.updateDrawing()
    }
    draw() {

        if (this.bufferNeedsClearing) {
            //   this.drawBufferClearPass.add();
            this.drawBufferTempPass.add();
            this.bufferNeedsClearing = false;
        }
        if (this.needsRedraw) {
            this.drawBufferTempPass.add();
            this.needsRedraw =false;
        }
        // this.mixPass.add();

    }

    onUI() {
        if(!this.project)return;

        UI.LText("drawing")
        UI.LFloatSlider(this, "lineSize", 1, 100);
        UI.LColor("LineColor", this.lineColor)
        if (this.project.drawLines.length) {
            if (UI.LButton("Undo Line")) {
                let line = this.project.drawLines.pop() as DrawLine
                line.destroy();
                this.updateDrawing();
            }
        }
    }


    setMouse(mouseLocal: Vector2, mouseDown: boolean, mouseUp: boolean) {

        if(!this.project)return;
        if (mouseDown && !UI.needsMouse()) {



            this.currentLine = new DrawLine(this.renderer, this.lineColor)
            this.currentLine.drawSize = this.lineSize / 1000;

            this.project.drawLines.push(this.currentLine);

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
                this.currentLine.addPoint(mouseLocal.clone());
                this.currentLine.makeSmooth()


                this.updateDrawing()

            }
        }
    }

    private updateDrawing() {
        this.needsRedraw =true;

        this.drawBufferTempPass.lineRenderer.lines = this.project.drawLines;
    }


}
