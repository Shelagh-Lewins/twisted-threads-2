// use Puppeteer to log in and visit a pattern by _id, for long enough to generate and save the pattern preview
// _id is loaded from environment variable
// run this file from a bash file e.g. generatePatternPreviews.sh which first saves the pattern _id and makes the user own the pattern so it can be viewed
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

	const patternId = process.env.PATTERN_ID.replace(',', '');
	const pageURL = `${process.env.URL}/pattern/${patternId}`;
	console.log('patternId', JSON.stringify(patternId));
	console.log('pageURL', pageURL);
	await page.goto(pageURL);

	// enable console output from inside a page.evaluate
	// https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
	// https://github.com/puppeteer/puppeteer/issues/1512
	page.on('console', (msg) => console.log('PAGE LOG:', msg.text()));
	page.on('pageerror', (error) => {
		console.log(error.message);
	});
	page.on('response', (response) => {
		console.log(response.status(), response.url());
	});
	page.on('requestfailed', (request) => {
		console.log(request.failure().errorText, request.url());
	});

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
		await browser.close();
	}

	await page.waitForSelector('.preview-holder svg');
	console.log('got selector .preview-holder.svg');
	await page.waitForTimeout(5000); // wait for the preview to be rendered and saved; less time than this and the image processing stage may fail

	console.log('end of pattern', patternId);

	await browser.close(); // problem - closing the browser kills the loop processes. But if not closed, the function never terminates...
})();
