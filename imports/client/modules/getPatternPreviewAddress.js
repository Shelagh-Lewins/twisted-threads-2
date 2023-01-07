// find the URL for pattern previews
// either the URI (old format, TODO remove after full migration)
// or the url of a file in the AWS bucket

// images in AWS are saved / deleted using the current bucket name / key
// but they are displayed using the absolute path (saved to the db as url)

const getPatternPreviewAddress = (patternPreview) => {
	const { url, uri } = patternPreview;

	if (url) {
		const timestamp = new Date().getTime();
		return `${url}?t=${timestamp}`; // force image reload
	}

	return uri;
};

export default getPatternPreviewAddress;
