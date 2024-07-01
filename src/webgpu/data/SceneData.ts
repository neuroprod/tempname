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

class SceneData {
    projects: Array<Project> = [];
    public projectsMap: Map<string, Project> = new Map<string, Project>();
    animations: Array<Animation> = [];
    public modelsByLoadID: { [id: string]: SceneObject3D } = {};
    root!: SceneObject3D;
    usedModels: Array<Model> = [];
    private renderer!: Renderer;
    private dataScene!: any;
    projectSelectItems:  Array<SelectItem> = [];
    private defaultShadowMaterial!: ShadowDepthMaterial;

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



            let m:SceneObject3D|null =null;
            if(d.meshId.length>0 && d.projectId.length>0 ){
               m = this.getModel( d.label,d.projectId,d.meshId,d.id);

            }


            if (m) {
                m.setPosition(d.position[0], d.position[1], d.position[2])
                m.setRotation(d.rotation[0], d.rotation[1], d.rotation[2], d.rotation[3])

                this.modelsByLoadID[d.id] = m;

                this.modelsByLoadID[d.parentID].addChild(m)
                if (m.model) {
                    if (d.scale) {
                        m.model.setScale(d.scale[0], d.scale[1], d.scale[2])
                    }
                    this.usedModels.push(m.model);
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

        this.defaultShadowMaterial = new ShadowDepthMaterial(renderer,"shadowDepth");


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

    private getModel( label:string ,projectId :string,meshId:string,id:string): SceneObject3D | null {


        let project = this.projectsMap.get(projectId)
        if(!project) return null
        let projMesh = project.getProjectMeshByID(meshId);

        if(! projMesh) return null
        let m  =this.makeSceneObjectWithMesh(project, projMesh,label,id);
        return m;


    }
    makeSceneObjectWithMesh(p:Project,m:ProjectMesh,name:string,id:string){


        let model = new Model(this.renderer, m.id);
        model.mesh = m.getMesh();
        if(m.meshType ==MeshType.TRANS_PLANE){
            model.material = new GBufferClipMaterial(this.renderer, "gMat");
            model.material.setTexture("colorTexture", p.baseTexture);


            let shadowClipMaterial = new ShadowClipDepthMaterial(this.renderer,"shadowDepthClip")
            shadowClipMaterial.setTexture("colorTexture", p.baseTexture);
            model.setMaterial("shadow", shadowClipMaterial)


        }else{
            model.material = new GBufferMaterial(this.renderer, "gMat");
            model.material.setTexture("colorTexture", p.baseTexture);
            model.setMaterial("shadow",this.defaultShadowMaterial)
        }


        let obj3D = new SceneObject3D(this.renderer, name)
        obj3D.addChild(model)
        obj3D.model = model;
        obj3D.meshId =m.id;
        obj3D.projectId =p.id;
        if(m.meshType ==MeshType.TRANS_PLANE){
            obj3D.transparent =true;
        }
        if(id.length>1) {obj3D.UUID =id;}
        return obj3D;
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

    makeSelectItems() {
        this.projectSelectItems =[]
        for(let p of this.projects){
            if(p.meshes.length>0){
                this.projectSelectItems.push(new SelectItem(p.name,p))
                p.makeSelectItems();
            }

        }


    }
}


export default new SceneData()
