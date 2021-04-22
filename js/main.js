import Shark from "./Shark.js";
import Dwarf from "./Dwarf.js";
import Player from "./Player.js"
let scene;
let canvas;
let engine;

window.onload = startGame;

function startGame() {
	canvas = document.querySelector("#myCanvas");
	engine = new BABYLON.Engine(canvas, true);
	scene = createScene();

	scene.enablePhysics();
  
	modifySettings();
    
	scene.toRender = () => {
		let deltaTime = engine.getDeltaTime();

		//all action for our player
		movePlayer(scene);


		//all action for mobs
		moveShark();
		moveDwarf();
    
		scene.render();
	};
  
	scene.assetsManager.load();
}

function createScene() {
	let scene = new BABYLON.Scene(engine);
  
	scene.assetsManager = configureAssetManager(scene);

	let camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, new BABYLON.Vector3(10,100,10), scene);
	camera.attachControl(canvas, true);
	
	let ground = createGround(scene);
	let lights = createLights(scene);
	//let freeCamera = createFreeCamera(scene);
  
	createIslands(scene);
	createFort(scene);
	createBoat(scene);
	createPlayer(scene);
	createFishes(scene);
	createDwarf(scene);
	createSkybox(scene);
	loadSounds(scene);

	createButtons();
  
	return scene;
}
  
function configureAssetManager(scene) {
	// useful for storing references to assets as properties. i.e scene.assets.cannonsound, etc.
	scene.assets = {};
  
	let assetsManager = new BABYLON.AssetsManager(scene);
  
	assetsManager.onProgress = function (
	  remainingCount,
	  totalCount,
	  lastFinishedTask
	) {
	  engine.loadingUIText = "\n" +
		"We are loading the scene. " +
		remainingCount +
		" out of " +
		totalCount +
		" items still need to be loaded.";
	  console.log(
		"We are loading the scene. " +
		  remainingCount +
		  " out of " +
		  totalCount +
		  " items still need to be loaded."
	  );
	};
  
	assetsManager.onFinish = function (tasks) {
	  engine.runRenderLoop(function () {
		scene.toRender();
	  });
	};
  
	return assetsManager;
}

function createButtons(){
	var button = document.createElement("button");
    button.style.top = "30px";
    button.style.right = "30px";
    button.textContent = "Pause Music";
    button.style.width = "50px"
    button.style.height = "50px"

    button.setAttribute = ("id", "soundButton");
    button.style.position = "absolute";
	button.style.color = "whitesmoke";
	button.style.borderColor = "transparent"
	button.style.borderRadius = "2em";
	button.style.outline = "none";
	button.style.backgroundColor = "rgba(166, 204, 210,0.5)";

    document.body.appendChild(button);

	button.addEventListener("click", () => {
        if (scene.assets.pirateMusic) {
			if (button.textContent == "Pause Music"){
				scene.assets.pirateMusic.pause()
				button.textContent = "Play Music";
			}
			else if (button.textContent == "Play Music"){
				scene.assets.pirateMusic.play()
				button.textContent = "Pause Music";
			}
        }
    })
}

function createSkybox(scene){
    var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:3300.0}, scene);
    var skyboxMaterial = new BABYLON.StandardMaterial("skyBox", scene);
    skyboxMaterial.backFaceCulling = false;
    skyboxMaterial.reflectionTexture = new BABYLON.CubeTexture("assets/Skybox/TropicalSunnyDay", scene);
    skyboxMaterial.reflectionTexture.coordinatesMode = BABYLON.Texture.SKYBOX_MODE;
    skyboxMaterial.diffuseColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.specularColor = new BABYLON.Color3(0, 0, 0);
    skyboxMaterial.disableLighting = true;
    skybox.material = skyboxMaterial;
    return skybox;
}

