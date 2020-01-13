import getCSSVariables from './getCSSVariables';

const getListPreviewDimensions = (width) => {
	// find the pattern / user summary dimensions from variables.scss
	// and the current width of the parent div
	const importedStyles = getCSSVariables()[0].style;
	const summaryWidth = parseInt(importedStyles.width, 10);
	const summaryMarginRight = parseInt(importedStyles['margin-right'], 10);

	const listPreviewPadding = parseInt(importedStyles['margin-right'], 10);

	const widthPerSummary = summaryWidth + summaryMarginRight;

	// find the number of pattern / user previews that will fit on one line
	const paddingX = 2 * listPreviewPadding;
	const numberToShow = Math.floor((width - paddingX) / widthPerSummary);

	// const patternsToShow = patterns.slice(0, numberOfPatternSummaries);

	const divWidth = numberToShow * widthPerSummary + paddingX;

	return { divWidth, numberToShow };
};

export default getListPreviewDimensions;
