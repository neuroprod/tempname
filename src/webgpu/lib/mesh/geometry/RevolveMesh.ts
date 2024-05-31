import Mesh from "../Mesh.ts";
import Renderer from "../../Renderer.ts";

export default class RevolveMesh extends Mesh
{

    constructor(renderer: Renderer,label:string,steps:number, radii:Array<number>, positionsY:Array<number>)
    {
        super(renderer,label);
        const numCircleSegments = steps;
        const numSegments = radii.length;

        const positions: Array<number> =[]
        const indices: Array<number> = [];

        let index =0;
        const indexArray: Array<Array<number>> = [];
        for (let y=0;y<numSegments;y++){
            const indexRow: Array<number> = [];
            let r = radii[y];
            let posY = positionsY[y];

            for (let x=0;x<=numCircleSegments;x++){

                let angle = x* Math.PI*2/numCircleSegments
                let posX = Math.sin(angle)*r;
                let posZ = Math.cos(angle)*r;
                positions.push(posX,posY,posZ)
                indexRow.push(index++);
            }
            indexArray.push(indexRow);

        }

        for (let x = 0; x < numCircleSegments; x++) {
            for (let y = 0; y < numSegments-1; y++) {
                const a = indexArray[y][x];
                const b = indexArray[y + 1][x];
                const c = indexArray[y + 1][x + 1];
                const d = indexArray[y][x + 1];

                indices.push(a, b, d);
                indices.push(b, c, d);
            }
        }
        this.setPositions(new Float32Array(positions))
        this.setIndices(new Uint16Array(indices))
    }


}
