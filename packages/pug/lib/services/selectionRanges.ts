import type * as html from 'vscode-html-languageservice';
import type { PugDocument } from '../pugDocument';
import { transformLocations } from '@volar/language-service/lib/utils/transform';

export function register(htmlLs: html.LanguageService) {
	return (pugDoc: PugDocument, posArr: html.Position[]) => {

		const htmlPosArr = posArr
			.map(position => pugDoc.map.getGeneratedPosition(position))
			.filter((v): v is NonNullable<typeof v> => !!v);

		const htmlResult = htmlLs.getSelectionRanges(
			pugDoc.map.embeddedDocument,
			htmlPosArr
		);

		return transformLocations(htmlResult, htmlRange => pugDoc.map.getSourceRange(htmlRange));
	};
}
