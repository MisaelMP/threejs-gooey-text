import { SceneManager } from './SceneManager';
import { createNoise3D } from 'simplex-noise';
import * as THREE from 'three';

export class AnimationController {
	private sceneManager: SceneManager;
	private gravity = 9.8;
	private dampingFactor = 0.85;
	private floorLevel!: number; // ✅ Dynamically get floor level
	private topBoundary = 10;
	private timeStep = 0.016;
	private velocity = 0;
	private lastBounceSpeed = 0;
	private isBouncing = false;

	constructor(sceneManager: SceneManager) {
		this.sceneManager = sceneManager;
		this.updateScreenBoundaries();
		this.floorLevel = this.sceneManager.getFloorLevel(); // ✅ Get the correct floor position

		window.addEventListener('resize', () => {
			this.updateScreenBoundaries();
			this.floorLevel = this.sceneManager.getFloorLevel(); // ✅ Update floor on resize
		});
	}

	private updateScreenBoundaries() {
		const camera = this.sceneManager.getCamera();
		const fovRadians = (camera.fov * Math.PI) / 180;
		this.topBoundary = Math.tan(fovRadians / 2) * camera.position.z * 2 - 2;
	}

	animateScene(isAnimating: boolean, gooeyness: number, bounceSpeed: number) {
		if (!isAnimating) return;
		this.applyBouncePhysics(bounceSpeed || this.lastBounceSpeed);
	}

	private applyBouncePhysics(bounceSpeed: number) {
		this.sceneManager.getScene().children.forEach((blob) => {
			if (blob instanceof THREE.Mesh) {
				this.animateBlob(blob, bounceSpeed);
			}
		});
	}

	private animateBlob(blob: THREE.Mesh, bounceSpeed: number) {
		const position = blob.position;

		// ✅ **Ensure it starts suspended above the floor**
		if (!this.isBouncing) {
			position.y = this.floorLevel + 3; // ✅ Floating above the floor at start
			return;
		}

		// ✅ **Apply Gravity & Update Velocity**
		this.velocity -= this.gravity * this.timeStep * bounceSpeed;
		position.y += this.velocity * this.timeStep;

		// ✅ **Bounce on the Floor (Fixed)**
		if (position.y <= this.floorLevel) {
			position.y = this.floorLevel; // ✅ Ensures it doesn't go below the floor
			this.velocity *= -this.dampingFactor;

			// ✅ **Fix: Ensure continuous bouncing**
			if (Math.abs(this.velocity) < 1) {
				this.velocity = Math.sqrt(this.lastBounceSpeed * 2 * this.gravity);
			}

			// ✅ **Squish Effect**
			blob.scale.y = 1 - bounceSpeed * 0.3;
			blob.scale.x = 1 + bounceSpeed * 0.2;
		}

		// ✅ **Bounce Off the Top Boundary**
		if (position.y >= this.topBoundary) {
			position.y = this.topBoundary;
			this.velocity *= -this.dampingFactor;
		}

		// ✅ **Restore Normal Shape Gradually**
		blob.scale.y += (1 - blob.scale.y) * 0.2;
		blob.scale.x += (1 - blob.scale.x) * 0.2;
	}

	// ✅ **Start Bouncing When `bounceSpeed > 0`**
	setBounciness(value: number) {
		if (value > 0) {
			this.isBouncing = true;
			this.velocity = Math.sqrt(value * 2 * this.gravity);
		}
		this.lastBounceSpeed = value;
	}
}