function createGround(scene){
	//On crée d'abord un sol "sabloneux" grâce à une texture et un bumb qui lui sont propres
	var groundTexture = new BABYLON.Texture("assets/textures/fond.jpg", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	var ground = BABYLON.Mesh.CreateGround("ground", 3000, 3000, 32, scene, false);
	ground.position.y = -20;
	ground.material = groundMaterial;

	//On crée ensuite un second sol qui est un Water Material, il représente la mer
	//On lui donne des attributs qui nous permettent de créer des vagues avec un effet de vent
	var waterMesh = BABYLON.Mesh.CreateGround("sea", 3000, 3000, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
	water.bumpTexture = new BABYLON.Texture("assets/textures/waterbump.png", scene);
	water.windForce = -6;
	water.windDirection = new BABYLON.Vector2(1, 1);
	water.waveHeight = 1.7;
	water.bumpHeight = 0.8;
	water.waveLength = 1;
	water.colorBlendFactor = 0;
	//water.alphaMode =  BABYLON.Engine.ALPHA_SUBTRACT;
    water.alpha = 0.9;
	// On fait en sorte que nos vagues reflètent la skybox et le sol
	let skybox = scene.getMeshByName("skyBox");
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
	waterMesh.material = water;
	waterMesh.position.y = 3;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
    light0.intensity = 1;
	var light = new BABYLON.HemisphericLight("HemiLight", new BABYLON.Vector3(0, 1, 0), scene);
	light.intensity = 0.7;
}

function loadSounds(scene) {
	var assetsManager = scene.assetsManager;
  
	var binaryTask = assetsManager.addBinaryFileTask(
	  "cannonSound",
	  "assets/sounds/cannonBlast.mp3"
	);
	binaryTask.onSuccess = function (task) {
	  scene.assets.cannonSound = new BABYLON.Sound(
		"cannon",
		task.data,
		scene,
		null,
		{ loop: false, spatialSound: true }
	  );
	};

	binaryTask = assetsManager.addBinaryFileTask(
	  "explosion",
	  "assets/sounds/explosion.mp3"
	);

	binaryTask.onSuccess = function (task) {
	  scene.assets.explosion = new BABYLON.Sound(
		"explosion",
		task.data,
		scene,
		null,
		{ loop: false, spatialSound: true }
	  );
	};
  
	binaryTask = assetsManager.addBinaryFileTask(
	  "pirates",
	  "assets/sounds/PiratesCaraiben.mp3"
	);
	binaryTask.onSuccess = function (task) {
	  scene.assets.pirateMusic = new BABYLON.Sound(
		"piratesCaraiben",
		task.data,
		scene,
		null,
		{
		  loop: true,
		  autoplay: true,
		}
	  );
	};
}

function getRandomInt(max) {
    return Math.floor(Math.random() * max);
}

function createIslands(scene) {

	let meshTask = scene.assetsManager.addMeshTask("islands task","","assets/meshes/scene/","îles.glb");
  
	meshTask.onSuccess = function (task) {
	  onIslandImported(
		task.loadedMeshes
	  );
	};
  
	function onIslandImported(newMeshes) {
		//On crée notre première île, avec la position, la taille et l'orientation souhaitée
		const island0 = newMeshes[0];
		island0.position = new BABYLON.Vector3(780, 0, -800);
		island0.scaling = new BABYLON.Vector3(1.5,1.5,1.5);
		island0.rotation = new BABYLON.Vector3(0,180,0);
		island0.name = "island";

		//On crée ensuite un tableau qui va contenir les position et orientations souhaitées pour chaque autre îles
		// Puisqu'on les veut toutes de la même taille, celle prise au clonage n'a pas besoin d'être modifiée
		var IslandsPositionsArray = [
			[new BABYLON.Vector3(-800, 0, -800), new BABYLON.Vector3(0,90,0)],
			[new BABYLON.Vector3(0, 1, -800), new BABYLON.Vector3(0,200,0)],
			[new BABYLON.Vector3(-790, 0, 30), new BABYLON.Vector3(0,150,0)],
			[new BABYLON.Vector3(-780, 0, 750),new BABYLON.Vector3(0,300,0)],
			[new BABYLON.Vector3(-450, -1, -320), new BABYLON.Vector3(0,320,0)]
		];
		
		// On clone donc ensuite l'île principale avec les caractéristiques définies précédemment pour chaque île
		for (let i=0; i<5; i++){
			var IslandClone = island0.clone("island"+i)
			IslandClone.position = IslandsPositionsArray[i][0]
			IslandClone.rotation = IslandsPositionsArray[i][1]
		}
	}
}

function createFort(scene){
	let fortTask = scene.assetsManager.addMeshTask("fort task","","assets/meshes/scene/","fort.glb");
	fortTask.onSuccess = function (task) {
	  onFortImported(
		task.loadedMeshes,
	  );
	};
  
	function onFortImported(newMeshes) {
		const fort = newMeshes[0];
		fort.position = new BABYLON.Vector3(0, 19, 0);
		fort.scaling = new BABYLON.Vector3(26,26,26);
	}
	
	let cannonTask = scene.assetsManager.addMeshTask("cannon task","","assets/meshes/canons/","cannon.glb");
  
	cannonTask.onSuccess = function (task) {
	  onCannonImported(
		task.loadedMeshes
	  );
	};
  
	function onCannonImported(newMeshes) {	
		// On procède ici exactement de la même façon que pour les îles créées précédemment
		var cannon = newMeshes[0]
		cannon.position = new BABYLON.Vector3(40, 244.4, 10);
		cannon.rotation = new BABYLON.Vector3(0,BABYLON.Tools.ToRadians(90),0);
		cannon.scaling = new BABYLON.Vector3(26,26,26);
		cannon.name = "cannon"

		scene.cannons = []
		
		var cannonPositionsArray = [
			[new BABYLON.Vector3(40, 162, 43),new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0)],
			[new BABYLON.Vector3(40, 79, 19),new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), 0)],
			[new BABYLON.Vector3(15, 124, 50),new BABYLON.Vector3(0, 0, 0)],
			[new BABYLON.Vector3(20, 244.4, 65),new BABYLON.Vector3(0, 0, 0)]
		]
		//scene.cannons[-1] = cannon0

		for(let i = 0 ; i<4; i++){
			const cannonClone = cannon.clone("cannon"+i);
			cannonClone.position = cannonPositionsArray[i][0];
			cannonClone.rotation = cannonPositionsArray[i][1];
		}
	}
	
}

