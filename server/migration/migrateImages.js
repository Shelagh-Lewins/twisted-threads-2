import {
	PatternImages,
} from '../../imports/modules/collection';

// migrate references to pattern images stored in AWS
const migrateImages = () => {
	console.log('*** starting to migrate images');
	const images = new Mongo.Collection('images');
	const oldImages = images.find().fetch();

	oldImages.forEach((oldImage) => {
		const {
			caption,
			created_at,
			created_by,
			height,
			key,
			url,
			used_by,
			width,
		} = oldImage;

		const newImage = {
			'createdAt': new Date(created_at),
			'createdBy': created_by,
			caption,
			height,
			key,
			'patternId': used_by,
			url,
			width,
		};

		PatternImages.insert(newImage);
	});

	images.rawCollection().drop();
	console.log('*** finished migrating images');
};

export default migrateImages;
