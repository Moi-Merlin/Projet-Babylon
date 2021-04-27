import Shark from "./Shark.js";
import Dwarf from "./Dwarf.js";
let scene;
let canvas;
let engine;
let score = 0;
let clickMenu = 0;

window.onload = startGame;

//==========================================================
//						Main loop
//==========================================================

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

//====================================================================
//						Scene and config
//====================================================================

function createScene() {
	let scene = new BABYLON.Scene(engine);
  
	scene.assetsManager = configureAssetManager(scene);

	let camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, new BABYLON.Vector3(10,100,10), scene);
	camera.attachControl(canvas, true);
	
	//enable physics in the scene with the gravity we have on earth
	scene.enablePhysics(new BABYLON.Vector3(0,-9.8,0));

	let ground = createGround(scene);
	let lights = createLights(scene);
	//let freeCamera = createFreeCamera(scene);
  
	createIslands(scene);
	createFort(scene);
	createBoat(scene);
	createPlayer(scene);
	createFishes(scene);
	createbridge(scene);
	createDwarf(scene);
	createDeapSea(scene);
	createSkybox(scene);
	createSem(scene);
	createHouse(scene);
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
	  document.querySelector("#loading").style.width = ((totalCount-remainingCount)/totalCount)*100 + "%"
	  console.log(
		"We are loading the scene. " +
		  remainingCount +
		  " out of " +
		  totalCount +
		  " items still need to be loaded."
	  );
	};
  
	assetsManager.onFinish = function (tasks) {
		document.querySelector("#croix").className = "crossOnDisplay";
		document.querySelector("#bar").className = "barNotDisplayed";
		engine.runRenderLoop(function () {
			scene.toRender();
		});
	};
  
	return assetsManager;
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
	var ground = BABYLON.Mesh.CreateGround("ground", 3100, 3100, 32, scene, false);
	ground.position.y = -150;
	ground.material = groundMaterial;

	//On crée ensuite un second sol qui est un Water Material, il représente la mer
	//On lui donne des attributs qui nous permettent de créer des vagues avec un effet de vent
	var waterMesh = BABYLON.Mesh.CreateGround("sea", 3100, 3100, 32, scene, false);
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
		{ loop: false, spatialSound: false }
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
		{ loop: false, spatialSound: false }
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

//===============================================================
//								Overlay
//===============================================================

function createButtons(){
	var button = document.createElement("button");
    button.style.top = "30px";
    button.style.right = "30px";
    button.textContent = "Pause Music";
    button.style.width = "55px";
    button.style.height = "55px";
    button.style.position = "absolute";
	button.style.lineHeight = "1.5em";
	button.style.color = "whitesmoke";
	button.style.fontWeight = "300";
	button.style.textShadow = "1px 1px 2px tomato";
	button.style.borderColor = "transparent";
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

	var scoreDisplay = document.createElement("score");
	scoreDisplay.textContent = "SCORE : "+score;
	scoreDisplay.style.top = "30px";
    scoreDisplay.style.left = "30px";
	scoreDisplay.style.position = "absolute";
	scoreDisplay.style.color = "whitesmoke";
	scoreDisplay.style.fontSize = "30px";
	scoreDisplay.style.fontFamily = "Arial"
	document.body.appendChild(scoreDisplay);

	var control = document.createElement("control");
	control.style.paddingTop = "0.5em";
	control.style.lineHeight = "1.5em";
	control.style.top = "110px";
    control.style.right = "30px";
    control.textContent = "Fermer Menu";
	control.style.textShadow = "1px 1px 2px rgb(255, 245, 49);";
	control.style.fontSize = "14px";
	control.style.pading = "1em";
    control.style.width = "55px";
    control.style.height = "50px";
    control.style.position = "absolute";
	control.style.color = "whitesmoke";
	control.style.borderColor = "transparent";
	control.style.borderRadius = "2em";
	control.style.outline = "none";
	control.style.backgroundColor = "rgba(166, 204, 210,0.5)";
	control.style.textAlign = "center";
	document.body.appendChild(control);

	control.addEventListener("click", () => {
        menu()
		if(control.innerHTML=="Fermer Menu"){control.innerHTML="Ouvrir Menu"}
		else if(control.innerHTML=="Ouvrir Menu"){control.innerHTML="Fermer Menu"}
    })

	document.querySelector("#croix").addEventListener("click", () => {
		console.log("click")
		menu()
		if(control.innerHTML=="Fermer Menu"){control.innerHTML="Ouvrir Menu"}
		else if(control.innerHTML=="Ouvrir Menu"){control.innerHTML="Fermer Menu"}
	})

	
	
}

