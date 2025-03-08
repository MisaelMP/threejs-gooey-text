import * as THREE from 'three';
import * as CANNON from 'cannon-es';
import { TextGeometry } from 'three/examples/jsm/geometries/TextGeometry.js';
import { GooeyText } from '../GooeyText';
import { Font } from 'three/examples/jsm/loaders/FontLoader.js';

export class TextBlob {
	static createText(
		font: Font,
		parent: GooeyText
	): { mesh: THREE.Mesh; body: CANNON.Body }[] {
		const text = parent.text || 'Gooey';
		const textBlobs: { mesh: THREE.Mesh; body: CANNON.Body }[] = [];

		const envMapLoader = new THREE.CubeTextureLoader();
		const envMap = envMapLoader.load([
			'https://threejs.org/examples/textures/cube/pisa/px.png',
			'https://threejs.org/examples/textures/cube/pisa/nx.png',
			'https://threejs.org/examples/textures/cube/pisa/py.png',
			'https://threejs.org/examples/textures/cube/pisa/ny.png',
			'https://threejs.org/examples/textures/cube/pisa/pz.png',
			'https://threejs.org/examples/textures/cube/pisa/nz.png',
		]);

		const material = new THREE.MeshPhysicalMaterial({
			color: new THREE.Color(parent.blobColor),
			metalness: 1.0,
			roughness: 0.02,
			transmission: 0.9,
			clearcoat: 1.0,
			clearcoatRoughness: 0.02,
			reflectivity: 1.0,
			envMap: envMap,
			envMapIntensity: 3.5,
		});

		const wordGeometry = new TextGeometry(text, {
			font: font,
			size: 3,
			depth: 2,
			bevelEnabled: true,
			bevelThickness: 0.5,
			bevelSize: 0.3,
			bevelSegments: 10,
			curveSegments: 24,
		});
		wordGeometry.computeBoundingBox();
		const wordMesh = new THREE.Mesh(wordGeometry, material);
		wordMesh.castShadow = true;

		//  Center text properly
		const textWidth = wordGeometry.boundingBox?.max.x ?? 0;
		wordMesh.position.set(-textWidth / 2, 10, 0);

		const floorLevel = parent.sceneManager.getFloorLevel(); 

		//  Place above the floor INITIALLY but allow physics to move it after
		const body = new CANNON.Body({
			mass: 1,
			shape: new CANNON.Box(new CANNON.Vec3(textWidth / 2, 1.5, 1)),

			//   Set initial position but allow gravity to take over 
			position: new CANNON.Vec3(
				wordMesh.position.x,
				floorLevel + 5, //  Start slightly above the floor
				0
			),

			material: new CANNON.Material({ restitution: parent.bounceSpeed }),
		});

		// Ensure gravity works properly 
		body.velocity.set(0, -5, 0); //  Starts falling
		setTimeout(() => (body.allowSleep = true), 1000); //  Prevents it from staying in the air

		body.linearDamping = 0.3;
		body.angularDamping = 0.3;

		textBlobs.push({ mesh: wordMesh, body });

		return textBlobs;
	}
}
