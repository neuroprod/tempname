import Renderer from "../../lib/Renderer.ts";
import {Vector2} from "@math.gl/core";
import UI from "../../lib/UI/UI.ts";
import DrawLine from "./DrawLine.ts";
import DrawBufferTempPass from "./DrawBufferTempPass.ts";

import Project from "../../data/Project.ts";
import Color from "../../lib/UI/math/Color.ts";

export class LineData {

    smoothing = 0.1;
    pressure = 0.5
    edge = 0.2
    lineSize = 5;
    uiRadius = 3

    constructor(lineSize: number = 5, uiRadius = 5, edge = 0.2) {
        this.lineSize = lineSize
        this.uiRadius = uiRadius
        this.edge = edge
    }

    copy(lineData: LineData) {
        this.smoothing = lineData.smoothing
        this.pressure = lineData.pressure
        this.edge = lineData.edge
        this.lineSize = lineData.lineSize
        this.uiRadius = lineData.uiRadius
    }
}


export default class Drawing {

    public lineColor = new Color(0.14901960784313725, 0.1357942726389747, 0.12798154555940022, 1)
    lineData = new LineData(5, 5, 0.3)
    private currentLine!: DrawLine;
    private isDrawing: boolean = false;


    private renderer: Renderer;


    private bufferNeedsClearing = true;


    private drawBufferTempPass: DrawBufferTempPass;
    private needsRedraw: boolean = false;
    private project!: Project;


    constructor(renderer: Renderer) {
        this.renderer = renderer;

        this.drawBufferTempPass = new DrawBufferTempPass(this.renderer)
    }

    setProject(project: Project) {
        this.project = project;
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
            this.needsRedraw = false;
        }
        // this.mixPass.add();

    }

    public undoLine() {
        let line = this.project.drawLines.pop() as DrawLine
        line.destroy();
        this.updateDrawing();
    }

    onUI() {
        if (!this.project) return;

        /*  UI.LText("drawing")
          UI.LFloatSlider(this, "lineSize", 1, 100);
          UI.LFloatSlider(this, "pressure", 0, 1);
          UI.LFloatSlider(this, "smoothing", 0, 1);
          UI.LColor("LineColor", this.lineColor)
          if (this.project.drawLines.length) {
              if (UI.LButton("Undo Line")) {
                  let line = this.project.drawLines.pop() as DrawLine
                  line.destroy();
                  this.updateDrawing();
              }
          }*/
    }


    setMouse(mouseLocal: Vector2, pressureIn: number, mouseDown: boolean, mouseUp: boolean) {

        if (!this.project) return;
        if (mouseDown && !UI.needsMouse()) {


            this.currentLine = new DrawLine(this.renderer, this.lineColor)
            this.currentLine.lineSize = this.lineData.lineSize / 1000;
            this.currentLine.smoothing = this.lineData.smoothing;
            this.currentLine.edge = this.lineData.edge;
            this.project.drawLines.push(this.currentLine);
            this.project.setDirty();
            this.isDrawing = true;
            this.updateDrawing()
        }
        if (this.isDrawing) {
            let size = (this.lineData.lineSize + ((pressureIn - 0.5) * this.lineData.pressure * this.lineData.lineSize)) / 1000;
            this.currentLine.addPoint(mouseLocal.clone(), size);
            this.updateDrawing()
        }
        if (mouseUp) {
            if (this.isDrawing) {

                this.isDrawing = false;
                this.currentLine.addPoint(mouseLocal.clone(), 0.01);
                this.currentLine.makeSmooth()


                this.updateDrawing()

            }
        }
    }

    private updateDrawing() {
        this.needsRedraw = true;
        this.drawBufferTempPass.lineRenderer.lines = this.project.drawLines;
    }


}
