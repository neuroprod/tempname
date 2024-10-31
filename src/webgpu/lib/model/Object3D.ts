import Renderer from "../Renderer";

import ObjectGPU from "../ObjectGPU.ts";
import {Matrix4, Quaternion, Vector3, Vector4} from "@math.gl/core";
import {NumericArray} from "@math.gl/types";


export default class Object3D extends ObjectGPU {
    public parent: Object3D | null = null
    public children: Array<Object3D> = []
    protected _dirty: boolean = true;
    protected _drawDirty: boolean = true;
    protected _position = new Vector3(0, 0, 0);
    private tempMatrix = new Matrix4()
    private _scale = new Vector3(1, 1, 1);
    private _rotation = new Quaternion(0, 0, 0, 1);

    private eulerDirty: boolean = false;

    constructor(renderer: Renderer, label: string = "") {
        super(renderer, label);

    }

    private _euler = new Vector3(0, 0, 0);

    public get euler() {
        if (this.eulerDirty) {
            const w = this._rotation[3];
            const x = this._rotation[0];
            const y = this._rotation[1];
            const z = this._rotation[2];

            const wx = w * x,
                wy = w * y,
                wz = w * z;
            const xx = x * x,
                xy = x * y,
                xz = x * z;
            const yy = y * y,
                yz = y * z,
                zz = z * z;

            this._euler.set(
                -Math.atan2(2 * (yz - wx), 1 - 2 * (xx + yy)),
                Math.asin(2 * (xz + wy)),
                -Math.atan2(2 * (xy - wz), 1 - 2 * (yy + zz)));
            this.eulerDirty = false
        }
        return this._euler as Vector3
    }

    public set euler(target: Vector3 | Array<number>) {
        this._rotation.identity()
        this._rotation.rotateZ(target[2]).rotateY(target[1]).rotateX(target[0]);
        this.setDirty();
    }

    private _worldMatrix: Matrix4 = new Matrix4()

    public get worldMatrix() {
        if (!this._dirty) return this._worldMatrix;
        this.updateMatrices();
        return this._worldMatrix;

    }

    public get x() {
        return this._position.x
    }

    public set x(value: number) {
        if (this._position.x !== value) {
            this._position.x = value;
            this.setDirty();
        }
    }

    public get y() {
        return this._position.y
    }

    public set y(value: number) {
        if (this._position.y != value) {

            this._position.y = value;
            this.setDirty();
        }
    }

    public get z() {
        return this._position.z
    }

    public set z(value: number) {
        if (this._position.z != value) {

            this._position.z = value;
            this.setDirty();
        }
    }

    public get rx() {
        // @ts-ignore
        return this.euler.x;
    }

    ////rotation
    public set rx(value: number) {
        // @ts-ignore
        if (this.euler.x != value) {

            this.setEuler(value, this._euler.y, this._euler.z)
            this.setDirty();
        }
    }

    public get ry() {
        return this.euler[1]
    }

    public set ry(value: number) {
        if (this.euler[1] != value) {
            this.setEuler(this._euler.x, value, this._euler.z)
            this.setDirty();
        }
    }

    public get rz() {
        // @ts-ignore
        return this.euler.z
    }

    public set rz(value: number) {
        // @ts-ignore
        if (this.euler.z != value) {


            this.setEuler(this._euler.x, this._euler.y, value)
            this.setDirty();
        }
    }

    public get sx() {
        return this._scale.x
    }

    ////scale
    public set sx(value: number) {
        if (this._scale.x != value) {
            this._scale.x = value;
            this.setDirty();
        }
    }

    public get sy() {
        return this._scale.y
    }

    public set sy(value: number) {
        if (this._scale.y != value) {

            this._scale.y = value;
            this.setDirty();
        }
    }

    public get sz() {
        return this._scale.z
    }

    public set sz(value: number) {
        if (this._scale.z != value) {

            this._scale.z = value;
            this.setDirty();
        }
    }

    public _worldMatrixInv: Matrix4 = new Matrix4();

    public get worldMatrixInv() {
        if (!this._dirty) return this._worldMatrixInv;
        this.updateMatrices();
        return this._worldMatrixInv;

    }

    private _localMatrix: Matrix4 = new Matrix4()

