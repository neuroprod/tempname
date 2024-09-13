import Renderer from "../lib/Renderer.ts";
import DefaultTextures from "../lib/textures/DefaultTextures.ts";
import Texture from "../lib/textures/Texture.ts";
import ProjectMesh from "./ProjectMesh.ts";
import DrawLine from "../modelMaker/drawing/DrawLine.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import TextureLoader from "../lib/textures/TextureLoader.ts";
import MathUtils from "../lib/MathUtils.ts";
import GBufferClipMaterial from "../render/GBuffer/GBufferClipMaterial.ts";
import ShadowClipDepthMaterial from "../render/shadow/ShadowClipDepthMaterial.ts";
import GBufferMaterial from "../render/GBuffer/GBufferMaterial.ts";

export default class Project {
    public name: string = "";

    public meshes: Array<ProjectMesh> = [];

    drawLines: Array<DrawLine> = [];
    textureDirty: boolean = false;
    textureSize: number = 1024;
    selectItems: Array<SelectItem> = [];
    baseTexture: Texture;
    fullTexture!: Texture;
    loadTexture!: TextureLoader;
    public isNew = true;
    id: string;
    private renderer: Renderer;
    private isDirty: boolean = false;
    private gBufferClipMaterial!: GBufferClipMaterial;
    private shadowClipMaterial!: ShadowClipDepthMaterial;
    private GBufferMaterial!: GBufferMaterial;

    constructor(renderer: Renderer) {
        this.renderer = renderer;
        this.baseTexture = DefaultTextures.getTransparent(renderer)

        this.id = MathUtils.generateUUID();
    }

    public setDirty() {
        this.isDirty = true;

    }

    getSaveString() {
        let a: any = {}
        a.version = "0.1";
        a.name = this.name;
        a.id = this.id;
        a.meshes = []
        for (let d of this.meshes) {
            a.meshes.push(d.getMeshData())
        }
        return JSON.stringify(a)
    }

    setData(projData: any) {

        this.name = projData.name;
        if (projData.id) {
            this.id = projData.id;
        }
        this.isNew = false;

        for (let m of projData.meshes) {
            let pm = new ProjectMesh(this.renderer)
            pm.setData(m);
            this.selectItems.push(new SelectItem(pm.name, pm));
            this.meshes.push(pm)
        }


    }


    getProjectMeshByID(id: string) {
        for (let m of this.meshes) {
            if (m.id == id) {
                return m

            }

        }
        return null;
    }

    makeSelectItems() {
        this.selectItems = []
        for (let m of this.meshes) {
            this.selectItems.push(new SelectItem(m.name, m))
        }
    }

    async loadPNGTexture() {
        this.loadTexture = new TextureLoader(this.renderer)
        await this.loadTexture.loadURL("./data/" + this.id + "/texture.png");


    }

    getGBufferClipMaterial() {
        if (!this.gBufferClipMaterial) {
            this.gBufferClipMaterial = new GBufferClipMaterial(this.renderer, "gMat");
          //  this.gBufferClipMaterial.setTexture("colorTexture", this.baseTexture);
        }
        return this.gBufferClipMaterial
    }

    getShadowClipMaterial() {
        if (!this.shadowClipMaterial) {
            this.shadowClipMaterial = new ShadowClipDepthMaterial(this.renderer, "shadowDepthClip")
         //   this.shadowClipMaterial.setTexture("colorTexture", this.baseTexture);
        }
        return this.shadowClipMaterial
    }

    getGBufferMaterial() {
        if (!   this.GBufferMaterial) {
            this.GBufferMaterial  = new GBufferMaterial(this.renderer, "gMat");
          //  this.GBufferMaterial.setTexture("colorTexture",this.baseTexture);
        }
        return this.GBufferMaterial;
    }
}
