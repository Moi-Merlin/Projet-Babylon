let scene;
let canvas;
let engine;

window.onload = startGame;

function startGame() {
	canvas = document.querySelector("#myCanvas");
	engine = new BABYLON.Engine(canvas, true);
	scene = createScene();

	scene.enablePhysics();
  
	//modifySettings();
    
	scene.toRender = () => {
	  let deltaTime = engine.getDeltaTime();
    
	  scene.render();
	};
  
	scene.assetsManager.load();
}

function createScene() {
	let scene = new BABYLON.Scene(engine);
  
	scene.assetsManager = configureAssetManager(scene);

	let camera = new BABYLON.ArcRotateCamera("Camera", 3 * Math.PI / 2, Math.PI / 4, 100, BABYLON.Vector3.Zero(), scene);
	camera.attachControl(canvas, true);
	
	let ground = createGround(scene);
	let lights = createLights(scene);
	//let freeCamera = createFreeCamera(scene);
  
	//createLights(scene);
	createSkybox(scene);
	//loadSounds(scene);
  
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
	  engine.loadingUIText =
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

function createSkybox(scene){
	var skybox = BABYLON.MeshBuilder.CreateBox("skyBox", {size:2300.0}, scene);
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
	var groundTexture = new BABYLON.Texture("assets/textures/sand.jpg", scene);
	groundTexture.vScale = groundTexture.uScale = 4.0;
	
	var groundMaterial = new BABYLON.StandardMaterial("groundMaterial", scene);
	groundMaterial.diffuseTexture = groundTexture;
	
	var ground = BABYLON.Mesh.CreateGround("ground", 2000, 2000, 32, scene, false);
	ground.position.y = -1;
	ground.material = groundMaterial;

	// On crée ensuite un second sol qui est un Water Material, il représente la mer
	// On lui donne des attributs qui nous permettent de créer des vagues avec un effet de vent
	var waterMesh = BABYLON.Mesh.CreateGround("sea", 2000, 2000, 32, scene, false);
	var water = new BABYLON.WaterMaterial("water", scene, new BABYLON.Vector2(1024, 1024));
	water.backFaceCulling = true;
	water.bumpTexture = new BABYLON.Texture("assets/textures/waterbump.png", scene);
	water.windForce = -6;
	water.windDirection = new BABYLON.Vector2(1, 1);
	water.waveHeight = 1.7;
	water.bumpHeight = 0.8;
	water.waveLength = 1;
	water.waterColor = new BABYLON.Color3(0.2, 0.2, 0.6);
	water.colorBlendFactor = 0.2;
	// On fait en sorte que nos vagues reflètent la skybox et le sol
	let skybox = scene.getMeshByName("skyBox");
	water.addToRenderList(skybox);
	water.addToRenderList(ground);
	waterMesh.material = water;
}

function createLights(scene) {
    // i.e sun light with all light rays parallels, the vector is the direction.
    let light0 = new BABYLON.DirectionalLight("dir0", new BABYLON.Vector3(-1, -1, 0), scene);
    light0.intensity = 1;
}