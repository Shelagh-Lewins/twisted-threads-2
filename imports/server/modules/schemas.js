const Schemas = {};

Schemas.Pattern = new SimpleSchema({
	description: {
		type: String,
		label: "Description",
		max: 2000,
	},
	name: {
		type: String,
		label: "Name",
		max: 256,
	},
	nameSort: {
		type: String,
		label: "Sortable name",
		max: 256,
	},


	numberOfRows: {
		type: SimpleSchema.Integer,
		label: "Number of rows",
		min: 1,
	},
	numberOfTablets: {
		type: SimpleSchema.Integer,
		label: "Number of tablets",
		min: 1,
	},

	createdAt: {
		type: Date,
		label: "Date created",
		optional: true
	},
	summary: {
		type: String,
		label: "Brief summary",
		optional: true,
		max: 1000
	}
});