function menu(){
	clickMenu += 1;
    if(clickMenu % 2 == 1){
		document.querySelector("#Menu").className = "MenuNotDisplayed";
		document.querySelector("#croix").className = "crossNotDisplayed";
	}
	else{
		document.querySelector("#Menu").className = "MenuOnDisplay";
		document.querySelector("#croix").className = "crossOnDisplay";
	}
}

function loadScore(){
	var scoretoDisplay = document.getElementsByTagName("score");
	scoretoDisplay.textContent = "SCORE : "+score;
}


//==============================================================
//						Meshes import
//==============================================================

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

async function createFort(scene){
	// we start by creating the pirate fort while adding it to the asset manager
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

	// the second step is to import the cannons and the cannon balls and effects that will be paired with them
    let cannonTask = scene.assetsManager.addMeshTask("cannon task","","assets/meshes/canons/","cannon.glb");
  
	cannonTask.onSuccess = function (task) {
	  onCannonImported(
		task.loadedMeshes,
		task.loadedAnimationGroups
	  );
	};
  
	async function onCannonImported(meshes, animationGroups) {

		//remove the top level root node
		var cannon = meshes[0].getChildren()[0];
		cannon.scaling = new BABYLON.Vector3(26,26,26);
		cannon.setParent(null);
		meshes[0].dispose();

		//set the metadata of each mesh to filter on later (we will be able to identify the meshes as cannons)
		var cannonMeshes = cannon.getChildMeshes();
		for (var i = 0; i < cannonMeshes.length; i++) {
			cannonMeshes[i].metadata = "cannon";
		}

		//array for holding the cannon and "paired" animation group, we are going tyo combine the original 
		// animations of the mesh so they are played at the same time
		var cannonAnimationPairings = {};

		//array for holding readyToPlay status for the cannons, we will later on set a boolean value to know if the 
		// cannon that has been selected is ready to be used again or not
		var cannonReadyToPlay = {};

		//create a large box underneath the tower, that will act as a trigger to destroy the cannonballs.
		// we make it the same size and origin point as the ocean (just a bit underneath) so we can make the 
		// cannonballs disapear once they reach the water (we only triger in the direction of the ocean so 
		// we don't need to consider any scenario where a cannonball will touch the island)
		var killBox = BABYLON.MeshBuilder.CreateBox("killBox", {width:3000, depth:3000, height:4}, scene);
		var sea = scene.getMeshByName("sea").position.y
		killBox.position = new BABYLON.Vector3(0,sea,0);
		killBox.isVisible = false;

		//create a cannonBall template in order to clone it whenerver we want to shoot
		var cannonBall = BABYLON.MeshBuilder.CreateSphere("cannonBall", {diameter: 7.8}, scene);
		var cannonBallMaterial = new BABYLON.StandardMaterial("cannonBallMaterial", scene);
		cannonBallMaterial.diffuseColor = BABYLON.Color3.Black();
		cannonBallMaterial.specularPower = 256;
		cannonBall.material = cannonBallMaterial;
		// we initialy set it to false and will only make the cannonballs visible when using them
		cannonBall.isVisible = false;

		// we load the animations of the cannon into a const in order to use them later on
		const importedAnimGroups = animationGroups;

		//loop through all imported animation groups and copy the animation curve data to an array.
		var animations = [];
		for (var i = 0; i < importedAnimGroups.length; i++) {
			importedAnimGroups[i].stop();
			animations.push(importedAnimGroups[i].targetedAnimations[0].animation);
			importedAnimGroups[i].dispose();
		}

		//create a new animation group and add targeted animations based on copied curve data from the "animations" array.
		// we want to play the annimations at the same time so we need to discpose of the ancient animations groups given with 
		// the asset and create a new one that will contain them both
		var cannonAnimGroup = new BABYLON.AnimationGroup("cannonAnimGroup");
		cannonAnimGroup.addTargetedAnimation(animations[0], cannon.getChildMeshes()[1]);
		cannonAnimGroup.addTargetedAnimation(animations[1], cannon.getChildMeshes()[0]);
		
		//create a box for particle emission, position it at the muzzle of the cannon, turn off visibility and parent it to the cannon mesh
		var particleEmitter = await BABYLON.MeshBuilder.CreateBox("particleEmitter", {size: 8}, scene);
		particleEmitter.position = new BABYLON.Vector3(0, 20, 25);
		particleEmitter.rotation.x = BABYLON.Tools.ToRadians(78.5);
		particleEmitter.isVisible = false;
		particleEmitter.setParent(cannon.getChildMeshes()[1]);
		
		//load particle system from the snippet server and set the emitter to the particleEmitter. Set its stopDuration.
		const smokeBlast = await BABYLON.ParticleHelper.CreateFromSnippetAsync("LCBQ5Y#6", scene);
		smokeBlast.emitter = particleEmitter;
		smokeBlast.minScaleX = 10;
        smokeBlast.maxScaleX = 100;
        smokeBlast.minScaleY = 10;
        smokeBlast.maxScaleY = 100;
		smokeBlast.targetStopDuration = 0.5;

		//position and rotation data for the placement of the cannon clones
		var cannonPositionArray = [
			[new BABYLON.Vector3(40, 244.4, 10),new BABYLON.Vector3(0,BABYLON.Tools.ToRadians(90),BABYLON.Tools.ToRadians(180))],
			[new BABYLON.Vector3(40, 162, 43),new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(180))],
			[new BABYLON.Vector3(40, 79, 19),new BABYLON.Vector3(0, BABYLON.Tools.ToRadians(90), BABYLON.Tools.ToRadians(180))],
			[new BABYLON.Vector3(15, 124, 50),new BABYLON.Vector3(0, 0, BABYLON.Tools.ToRadians(180))],
			[new BABYLON.Vector3(20, 244.4, 65),new BABYLON.Vector3(0, 0, BABYLON.Tools.ToRadians(180))]
		];
		//create 5 cannon clones, each with unique position/rotation data (and the particle systems with them)
		//also create 5 new animation groups with targeted animations applied to the newly cloned meshes
		for (var i = 0; i < cannonPositionArray.length; i++) {
			var cannonClone = cannon.clone("cannonClone" + i);
			cannonClone.position = cannonPositionArray[i][0];
			cannonClone.rotation = cannonPositionArray[i][1];
			var cannonAnimGroupClone = new BABYLON.AnimationGroup("cannonAnimGroupClone" + i);
			cannonAnimGroupClone.addTargetedAnimation(cannonAnimGroup.targetedAnimations[0].animation, cannonClone.getChildMeshes()[1]);
			cannonAnimGroupClone.addTargetedAnimation(cannonAnimGroup.targetedAnimations[1].animation, cannonClone.getChildMeshes()[0]);

			//store a key/value pair of each clone name and the name of the associated animation group name.
			cannonAnimationPairings[cannonClone.name] = cannonAnimGroupClone.name;

			//store key/value pair for the cannon name and it's readyToPlay status as 1;
			cannonReadyToPlay[cannonClone.name] = 1;

		}
		//dispose of the original cannon, animation group, and particle system
		cannon.dispose();
		cannonAnimGroup.dispose();
		smokeBlast.dispose();

		//create an array for all particle systems in the scene, loop through it and stop all systems from playing.
		var smokeBlasts = scene.particleSystems;
		for(var i = 0; i < smokeBlasts.length; i++){
			smokeBlasts[i].stop();
		}

		//logic of what happens on a click oàn one of the cannons
		scene.onPointerDown = function (evt, pickResult) {
			//check if a mesh was picked and if that mesh has specific metadata
			if (pickResult.pickedMesh && pickResult.pickedMesh.metadata === "cannon") {
				//find the top level parent (necessary since the cannon is an extra layer below the clone root)
				var topParent = pickResult.pickedMesh.parent;
				if (topParent.parent) {
					topParent = topParent.parent;
				}
				//wrap all 'play' elements into a check to make sure the cannon can be played.
				if(cannonReadyToPlay[topParent.name] === 1){
					//set the readyToPlay status to 0
					cannonReadyToPlay[topParent.name] = 0;
					//loop through all of the animation groups in the scene and play the correct group based on the top level parent of the picked mesh.
					var animationToPlay = cannonAnimationPairings[topParent.name];
					for (var i = 0; i < scene.animationGroups.length; i++) {
						if (scene.animationGroups[i].name === animationToPlay) {
							scene.animationGroups[i].play();
							//after the animation has finished, set the readyToPlay status for this cannon to 1;
							scene.animationGroups[i].onAnimationGroupEndObservable.addOnce(() => {
								cannonReadyToPlay[topParent.name] = 1;
							});
						}
					}
					//loop through all particle systems in the scene, loop through all picked mesh submeshes. if there is a matching mesh and particle system emitter, start the particle system.
					var childMeshes = pickResult.pickedMesh.getChildMeshes();
					for(var i = 0; i < smokeBlasts.length; i++){
						for (var j = 0; j < childMeshes.length; j++){
							if(childMeshes[j] === smokeBlasts[i].emitter){
								smokeBlasts[i].start();
								//clone the cannonBall, make it visible, and add a physics imposter to it. Finally apply a force by scaling the up vector of the particle emitter box
								var cannonBallClone = cannonBall.clone("cannonBallClone")
								cannonBallClone.isVisible = true;
								cannonBallClone.position = childMeshes[j].absolutePosition;
								cannonBallClone.physicsImpostor = new BABYLON.PhysicsImpostor(cannonBallClone, BABYLON.PhysicsImpostor.SphereImpostor, {mass:10, friction:1.5, restitution:0.2}, scene);
								cannonBallClone.physicsImpostor.applyImpulse(childMeshes[j].up.scale(1050), BABYLON.Vector3.Zero());
								//create an action manager for the cannonBallClone that will fire when intersecting the killbox.
								// It will create a small explosion at the intersection and the cannonball disapears
								cannonBallClone.actionManager = new BABYLON.ActionManager(scene);
								cannonBallClone.actionManager.registerAction(
									new BABYLON.ExecuteCodeAction(
										{
										trigger:BABYLON.ActionManager.OnIntersectionEnterTrigger,
										parameter:killBox
										}, 
										function(){
											BABYLON.ParticleHelper.CreateAsync("explosion", this.scene).then((set) => {
												set.systems.forEach((s) => {
												  s.emitter = cannonBallClone.position;
												  s.disposeOnStop = true;
												});
												set.start();
											});
											scene.assets.explosion.play();
											cannonBallClone.dispose();
										}
									)
								);
							}
						}
					}
					scene.assets.cannonSound.play();
				}
			}
		};
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

function createbridge(scene){
	let bridgeTask = scene.assetsManager.addMeshTask("bridgetask","","assets/meshes/scene/","garden.glb")

	bridgeTask.onSuccess = function(task){
		onBridgeImported(task.loadedMeshes)
	}

	function onBridgeImported(meshes){
		let bridge = meshes[0]
		bridge.scaling = new BABYLON.Vector3(23,23,23);
		bridge.position = new BABYLON.Vector3(650,-23,-320);
		bridge.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(2),BABYLON.Tools.ToRadians(150),0)
	}
}