function createBoat(scene){
	let boatTask = scene.assetsManager.addMeshTask("boat task","", "assets/meshes/Boat/", "Epave.glb");

	boatTask.onSuccess = function (task) {
		onBoatImport(
		  task.loadedMeshes
		);
	};

    function onBoatImport(newMeshes){
		let boat = newMeshes[0];
		//console.log (boat);
        boat.position = new BABYLON.Vector3(-440, 2, 240);
        boat.scaling = new BABYLON.Vector3(8  , 8 , 8);

        boat.name = "boat";
	}    
}


function createFishes(scene){
	let sharkTask = scene.assetsManager.addMeshTask("sharktask","","assets/meshes/mob/","shark.glb");

	sharkTask.onSuccess = function (task) {
		onSharkImported(
			task.loadedMeshes
		);
	};

	function onSharkImported(Meshes, skeletons){
		let shark = Meshes[0];
		shark.position = new BABYLON.Vector3(380,-22,160);
		shark.scaling = new BABYLON.Vector3(10,10,10);

		let target = new BABYLON.Vector3(0,0,0)
        let direction = target.subtract(shark.position);
		//console.log("shark direction ",direction);
		//console.log ("normalize shark direction ",direction.normalize())

		shark.rotationQuaternion.x = 0;
		shark.rotationQuaternion.y = 0.7071;
		shark.rotationQuaternion.z = 0;
		shark.rotationQuaternion.w = -0.7071;
		shark.name = "shark";
		shark.showBoundingBox = true;
		let _shark = new Shark(shark, 0, 1, 10, scene);
	}
}

function moveShark(){
	let sharky = scene.getMeshByName("shark");
	if (sharky){
		sharky.Shark.move();
		//console.log(sharky.position);
	} 
}

