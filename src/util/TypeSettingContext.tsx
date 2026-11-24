import {createContext, ReactNode, useContext, useEffect, useRef, useState} from "react";
import {App, TFile} from "obsidian";
import {EditorView} from "@codemirror/view";
import {useSettings} from "../TexEditSettings";

export type TypeSettingContextType = {
	app: App;
	file: TFile | null;
	source: string;
	onChange: (source: string) => void;
	save: (source: string) => Promise<void>;
	livePreview: boolean;
	setLivePreview: (value: boolean) => void;
	editor: EditorView|null;
	setEditor: (value: EditorView|null) => void;
};

export const TypeSettingContext = createContext<TypeSettingContextType | null>(null);

export function TypeSettingProvider({
								  children,
								  app,
								  file,
								  initialData,
								  updateData,
								  save,
							  }: {
	children: ReactNode;
	app: App;
	file: TFile | null;
	initialData: string;
	updateData: (source: string) => void;
	save: (source: string) => Promise<void>;
}) {
	const [source, setSource] = useState(initialData);
	const [livePreview, setLivePreview] = useState<boolean>(false);
	const editorRef = useRef<EditorView|null>(null);
	const settings = useSettings();

	useEffect(() => {
		setLivePreview(settings.livePreview);
	}, []);

	useEffect(() => {
    	setLivePreview(settings.livePreview);
	}, [settings]);

	const onChange = (value: string) => {
		setSource(value);
		updateData(value);
	};

	const setEditor = (value: EditorView|null) => {
		editorRef.current = value;
	}

	return (
		<TypeSettingContext.Provider
			value={{app, file, source, onChange, save, livePreview, setLivePreview, editor: editorRef.current, setEditor}}
		>
			{children}
		</TypeSettingContext.Provider>
	);
}

export function useLatex(): TypeSettingContextType {
	const ctx = useContext(TypeSettingContext);

	if (!ctx) {
		throw new Error("useLatex must be used within LatexProvider");
	}

	return ctx;
}
