print('running importTwistValues.js');
// read isTwistNeutral and willRepeat values from an input variable
// write the values to patterns in the database

// https://stackoverflow.com/questions/27670996/import-json-with-mongo-script
var patterns = JSON.parse(cat('./patterns.json'));
// print('patterns', patterns);
print('number of patterns in data:', patterns.length);

if (mongoAddress) {
	conn = new Mongo(mongoAddress);
} else {
	conn = new Mongo(); // default for local
}

db = conn.getDB(databaseName);

patterns.forEach(patternData => {
	const { _id, isTwistNeutral, willRepeat } = patternData;
	const originalPattern = db.patterns.findOne({ _id });
	print('*** processing pattern with _id', _id);
	// update values if not already set
	// and there is a new value
	if (typeof isTwistNeutral !== 'undefined'
		&& typeof originalPattern.isTwistNeutral === 'undefined') {
		print('set isTwistNeutral:', isTwistNeutral);
		db.patterns.update( { _id }, { '$set': { isTwistNeutral } });
	}

	if (typeof willRepeat !== 'undefined'
		&& typeof originalPattern.willRepeat === 'undefined') {
		print('set willRepeat:', willRepeat);
		db.patterns.update( { _id }, { '$set': { willRepeat } });
	}
});

