// use Puppeteer to log in and visit an array of patterns by _id, for long enough to generate and save the pattern preview
// an array of _id is loaded from environment variable as a string of comma separated
// run this file from a bash file e.g. generatePatternPreviews.sh which first saves the pattern _id array
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({
		args: ['--no-sandbox', '--disable-setuid-sandbox'],
		ignoreHTTPSErrors: true,
		timeout: 5000,
	});
	// if the page doesn't load fairly quickly, odds are it won't load at all. So speed things up by reducing timeout from default of 30s
	// debugging tip: disable headless to see browser launch
	// then you can see what URL it's actually at and what the page looks like
	// const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, headless: false });
	page = await browser.newPage();

	process.on('unhandledRejection', (reason, p) => {
		console.error('Unhandled Rejection at: Promise', p, 'reason:', reason);
		browser.close();
	});

	//const patternId = process.env.PATTERN_ID.replace(',', '');
	const patternIds = process.env.PATTERN_IDS.split(',');
	const pageURL = `${process.env.URL}`;

	console.log('pageURL', pageURL);
	await page.goto(pageURL);
	console.log('at page', pageURL);

	// enable console output from inside a page.evaluate
	// https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
	// https://github.com/puppeteer/puppeteer/issues/1512
	// do NOT log response because that will be the entire image as data
	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
	// page.on('pageerror', (error) => {
	// 	console.log(error.message);
	// });
	// page.on('response', (response) => {
	// 	console.log(response.status(), response.url());
	// });
	// page.on('requestfailed', (request) => {
	// 	console.log(request.failure().errorText, request.url());
	// });

	let USERNAME = process.env.TWT_USERNAME;
	let PASSWORD = process.env.PASSWORD;

	// the user must be logged in
	const result1 = await page.evaluate(
		({ USERNAME, PASSWORD }) => {
			return new Promise((resolve, reject) => {
				Meteor.loginWithPassword(USERNAME, PASSWORD, (error) => {
					if (error) {
						console.log('error logging in', error);
						resolve(true);
					} else {
						console.log('logged in OK');

						resolve(true);
					}
				});
			});
		},
		{ USERNAME, PASSWORD },
	);

	if (!result1) {
		console.log('no result, closing');
		await browser.close();
	}
	console.log('got result', result1);

	for (let i = 0; i < patternIds.length; i += 1) {
		// forEach closes the browser
		const patternId = patternIds[i];
		const patternPageURL = `${process.env.URL}/pattern/${patternId}`;
		await page.goto(patternPageURL);
		console.log(
			`*** view pattern _id: ${patternId}, ${i} of ${patternIds.length}`,
		);

		await page.waitForSelector('.preview-holder svg');
		console.log('got selector .preview-holder.svg');
		await page.waitForTimeout(10000); // wait for the preview to be rendered and saved; less time than this and the image processing stage may fail

		console.log('leaving pattern', patternId);
	}

	await browser.close(); // problem - closing the browser kills the loop processes. But if not closed, the function never terminates...
})();
