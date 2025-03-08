import { LitElement, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SceneManager } from './components/SceneManager';
import { AnimationController } from './components/AnimationController';
import { GUIController } from './components/GUIController';
import * as THREE from 'three';

@customElement('gooey-text')
export class GooeyText extends LitElement {
	static styles = css`
		:host {
			display: block;
			width: 100%;
			height: 100vh;
			position: relative;
			cursor: pointer;
		}
		canvas {
			display: block;
			width: 100%;
			height: 100%;
		}
	`;

	@property({ type: String }) text = 'Gooey';
	@property({ type: Boolean }) isAnimating = true;
	@property({ type: Number }) gooeyness = 0.1;
	@property({ type: Number }) bounceSpeed = 0.1;
	@property({ type: String }) blobColor = '#ff69b4';
	@property({ type: String }) backgroundColor = '#111';
	@property({ type: Number }) lightIntensity = 2.5;
	@property({ type: String }) link = ''; // New property for the link

	public sceneManager!: SceneManager;
	private animationController!: AnimationController;
	private guiController!: GUIController | null = null;

	firstUpdated() {
		this.sceneManager = new SceneManager(this);
		this.sceneManager.initScene();
		this.animationController = new AnimationController(this.sceneManager);
		this.guiController = new GUIController(this);
		this.startAnimation();
		this.addClickListener();
	}

	addClickListener() {
		this.sceneManager
			.getRenderer()
			.domElement.addEventListener('click', (event) => {
				const mouse = new THREE.Vector2(
					(event.clientX / window.innerWidth) * 2 - 1,
					-(event.clientY / window.innerHeight) * 2 + 1
				);

				const raycaster = new THREE.Raycaster();
				raycaster.setFromCamera(mouse, this.sceneManager.getCamera());

				const intersects = raycaster.intersectObjects(
					this.sceneManager.getTextBlobs().map(({ mesh }) => mesh)
				);

				if (intersects.length > 0) {
					this.handleClick();
				}
			});
	}

	handleClick() {
		if (this.link) {
			window.open(this.link, '_blank');
		}
	}

	setBounciness(value: number) {
		this.animationController.setBounciness(value);
	}

	updateGooeyness() {
		this.sceneManager.updateGooeyness(this.gooeyness);
	}

	recreateTextBlobs() {
		this.sceneManager.createTextBlobs();
	}

	updateBlobColor(color: string) {
		this.sceneManager.updateBlobColor(color);
	}

	updateBackgroundColor(color: string) {
		this.sceneManager.updateBackgroundColor(color);
	}

	updateLightIntensity(intensity: number) {
		this.sceneManager.updateLightIntensity(intensity);
	}

	startAnimation() {
		const animate = () => {
			requestAnimationFrame(animate);
			if (this.isAnimating) {
				this.animationController.animateScene();
			}
			this.sceneManager
				.getRenderer()
				.render(this.sceneManager.getScene(), this.sceneManager.getCamera());
		};
		animate();
	}
}
