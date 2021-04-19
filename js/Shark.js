export default class Shark {
    constructor(sharkMesh, id, speed, scaling, scene) {
        this.sharkMesh = sharkMesh;
        this.id = id;
        this.scene = scene;
        this.scaling = scaling;

        if (speed) this.speed = speed;
        else this.speed = 1;

        sharkMesh.Shark = this;

        this.sharkMesh.scaling = new BABYLON.Vector3(10, 10, 10);

        if (Shark.boundingBoxParameters == undefined) {
        Shark.boundingBoxParameters = this.calculateBoundingBoxParameters();
        }

        this.bounder = this.createBoundingBox();
        this.bounder.sharkMesh = this.sharkMesh;
    }

    move(scene) {
        if (!this.bounder) return;

        this.sharkMesh.position = new BABYLON.Vector3(
            this.bounder.position.x,
            this.bounder.position.y, 
            this.bounder.position.z
        );

        let target = new BABYLON.Vector3(0,0,0)
        let direction = target.subtract(this.sharkMesh.position);
        let distance = direction.length(); 
        let dir = direction.normalize();

        let alpha = Math.atan2(-dir.x, -dir.z);

        this.sharkMesh.rotation.y = alpha;

        if(distance<200 && distance > 30) {
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
        else {
        }   
    }

    calculateBoundingBoxParameters() {
        let childrenMeshes = this.sharkMesh.getChildren();
        let bbInfo = this.totalBoundingInfo(childrenMeshes);

        return bbInfo;
    }

    totalBoundingInfo(meshes){
        var boundingInfo = meshes[0].getBoundingInfo();
        var min = boundingInfo.minimum.add(meshes[0].position);
        var max = boundingInfo.maximum.add(meshes[0].position);
        for(var i=1; i<meshes.length; i++){
            boundingInfo = meshes[i].getBoundingInfo();
            min = BABYLON.Vector3.Minimize(min, boundingInfo.minimum.add(meshes[i].position));
            max = BABYLON.Vector3.Maximize(max, boundingInfo.maximum.add(meshes[i].position));
        }
        return new BABYLON.BoundingInfo(min, max);
    }

    createBoundingBox() {
        // Create a box as BoundingBox of the Shark
        let bounder = new BABYLON.Mesh.CreateBox(
        "bounder" + this.id.toString(),
        1,
        this.scene
        );
        let bounderMaterial = new BABYLON.StandardMaterial(
        "bounderMaterial",
        this.scene
        );
        bounderMaterial.alpha = 0.4;
        bounder.material = bounderMaterial;
        bounder.checkCollisions = true;

        bounder.position = this.sharkMesh.position.clone();

        let bbInfo = Shark.boundingBoxParameters;

        let max = bbInfo.boundingBox.maximum;
        let min = bbInfo.boundingBox.minimum;

        // Not perfect, but kinda of works...
        // Looks like collisions are computed on a box that has half the size... ?
        bounder.scaling.x = (max._x - min._x) * this.scaling;
        bounder.scaling.y = (max._y - min._y) * this.scaling;
        bounder.scaling.z = (max._z - min._z) * this.scaling * 3;
        bounder.isVisible = true;

        bounder.position.y += (max._y - min._y) * this.scaling/2;

        return bounder;
    }
}