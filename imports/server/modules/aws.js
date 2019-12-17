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

const getSignedUrl = (key) => s3.getSignedUrl('postObject', {
	'Bucket': myBucket,
	'Key': key,
	'Expires': signedUrlExpireSeconds,
	'ContentType': 'image/jpeg',
});

export default getSignedUrl;
