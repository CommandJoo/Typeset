import {App, normalizePath, TFile} from "obsidian";
import {execFile} from "child_process";
import path from "path"

import * as pdfjsLib from "pdfjs-dist/legacy/build/pdf.mjs";
import "pdfjs-dist/legacy/build/pdf.worker.mjs";

export async function countPdfWords(
	app: App,
	pdfPath: string,
) {
	const data = new Uint8Array(
		await app.vault.adapter.readBinary(pdfPath)
	);

	const loadingTask = pdfjsLib.getDocument({ data });

	let words = 0;
	try {
		const doc = await loadingTask.promise;
		for (let i = 1; i <= doc.numPages; i++) {
			const page = await doc.getPage(i);
			const { items } = await page.getTextContent();
			let text = items.map((it) => ('str' in it ? it.str + (it.hasEOL ? '\n' : ' ') : '')).join('');
			words += text
				.split(/\s+/)
				.map((t) => t.replace(/^[^\p{L}\p{N}]+|[^\p{L}\p{N}]+$/gu, ''))
				.filter(Boolean).length;
		}
	} finally {
		await loadingTask.destroy();
	}
	return words;
}

export async function renderPdfPages(
	app: App,
	pdfPath: string,
	container: HTMLElement
) {
	const data = new Uint8Array(
		await app.vault.adapter.readBinary(pdfPath)
	);

	const loadingTask = pdfjsLib.getDocument({ data });

	try {
		const pdf = await loadingTask.promise;
		const pixelRatio = window.devicePixelRatio || 1;

		const renderedPages = createFragment();
		const scrollContainer =
			container.closest<HTMLElement>(".latex-preview-panel");

		const previousScrollTop = scrollContainer?.scrollTop ?? 0;

		for (let i = 1; i <= pdf.numPages; i++) {
			const page = await pdf.getPage(i);

			const baseViewport = page.getViewport({ scale: 1 });
			const scale = container.clientWidth / baseViewport.width;
			const viewport = page.getViewport({ scale });

			const canvas = createEl("canvas");
			const context = canvas.getContext("2d");

			if (!context) continue;

			canvas.width = Math.floor(viewport.width * pixelRatio);
			canvas.height = Math.floor(viewport.height * pixelRatio);

			renderedPages.appendChild(canvas);

			await page.render({
				canvas,
				canvasContext: context,
				viewport: page.getViewport({
					scale: scale * pixelRatio
				})
			}).promise;
		}

		// Replace the old preview only after all pages are ready.
		container.replaceChildren(renderedPages);

		if (scrollContainer) {
			scrollContainer.scrollTop = previousScrollTop;
		}
	} finally {
		await loadingTask.destroy();
	}
}

export function pdfPath(file: TFile) {
	return path.join(outputDir(file), `${file.basename}.pdf`);
}

export function outputDir(file: TFile) {
	const parent = file.parent;
	const parentPath = parent && !parent.isRoot() ? parent.path : "";

	return normalizePath(
		parentPath ? `${parentPath}/${file.basename}` : file.basename
	);
}

export async function makeOutputDir(app: App, file: TFile): Promise<string> {
	const outputPath = outputDir(file);
	if (app.vault.getAbstractFileByPath(outputPath)) return outputPath;

	await app.vault.createFolder(outputPath);

	return outputPath;
}

export async function compileLatex(app: App, file: TFile, compiler: {compilerBin: string}) {
	const vaultPath = (app.vault.adapter as unknown as {
		getBasePath: () => string
	}).getBasePath();

	const dir = await makeOutputDir(app, file);

	const absDir = path.join(vaultPath, dir);
	const absFile = path.join(vaultPath, file.path);

	await new Promise<void>((resolve, reject) => {
		execFile(
			compiler.compilerBin,
			[
				"-interaction=nonstopmode",
				"-file-line-error",
				"-halt-on-error",
				"-output-directory",
				absDir,
				absFile,
			],
			(error, stdout, stderr) => {
				if (error) {
					reject(new Error(stderr || stdout || error.message));
					return;
				}

				resolve();
			}
		);
	});
}

export async function compileTypst(app: App, file: TFile, compiler: {compilerBin: string}) {
	const vaultPath = (app.vault.adapter as unknown as {
		getBasePath: () => string
	}).getBasePath();

	const dir = await makeOutputDir(app, file);

	const absDir = path.join(vaultPath, dir);
	const absFile = path.join(vaultPath, file.path);

	await new Promise<void>((resolve, reject) => {
		execFile(
			compiler.compilerBin,
			[
				"compile",
				absFile,
				path.join(absDir, file.basename+".pdf")
			],
			(error, stdout, stderr) => {
				if (error) {
					reject(new Error(stderr || stdout || error.message));
					return;
				}

				resolve();
			}
		);
	});
}

