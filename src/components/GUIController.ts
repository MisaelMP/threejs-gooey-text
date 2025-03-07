import * as dat from 'dat.gui';
import { GooeyText } from '../GooeyText';

export class GUIController {
	private static gui: dat.GUI | null = null;
	private parent: GooeyText;

	constructor(parent: GooeyText) {
		this.parent = parent;

		// Ensure only one GUI instance exists
		if (GUIController.gui) {
			GUIController.gui.destroy();
		}

		GUIController.gui = new dat.GUI();
		this.initControls();
	}

	private initControls() {
		GUIController.gui!.add(this.parent, 'isAnimating')
			.name('Animate')
			.onChange(() => this.forceUpdate());

	GUIController.gui!.add(this.parent, 'bounceSpeed', 0, 5, 0.1)
		.name('Bounce Speed')
		.onChange((value) => {
			this.parent.setBounciness(value); // ✅ Keep applying gravity even after dragging
		});

		GUIController.gui!.add(this.parent, 'gooeyness', 0, 1, 0.05)
			.name('Gooeyness')
			.onChange(() => this.forceUpdate());

		GUIController.gui!.addColor(this.parent, 'blobColor')
			.name('Blob Color')
			.onChange(() => this.forceUpdate());

		GUIController.gui!.addColor(this.parent, 'backgroundColor')
			.name('Background')
			.onChange(() => this.forceUpdate());

		GUIController.gui!.add(this.parent, 'text')
			.name('Text')
			.onChange(() => this.forceUpdate());

		GUIController.gui!.add(this.parent, 'lightIntensity', 0, 5, 0.1)
			.name('Light Intensity')
			.onChange(() => this.forceUpdate());
	}

	// Forces an update in `GooeyText.ts`
	private forceUpdate() {
		this.parent.requestUpdate();
	}
}
