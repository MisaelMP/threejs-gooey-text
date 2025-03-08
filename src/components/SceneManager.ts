import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { TextBlob } from './TextBlob';
import { GooeyText } from '../GooeyText';
import { GUIController } from './GUIController';

export class SceneManager {
	public parent: GooeyText;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls!: OrbitControls;
	private textBlobs: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];
	private pointLight!: THREE.PointLight;
	private floor!: THREE.Mesh;
	private floorBody!: CANNON.Body;
	private world!: CANNON.World;
	private floorLevel = -10;

	constructor(parent: GooeyText) {
		this.parent = parent;
		this.scene = new THREE.Scene();
		this.scene.background = new THREE.Color(this.parent.backgroundColor);

		this.camera = new THREE.PerspectiveCamera(
			50,
			window.innerWidth / window.innerHeight,
			0.1,
			1000
		);
		this.camera.position.z = 20;

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;

		//  Initialize physics
		this.initPhysics();
	}

	private initPhysics() {
		this.world = new CANNON.World();
		this.world.gravity.set(0, -9.8, 0);

		this.floorBody = new CANNON.Body({
			mass: 0,
			shape: new CANNON.Plane(),
		});
		this.floorBody.position.set(0, this.floorLevel, 0);
		this.floorBody.quaternion.setFromEuler(-Math.PI / 2, 0, 0);
		this.world.addBody(this.floorBody);
	}

	initScene() {
		const canvas = document.createElement('canvas');
		this.parent.shadowRoot?.appendChild(canvas);

		this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;

		this.controls = new OrbitControls(this.camera, this.renderer.domElement);
		this.controls.enableDamping = true;
		this.controls.dampingFactor = 0.05;

		this.addLighting();
		this.addFloor();
		this.createTextBlobs();

		new GUIController(this.parent);
	}

	addLighting() {
		const ambientLight = new THREE.AmbientLight(0x404040, 0.5);
		this.scene.add(ambientLight);

		//   Directional light for strong shadows under each letter 
		const directionalLight = new THREE.DirectionalLight(0xffffff, 1.5);
		directionalLight.position.set(0, 50, 10);
		directionalLight.castShadow = true;
		directionalLight.shadow.mapSize.width = 4096;
		directionalLight.shadow.mapSize.height = 4096;
		directionalLight.shadow.camera.near = 1;
		directionalLight.shadow.camera.far = 200;
		directionalLight.shadow.camera.left = -50;
		directionalLight.shadow.camera.right = 50;
		directionalLight.shadow.camera.top = 50;
		directionalLight.shadow.camera.bottom = -50;
		this.scene.add(directionalLight);

		//   Each letter now casts its own shadow 
		this.pointLight = new THREE.PointLight(0xffffff, 2);
		this.pointLight.position.set(0, 30, 10);
		this.pointLight.castShadow = true;
		this.pointLight.shadow.mapSize.width = 4096;
		this.pointLight.shadow.mapSize.height = 4096;
		this.scene.add(this.pointLight);
	}

	addFloor() {
		const floorGeometry = new THREE.PlaneGeometry(100, 100);
		const floorMaterial = new THREE.MeshStandardMaterial({
			color: 0x222222,
			roughness: 0.8,
			metalness: 0.1,
		});

		this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
		this.floor.rotation.x = -Math.PI / 2;
		this.floor.position.y = this.floorLevel;
		this.floor.receiveShadow = true;
		this.scene.add(this.floor);
	}

	createTextBlobs() {
		const loader = new FontLoader();
		loader.load(
			'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
			(font) => {
				this.textBlobs.forEach(({ mesh }) => this.scene.remove(mesh));
				this.textBlobs = [];

				const textBlobs = TextBlob.createText(font, this.parent);

				textBlobs.forEach(({ mesh, body }) => {
					this.world.addBody(body);
					this.textBlobs.push({ mesh, body });
					this.scene.add(mesh);
				});
			}
		);
	}

	updateBlobColor(color: string) {
		this.textBlobs.forEach(({ mesh }) => {
			if (mesh.material instanceof THREE.MeshStandardMaterial) {
				mesh.material.color.set(color);
			}
		});
	}

	updateBackgroundColor(color: string) {
		this.scene.background = new THREE.Color(color);
	}

	updateLightIntensity(intensity: number) {
		this.pointLight.intensity = intensity;
	}

	updateGooeyness(value: number) {
		this.textBlobs.forEach(({ mesh }) => {
			if (mesh.material instanceof THREE.ShaderMaterial) {
				mesh.material.uniforms.u_gooeyEffect.value = value; //  Update gooeyness effect in shader
			}
		});
	}

	startAnimation() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.updatePhysics();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	private updatePhysics() {
		this.world.step(1 / 60);

		this.textBlobs.forEach(({ mesh, body }) => {
			if (mesh instanceof THREE.Mesh && body instanceof CANNON.Body) {
				mesh.position.set(body.position.x, body.position.y, body.position.z);
			}
		});
	}

	//  Now includes all missing functions
	getGooeyness() {
		return this.parent.gooeyness; //  Get gooeyness from GUI
	}

	getBounciness() {
		return this.parent.bounceSpeed; //  Get bounciness from GUI
	}
	getFloorLevel() {
		return this.floorLevel; //  Returns the floor level for physics
	}

	getPhysicsWorld() {
		return this.world;
	}

	getTextBlobs() {
		return this.textBlobs;
	}

	getRenderer() {
		return this.renderer;
	}

	getCamera() {
		return this.camera;
	}

	getScene() {
		return this.scene;
	}
}
