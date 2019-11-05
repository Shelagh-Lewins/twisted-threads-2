import Todos from '../imports/collection';

const todoPubFields = {
	'text': 1,
	'completed': 1,
	'testArray': 1,
};

const getTodoPublication = function (filter, pageSkip = 0) {
	const query = {};

	// Simulate server delay
	Meteor._sleepForMs(10000); // eslint-disable-line no-underscore-dangle

	switch (filter) {
		case 'SHOW_COMPLETED':
			query.completed = true;
			break;
		case 'SHOW_ACTIVE':
			query.completed = false;
			break;
		default:
			break;
	}
	Counts.publish(this, 'TodoCount', Todos.find(query)); // eslint-disable-line no-undef
	return Todos.find(query, {
		'fields': todoPubFields,
		'skip': pageSkip,
		'limit': 10,
	});
};

Meteor.publish('getTodos', getTodoPublication);
