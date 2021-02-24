//print('running ownAllPatterns.js');
// makes all patterns owned by the user who ran the script
// and saves pattern ids in a file

if (mongoAddress) {
	conn = new Mongo(mongoAddress);
} else {
	conn = new Mongo(); // default for local
}

db = conn.getDB(databaseName);

// for local use only, make patterns owned by current user
var patterns = db.patterns.find();

//print('number of patterns', patterns.count());
//print('adding field includeInTwist to patterns');
const createdBy = db.users.findOne( { username })._id;
const patternIds = [];

patterns.forEach(pattern => {
	const {
		_id,
		isTwistNeutral,
		patternType,
		willRepeat,
	} = pattern;

	// pick up any patterns that are missing isTwistNeutral or willRepeat
	// several runs are likely to be required because of timeout issues with Puppeteer
	if (patternType !== 'freehand' && (typeof isTwistNeutral === 'undefined' || typeof willRepeat === 'undefined')) {
		db.patterns.update( { _id }, { '$set': { createdBy } });
		patternIds.push(_id);
		//print(_id);
	}
});

print(patternIds);
