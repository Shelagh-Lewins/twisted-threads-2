// hack to get variable values out of variables.scss
// so they can be used in js
import variables from '../constants/variables.scss';

const getCSSVariables = function () {
	const doc = document.implementation.createHTMLDocument('');
	const styleElement = document.createElement('style');

	styleElement.textContent = variables.firstChild.nodeValue;
	// the style will only be parsed once it is added to a document
	doc.body.appendChild(styleElement);

	return styleElement.sheet.cssRules;
};

export default getCSSVariables;
