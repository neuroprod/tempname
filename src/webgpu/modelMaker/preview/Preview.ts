import Renderer from "../../lib/Renderer.ts";
import Project from "../Project.ts";

export default class Preview{
    private renderer: Renderer;

    constructor(renderer:Renderer) {
        this.renderer = renderer;
    }

    setProject(project: Project) {

    }
}
