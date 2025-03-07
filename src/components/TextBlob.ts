import * as THREE from 'three';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GooeyText } from '../GooeyText';
import { Font  } from 'three/examples/jsm/loaders/FontLoader.js';

export class TextBlob {
	static createText(font: Font, parent: GooeyText): THREE.Mesh[] {
		//  Load an environment map for realistic chrome reflections
		const envMapLoader = new THREE.CubeTextureLoader();
		const envMap = envMapLoader.load([
			'https://threejs.org/examples/textures/cube/pisa/px.png',
			'https://threejs.org/examples/textures/cube/pisa/nx.png',
			'https://threejs.org/examples/textures/cube/pisa/py.png',
			'https://threejs.org/examples/textures/cube/pisa/ny.png',
			'https://threejs.org/examples/textures/cube/pisa/pz.png',
			'https://threejs.org/examples/textures/cube/pisa/nz.png',
		]);

		// Apply an improved liquid metallic material
		const material = new THREE.MeshPhysicalMaterial({
			color: new THREE.Color(parent.blobColor),
			metalness: 1.0,
			roughness: 0.02,
			transmission: 0.9, // Slight transparency
			clearcoat: 1.0,
			clearcoatRoughness: 0.02,
			reflectivity: 1.0,
			envMap: envMap,
			envMapIntensity: 2.5, // Boosted reflections
		});

		const textArray = parent.text.split('');
		const baseSize = 3;
		const sizeMultiplier = 1 + parent.gooeyness * 0.5;
		const adjustedSize = baseSize * sizeMultiplier;
		const textBlobs: THREE.Mesh[] = [];

		// Compute total width dynamically
		let totalWidth = 0;
		const letterMeshes: { mesh: THREE.Mesh; width: number }[] = [];

		// Create letters and compute their width for proper spacing
		textArray.forEach((char) => {
			const letterGeometry = new TextGeometry(char, {
				font: font,
				size: adjustedSize,
				depth: 1.5 + parent.gooeyness * 1.5,
				bevelEnabled: true,
				bevelThickness: 0.3 + parent.gooeyness * 0.8,
				bevelSize: 0.2 + parent.gooeyness * 0.4,
				bevelSegments: 10,
				curveSegments: 24,
			});

			// Compute bounding box width for precise spacing
			letterGeometry.computeBoundingBox();
			const width =
				(letterGeometry.boundingBox?.max.x || 0) -
				(letterGeometry.boundingBox?.min.x || 0);

			const letterBlob = new THREE.Mesh(letterGeometry, material);
			letterBlob.castShadow = true;

			letterMeshes.push({ mesh: letterBlob, width });
			totalWidth += width;
		});

		// Adjust spacing dynamically for a **balanced look**
		const spacingFactor = 0.85; // 🔥 Slightly more space than before
		let currentX = -totalWidth / 2;

		// Apply proper spacing
		letterMeshes.forEach(({ mesh, width }, i) => {
			mesh.position.x = currentX;
			currentX += width * spacingFactor; // 🔥 Keeps letters evenly spaced
			textBlobs.push(mesh);
		});

		//  Apply bounce and squish effect
		textBlobs.forEach((blob) => {
			blob.userData.bounceSpeed = parent.bounceSpeed * 2; // 🔥 Increased bounce strength
			blob.userData.squishEffect = parent.gooeyness * 0.5; // 🔥 More noticeable squish
		});

		return textBlobs;
	}
}
