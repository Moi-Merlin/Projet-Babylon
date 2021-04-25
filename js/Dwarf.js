export default class Dwarf {
  constructor(dwarfMesh, id, speed, scaling, scene,bounder) {
    this.dwarfMesh = dwarfMesh;
    this.id = id;
    this.scene = scene;
    this.scaling = scaling;

    if (speed) this.speed = speed;
    else this.speed = 1;

    dwarfMesh.Dwarf = this;

    this.bounder = bounder;

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

    if(distance<3000 && distance > 60) {
      this.bounder.moveWithCollisions(dir.multiplyByFloats(this.speed, this.speed, this.speed));
    }
  }
}
  