function createDeapSea(scene){
	let seaTask = scene.assetsManager.addMeshTask("bridgetask","","assets/meshes/scene/","sea.glb")

	seaTask.onSuccess = function(task){
		onSeaImported(task.loadedMeshes)
	}

	function onSeaImported(meshes){
		let sea = meshes[0]
		sea.scaling = new BABYLON.Vector3(10,10,10);
		sea.position = new BABYLON.Vector3(750,-140,520);
		sea.rotation = new BABYLON.Vector3(BABYLON.Tools.ToRadians(2),BABYLON.Tools.ToRadians(150),0);
	}
}

function createSem(scene){
	let centralTask = scene.assetsManager.addMeshTask("gravetask","","assets/meshes/graveyard/","central_grave.glb")
	centralTask.onSuccess = function(task){
		onCentralImported(task.loadedMeshes)
	}
	function onCentralImported(meshes){
		let grave = meshes[0]
		grave.scaling = new BABYLON.Vector3(0.6,0.6,0.6);
		grave.position = new BABYLON.Vector3(-555,11,-1030);
		frave.rotation = new BABYLON.Vector3(0,BABYLON.Tools.ToRadians(150),0);
	}

	let skullTask = scene.assetsManager.addMeshTask("skulltask","","assets/meshes/graveyard/","crâne.glb")
	skullTask.onSuccess = function(task){
		onSkullImported(task.loadedMeshes)
	}
	function onSkullImported(meshes){
		skull = meshes[1]
		skull.scaling = new BABYLON.Vector3(5,5,5)
		skull.position = new BABYLON.Vector3(-570,50,-1030);
	}
}

