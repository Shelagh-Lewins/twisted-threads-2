// use Puppeteer to log in and visit each pattern to force isTwistNeutral and willRepeat to be saved
const puppeteer = require('puppeteer');

(async () => {
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, timeout: 5000 });
	// if the page doesn't load fairly quickly, odds are it won't load at all. So speed things up by reducing timeout from default of 30s
	// debugging tip: disable headless to see browser launch
	// then you can see what URL it's actually at and what the page looks like
	// const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true, headless: false });
	page = await browser.newPage();

	process.on("unhandledRejection", (reason, p) => {
		console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
		browser.close();
	});

	const patternId = process.env.PATTERN_ID.replace(',', '');
	const pageURL = `${process.env.URL}/pattern/${patternId}`;
	console.log('patternId', JSON.stringify(patternId));
	console.log('pageURL', pageURL);
	await page.goto(pageURL);

	// enable console.log from inside a page.evaluate
	// https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
	//page.on('console', (log) => console[log._type](log._text));
	page.on('console', consoleObj => console.log(consoleObj.text()));

	let USERNAME = process.env.TWT_USERNAME;
	let PASSWORD = process.env.PASSWORD;

	// the user must be logged in
	const result1 = await page.evaluate(({USERNAME, PASSWORD}) => {
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
		})

	},{USERNAME, PASSWORD});

	if (!result1) {
		await browser.close()
	}

	await page.waitForSelector(".preview-outer h2");

	console.log('end of pattern', patternId);

	await browser.close(); // problem - closing the browser kills the loop processes. But if not closed, the function never terminates...
})();

