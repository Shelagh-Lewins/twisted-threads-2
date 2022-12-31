// construct the URL for pattern previews
// either the URI (old format, TODO remove after full migration)
// or a file in the AWS bucket

const getPatternPreviewAddress = (patternPreview) => {
	const { key, rootAddress, uri } = patternPreview;
	return key ? `${rootAddress}/${key}` : uri;
};

export default getPatternPreviewAddress;
