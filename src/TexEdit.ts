import {
	Plugin,
} from 'obsidian';
import {
	ConfigStore,
	DEFAULT_SETTINGS,
	TexEditSettings, TexEditSettingsTab,
} from './TexEditSettings';
import {LatexEditorView, TypstEditorView} from "./ui/TypeSettingEditorView";

export const VIEW_TYPE_LATEX: string = "latex-view";
export const VIEW_TYPE_TYPST: string = "typst-view";

export default class TexEdit extends Plugin {
	settings!: ConfigStore<TexEditSettings>;

	async onload() {
		await this.loadSettings();
		this.registerExtensions(["tex"], VIEW_TYPE_LATEX);
		this.registerExtensions(["typ"], VIEW_TYPE_TYPST);
		this.registerView(
			VIEW_TYPE_LATEX,
			(leaf) => new LatexEditorView(leaf, this)
		);
		this.registerView(
			VIEW_TYPE_TYPST,
			(leaf) => new TypstEditorView(leaf, this)
		);
	}

	loadData(): Promise<TexEditSettings> {
		return super.loadData();
	}


	async loadSettings() {
		this.settings = new ConfigStore<TexEditSettings>(Object.assign({}, DEFAULT_SETTINGS, await this.loadData()));
		this.addSettingTab(new TexEditSettingsTab(this.app, this));
	}

	async updateSettings(patch: Partial<TexEditSettings>) {
		const next = {...this.settings.get(), ...patch};
		this.settings.set(next);
		await this.saveData(next);
	}
}
