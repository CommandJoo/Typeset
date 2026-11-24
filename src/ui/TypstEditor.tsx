import {EditorView, keymap} from "@codemirror/view";
import {Compartment, EditorState} from "@codemirror/state";
import {closeBrackets} from "@codemirror/autocomplete";
import {
	bracketMatching,
	HighlightStyle,
	syntaxHighlighting,
} from "@codemirror/language";

import {search, searchKeymap, openSearchPanel} from "@codemirror/search"
import {history} from "@codemirror/commands"
import {autocompletion} from "@codemirror/autocomplete"
import {tags} from "@lezer/highlight";
import {useLatex} from "../util/TypeSettingContext";
import {compileTypst} from "../util/TypeSettingCompiler";
import {typst_lezer} from "codemirror-lang-typst/lezer"
import {useCallback, useEffect, useRef} from "react";
import {useSettings} from "../TexEditSettings";

export function TypstEditor({onCompiled}: { onCompiled: () => void }) {
	const containerRef = useRef<HTMLDivElement>(null);
	const {app, livePreview, file, source, onChange, save, setEditor, editor} = useLatex();
	const settings = useSettings();

	const linewrappingCompartment = useRef(new Compartment()).current;
	const fontSizeCompartment = useRef(new Compartment()).current;

	const timeoutRef = useRef<number |null>(null);
	const latestValueRef = useRef(source);
	latestValueRef.current = source;
	const livePreviewRef = useRef(livePreview);
	livePreviewRef.current = livePreview;
	const handleChangeRef = useRef<(value: string) => void>(() => {
	});

	const flushSave = async () => {
		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
			timeoutRef.current = null;
		}

		if (!file) return;

		try {
			const value = latestValueRef.current;

			await save(value);
			if (livePreviewRef.current) {
				await compileTypst(app, file, {compilerBin: settings.typstCompilerBin});
			}

			onCompiled();
		} catch (error) {
			console.error("LaTeX compilation failed:", error);
		}
	};

	const handleChange = useCallback((value: string) => {
		latestValueRef.current = value;
		onChange(value);

		if (timeoutRef.current !== null) {
			window.clearTimeout(timeoutRef.current);
		}

		timeoutRef.current = window.setTimeout(() => {
			void flushSave();
		}, settings.debounceTime);
	}, [settings.debounceTime]);
	handleChangeRef.current = handleChange;

	useEffect(() => {
		void flushSave();
	}, [livePreview]);

	useEffect(() => {
		if (!containerRef.current) return;

		let fontSize = 16;

		const latexHighlight = HighlightStyle.define([
			{tag: tags.macroName, color: "var(--text-accent)"},
			{tag: tags.keyword, color: "var(--text-accent)"},
			{tag: tags.name, color: "color-mix(in srgb, var(--text-accent), 30% white)"},
			{tag: tags.definition(tags.name), color: "var(--color-purple)"},

			{tag: tags.variableName, color: "var(--color-cyan)"},
			{tag: tags.string, color: "var(--color-green)"},
			{tag: tags.number, color: "var(--color-orange)"},
			{tag: tags.bool, color: "var(--color-orange)"},
			{tag: tags.literal, color: "var(--color-orange)"},

			{tag: tags.bracket, color: "var(--color-base-70)"},
			{tag: tags.punctuation, color: "var(--color-base-70)"},
			{tag: tags.operator, color: "var(--color-yellow)"},

			{tag: tags.comment, color: "var(--color-base-60)", fontStyle: "italic"},
			{tag: tags.docComment, color: "var(--color-base-60)", fontStyle: "italic"},

			{tag: tags.atom, color: "var(--color-pink)"},
			{tag: tags.meta, color: "var(--color-pink)"},
			{tag: tags.invalid, color: "var(--text-error)", textDecoration: "underline wavy"}
		]);

		const state = EditorState.create({
			doc: source,
			extensions: [
				search(),
				history(),
				autocompletion(),

				linewrappingCompartment.of(settings.lineWrapping ? EditorView.lineWrapping : []),

				keymap.of([
					{key: "Mod-f", run: openSearchPanel},
					...searchKeymap.filter(binding => binding.key !== "Mod-f")
				]),

				typst_lezer({
				}),
				syntaxHighlighting(latexHighlight),

				closeBrackets(),
				bracketMatching(),

				fontSizeCompartment.of(
					EditorView.theme({
						"&": {
							fontSize: "16px",
						},
					}),
				),

				EditorView.domEventHandlers({
					wheel(event, view) {
						if (!event.ctrlKey) return false;

						event.preventDefault();

						if (event.deltaY < 0) {
							fontSize = Math.min(fontSize + 1, 32);
						} else {
							fontSize = Math.max(fontSize - 1, 8);
						}

						view.dispatch({
							effects: fontSizeCompartment.reconfigure(
								EditorView.theme({
									"&": {
										fontSize: `${fontSize}px`,
									},
								}),
							),
						});

						return true;
					},
				}),

				EditorView.updateListener.of((update) => {
					if (update.docChanged) {
						handleChangeRef.current(update.state.doc.toString());
					}
				}),

				EditorView.editorAttributes.of({
					class: "cm-s-obsidian",
				}),

				EditorView.theme({
					"&": {
						height: "100%",
						color: "var(--text-normal)",
						fontFamily: "var(--font-monospace)",
						fontSize: "var(--font-size-editor)",
					},

					".cm-content": {
						caretColor: "var(--text-normal)",
					},

					".cm-gutters": {
						backgroundColor: "transparent",
						color: "var(--text-muted)",
						border: "none",
					},

					".cm-activeLine": {
						backgroundColor: "var(--background-primary-alt)",
					},

					".cm-activeLineGutter": {
						backgroundColor: "var(--background-primary-alt)",
					},

					"&.cm-focused .cm-selectionBackground": {
						backgroundColor: "var(--text-selection)",
					},
				})


			],
		});

		const view = new EditorView({state,parent: containerRef.current});
		setEditor(view);

		return () => {
			view.destroy();
			setEditor(null);
		};
	}, []);

	useEffect(() => {
		if(!editor) return;
		editor.dispatch({
			effects: linewrappingCompartment.reconfigure(settings.lineWrapping ? EditorView.lineWrapping : []),
		})
	}, [settings.lineWrapping, editor]);

	useEffect(() => {
		if (!editor) return;

		const currentValue = editor.state.doc.toString();

		if (currentValue !== source) {
			editor.dispatch({
				changes: {
					from: 0,
					to: currentValue.length,
					insert: source,
				},
			});
		}
	}, [source]);

	return (
		<div
			ref={containerRef}
			className={"typst-editor-view"}
		/>
	);
}