    public get localMatrix() {
        if (!this._dirty) return this._localMatrix;
        this.updateMatrices();
        return this._localMatrix;

    }

    setRY(value: number) {
        this.ry = value;
    }

    getRY() {
        return this.ry;
    }

    public getWorldPos(localPos = new Vector3(0, 0, 0)) {

        let temp = new Vector4(localPos.x, localPos.y, localPos.z, 1)
        temp.applyMatrix4(this.worldMatrix);
        return new Vector3(temp.x, temp.y, temp.z);
    }

    getLocalPos(worldPos: Vector3) {
        let temp = new Vector4(worldPos.x, worldPos.y, worldPos.z, 1)
        temp.applyMatrix4(this.worldMatrixInv);
        return new Vector3(temp.x, temp.y, temp.z);
    }

    //d
    setPositionV(target: Vector3 | Array<number>) {
        if (this._position.equals(target as NumericArray)) return
        this._position.from(target);
        this.setDirty();
    }

    public setPosition(x: number, y: number, z: number) {
        if (this._position.equals([x, y, z])) return
        this._position.set(x, y, z)
        this.setDirty();
    }

    public setScaler(val: number) {
        this.setScale(val, val, val);
    }

    public setScale(x: number, y: number, z: number) {
        if (this._scale.equals([x, y, z])) return
        this._scale.set(x, y, z)
        this.setDirty();
    }

    setScaleV(val: Vector3 | Array<number>) {
        if (this._scale.equals(val as NumericArray)) return
        this._scale.from(val)
        this.setDirty();
    }

    setRotationQ(newRot: Quaternion | Array<number>) {
        if (this._rotation.equals(newRot as Array<number>)) return
        this._rotation.from(newRot)
        this.eulerDirty = true;
        this.setDirty();
    }

    public setRotation(x: number, y: number, z: number, w: number) {

        if (this._rotation.equals([x, y, z, w])) return
        this._rotation.set(x, y, z, w)
        this.eulerDirty = true;
        this.setDirty();
    }

    public setEuler(x: number, y: number, z: number) {
        // @ts-ignore
        if (this.euler.equals([x, y, z])) {
            return;
        }

        this._rotation.identity()
        this._rotation.rotateZ(z).rotateY(y).rotateX(x);

        this._euler.set(x, y, z)
        this.setDirty();
    }

    public addChild(child: Object3D) {

        if (child.parent) child.parent.removeChild(child);
        this.children.push(child);
        child.parent = this;
        child.setDirty();
        // this._rotation.fromAxisRotation()
    }

    public removeChild(child: Object3D) {
        let index = this.children.indexOf(child);

        if (index < 0) return;
        child.parent = null;

        this.children.splice(index, 1);
    }

    public removeAllChildren() {

        while (this.children.length > 0) {
            //
            let c = this.children[this.children.length - 1]
            c.removeAllChildren()
            this.removeChild(c)
            c.destroy()

        }


    }

    getScale() {
        return this._scale;
    }

    getRotation() {
        return this._rotation;
    }

    getPosition() {
        return this._position;
    }

    copyProperties(obj: Object3D) {
        obj.setPositionV(this._position.clone())
        obj.setScaleV(this._scale.clone())
        obj.setRotationQ(this._rotation.clone())
    }

    public destroy() {

    }

    protected updateMatrices() {
        if (!this._dirty) return

        this._localMatrix.identity();
        this._localMatrix.translate(this._position);

        this.tempMatrix.fromQuaternion(this._rotation);
        this._localMatrix.multiplyRight(this.tempMatrix);
        this._localMatrix.scale(this._scale);
        //update local matrix
        if (this.parent) {
            this._worldMatrix.from(this.parent.worldMatrix)
            this._worldMatrix.multiplyRight(this._localMatrix);
        } else {
            this._worldMatrix.from(this._localMatrix)
        }
        this._worldMatrixInv.from(this._worldMatrix);
        this._worldMatrixInv.invert();
        // this._rotation.
        //this._euler

        this._dirty = false;

    }

    private setDirty() {
        if (this._dirty) return;
        this._dirty = true;
        this._drawDirty = true;
        for (let c of this.children) {
            c.setDirty();
        }
    }
}
