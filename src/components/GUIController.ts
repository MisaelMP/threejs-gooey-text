import * as dat from 'dat.gui';
import { GooeyText } from '../GooeyText';

export class GUIController {
	private static gui: dat.GUI | null = null;
	private parent: GooeyText;

	constructor(parent: GooeyText) {
		if (!(parent instanceof GooeyText)) {
			throw new Error(
				'GUIController expected a GooeyText instance but received something else.'
			);
		}

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
				this.parent.setBounciness(value);
			});

		GUIController.gui!.add(this.parent, 'gooeyness', 0, 1, 0.05)
			.name('Gooeyness')
			.onChange(() => {
				this.parent.updateGooeyness();
			});

		GUIController.gui!.addColor(this.parent, 'blobColor')
			.name('Blob Color')
			.onChange((color) => {
				this.parent.updateBlobColor(color);
			});

		GUIController.gui!.addColor(this.parent, 'backgroundColor')
			.name('Background')
			.onChange((color) => {
				this.parent.updateBackgroundColor(color);
			});

		GUIController.gui!.add(this.parent, 'text')
			.name('Text')
			.onChange(() => {
				this.parent.recreateTextBlobs();
			});

		GUIController.gui!.add(this.parent, 'lightIntensity', 0, 5, 0.1)
			.name('Light Intensity')
			.onChange((intensity) => {
				this.parent.updateLightIntensity(intensity);
			});
	}

	private forceUpdate() {
		this.parent.requestUpdate();
	}
}