function createHouse(scene){
	let houseTask = scene.assetsManager.addMeshTask("house task","","assets/meshes/scene/","house.glb")
	houseTask.onSuccess = function(task){
		onHouseImported(task.loadedMeshes)
	}
	function onHouseImported(meshes){
		let house = meshes[0]
		house.position = new BABYLON.Vector3(600,10,-1220)
		house.scaling = new BABYLON.Vector3(0.05,0.05,0.05)
		house.rotation = new BABYLON.Vector3(0,BABYLON.Tools.ToRadians(100),0)
	}
}

function createFishes(scene){
	let sharkTask = scene.assetsManager.addMeshTask("sharktask","","assets/meshes/mob/","shark.glb");

	sharkTask.onSuccess = function (task) {
		onSharkImported(
			task.loadedMeshes,
			task.loadedParticleSystems,
			task.loadedSkeletons
		);
	};

	function onSharkImported(Meshes, particles, skeletons){
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
		
		// Create a box as BoundingBox of the shark
		let bounderShark = new BABYLON.Mesh.CreateBox("bounder" + shark.name,1,scene);
		let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",scene);
		bounderMaterial.alpha = 0.4;
		bounderShark.material = bounderMaterial;
		bounderShark.checkCollisions = true;
	
		bounderShark.position = shark.position.clone();
	
		//Thinks Michel buffa, for calculate manually
		let bbInfo = calculateBoundingBoxParameters(shark);
		console.log("==================SHARK================");
		console.log(bbInfo);
	
		let max = bbInfo.boundingBox.maximum;
		let min = bbInfo.boundingBox.minimum;
		console.log("infos ",min , max);
		console.log("bbtaille init ",bounderShark);
	
		bounderShark.scaling.x = (max._z - min._z) * shark.scaling.z;
		bounderShark.scaling.y = (max._y - min._y) * shark.scaling.y;		
		bounderShark.scaling.z = (max._x - min._x) * shark.scaling.x;
		console.log("bbox taille ", bounderShark.scaling);
		bounderShark.isVisible = false;
	
		bounderShark.position.y += (max._y - min._y) * shark.scaling.y/2.5;
	
		shark.bounder = bounderShark;
	
		shark.showBoundingBox = false;

		let _shark = new Shark(shark, 0, 1, 10, scene,bounderShark);
	}
}

