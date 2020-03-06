import {
	Patterns,
} from '../../imports/modules/collection';

const createManyPatterns = () => {
	Patterns.remove({});

	const publicMyPatternNames = [];
	const privateMyPatternNames = [];

	const publicOtherPatternNames = [];
	const privateOtherPatternNames = [];

	const numberOfMyPublicPatterns = 20;
	const numberOfMyPrivatePatterns = 15;
	const numberOfOtherPublicPatterns = 9;
	const numberOfOtherPrivatePatterns = 23;

	// patterns belonging to current user
	for (let i = 0; i < numberOfMyPublicPatterns; i += 1) {
		const name = `${i} my public pattern`;
		publicMyPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': Meteor.user()._id,
			'isPublic': true,
		});
	}

	for (let i = 0; i < numberOfMyPrivatePatterns; i += 1) {
		const name = `${i} my private pattern`;
		privateMyPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': Meteor.user()._id,
			'isPublic': false,
		});
	}

	// patterns belongiing to some other user
	for (let i = 0; i < numberOfOtherPublicPatterns; i += 1) {
		const name = `${i} other public pattern`;
		publicOtherPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': 'xxx',
			'isPublic': true,
		});
	}

	for (let i = 0; i < numberOfOtherPrivatePatterns; i += 1) {
		const name = `${i} other private pattern`;
		privateOtherPatternNames.push(name);

		Factory.create('pattern', {
			'name': name,
			'nameSort': name,
			'createdBy': 'xxx',
			'isPublic': false,
		});
	}

	// make sure all patterns have different createdAt dates
	const now = new Date();
	let count = 0;

	Patterns.find().fetch().forEach((pattern) => {
		const newDate = pattern.createdAt.setSeconds(now.getSeconds() + (10 * count));
		Patterns.update({ '_id': pattern._id },
			{ '$set': { 'createdAt': newDate } });
		count += 1;
	});

	return {
		publicMyPatternNames,
		privateMyPatternNames,
		publicOtherPatternNames,
		privateOtherPatternNames,
	};
};

export default createManyPatterns;
