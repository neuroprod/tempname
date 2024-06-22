import Mesh from "../Mesh.ts";
import Renderer from "../../Renderer.ts";


export default class FatLineMesh extends Mesh {
    constructor(renderer: Renderer) {
        super(renderer, "FatLineMesh");

        const positionData: Float32Array = new Float32Array([
            -1,
            0,
            0, //0
            -1,
            1,
            0, //1
            1,
            1,
            0, //2
            1,
            0,
            0, //3
        ]);
        this.setPositions(positionData);


        const indices: Uint16Array = new Uint16Array([0, 2, 1, 2, 0, 3]);
        this.setIndices(indices);
    }
}
