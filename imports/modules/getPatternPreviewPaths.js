// get the path for the folder where pattern preview images are stored

import {
	PREVIEW_PATH,
} from './parameters';

const Os = require('os');

export function getPatternPreviewFolderPath() {
	const homeDir = Os.homedir(); // save preview files under the current user

	return `${homeDir}/${PREVIEW_PATH}`;
}

// get the path for the file itself
export function getPatternPreviewImagePath(patternId) {
	return `${getPatternPreviewFolderPath()}/${patternId}.png`;
}
