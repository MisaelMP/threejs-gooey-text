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
	@property({ type: Boolean }) isAnimating = true; // Fixed: Used correctly
	@property({ type: Number }) gooeyness = 0.1;
	@property({ type: Number }) bounceSpeed = 0.1;
	@property({ type: String }) blobColor = '#ff69b4';
	@property({ type: String }) backgroundColor = '#111';
	@property({ type: Number }) lightIntensity = 2.5;

	private sceneManager!: SceneManager;
	private animationController!: AnimationController;
	private guiController!: GUIController | null = null;
	private animationFrameId!: number; // Fix: Ensure animation loop is controlled

	firstUpdated() {
		this.sceneManager = new SceneManager(this);
		this.sceneManager.initScene();

		this.animationController = new AnimationController(this.sceneManager);

		// Prevent multiple GUI initializations
		if (!this.guiController) {
			this.guiController = new GUIController(this);
		}

		this.startAnimation();
	}

	setBounciness(value: number) {
		if (this.animationController) {
			this.animationController.setBounciness(value);
		}
	}

	startAnimation() {
		const animate = () => {
			this.animationFrameId = requestAnimationFrame(animate); // Store frame ID
			if (this.isAnimating) {
				this.animationController.animateScene(
					this.isAnimating,
					this.gooeyness,
					this.bounceSpeed
				);
			}
			this.sceneManager
				.getRenderer()
				.render(this.sceneManager.getScene(), this.sceneManager.getCamera());
		};
		animate();
	}

	updated(changedProperties: Map<string, any>) {
		// If animation state changes, restart animation
		if (changedProperties.has('isAnimating')) {
			if (this.isAnimating) {
				this.startAnimation();
			} else {
				cancelAnimationFrame(this.animationFrameId); // Stop animation if toggled off
			}
		}

		if (changedProperties.has('text') || changedProperties.has('gooeyness')) {
			this.sceneManager.createTextBlobs(); // Ensures previous text is removed
		}
		if (changedProperties.has('blobColor')) {
			this.sceneManager.updateBlobColor(this.blobColor);
		}
		if (changedProperties.has('backgroundColor')) {
			this.sceneManager.updateBackgroundColor(this.backgroundColor);
		}
		if (
			changedProperties.has('gooeyness') ||
			changedProperties.has('bounceSpeed')
		) {
			this.animationController.animateScene(
				this.isAnimating,
				this.gooeyness,
				this.bounceSpeed
			);
		}
		if (changedProperties.has('lightIntensity')) {
			this.sceneManager.updateLightIntensity(this.lightIntensity);
		}
	}
}
