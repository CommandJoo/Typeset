import {
	Plugin,
} from 'obsidian';
import {
	ConfigStore,
	DEFAULT_SETTINGS,
	TypesetSettings, TypesetSettingsTab,
} from './TypesetSettings';
import {LatexEditorView, TypstEditorView} from "./ui/TypeSettingEditorView";
import path from "path";

export const VIEW_TYPE_LATEX: string = "latex-view";
export const VIEW_TYPE_TYPST: string = "typst-view";

export default class Typeset extends Plugin {
	settings!: ConfigStore<TypesetSettings>;

	async onload() {
		await this.loadSettings();

		this.addCommand({
			id: 'create-tex-file',
			name: 'Create a .tex file',
			callback: () => {
				void this.app.vault.create(path.join(this.app.workspace.getActiveFile()?.parent?.path ?? "", "main.tex").toString(), "")
			},
		});

		this.addCommand({
			id: 'create-typ-file',
			name: 'Create a .typ file',
			callback: () => {
				void this.app.vault.create(path.join(this.app.workspace.getActiveFile()?.parent?.path ?? "", "main.typ").toString(), "")
			},
		});

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

	loadData(): Promise<TypesetSettings> {
		return super.loadData();
	}


	async loadSettings() {
		this.settings = new ConfigStore<TypesetSettings>(Object.assign({}, DEFAULT_SETTINGS, await this.loadData()));
		this.addSettingTab(new TypesetSettingsTab(this.app, this));
	}

	async updateSettings(patch: Partial<TypesetSettings>) {
		const next = {...this.settings.get(), ...patch};
		this.settings.set(next);
		await this.saveData(next);
	}
}
