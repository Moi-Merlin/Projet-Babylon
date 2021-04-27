export default class Shark {
    constructor(sharkMesh, id, speed, scaling, scene,bounder) {
        this.sharkMesh = sharkMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = scaling;

        if (speed) this.speed = speed;
        else this.speed = 1;

        sharkMesh.Shark = this;

        this.sharkMesh.scaling = new BABYLON.Vector3(10, 10, 10);

        this.bounder = bounder;
    }

    move(){
        if (!this.bounder) {
            console.log("no bonder");
            return;
        }

        let target = new BABYLON.Vector3(0,0,0)
        let direction = target.subtract(this.sharkMesh.position);
        let distance = direction.length();
        //console.log(distance);
        let dir = direction.normalize();

        let alpha = Math.atan2(-dir.x, -dir.z);

        this.sharkMesh.rotation.y = alpha;

        if(distance<1000 && distance > 153) {
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
            this.sharkMesh.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }
}