import * as THREE from 'three';

export class ShaderMaterialFactory {
	static createBlobMaterial(color: string): THREE.ShaderMaterial {
		return new THREE.ShaderMaterial({
			uniforms: {
				u_time: { value: 0.0 },
				u_amplitude: { value: 1.0 },
				u_color: { value: new THREE.Color(color) },
				u_bounceEffect: { value: 0.0 }, // Added: Bounciness uniform
				u_gooeyEffect: { value: 0.0 }, // Added: Gooeyness uniform
			},
			vertexShader: `
        uniform float u_time;
        uniform float u_gooeyEffect;
        varying vec3 vNormal;

        void main() {
          vNormal = normalize(normalMatrix * normal);
          vec3 pos = position;

          // Improved noise function for smoother gooey effect
          float wobble = sin(u_time * 5.0 + position.y * 0.2) * 0.2 * u_gooeyEffect;
          pos.x += wobble;
          pos.y += wobble * 1.2;
          pos.z += wobble * 0.8;

          gl_Position = projectionMatrix * modelViewMatrix * vec4(pos, 1.0);
        }
`,

			fragmentShader: `
        uniform vec3 u_color;
        varying vec3 vNormal;

        void main() {
          vec3 light = normalize(vec3(0.5, 1.8, 0.75));
          float intensity = max(dot(vNormal, light), 0.3);
          gl_FragColor = vec4(u_color * intensity, 1.0);
        }
      `,
		});
	}
}
