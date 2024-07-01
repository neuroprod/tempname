import Renderer from "../lib/Renderer.ts";
import PreLoader from "../lib/PreLoader.ts";
import projectsArr from "./data.json"
import Project from "./Project.ts";
import TextureLoader from "../lib/textures/TextureLoader.ts";
import Animation from "../sceneEditor/timeline/animation/Animation.ts";
import AnimationChannel, {Key} from "../sceneEditor/timeline/animation/AnimationChannel.ts";
import {Quaternion, Vector3} from "@math.gl/core";

import SceneObject3D from "../sceneEditor/SceneObject3D.ts";
import Model from "../lib/model/Model.ts";
import GBufferMaterial from "../render/GBuffer/GBufferMaterial.ts";
import SelectItem from "../lib/UI/math/SelectItem.ts";
import ProjectMesh, {MeshType} from "./ProjectMesh.ts";
import GBufferClipMaterial from "../render/GBuffer/GBufferClipMaterial.ts";
import ShadowDepthMaterial from "../render/shadow/ShadowDepthMaterial.ts";
import ShadowClipDepthMaterial from "../render/shadow/ShadowClipDepthMaterial.ts";
import Font from "./Font.ts";
import FontMesh from "../modelMaker/FontMesh.ts";
import GBufferFontMaterial from "../render/GBuffer/GBufferFontMaterial.ts";
import ShadowFontDepthMaterial from "../render/shadow/ShadowFontDepthMaterial.ts";

class SceneData {
    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    animations: Array<Animation> = [];
    public modelsByLoadID: { [id: string]: SceneObject3D } = {};
    root!: SceneObject3D;
    usedModels: Array<Model> = [];
    projectSelectItems: Array<SelectItem> = [];
    private renderer!: Renderer;
    private dataScene!: any;
    private defaultShadowMaterial!: ShadowDepthMaterial;
    private font!: Font;

    private defaultFontMaterial!: GBufferFontMaterial;
    private defaultFontShadowMaterial!: ShadowFontDepthMaterial;

    constructor() {


    }

    parseSceneData() {


        let sceneData = this.dataScene.scene;


        this.root = new SceneObject3D(this.renderer, "root")
        for (let d of sceneData) {

            if (d.label == "root") {
                this.modelsByLoadID[d.id] = this.root;
                continue;
            }


            let sceneObj: SceneObject3D | null = null;
            if (d.meshId.length > 0 && d.projectId.length > 0) {
                sceneObj = this.getModel(d.label, d.projectId, d.meshId, d.id);
            } else if (d.isText) {
                sceneObj = this.makeSceneObjectWithText(d.label, d.text)
            } else {
                sceneObj = new SceneObject3D(this.renderer, d.label)
                sceneObj.UUID = d.id;

            }


            if (sceneObj) {
                sceneObj.setPosition(d.position[0], d.position[1], d.position[2])
                sceneObj.setRotation(d.rotation[0], d.rotation[1], d.rotation[2], d.rotation[3])

                this.modelsByLoadID[d.id] = sceneObj;

                this.modelsByLoadID[d.parentID].addChild(sceneObj)
                if (sceneObj.model) {
                    if (d.scale) {
                        sceneObj.model.setScale(d.scale[0], d.scale[1], d.scale[2])
                    }
                    this.usedModels.push(sceneObj.model);
                }// if(m.model)
            }
        }


        for (let anime of this.dataScene.animation) {

            let animation = new Animation(this.renderer, anime.label, this.modelsByLoadID[anime.rootID])
            animation.frameTime = anime.frameTime;
            animation.numFrames = anime.numFrames;

            for (let channelData of anime.channels) {

                let m = this.modelsByLoadID[channelData.id]
                if (m) {

                    let channel = new AnimationChannel(this.modelsByLoadID[channelData.id], channelData.type)

                    for (let i = 0; i < channelData.frames.length; i++) {
                        let key = new Key()
                        key.frame = channelData.frames[i]
                        let keyData = channelData.values[i]
                        if (keyData.length == 3) {
                            key.data = new Vector3(channelData.values[i])
                        }
                        if (keyData.length == 4) {
                            key.data = new Quaternion(channelData.values[i])
                        }

                        channel.keys.push(key);
                    }
                    channel.lastKeyIndex = channel.keys.length - 1;
                    animation.channels.push(channel)
                }
            }

            this.animations.push(animation)
            //AnimationEditor.setAnimation(this.animations[0]);
        }


    }

