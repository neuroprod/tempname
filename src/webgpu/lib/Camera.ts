import Renderer from "./Renderer";
import {lerp, Matrix3, Matrix4, Vector2, Vector3, Vector4} from "@math.gl/core";
import UniformGroup from "./material/UniformGroup.ts";
import Model from "./model/Model.ts";


export default class Camera extends UniformGroup {
    public static instance: Camera;
    public cameraWorld: Vector3 = new Vector3(0, 0, 2);
    public cameraLookAt: Vector3 = new Vector3(0, 0, 0);
    public cameraUp: Vector3 = new Vector3(0, 1, 0);
    public fovy = 0.7
    public near = 2;
    public far = 100;
    public ratio = 1;
    public lensShift = new Vector2(0, 0)
    public viewProjectionInv = new Matrix4();
    public viewInv: Matrix4 = new Matrix4();
    public projectionInv: Matrix4 = new Matrix4();
    public perspective: boolean = true;
    public orthoLeft: number = -10;
    public orthoRight: number = 10;
    public orthoTop: number = 10;
    public orthoBottom: number = -10;
    viewProjection: Matrix4 = new Matrix4();
    private cameraWorldU: Vector4 = new Vector4(0, 0, 10, 1.0);
    view: Matrix4 = new Matrix4();
    private projection: Matrix4 = new Matrix4();
    private fplanes: Array<Vector4> = []


    constructor(renderer: Renderer) {
        super(renderer, "camera");

        this.addUniform("viewProjectionMatrix", this.viewProjection)
        this.addUniform("inverseViewProjectionMatrix", this.viewProjection)
        this.addUniform("viewMatrix", this.view)
        this.addUniform("inverseViewMatrix", this.viewInv)
        this.addUniform("inverseProjectionMatrix", this.projectionInv)
        this.addUniform("projectionMatrix", this.projection)
        this.addUniform("worldPosition", this.cameraWorldU)


        for (let i = 0; i < 6; i++) {
            this.fplanes.push(new Vector4())
        }

        if (!Camera.instance) Camera.instance = this;
    }

    static getShaderText(id: number): string {
        return Camera.instance.getShaderText(id);
    }

    static getBindGroupLayout() {
        return Camera.instance.bindGroupLayout
    }

    static getUniform(id: number): string {
        return Camera.instance.getShaderText(id);
    }

    setOrtho(right = 1,left = -1, top = 1, bottom = 1) {
        this.orthoRight =right;
        this.orthoLeft =left;
        this.orthoTop =top;
        this.orthoBottom =bottom;
       // this.near = near;
       // this.far =far;
        this.perspective = false
    }

    public modelInFrustum(model: Model): boolean {
console.log("fix culling")
       /* for (let i: number = 0; i < 6; i++) {
            if (this.dot(this.fplanes[i], model.center.x, model.center.y, model.center.z) < -model.radius) {

                return false;
            }
        }*/
        return true;
    }

    protected updateData() {

        if (this.perspective) {
            this.setProjection();
        } else {

            this.projection.ortho({
                left: this.orthoLeft,
                right: this.orthoRight,
                bottom: this.orthoBottom,
                top: this.orthoTop,
                near: this.near,
                far: this.far,
            })
        }

        this.view.lookAt({
            eye: this.cameraWorld,
            center: this.cameraLookAt,
            up: this.cameraUp,
        });



        this.viewInv.from(this.view);
        this.viewInv.invert();

        this.projectionInv.from(this.projection);
        this.projectionInv.invert();


        this.viewProjection.identity();
        this.viewProjection.multiplyRight(this.projection);
        this.viewProjection.multiplyRight(this.view);

        this.makeFrustum();

        this.viewProjectionInv.from(this.viewProjection);
        this.viewProjectionInv.invert();

        this.setUniform("inverseViewProjectionMatrix", this.viewProjectionInv)
        this.setUniform("viewProjectionMatrix", this.viewProjection)
        this.cameraWorldU.set(this.cameraWorld.x, this.cameraWorld.y, this.cameraWorld.z, 1)
        this.setUniform("worldPosition", this.cameraWorldU)
        this.setUniform("inverseViewMatrix", this.viewInv)
        this.setUniform("viewMatrix", this.view)
        this.setUniform("inverseProjectionMatrix", this.projectionInv)
        this.setUniform("projectionMatrix", this.projection)

    }

