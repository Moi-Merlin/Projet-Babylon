export default class Player {
    constructor(playerMesh, id, speed, scaling, scene) {
      this.playerMesh = playerMesh;
      this.id = id;
      this.scene = scene;
      this.scaling = scaling;
      
  
      if (speed) this.speed = speed;
      else this.speed = 1;
  
      playerMesh.Player = this;
  
      // scaling
      //this.playerMesh.scaling = new BABYLON.Vector3(0.2, 0.2, 0.2);
  
      //Like for the Shark let's construct the bounding box here too

      if (Player.boundingBoxParameters == undefined) {
        Player.boundingBoxParameters = this.calculateBoundingBoxParameters();
      }
  
      this.bounder = this.createBoundingBox();
      this.bounder.playerMesh = this.playerMesh;
      console.log("bounder = ",this.bounder.playerMesh);
      this.showBoundingBox = true;
      
    }
  
    //a modifier !!
    move(scene) {
      if (!this.bounder) return;
  
      this.playerMesh.position.x = this.bounder.position.x;
      this.playerMesh.position.z = this.bounder.position.z;
      this.playerMesh.position.y = this.bounder.position.y;
    
      if (scene.inputStates.up) {
        this.bounder.moveWithCollisions(
          this.frontVector.multiplyByFloats(this.speed, this.speed, this.speed)
        );
      }
  
      if (scene.inputStates.down) {
        this.bounder.moveWithCollisions(
          this.frontVector.multiplyByFloats(-this.speed, -this.speed, -this.speed)
        );
      }
  
      if (scene.inputStates.left) {
        var alpha = this.playerMesh.rotation.y;
        alpha -= 0.02;
        this.frontVector = new BABYLON.Vector3(-Math.sin(alpha), 0, -Math.cos(alpha));
      }
      if (scene.inputStates.right) {
        var alpha = this.playerMesh.rotation.y;
        alpha += 0.02;
        this.frontVector = new BABYLON.Vector3(-Math.sin(alpha), 0,-Math.cos(alpha));
      }
    }
  
    calculateBoundingBoxParameters() {
      // Compute BoundingBoxInfo for the player, for this we visit all children meshes
      //let childrenMeshes = this.playerMesh.getChildren();
      let bbInfo = this.totalBoundingInfo(this.playerMesh);
  
      return bbInfo;
    }
  
    totalBoundingInfo(meshes) {
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
      // Create a box as BoundingBox of the player
      let bounder = new BABYLON.Mesh.CreateBox("bounder" + this.id.toString(),1,this.scene);
      let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",this.scene);
      bounderMaterial.alpha = 0.4;
      bounder.material = bounderMaterial;
      bounder.checkCollisions = true;
  
      bounder.position = this.playerMesh.position.clone();
  
      let bbInfo = player.boundingBoxParameters;
  
      let max = bbInfo.boundingBox.maximum;
      let min = bbInfo.boundingBox.minimum;
  
      bounder.scaling.x = (max._x - min._x) * this.scaling.x;
      bounder.scaling.y = (max._y - min._y) * this.scaling.y;
      bounder.scaling.z = (max._z - min._z) * this.scaling.z * 3;
      console.log("bbox taille ",bounder.scaling);
      bounder.isVisible = true;
  
      bounder.position.y += (max._y - min._y) * this.scaling.y/2;
  
      return bounder;
    }
  
}
  