function createDwarf(scene){
	let dwarfTask = scene.assetsManager.addMeshTask("dwarf task","","assets/meshes/mob/","Dwarf.glb");
	
	dwarfTask.onSuccess = function (task) {
		onDwarfImported(
		task.loadedMeshes,
		task.loadedParticleSystems,
		task.loadedSkeletons);
	};
	
	function onDwarfImported(Meshes, particles, skeletons){
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
	
		dwarf.name = "dwarf";
	
		// Create a box as BoundingBox of the dwarf
		let bounderDwarf = new BABYLON.Mesh.CreateBox("bounder" + dwarf.name,1,scene);
		let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",scene);
		bounderMaterial.alpha = 0.4;
		bounderDwarf.material = bounderMaterial;
		bounderDwarf.checkCollisions = true;
	
		bounderDwarf.position = dwarf.position.clone();
	
		//let bbInfo = dwarf.getBoundingInfo();
		//bbInfo = dwarf.getBoundingInfo();
	
		//Thinks Michel buffa, for calculate manually
		let bbInfo = calculateBoundingBoxParameters(dwarf)
		console.log("==================NAIN================");
		console.log(bbInfo);
	
		let max = bbInfo.boundingBox.maximum;
		let min = bbInfo.boundingBox.minimum;
		console.log("infos ",min , max);
		console.log("bbtaille init ",bounderDwarf);
	
		bounderDwarf.scaling.x = (max._x - min._x) * dwarf.scaling.x;
		bounderDwarf.scaling.y = (max._y - min._y) * dwarf.scaling.y;		
		bounderDwarf.scaling.z = (max._z - min._z) * dwarf.scaling.z;
		console.log("bbox taille ", bounderDwarf.scaling);
		bounderDwarf.isVisible = false;
	
		bounderDwarf.position.y += (max._y - min._y) * dwarf.scaling.y/2;
	
		dwarf.bounder = bounderDwarf;
	
		dwarf.showBoundingBox = false;

		let _dwarf = new Dwarf(dwarf, 0, 1, 10, scene,bounderDwarf);
	}
}
	
