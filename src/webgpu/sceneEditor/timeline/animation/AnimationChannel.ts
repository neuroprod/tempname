import SceneObject3D from "../../../data/SceneObject3D.ts";
import {AnimationType} from "./Animation.ts";
import {Quaternion, Vector3} from "@math.gl/core";


export class Key {
    frame: number = 0;
    data: any

}

export default class AnimationChannel {

    public sceneObject3D: SceneObject3D

    public keys: Array<Key> = []

    type: AnimationType;
    lastKeyIndex: number = 0;

    constructor(sceneObject3D: SceneObject3D, type: AnimationType) {
        this.sceneObject3D = sceneObject3D;
        this.type = type;

    }

    getChannelData(arr: Array<any>) {
        let data: any = {}
        data.type = this.type;
        data.id = this.sceneObject3D.UUID;
        data.frames = []
        data.values = []
        for (let key of this.keys) {
            data.frames.push(key.frame)
            data.values.push(key.data);

        }
        arr.push(data);

    }

    getCurrentData() {
        if (this.type == AnimationType.TRANSLATE) {
            let d = new Vector3()
            d.from(this.sceneObject3D.getPosition())
            return d;
        } else if (this.type == AnimationType.ROTATE) {
            let q = new Quaternion()
            q.from(this.sceneObject3D.getRotation())
            return q;
        } else if (this.type == AnimationType.SCALE) {
            let d = new Vector3()
            // @ts-ignore
            d.from(this.sceneObject3D.model.getScale())
            return d;
        }
    }


    addKey(frame: number) {
        for (let k of this.keys) {
            if (k.frame == frame) {

                k.data = this.getCurrentData();
                return;
            }
        }
        let key = new Key();
        key.frame = frame;

        key.data = this.getCurrentData();

        this.keys.push(key)
        this.lastKeyIndex = this.keys.length - 1;
        this.sortKeys();

    }

    sortKeys() {
        this.keys.sort((a, b) => {
            if (a.frame > b.frame) {
                return 1
            }
            return -1
        })
    }

    setTime(time: number) {

        if (this.keys.length == 0) return;

        if (this.keys.length == 1) {
            this.setCurrentData(this.keys[0].data)
            return;
        }
        if (time <= this.keys[0].frame) {
            this.setCurrentData(this.keys[0].data)
            return;
        }

        if (time >= this.keys[this.lastKeyIndex].frame) {
            this.setCurrentData(this.keys[this.lastKeyIndex].data)
            return;
        }
        //interpolate


        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].frame > time) {
                let k0 = this.keys[i - 1];
                let k1 = this.keys[i];
                let lerpVal = (time - k0.frame) / (k1.frame - k0.frame);

                if (this.type == AnimationType.TRANSLATE) {
                    let v = new Vector3()
                    v.from(k0.data)
                    v.lerp(k1.data, lerpVal)
                    this.sceneObject3D.setPositionV(v);
                }
                if (this.type == AnimationType.SCALE) {
                    let v = new Vector3()
                    v.from(k0.data)
                    v.lerp(k1.data, lerpVal)
                    this.sceneObject3D.model?.setScaleV(v);
                }
                if (this.type == AnimationType.ROTATE) {
                    let q = new Quaternion()
                    q.from(k0.data)
                    q.slerp(k1.data, lerpVal)
                    this.sceneObject3D.setRotationQ(q);
                }
                return;
            }
        }

    }

    setCurrentData(data: any) {

        if (this.type == AnimationType.TRANSLATE) {
            this.sceneObject3D.setPositionV(data);
        } else if (this.type == AnimationType.ROTATE) {
            this.sceneObject3D.setRotationQ(data);
        } else if (this.type == AnimationType.SCALE) {
            this.sceneObject3D.model?.setScaleV(data);
        }
    }

    moveFrame(startFrame: number, targetFrame: number) {
        ///remove targetframe if it exist
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].frame == targetFrame) {
                this.keys.splice(i, 1);
                break
            }
        }
        //change frame number
        for (let i = 0; i < this.keys.length; i++) {

            if (this.keys[i].frame == startFrame) {
                this.keys[i].frame = targetFrame;
                break
            }

        }
        //resort
        this.sortKeys()
    }

    removeFrame(selectedFrame: number) {
        for (let i = 0; i < this.keys.length; i++) {
            if (this.keys[i].frame == selectedFrame) {
                this.keys.splice(i, 1);
                break
            }
        }
        this.sortKeys()
        this.lastKeyIndex = this.keys.length - 1;
    }
}
