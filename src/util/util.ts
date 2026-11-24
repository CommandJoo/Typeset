export function stripLatex(text: string): string {
	let cleaned = text;

	// 1. Strip everything before \title{ (removes \documentclass, \usepackage, \hypersetup, \newtheorem, etc.)
	if (cleaned.includes('\\title{')) {
		cleaned = cleaned.replace(/^[\s\S]*?\\title\{/, '');
	}

	const patterns = [
		// 2. Comments (unescaped % to end of line)
		/(?<!\\)%.*/g,

		// 3. Display and inline math blocks ($$...$$, $...$, \[...\], \(...\))
		/\$\$.*?\$\$|\$.*?\$|\\\[.*?\\\]|\\\(.*?\\\)/gs,

		// 4. Non-text environments (equations, figures, tables, code blocks)
		/\\begin\{(equation|align|gather|figure|table|tikzpicture|verbatim|lstlisting)\*?\}.*?\\end\{\1\*?\}/gs,

		// 5. Remaining \begin{...} and \end{...} tags (keeps inner text)
		/\\(begin|end)\{[^}]*\}(\[[^\]]*\])?/g,

		// 6. Commands with non-prose/config arguments (added hypersetup, newtheorem, url, graphicspath, etc.)
		/\\(documentclass|usepackage|hypersetup|newtheorem|geometry|graphicspath|bibliographystyle|bibliography|cite\w*|ref|eqref|label|pageref|hspace|vspace|input|include|url)\*?(\[[^\]]*\])?\{[^}]*\}/gs,

		// 7. Remaining command names (e.g., \textbf, \section) while keeping {text}
		/\\[a-zA-Z]+\*?(\[[^\]]*\])?/g,

		// 8. Stray LaTeX syntax characters
		/[{}~^_&]/g
	];

	for (const pattern of patterns) {
		cleaned = cleaned.replace(pattern, ' ');
	}

	// Collapse multiple spaces/newlines into a single space
	return cleaned.replace(/\s+/g, ' ').trim();
}

export function countWrittenLatexWords(text: string): number {
	const cleaned = stripLatex(text);
	return cleaned.split(/\s+/).length;
}