    public init(renderer: Renderer, preLoader: PreLoader) {
        this.renderer = renderer;

        this.defaultShadowMaterial = new ShadowDepthMaterial(renderer, "shadowDepth");
        this.defaultFontMaterial = new GBufferFontMaterial(renderer, "fontMaterial");
        this.defaultFontShadowMaterial = new ShadowFontDepthMaterial(renderer, "fontDepthMaterial");
        this.font = new Font()

        this.loadBase(preLoader).then(() => {
        })
        this.loadProjects(preLoader)

    }

    async loadBase(preloader: PreLoader) {
        const response = await fetch("./scene1.json");
        let sceneText = await response.text();
        this.dataScene = JSON.parse(sceneText);
    }

    async loadProject(folder: string, preloader: PreLoader) {

        const response = await fetch("./data/" + folder + "/data.json")
        preloader.startLoad()
        let texture = new TextureLoader(this.renderer, "./data/" + folder + "/texture.webp")
        texture.onComplete = () => {
            preloader.stopLoad()
        }
        let text = await response.text();
        let projData = JSON.parse(text);
        let p = new Project(this.renderer)

        p.setData(projData);


        p.baseTexture = texture;
        this.addProject(p);
    }

    makeSceneObjectWithMesh(p: Project, m: ProjectMesh, name: string, id: string) {


        let model = new Model(this.renderer, m.id);
        model.mesh = m.getMesh();
        if (m.meshType == MeshType.TRANS_PLANE) {
            model.material = new GBufferClipMaterial(this.renderer, "gMat");
            model.material.setTexture("colorTexture", p.baseTexture);


            let shadowClipMaterial = new ShadowClipDepthMaterial(this.renderer, "shadowDepthClip")
            shadowClipMaterial.setTexture("colorTexture", p.baseTexture);
            model.setMaterial("shadow", shadowClipMaterial)


        } else {
            model.material = new GBufferMaterial(this.renderer, "gMat");
            model.material.setTexture("colorTexture", p.baseTexture);
            model.setMaterial("shadow", this.defaultShadowMaterial)
        }


        let obj3D = new SceneObject3D(this.renderer, name)
        obj3D.addChild(model)
        obj3D.model = model;
        obj3D.meshId = m.id;
        obj3D.projectId = p.id;
        if (m.meshType == MeshType.TRANS_PLANE) {
            // obj3D.transparent =true;
        }
        if (id.length > 1) {
            obj3D.UUID = id;
        }
        return obj3D;
    }

    makeSelectItems() {
        this.projectSelectItems = []
        for (let p of this.projects) {
            if (p.meshes.length > 0) {
                this.projectSelectItems.push(new SelectItem(p.name, p))
                p.makeSelectItems();
            }

        }


    }

    makeSceneObjectWithText(name: string, text: string) {

        let model = new Model(this.renderer, "textModel")
        let mesh = new FontMesh(this.renderer, 'fontMesh');
        mesh.setText(text, this.font);
        model.mesh = mesh

        model.material = this.defaultFontMaterial;
model.setMaterial("shadow",this.defaultFontShadowMaterial)

        let obj3D = new SceneObject3D(this.renderer, name)
        obj3D.addChild(model)
        obj3D.isText = true;
        obj3D.text = text;
        obj3D.model = model;
        return obj3D;
    }

    private getModel(label: string, projectId: string, meshId: string, id: string): SceneObject3D | null {


        let project = this.projectsMap.get(projectId)
        if (!project) return null
        let projMesh = project.getProjectMeshByID(meshId);

        if (!projMesh) return null
        let m = this.makeSceneObjectWithMesh(project, projMesh, label, id);
        return m;


    }

    private loadProjects(preloader: PreLoader) {
        for (let p of projectsArr) {
            preloader.startLoad()
            this.loadProject(p, preloader).then(() => {
                preloader.stopLoad();
            })
        }
    }

    private addProject(p: Project) {
        this.projects.push(p)
        this.projectsMap.set(p.id, p);

    }
}


export default new SceneData()
