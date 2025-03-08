import { LitElement, html, css } from 'lit';
import { customElement, property } from 'lit/decorators.js';
import { SceneManager } from './components/SceneManager';
import { AnimationController } from './components/AnimationController';
import { GUIController } from './components/GUIController';

@customElement('gooey-text')
export class GooeyText extends LitElement {
	static styles = css`
		:host {
			display: block;
			width: 100%;
			height: 100vh;
			position: relative;
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

	public sceneManager!: SceneManager;
	private animationController!: AnimationController;
	private guiController!: GUIController | null = null;

	firstUpdated() {
		this.sceneManager = new SceneManager(this);
		this.sceneManager.initScene();
		this.animationController = new AnimationController(this.sceneManager);
		this.guiController = new GUIController(this);
		this.startAnimation();
	}

	setBounciness(value: number) {
		this.animationController.setBounciness(value);
	}

	// ✅ Updates gooeyness dynamically
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
