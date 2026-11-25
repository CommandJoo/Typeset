import {ChangeEvent, useCallback, useEffect, useRef, useState} from "react";

import {EditorSelection} from "@codemirror/state";
import {useLatex} from "../util/TypeSettingContext";

import {
	LetterB,
	Italic,
	Underline,
	Code,
	Superscript,
	Subscript,
	Heading1,
	Heading2,
	Heading3,
	List, ListOrdered, Quote
} from 'lucide-react';

import {countPdfWords, pdfPath, renderPdfPages} from "../util/TypeSettingCompiler";
import {LatexEditor} from "./LatexEditor";
import {TypstEditor} from "./TypstEditor";

export function TypeSettingPreview({revision}: { revision: number }) {
	const {app, file} = useLatex();
	const containerRef = useRef<HTMLDivElement>(null);

	useEffect(() => {
		const container = containerRef.current;
		if (!container || !file) return;

		void renderPdfPages(app, pdfPath(file), container)
			.catch(console.error);
	}, [app, file, revision]);

	return <div ref={containerRef} className="typesetting-preview"/>;
}

export function TypeSettingRenderer({lang}: { lang: string }) {
	const [revision, setRevision] = useState(0);
	const {app, file, livePreview, setLivePreview, editor} = useLatex();

	const [wordcount, setWordcount] = useState(0);

	const wrapSelection = useCallback((before: string, after: string) => {
		if (!editor) return;

		editor.dispatch(
			editor.state.changeByRange((range) => {
				const selected = editor.state.sliceDoc(range.from, range.to);
				return {
					changes: {from: range.from, to: range.to, insert: before + selected + after},
					range: EditorSelection.range(
						range.from + before.length,
						range.from + before.length + selected.length,
					),
				};
			}),
			{userEvent: "input", scrollIntoView: true},
		);
		editor.focus();
	}, [editor]);

	useEffect(() => {
		async function load() {
			if(!file) return;
			setWordcount(await countPdfWords(app, pdfPath(file)));
		}
		void load();
	}, [file, revision]);

	return <div key={lang} className={"typesetting-workspace"}>
		<div className={"typesetting-workspace-toolbar"} onMouseDown={(e) => e.preventDefault()}>
			<div className={"toolbar-editor"}>
				{lang === "latex" ? <>
					<div className={"tools"}>
						<button onClick={() => {
							wrapSelection("\\textbf{", "}");

						}}><LetterB/></button>
						<button onClick={() => {
							wrapSelection("\\textit{", "}");

						}}><Italic/></button>
						<button onClick={() => {
							wrapSelection("\\underline{", "}");

						}}><Underline/></button>
						<button onClick={() => {
							wrapSelection("\\begin{verbatim}\n", "\n\\end{verbatim}");

						}}><Code/></button>

						<button onClick={() => {
							wrapSelection("\\textsuperscript{", "}");

						}}><Superscript/></button>
						<button onClick={() => {
							wrapSelection("\\textsubscript{", "}");

						}}><Subscript/></button>

						<hr/>

						<button onClick={() => {
							wrapSelection("\\section{", "}");

						}}><Heading1/></button>

						<button onClick={() => {
							wrapSelection("\\subsection{", "}");

						}}><Heading2/></button>

						<button onClick={() => {
							wrapSelection("\\subsubsection{", "}");

						}}><Heading3/></button>

						<hr/>

						<button onClick={() => {
							wrapSelection("\\begin{itemize}\n\\item", "\n\\end{itemize}");

						}}><List/></button>

						<button onClick={() => {
							wrapSelection("\\begin{enumerate}\n\\item", "\n\\end{enumerate}");

						}}><ListOrdered/></button>

						<button onClick={() => {
							wrapSelection("\\begin{quote}\n", "\n\\end{quote}");

						}}><Quote/></button>
					</div>
					<div className={"word-count"}>
						{wordcount} Words
					</div>
				</> : ""}
				{lang === "typst" ? <>
					<div className={"tools"}>
						<button onClick={() => {
							wrapSelection("*", "*");

						}}><LetterB/></button>
						<button onClick={() => {
							wrapSelection("_", "_");

						}}><Italic/></button>
						<button onClick={() => {
							wrapSelection("#underline[", "]");

						}}><Underline/></button>
						<button onClick={() => {
							wrapSelection("```", "\n```");

						}}><Code/></button>

						<button onClick={() => {
							wrapSelection("#super[", "]");

						}}><Superscript/></button>
						<button onClick={() => {
							wrapSelection("#sub[", "]");

						}}><Subscript/></button>

						<hr/>

						<button onClick={() => {
							wrapSelection("= ", "");

						}}><Heading1/></button>

						<button onClick={() => {
							wrapSelection("== ", "");

						}}><Heading2/></button>

						<button onClick={() => {
							wrapSelection("=== ", "");

						}}><Heading3/></button>

						<hr/>

						<button onClick={() => {
							wrapSelection("- ", "");

						}}><List/></button>

						<button onClick={() => {
							wrapSelection("+ ", "");

						}}><ListOrdered/></button>

						<button onClick={() => {
							wrapSelection("#quote[", "]");

						}}><Quote/></button>
					</div>
					<div className={"word-count"}>
						{wordcount} Words
					</div>
				</> : ""}
			</div>
			<div className={"toolbar-preview"}>
				<div className={"setting"}><input type={"checkbox"} onChange={(e: ChangeEvent<HTMLInputElement>) => {
					setLivePreview(e.target.checked);
				}} checked={livePreview}/><span>Live Preview</span></div>

			</div>
		</div>
		<div className={"typesetting-workspace-main"}>
			<div className={"typesetting-editor-panel"}>
				{lang === "latex" ?
					<LatexEditor onCompiled={() => setRevision(v => v + 1)}/> : ""
				}
				{lang === "typst" ?
					<TypstEditor onCompiled={() => setRevision(v => v + 1)}/> : ""
				}
			</div>
			<div className={"typesetting-preview-panel"}>
				<TypeSettingPreview revision={revision}/>
			</div>
		</div>
	</div>
}
