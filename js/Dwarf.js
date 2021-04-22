export default class Dwarf {
    constructor(dwarfMesh, id, speed, scaling, scene) {
      this.dwarfMesh = dwarfMesh;
      this.id = id;
      this.scene = scene;
      this.scaling = scaling;
  
      if (speed) this.speed = speed;
      else this.speed = 1;
  
      dwarfMesh.Dwarf = this;
    
      if (Dwarf.boundingBoxParameters == undefined) {
        Dwarf.boundingBoxParameters = this.calculateBoundingBoxParameters();
      }
  
      this.bounder = this.createBoundingBox();
      this.bounder.dwarfMesh = this.dwarfMesh;
  
    }
  
    calculateBoundingBoxParameters() {
      // Compute BoundingBoxInfo for the dwarf, like for the shark and the player 
      // this meshes has been build as a unique meshes so we don't have to go over
      //every of it children
      //let childrenMeshes = this.dwarfMesh.getChildren();
      //let bbInfo = this.totalBoundingInfo(childrenMeshes);
      let bbInfo = this.totalBoundingInfo(this.dwarfMesh);
      return bbInfo;
    }
  
    move(){
        if (!this.bounder) {
            console.log("no bonder");
            return;
        }

        this.dwarfMesh.position = new BABYLON.Vector3(
            this.bounder.position.x,
            this.bounder.position.y, 
            this.bounder.position.z
        );

        let target = new BABYLON.Vector3(0,0,0)
        let direction = target.subtract(this.dwarfMesh.position);
        let distance = direction.length();
        //console.log(distance);
        let dir = direction.normalize();

        let alpha = Math.atan2(-dir.x, -dir.z);

        this.dwarfMesh.rotation.y = alpha;

        if(distance<2000 && distance > 60) {
            this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
        }
    }

    totalBoundingInfo(meshes) {
      //Once again because this meshes aven't children we need to modify a few the fonction
      // used in the class Dude.js
      var boundingInfo = meshes.getBoundingInfo();
      var min = boundingInfo.minimum.add(meshes.position);
      var max = boundingInfo.maximum.add(meshes.position);
      /*for (var i = 1; i < meshes.length; i++) {
        boundingInfo = meshes[i].getBoundingInfo();
        min = BABYLON.Vector3.Minimize(
          min,
          boundingInfo.minimum.add(meshes[i].position)
        );
        max = BABYLON.Vector3.Maximize(
          max,
          boundingInfo.maximum.add(meshes[i].position)
        );
      }*/
      return new BABYLON.BoundingInfo(min, max);
    }
  
    createBoundingBox() {
      // Create a box as BoundingBox of the dwarf
      let bounder = new BABYLON.Mesh.CreateBox("bounder" + this.id.toString(),1,this.scene);
      let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",this.scene);
      bounderMaterial.alpha = 0.4;
      bounder.material = bounderMaterial;
      bounder.checkCollisions = true;
  
      bounder.position = this.dwarfMesh.position.clone();
  
      let bbInfo = Dwarf.boundingBoxParameters;
  
      let max = bbInfo.boundingBox.maximum;
      let min = bbInfo.boundingBox.minimum;
  
      bounder.scaling.x = (max._x - min._x) * this.scaling;
      bounder.scaling.y = (max._y - min._y) * this.scaling;
      bounder.scaling.z = (max._z - min._z) * this.scaling * 3;
      //bounder.isVisible = false;
  
      bounder.position.y += (max._y - min._y) * this.scaling/2;
  
      return bounder;
    }
}
  