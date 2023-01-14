// a 'print' statement is effectively the return value
// finds patterns with patternPreview saved in the database as raw data (uri)
// that is, those patterns without 'key' field
// and return pattern _id's as an array

if (mongoAddress) {
	conn = new Mongo(mongoAddress);
} else {
	conn = new Mongo(); // default for local
}

db = conn.getDB(databaseName);

// all patterns ought to have a patternPreview, but there are more patterns than patternPreviews so clearly that's not the case
// so work from the pattern list
var patterns = db.patterns.find();

const patternIds = []; // patterns that need to have a preview generated and saved in AWS
const patternsWithoutPreview = []; // just for testing
const patternsWithAWSPreview = []; // just for testing
const patternsWithoutKey = []; // just for testing
const allPatterns = []; // just for testing
//print('**** here 1', patterns.count());
patterns.forEach((pattern) => {
	const { _id } = pattern;
	//prinrt('**** here 2', _id);
	allPatterns.push(_id);

	const patternPreview = db.patternPreviews.findOne({ patternId: _id });

	// several runs are likely to be required because of timeout issues with Puppeteer
	if (!patternPreview || !patternPreview.key) {
		patternIds.push(_id);
	}

	if (!patternPreview) {
		patternsWithoutPreview.push(_id);
	}

	if (patternPreview && patternPreview.key) {
		patternsWithAWSPreview.push(_id);
	}

	if (patternPreview && !patternPreview.key) {
		patternsWithoutKey.push(_id);
	}
});

const numberOfPatternsToProcess = 3;
const patternIdsToProcess = patternIds.slice(0, numberOfPatternsToProcess);
//const patternIdsAsString = patternIdsToProcess.toString(','); // export as comma separated string so it can be provided as an environment variable for the next step
// e.g. 'A4,B2,C8'

//print(patternIdsToProcess); // this is effectively the return value
print(['gucN5KtX6Bpf2aLW7']); // single pattern id for testing