function calculateBoundingBoxParameters(mesh) {
	// Compute BoundingBoxInfo for the Dude, for this we visit all children meshes
	let childrenMeshes = getAllChildrenThatAreMeshes(mesh)
	let bbInfo = totalBoundingInfo(childrenMeshes);
	
	return bbInfo;
}
	
function getAllChildrenThatAreMeshes(mesh) {
	let meshes = [];
	var children = mesh.getChildren();

	if ((children.length === 0) && (mesh instanceof BABYLON.Mesh)) {
		meshes.push(mesh);
	} else {
		for (var i = 0 ; i < children.length ; i++) {
			let child = children[i];
			let childrenMeshes = getAllChildrenThatAreMeshes(child);
			if(childrenMeshes.length !== 0) {
				meshes = meshes.concat(childrenMeshes);
			}
		}
	}
	
	return meshes;
}
	
// Taken from BabylonJS Playground example : https://www.babylonjs-playground.com/#QVIDL9#1	
function totalBoundingInfo(meshes) {	
	var boundingInfo = meshes[0].getBoundingInfo();
	var min = boundingInfo.minimum.add(meshes[0].position);
	var max = boundingInfo.maximum.add(meshes[0].position);
	for (var i = 1; i < meshes.length; i++) {
		boundingInfo = meshes[i].getBoundingInfo();
		min = BABYLON.Vector3.Minimize(min,boundingInfo.minimum.add(meshes[i].position));
		max = BABYLON.Vector3.Maximize(max,boundingInfo.maximum.add(meshes[i].position));
	}
	
	return new BABYLON.BoundingInfo(min, max);
}

