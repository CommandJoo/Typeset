import {TextFileView, TFile, WorkspaceLeaf} from "obsidian";
import Typeset, {VIEW_TYPE_LATEX, VIEW_TYPE_TYPST} from "../Typeset";
import {createRoot, Root} from "react-dom/client";
import {StrictMode} from "react";
import {TypeSettingRenderer} from "./TypeSettingEditor";
import {TypeSettingProvider} from "../util/TypeSettingContext";
import {StoreContext} from "../TypesetSettings";

export class LatexEditorView extends TextFileView {
	plugin: Typeset;
	root: Root | null = null;
	data: string = "";

	constructor(leaf: WorkspaceLeaf, plugin: Typeset) {
		super(leaf);
		this.plugin = plugin;
	}

	getDisplayText(): string {
		return this.file?.basename ?? "LaTeX Editor";
	}

	getViewData(): string {
		return this.data;
	}


	private renderReact(file: TFile | null) {
		this.root ??= createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<StoreContext.Provider value={this.plugin.settings}>
					<TypeSettingProvider
						key={file?.path ?? "none"}
						app={this.app}
						file={file}
						initialData={this.data}
						updateData={(s) => {
							this.data = s;
						}}
						save={async (s) => {
							this.data = s;
							await this.save(false);
						}}
					>
						<TypeSettingRenderer key={this.getViewType()} lang={"latex"}/>
					</TypeSettingProvider>
				</StoreContext.Provider>
			</StrictMode>
		);
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);   // reads the file, calls setViewData
		this.renderReact(file);
	}

	async onUnloadFile(file: TFile) {
		await super.onUnloadFile(file);
		this.renderReact(null);
	}

	setViewData(data: string, clear: boolean) {
		this.data = data;
		this.renderReact(this.file);
	}

	clear(): void {
		this.data = "";
	}

	getViewType(): string {
		return VIEW_TYPE_LATEX;
	}

	async onOpen() {
		this.root ??= createRoot(this.contentEl);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
	}
}

export class TypstEditorView extends TextFileView {
	plugin: Typeset;
	root: Root | null = null;
	data: string = "";

	constructor(leaf: WorkspaceLeaf, plugin: Typeset) {
		super(leaf);
		this.plugin = plugin;
	}

	getDisplayText(): string {
		return this.file?.basename ?? "Typst Editor";
	}

	getViewData(): string {
		return this.data;
	}


	private renderReact(file: TFile | null) {
		this.root ??= createRoot(this.contentEl);
		this.root.render(
			<StrictMode>
				<StoreContext.Provider value={this.plugin.settings}>
					<TypeSettingProvider
						key={file?.path ?? "none"}
						app={this.app}
						file={file}
						initialData={this.data}
						updateData={(s) => {
							this.data = s;
						}}
						save={async (s) => {
							this.data = s;
							await this.save(false);
						}}
					>
						<TypeSettingRenderer key={this.getViewType()} lang={"typst"}/>
					</TypeSettingProvider>
				</StoreContext.Provider>
			</StrictMode>
		);
	}

	async onLoadFile(file: TFile) {
		await super.onLoadFile(file);   // reads the file, calls setViewData
		this.renderReact(file);
	}

	async onUnloadFile(file: TFile) {
		await super.onUnloadFile(file);
		this.renderReact(null);
	}

	setViewData(data: string, clear: boolean) {
		this.data = data;
		this.renderReact(this.file);
	}

	clear(): void {
		this.data = "";
	}

	getViewType(): string {
		return VIEW_TYPE_TYPST;
	}

	async onOpen() {
		this.root ??= createRoot(this.contentEl);
	}

	async onClose() {
		this.root?.unmount();
		this.root = null;
	}
}