function createDwarf(scene){
	let dwarfTask = scene.assetsManager.addMeshTask("dwarf task","","assets/meshes/mob/","Dwarf.glb");

	dwarfTask.onSuccess = function (task) {
		onDwarfImported(
			task.loadedMeshes,
			task.loadSkeletons
		);
	};

	function onDwarfImported(Meshes, skeletons){
		let dwarf = Meshes[0];
		//pos
		dwarf.position = new BABYLON.Vector3(70, 8, -20);

		//console.log("initial dwarf scaling ",dwarf.scaling);
		dwarf.scaling = new BABYLON.Vector3(22,22,22);
		//console.log("update dwarf scaling ",dwarf.scaling);

		let target = new BABYLON.Vector3(0,0,0)
        let direction = target.subtract(dwarf.position);
		//console.log(direction);
		//console.log (direction.normalize())

		/*shark.rotationQuaternion.x = 0;
		shark.rotationQuaternion.y = 0.7071;
		shark.rotationQuaternion.z = 0;
		shark.rotationQuaternion.w = -0.7071;*/
		dwarf.name = "dwarf";
		dwarf.showBoundingBox = true;
		let _dwarf = new Dwarf(dwarf, 0, 1, 10, scene);
	}
}

function moveDwarf(){
	let dwarfy = scene.getMeshByName("dwarf");
	if (dwarfy){
		dwarfy.Dwarf.move();
		//console.log(dwarfy.position);
	} 
}

function createPlayer(scene){
	let playerTask = scene.assetsManager.addMeshTask("playertask","","assets/meshes/mob/","Player.glb");

	playerTask.onSuccess = function (task) {
		onPlayerImported(
			task.loadedMeshes,
			task.loadSkeletons
		);
	};

	function onPlayerImported(Meshes, skeletons){
		let player = Meshes[0];
		
		//pos
		player.position = new BABYLON.Vector3(25, 80, -15);

		//scaling
		//console.log("initial player scaling ",player.scaling);
		player.scaling = new BABYLON.Vector3(22,22,22);
		//console.log("update player scaling ",player.scaling);

		/*shark.rotationQuaternion.x = 0;
		shark.rotationQuaternion.y = 0.7071;
		shark.rotationQuaternion.z = 0;
		shark.rotationQuaternion.w = -0.7071;*/
		player.name = "Player";
		player.showBoundingBox = true;
		
		let _player = new Player(player, 0, 1, 10, scene);
	}
}

function movePlayer(scene){
	let player = scene.getMeshByName("player");
	if (player){
		player.Player.move(scene);
		console.log(player.position);
	} 
}

window.addEventListener("resize", () => {
	engine.resize();
});
  
function modifySettings() {

	scene.inputStates = {};
  	scene.inputStates.left = false;
  	scene.inputStates.right = false;
  	scene.inputStates.up = false;
  	scene.inputStates.down = false;

	//add the listener to the main, window object, and update the states
	window.addEventListener(
	  "keydown",
	  (event) => {
		if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
		  scene.inputStates.left = true;
		} else if (
		  event.key === "ArrowUp" ||
		  event.key === "z" ||
		  event.key === "Z"
		) {
		  scene.inputStates.up = true;
		} else if (
		  event.key === "ArrowRight" ||
		  event.key === "d" ||
		  event.key === "D"
		) {
		  scene.inputStates.right = true;
		} else if (
		  event.key === "ArrowDown" ||
		  event.key === "s" ||
		  event.key === "S"
		) {
		  scene.inputStates.down = true;
		}
	  },
	  false
	);
  
	//if the key will be released, change the states object
	window.addEventListener(
	  "keyup",
	  (event) => {
		if (event.key === "ArrowLeft" || event.key === "q" || event.key === "Q") {
		  scene.inputStates.left = false;
		} else if (
		  event.key === "ArrowUp" ||
		  event.key === "z" ||
		  event.key === "Z"
		) {
		  scene.inputStates.up = false;
		} else if (
		  event.key === "ArrowRight" ||
		  event.key === "d" ||
		  event.key === "D"
		) {
		  scene.inputStates.right = false;
		} else if (
		  event.key === "ArrowDown" ||
		  event.key === "s" ||
		  event.key === "S"
		) {
		  scene.inputStates.down = false;
		} else if (event.key === " ") {
		  scene.inputStates.space = false;
		}
	  },
	  false
	);
}