function createPlayer(scene){
	//Pour le joueur de nombreux problèmes sont survenue a cause du format du meshes, pour être plus spécifique, l'exportation du meshe de blender a 
	//un fichier en .babylon a déformé l'ensemble des animations lié a celui-ci les rendant inutilisable. Tout le code lié au meshes issue du fichier .babylon
	//sera laissé comme trace mais non focntionnel pour le fichier .glb ....
	//Après des échec pour déplacer le joueur le fichier .babylon sera finalement choisi au dépend des animations

	let playerTask = scene.assetsManager.addMeshTask("playertask","","assets/meshes/mob/Player/","player.babylon");
	//let playerTask = scene.assetsManager.addMeshTask("playertask","","assets/meshes/mob/","Player.glb");
	
	playerTask.onSuccess = function (task) {
		onPlayerImported(
			task.loadedMeshes,
			task.loadedParticleSystems,
			task.loadedSkeletons
		);
	};

	function onPlayerImported(Meshes, particles, skeletons){
		let player = Meshes[0];
		console.log("=============JOUEUR=========");
		//console.log(player);
		
		//pos
		player.position = new BABYLON.Vector3(-100, 0, -100);
		//player.position = new BABYLON.Vector3(25, 80, -15);
		//scaling
		//console.log("initial player scaling ",player.scaling);
		player.scaling = new BABYLON.Vector3(0.15,0.15,0.15); //version pour le meshe en .babylon
		//player.scaling = new BABYLON.Vector3(22,22,22); scaling .glb
		
		player.frontVector = new BABYLON.Vector3(0, 0, 0); //fie x = 1 pour permettre un déplacement du joueur vers l'avant quand on appuit sur z four le .glb

		player.rotation.x = -Math.PI/2;
		//player.rotation = new BABYLON.Vector3(0,0,0); pour les fichiers sous format glb il faut soit passer  par la rotation en Quaternion soit définir un vecteur de postion entier
										 
		player.name = "player";
		player.speed = 1;
		
		/* .glb file 
		// Create a box as BoundingBox of the player
		let bounderPlayer = new BABYLON.Mesh.CreateBox("bounder" + player.name,1,scene);
		let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",scene);
		bounderMaterial.alpha = 0.4;
		bounderPlayer.material = bounderMaterial;
		bounderPlayer.checkCollisions = true;
	
		bounderPlayer.position = player.position.clone();

		let bbInfo = calculateBoundingBoxParameters(player)
		console.log(bbInfo);
	
		let max = bbInfo.boundingBox.maximum;
		let min = bbInfo.boundingBox.minimum;
		console.log("infos ",min , max);
		console.log("bbtaille init ",bounderPlayer);
	
		bounderPlayer.scaling.x = (max._x - min._x) * player.scaling.x;
		bounderPlayer.scaling.y = (max._y - min._y) * player.scaling.y;		
		bounderPlayer.scaling.z = (max._z - min._z) * player.scaling.z;
		console.log("bbox taille ", bounderPlayer.scaling);
		bounderPlayer.isVisible = true;
	
		bounderPlayer.frontVector = new BABYLON.Vector3(1, 0, 0);
		bounderPlayer.position.y += (max._y - min._y) * player.scaling.y/2;
	
		player.bounder = bounderPlayer;*/

		
		//L'ensemble du code suivant focntion uniquement sur le fichier en .babylon encore une fois
		//Create a box as BoundingBox of the player
		let bounderPlayer = new BABYLON.Mesh.CreateBox("bounder" + player.name,1,scene);
		let bounderMaterial = new BABYLON.StandardMaterial("bounderMaterial",scene);
		bounderMaterial.alpha = 0.4;
		bounderPlayer.material = bounderMaterial;
		bounderPlayer.checkCollisions = true;

		bounderPlayer.position = player.position.clone();

		let bbInfo = player.getBoundingInfo();

		let max = bbInfo.boundingBox.maximum;
		let min = bbInfo.boundingBox.minimum;
		//console.log("infos ",min , max);
		//console.log("bbtaille init ",bounderPlayer)
		bounderPlayer.scaling.x = (max._x - min._x) * player.scaling.x*0.95;
		bounderPlayer.scaling.y = (max._y - min._y) * player.scaling.y*1.35;
		bounderPlayer.scaling.z = (max._z - min._z) * player.scaling.z*0.5;
		//console.log("bbox taille ",bounderPlayer.scaling);
		bounderPlayer.isVisible = false;

		bounderPlayer.position.y = player.position.y + 1.15*bounderPlayer.scaling.y;
		bounderPlayer.frontVector = new BABYLON.Vector3(0, 0, 0); 

		player.bounder = bounderPlayer;
		player.showBoundingBox = false;

		//Gestion des animations pour le fichier en .babylon
		//Suite a un problème dans le fihcier .babylon du mesh (ou du mesh en lui même) les animations étant bugé il est inutile d'utiliser les lignes suivantes
		/*const idle = scene.beginWeightedAnimation(skeletons[0],630,1101,1,true,1);
		const ending = scene.beginWeightedAnimation(skeletons[0],0,120,0,false,1);
		const failed = scene.beginWeightedAnimation(skeletons[0],130,132,1.0,false,1);
		const fireball = scene.beginWeightedAnimation(skeletons[0],140,343,0,false,1);
		const genkidama = scene.beginWeightedAnimation(skeletons[0],6350,619,0,false,1);
		const walk = scene.beginWeightedAnimation(skeletons[0],1120,1186,0,false,1);

		idle.syncWith(null);
		failed.syncWith(idle);
		while(failed.weight >  0){
			failed.weight -= 0.1;
			idle.weight += 0.1;
		}*/
	}
}