    private setProjection() {

        let sin_fov=Math.sin(0.5 * this.fovy);
        let cos_fov=Math.cos(0.5 * this.fovy);

        let h = cos_fov / sin_fov;
        let w = h / this.ratio;
        let r =this.far / (this.near - this.far);

        this.projection[0] = w;
        this.projection[1] = 0.0;
        this.projection[2] = 0.0;
        this.projection[3] = 0.0;

        this.projection[4] = 0.0;
        this.projection[5] = h;
        this.projection[6] = 0.0;
        this.projection[7] = 0.0;

        this.projection[8] = 0;
        this.projection[9] = 0;
        this.projection[10] =r;
        this.projection[11] = -1.0;

        this.projection[12] = 0.0;
        this.projection[13] = 0.0;
        this.projection[14] = r*this.near ;
        this.projection[15] = 0.0;



        /*let frustumTop = this.near * Math.tan(this.fovy / 2);
        let frustumBottom = -frustumTop;

        let frustumRight = frustumTop * this.ratio;
        let frustumLeft = -frustumRight;


        if (this.lensShift.y != 0.0) {
            frustumTop = lerp(0.0, 2.0 * frustumTop, 0.5 + 0.5 * this.lensShift.y);
            frustumBottom = lerp(2.0 * frustumBottom, 0.0, 0.5 + 0.5 * this.lensShift.y);
        }

        if (this.lensShift.x != 0.0) {
            frustumRight = lerp(2.0 * frustumRight, 0.0, 0.5 - 0.5 * this.lensShift.x);
            frustumLeft = lerp(0.0, 2.0 * frustumLeft, 0.5 - 0.5 * this.lensShift.x);
        }


        const dx = (frustumRight - frustumLeft);
        const dy = (frustumTop - frustumBottom);
        const dz = (this.near - this.far);

        this.projection[0] = 2.0 * this.near / dx;
        this.projection[1] = 0.0;
        this.projection[2] = 0.0;
        this.projection[3] = 0.0;

        this.projection[4] = 0.0;
        this.projection[5] = 2.0 * this.near / dy;
        this.projection[6] = 0.0;
        this.projection[7] = 0.0;

        this.projection[8] = (frustumRight + frustumLeft) / dx;
        this.projection[9] = (frustumTop + frustumBottom) / dy;
        this.projection[10] = this.far / dz;
        this.projection[11] = -1.0;

        this.projection[12] = 0.0;
        this.projection[13] = 0.0;
        this.projection[14] = this.far * this.near / dz;
        this.projection[15] = 0.0;*/


    }

    private dot(plane: Vector4, x: number, y: number, z: number) {
        return plane.x * x + plane.y * y + plane.z * z + plane.w;
    }

    private makeFrustum() {

        this.fplanes[0].set(this.viewProjection[3] - this.viewProjection[0], this.viewProjection[7] - this.viewProjection[4], this.viewProjection[11] - this.viewProjection[8], this.viewProjection[15] - this.viewProjection[12]);
        this.fplanes[1].set(this.viewProjection[3] + this.viewProjection[0], this.viewProjection[7] + this.viewProjection[4], this.viewProjection[11] + this.viewProjection[8], this.viewProjection[15] + this.viewProjection[12]);
        this.fplanes[2].set(this.viewProjection[3] + this.viewProjection[1], this.viewProjection[7] + this.viewProjection[5], this.viewProjection[11] + this.viewProjection[9], this.viewProjection[15] + this.viewProjection[13]);
        this.fplanes[3].set(this.viewProjection[3] - this.viewProjection[1], this.viewProjection[7] - this.viewProjection[5], this.viewProjection[11] - this.viewProjection[9], this.viewProjection[15] - this.viewProjection[13]);
        this.fplanes[4].set(this.viewProjection[3] - this.viewProjection[2], this.viewProjection[7] - this.viewProjection[6], this.viewProjection[11] - this.viewProjection[10], this.viewProjection[15] - this.viewProjection[14]);
        this.fplanes[5].set(this.viewProjection[3] + this.viewProjection[2], this.viewProjection[7] + this.viewProjection[6], this.viewProjection[11] + this.viewProjection[10], this.viewProjection[15] + this.viewProjection[14]);

        for (let p of this.fplanes) {
            p.scale(1 / Math.sqrt(p.x ** 2 + p.y ** 2 + p.z ** 2));
        }
    }
}
