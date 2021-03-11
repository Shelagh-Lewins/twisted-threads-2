print('running dataMigration2021_Feb.js');

if (mongoAddress) {
	conn = new Mongo(mongoAddress);
} else {
	conn = new Mongo(); // default for local
}

db = conn.getDB(databaseName);

// migrate patterns
var patterns = db.patterns.find();

print('number of patterns', patterns.count());
print('adding field includeInTwist to patterns');

patterns.forEach(pattern => {
	const {
		_id,
		numberOfTablets,
		patternType,
	} = pattern;
	print(_id);

	// all simulation patterns calculate twist
	if (patternType !== 'freehand') {
		const includeInTwist = new Array(numberOfTablets).fill(true);

		db.patterns.update( { _id }, { '$set': { includeInTwist } });
	}
});