//=================================================================
//							Movement
//=================================================================

function moveShark(){
	let sharky = scene.getMeshByName("shark");
	if (sharky){
		sharky.Shark.move();
		//console.log(sharky.position);
	} 
}

function moveDwarf(){
	let dwarfy = scene.getMeshByName("dwarf");
	if (dwarfy){
		dwarfy.Dwarf.move();
		//console.log(dwarfy.position);
	} 
}

function movePlayer(scene){
	let player = scene.getMeshByName("player");
	
	if (player){
		if (!player.bounder) return;
	
		if (scene.inputStates.up) {
			player.moveWithCollisions(player.frontVector.multiplyByFloats(player.speed, player.speed, player.speed));
			player.bounder.moveWithCollisions(player.bounder.frontVector.multiplyByFloats(player.speed, player.speed, player.speed));
		}
	
		if (scene.inputStates.down) {
			player.moveWithCollisions(player.frontVector.multiplyByFloats(-player.speed, -player.speed, -player.speed));
			player.bounder.moveWithCollisions(player.bounder.frontVector.multiplyByFloats(-player.speed, -player.speed, -player.speed));
		}
	
		//déplacement fonctionnel uniquement selon certain degré (certaines valeur de mesh.rotation.y)
		if (scene.inputStates.left) {
			player.rotation.y -= 0.02;
			player.bounder.rotation.y -= 0.02;
			player.frontVector = new BABYLON.Vector3(-Math.sin(player.rotation.y), 0, -Math.cos(player.rotation.y));
			player.bounder.frontVector = new BABYLON.Vector3(-Math.sin(player.rotation.y), 0, -Math.cos(player.bounder.rotation.y));
		}
		if (scene.inputStates.right) {
			player.rotation.y += 0.02;
			player.bounder.rotation.y += 0.02;
			player.frontVector = new BABYLON.Vector3(-Math.sin(player.rotation.y), 0, -Math.cos(player.rotation.y));
			player.bounder.frontVector = new BABYLON.Vector3(-Math.sin(player.rotation.y), 0,-Math.cos(player.bounder.rotation.y));
		}
	} 
}

//=============================================================================================
//							Setting
//=============================================================================================

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
		}else if (event.key === " "){
			scene.inputStates.space = true;
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