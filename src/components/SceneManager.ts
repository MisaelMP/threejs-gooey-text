import * as THREE from 'three';
import { FontLoader } from 'three/examples/jsm/loaders/FontLoader.js';
import { OrbitControls } from 'three/examples/jsm/controls/OrbitControls.js';
import { DragControls } from 'three/examples/jsm/controls/DragControls.js';
import { TextBlob } from './TextBlob';
import { GooeyText } from '../GooeyText';
import { GUIController } from './GUIController';

export class SceneManager {
	private parent: GooeyText;
	private scene: THREE.Scene;
	private camera: THREE.PerspectiveCamera;
	private renderer: THREE.WebGLRenderer;
	private controls!: OrbitControls;
	private textBlobs: THREE.Mesh[] = [];
	private pointLight!: THREE.PointLight;
	private floor!: THREE.Mesh;
	private dragControls!: DragControls;
	private floorLevel!: number; // Stores **precise** floor position

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
		this.camera.position.set(0, 10, 30); // Moves the camera farther away

		this.renderer = new THREE.WebGLRenderer({ antialias: true });
		this.renderer.setSize(window.innerWidth, window.innerHeight);
		this.renderer.shadowMap.enabled = true;
		this.renderer.shadowMap.type = THREE.PCFSoftShadowMap;
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
		this.initDragControls();

		new GUIController(this.parent);
	}

	initDragControls() {
		if (!this.renderer || !this.textBlobs.length) {
			console.error(
				'DragControls initialization failed: Renderer or textBlobs missing.'
			);
			return;
		}

		this.dragControls = new DragControls(
			this.textBlobs,
			this.camera,
			this.renderer.domElement
		);

		this.dragControls.addEventListener('dragstart', () => {
			if (this.controls) this.controls.enabled = false;
		});

		this.dragControls.addEventListener('dragend', () => {
			if (this.controls) this.controls.enabled = true;
		});
	}

	addFloor() {
		const floorGeometry = new THREE.PlaneGeometry(100, 100);
		const floorMaterial = new THREE.MeshStandardMaterial({
			transparent: true, // Enable transparency
			opacity: 0,
		});

		this.floor = new THREE.Mesh(floorGeometry, floorMaterial);
		this.floor.rotation.x = -Math.PI / 2;

		//**Correctly position the floor at the very bottom of the screen**
		this.floorLevel = -10; // 🔥 Make sure it's always BELOW the text
		this.floor.position.y = this.floorLevel;

		this.floor.receiveShadow = true;
		this.scene.add(this.floor);
	}

	updateBlobColor(color: string) {
		this.textBlobs.forEach((blob) => {
			if (blob.material instanceof THREE.MeshStandardMaterial) {
				blob.material.color.set(color);
			}
		});
	}

	updateBackgroundColor(color: string) {
		if (this.scene) {
			this.scene.background = new THREE.Color(color);
		}
	}

	updateLightIntensity(intensity: number) {
		if (this.pointLight) {
			this.pointLight.intensity = intensity;

			this.pointLight.position.set(0, 25 + intensity * 2, 5);
		}
	}

	addLighting() {
		const ambientLight = new THREE.AmbientLight(0x404040, 0.3);
		this.scene.add(ambientLight);

		this.pointLight = new THREE.PointLight(
			0xffffff,
			this.parent.lightIntensity
		);
		this.pointLight.position.set(0, 20, 10);
		this.pointLight.castShadow = true;
		this.scene.add(this.pointLight);
	}

	createTextBlobs() {
		this.textBlobs.forEach((blob) => {
			this.scene.remove(blob);
			if (blob.geometry) blob.geometry.dispose();
			if (blob.material) (blob.material as THREE.Material).dispose();
		});
		this.textBlobs = [];

		const loader = new FontLoader();
		loader.load(
			'https://threejs.org/examples/fonts/helvetiker_bold.typeface.json',
			(font) => {
				const totalWidth = this.textBlobs.reduce(
					(acc, blob) => acc + (blob.geometry.boundingBox?.max.x || 0),
					0
				);
				const offset = -totalWidth / 2;

				this.textBlobs.forEach((blob) => {
					this.scene.remove(blob);
					if (blob.geometry) blob.geometry.dispose();
					if (blob.material) (blob.material as THREE.Material).dispose();
				});
				this.textBlobs = [];

				this.textBlobs = TextBlob.createText(font, this.parent);
				this.textBlobs.forEach((blob, i) => {
					blob.position.x += offset + i * 3.2;
					blob.position.y = this.floorLevel + 40;
					blob.castShadow = true;
					this.scene.add(blob);
				});
			}
		);
	}

	startAnimation() {
		const animate = () => {
			requestAnimationFrame(animate);
			this.parent.requestUpdate();
			this.renderer.render(this.scene, this.camera);
		};
		animate();
	}

	getScene() {
		return this.scene;
	}

	getCamera() {
		return this.camera;
	}

	getRenderer() {
		return this.renderer;
	}

	getFloorLevel() {
		return this.floorLevel;
	}
}
