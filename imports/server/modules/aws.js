const AWS = require('aws-sdk');

const s3 = new AWS.S3();

const accessKeyId = process.env.AWS_ACCESS_KEY_ID;
const secretAccessKey = process.env.AWS_SECRET_ACCESS_KEY;

AWS.config.update({
	'accessKeyId': accessKeyId,
	'secretAccessKey': secretAccessKey,
	// 'signatureVersion': 'v4',
	'region': 'eu-west-1', // remove if not required
});

const myBucket = process.env.AWS_BUCKET;
const signedUrlExpireSeconds = 60 * 5;

// post
// https://stackoverflow.com/questions/44888301/upload-file-to-s3-with-post
const getSignedUrl = (key) => {
	const params = {
		'Bucket': myBucket,
		'Fields': {
			'key': key,
		},
		'Expires': signedUrlExpireSeconds,
		'Conditions': [
			['content-length-range', 0, 10000000], // 10 Mb
			{ 'acl': 'public-read' },
		],
	};
	return s3.createPresignedPost(params);
};

/*
// put
const getSignedUrl = (key) => s3.getSignedUrl('putObject', {
	'Bucket': myBucket,
	'Key': key,
	'Expires': signedUrlExpireSeconds,
	'ContentType': 'image/jpeg',
});
*/

export default getSignedUrl;
