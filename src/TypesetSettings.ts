import {App, PluginSettingTab, SettingDefinitionItem} from 'obsidian';
import Typeset from './Typeset';
import {createContext, useContext, useSyncExternalStore} from "react";

export interface TypesetSettings {
	livePreview: boolean;
	lineWrapping: boolean;

	latexCompilerBin: string;
	typstCompilerBin: string;
	debounceTime: number;
}

export const DEFAULT_SETTINGS: TypesetSettings = {
	livePreview: true,
	lineWrapping: true,

	latexCompilerBin: 'pdflatex',
	typstCompilerBin: 'typst',
	debounceTime: 300,
};

export class ConfigStore<T> {
	private listeners = new Set<() => void>();

	constructor(private value: T) {
	}

	subscribe = (cb: () => void) => {
		this.listeners.add(cb);
		return () => this.listeners.delete(cb);
	};

	get = () => this.value;

	set(next: T) {
		this.value = next;
		this.listeners.forEach(cb => cb());
	}
}

export const StoreContext = createContext<ConfigStore<TypesetSettings>>(null!);

export function useSettings() {
	const store = useContext(StoreContext);
	return useSyncExternalStore(store.subscribe, store.get);
}

export class TypesetSettingsTab extends PluginSettingTab {
	plugin: Typeset;

	constructor(app: App, plugin: Typeset) {
		super(app, plugin);
		this.plugin = plugin;
	}

	getSettingDefinitions(): SettingDefinitionItem[] {
		return [
			{
				"type": "group",
				"heading": "Preview Settings",
				"items": [
					{
						"name": "Live Preview",
						"desc": "Sets the standard value of live preview mode if enabled it will always automatically rerender the generated file after writing in it.",
						"control": {
							"key": "livePreview",
							"type": "toggle",
							"defaultValue": true,
						}
					},
					{
						"name": "Line Wrapping",
						"desc": "If lines are so long they would overflow and require scrolling wrap them onto the next line.",
						"control": {
							"key": "lineWrapping",
							"type": "toggle",
							"defaultValue": true,
						}
					}
				]
			},
			{
				"type": "list",
				"heading": "Compiler Settings",
				"items": [
					{
						"name": "LaTeX Compiler Binary",
						"desc": "Path to the binary file of the LaTeX compiler you want to use",
						"control": {
							"key": "latexCompilerBin",
							"type": "text",
							"defaultValue": "pdflatex"
						}
					},
					{
						"name": "Typst Compiler Binary",
						"desc": "Path to the binary file of the Typst compiler you want to use",
						"control": {
							"key": "typstCompilerBin",
							"type": "text",
							"defaultValue": "typst"
						}
					},
					{
						"name": "Debounce Time",
						"desc": "Time in milliseconds you need after typing to wait before your LaTeX gets recompiled.",
						"control": {
							"key": "debounceTime",
							"type": "slider",
							"min": 100,
							"max": 5000,
							"step": 5,
							"defaultValue": 300,
						}
					}
				]
			}
		]
	}


	getControlValue<K extends keyof TypesetSettings>(key: K): TypesetSettings[K] {
		return this.plugin.settings.get()[key];
	}

	async setControlValue(key: string, value: unknown): Promise<void> {
		await this.plugin.updateSettings({[key]: value});
	}

}
