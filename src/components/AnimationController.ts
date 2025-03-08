import { SceneManager } from './SceneManager';
import * as CANNON from 'cannon-es';
import * as THREE from 'three';

export class AnimationController {
	private sceneManager: SceneManager;
	private maxHeight: number; // 🔥 Store max height

	constructor(sceneManager: SceneManager) {
		this.sceneManager = sceneManager;
		this.maxHeight = window.innerHeight / 50; // 🔥 Convert pixels to world units
	}

	animateScene() {
		const world = this.sceneManager.getPhysicsWorld();
		if (!world) return;

		world.step(1 / 60);

		const parent = this.sceneManager.parent;
		if (!parent.isAnimating) return;

		const textBlobs = this.sceneManager.getTextBlobs();
		const gooeyness = parent.gooeyness;
		const bounciness = parent.bounceSpeed;
		const floorLevel = this.sceneManager.getFloorLevel();

		textBlobs.forEach(({ mesh, body }) => {
			if (mesh instanceof THREE.Mesh && body instanceof CANNON.Body) {
				mesh.position.set(body.position.x, body.position.y, body.position.z);

				// ✅ **Ensure object can fall**
				if (bounciness === 0) {
					body.allowSleep = true;
					return;
				} else {
					body.allowSleep = false;
					body.wakeUp();
				}

				// ✅ **If floating, apply natural gravity**
				if (mesh.position.y > floorLevel + 1) {
					body.velocity.y -= 0.1; // 🔥 More natural gravity
				}

				// ✅ **Flatten the text on impact**
				if (mesh.position.y <= floorLevel + 1.5 && body.velocity.y < 1) {
					const impactForce = Math.max(0.3, Math.abs(body.velocity.y) + 0.8);

					// ✅ **Scale deformation based on impact force**
					let flattenFactor = Math.min(impactForce * 0.15, 0.5); // 🔥 More balanced squash
					mesh.scale.y = Math.max(0.3, 1 - flattenFactor);
					mesh.scale.x = 1 + flattenFactor * 0.4;
					mesh.scale.z = 1 + flattenFactor * 0.4;

					// ✅ **Bounce AFTER squishing (controlled force)**
					body.velocity.y = Math.min(
						impactForce * (bounciness + 0.8), // Bounce force
						this.maxHeight - floorLevel // 🔥 Prevent exceeding screen height
					);
				} else {
					// ✅ **Faster recovery to normal shape**
					const recoverySpeed = 0.3; // 🔥 Adjusted return speed
					mesh.scale.y += (1 - mesh.scale.y) * recoverySpeed;
					mesh.scale.x += (1 - mesh.scale.x) * recoverySpeed;
					mesh.scale.z += (1 - mesh.scale.z) * recoverySpeed;
				}

				// ✅ **Gooeyness effect: Wobble animation**
				if (gooeyness > 0) {
					const wobble = Math.sin(Date.now() * 0.005) * gooeyness * 0.3;
					mesh.scale.y += wobble;
					mesh.scale.x -= wobble * 0.5;
				}
			}
		});
	}

	// ✅ **Ensure GUI can properly set bounce effect**
	setBounciness(value: number) {
		const textBlobs = this.sceneManager.getTextBlobs();
		textBlobs.forEach(({ body }) => {
			if (body.material) {
				body.material.restitution = value;
			}
			// 🔥 Prevent bouncing too high
			body.velocity.y = Math.min(
				Math.max(value * 2.5, 1), // Normal bounce calculation
				this.maxHeight - this.sceneManager.getFloorLevel() // 🔥 Keep inside screen
			);
		});
	}
}
