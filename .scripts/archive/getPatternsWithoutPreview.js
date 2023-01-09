// a 'print' statement is effectively the return value, so only put in extraneous prints for debugging. They will mess up execution.
// print('running getPatternsWithoutPreview.js');
// finds patterns without a patternPreview
// makes them owned by the user who ran the script
// and return pattern _id's as an array
// !!! NEVER run on live data !!!

if (mongoAddress) {
	conn = new Mongo(mongoAddress);
} else {
	conn = new Mongo(); // default for local
}

db = conn.getDB(databaseName);

// for local use only; make patterns owned by current user
var patterns = db.patterns.find();

//print('number of patterns', patterns.count());
const createdBy = db.users.findOne( { username })._id;
const patternIds = [];

patterns.forEach(pattern => {
	const {
		_id,
	} = pattern;

	const patternPreview = db.patternPreviews.findOne({ 'patternId': _id });
	//print('Got id');
	//print(_id);
	// several runs are likely to be required because of timeout issues with Puppeteer
	if (!patternPreview) {
		db.patterns.update( { _id }, { '$set': { createdBy } });
		patternIds.push(_id);
	}
});

print(patternIds); // this is effectively the return value
