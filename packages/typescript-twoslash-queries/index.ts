import type { InlayHint, LanguageServicePlugin, LanguageServicePluginInstance } from '@volar/language-service';
import type { Provide } from 'volar-service-typescript';

export function create(ts: typeof import('typescript')): LanguageServicePlugin {
	return {
		name: 'typescript-twoslash-queries',
		create(context): LanguageServicePluginInstance {
			return {
				provideInlayHints(document, range) {
					if (isTsDocument(document.languageId)) {

						const languageService = context.inject<Provide, 'typescript/languageService'>('typescript/languageService');
						const fileName = context.inject<Provide, 'typescript/documentFileName'>('typescript/documentFileName', document.uri);
						if (!languageService || !fileName) {
							return;
						}

						const inlayHints: InlayHint[] = [];

						for (const pointer of document.getText(range).matchAll(/^\s*\/\/\s*\^\?/gm)) {
							const pointerOffset = pointer.index + pointer[0].indexOf('^?') + document.offsetAt(range.start);
							const pointerPosition = document.positionAt(pointerOffset);
							const hoverOffset = document.offsetAt({
								line: pointerPosition.line - 1,
								character: pointerPosition.character,
							});

							const quickInfo = languageService.getQuickInfoAtPosition(fileName, hoverOffset);
							if (quickInfo) {
								inlayHints.push({
									position: { line: pointerPosition.line, character: pointerPosition.character + 2 },
									label: ts.displayPartsToString(quickInfo.displayParts),
									paddingLeft: true,
									paddingRight: false,
								});
							}
						}

						return inlayHints;
					}
				},
			};
		},
	};
}

function isTsDocument(languageId: string) {
	return languageId === 'javascript' ||
		languageId === 'typescript' ||
		languageId === 'javascriptreact' ||
		languageId === 'typescriptreact';
}
