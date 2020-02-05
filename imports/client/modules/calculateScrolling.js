// used to keep weaving toolbar visible when editing large weaving instructions

const calculateScrolling = ({
	controlsElm,
	weavingElm,
}) => {
	const {
		'x': weavingPositionX,
		'y': weavingPositionY,
	} = weavingElm.getBoundingClientRect();

	// find the containing element's applied styles
	const weavingCompStyles = window.getComputedStyle(weavingElm);
	const controlsCompStyles = window.getComputedStyle(controlsElm);

	const weavingWidth = parseFloat(weavingElm.clientWidth)
	- parseFloat(weavingCompStyles.getPropertyValue('padding-left'))
	- parseFloat(weavingCompStyles.getPropertyValue('padding-right'));

	const weavingHeight = parseFloat(weavingElm.clientHeight)
	- parseFloat(weavingCompStyles.getPropertyValue('padding-top'))
	- parseFloat(weavingCompStyles.getPropertyValue('padding-bottom'));

	const windowHeight = window.innerHeight;
	const controlsPaddingY = parseFloat(controlsCompStyles.getPropertyValue('padding-top')) + parseFloat(controlsCompStyles.getPropertyValue('padding-bottom'));
	const weavingLeftOffset = weavingPositionX;
	const weavingBottomOffset = weavingHeight + weavingPositionY - windowHeight + controlsPaddingY + 16; // extra bit to raise panel above bottom of window

	const controlsWidth = controlsElm.getBoundingClientRect().width;

	const controlsHeight = controlsElm.getBoundingClientRect().height;

	const widthDifference = weavingWidth - controlsWidth;

	const heightDifference = weavingHeight - controlsHeight;

	let offsetX = 0;
	let offsetY = 0;

	if (weavingLeftOffset < 0) {
		offsetX = Math.min(-1 * weavingLeftOffset, widthDifference);
	}

	if (weavingBottomOffset > 0) {
		offsetY = Math.min(weavingBottomOffset, heightDifference);
	}

	return {
		'controlsOffsetX': offsetX,
		'controlsOffsetY': offsetY,
	};
};

export default calculateScrolling;
