// use Puppeteer to log in and visit each pattern to force isTwistNeutral and willRepeat to be saved
const puppeteer = require('puppeteer');

const patternIds = process.env.PATTERN_IDS.split('\n');
let currentPageIndex = 0;
let pageInterval;
let page;

const viewPage = function() {
	const patternId = patternIds[currentPageIndex];
	console.log('view page', patternId);

	(async () => {
		console.log('currentPageIndex', currentPageIndex);
		//await page.goto(`${process.env.URL}/pattern/${patternId}`);
		//console.log('after goto');
		//https://github.com/puppeteer/puppeteer/issues/1175
		const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox', '--disable-dev-shm-usage', '--shm-size=1gb'], ignoreHTTPSErrors: true});
	page = await browser.newPage();
	//const page = await browser.newPage();

	process.on("unhandledRejection", (reason, p) => {
		console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
		browser.close();
	});

	// Configure the navigation timeout
   await page.setDefaultNavigationTimeout(0);

	//await page.goto(process.env.URL);
	await page.goto(`${process.env.URL}/pattern/${patternId}`);
console.log('URL', `${process.env.URL}/pattern/${patternId}`);
	// enable console.log from inside a page.evaluate
	// https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
	//page.on('console', (log) => console[log._type](log._text));
	page.on('console', consoleObj => console.log(consoleObj.text()));

	let USERNAME = process.env.TWT_USERNAME;
	let PASSWORD = process.env.PASSWORD;console.log('*** username', USERNAME);
	// the user must be logged in
	const result1 = await page.evaluate(({USERNAME, PASSWORD}) => {
		return new Promise((resolve, reject) => {
			Meteor.loginWithPassword(USERNAME, PASSWORD, (error) => {
				if (error) {
					console.log('error logging in', error);
					resolve(true);
				} else {
					console.log('logged in OK');
					console.log('logged in as', Meteor.user().username);
					
					resolve(true);
				}
			});
		})

	},{USERNAME, PASSWORD});

	if (!result1) {
		await browser.close()
	}

	console.log('got to end');
//await page.goto(`${process.env.URL}/pattern/${patternId}`);
	await browser.close();
	})();

	currentPageIndex += 1;
	if (currentPageIndex > 2) {
		console.log('*** clear interval now');
		//if (currentPageIndex > patternIds.length) {
		clearInterval(pageInterval);
	}
};

pageInterval = setInterval(viewPage, 200);
/* for (var i = 0; i < 2; i += 1) {
	viewPage();
} */ // works for 2 patterns

/* (async () => {
	const browser = await puppeteer.launch({args: ['--no-sandbox', '--disable-setuid-sandbox'], ignoreHTTPSErrors: true});
	page = await browser.newPage();
	//const page = await browser.newPage();

	process.on("unhandledRejection", (reason, p) => {
		console.error("Unhandled Rejection at: Promise", p, "reason:", reason);
		browser.close();
	});

	await page.goto(process.env.URL);

	// enable console.log from inside a page.evaluate
	// https://stackoverflow.com/questions/46198527/puppeteer-log-inside-page-evaluate
	//page.on('console', (log) => console[log._type](log._text));
	page.on('console', consoleObj => console.log(consoleObj.text()));

	let USERNAME = process.env.TWT_USERNAME;
	let PASSWORD = process.env.PASSWORD;
console.log('*** username', USERNAME);
	// the user must be logged in
	const result1 = await page.evaluate(({USERNAME, PASSWORD}) => {
		return new Promise((resolve, reject) => {
			Meteor.loginWithPassword(USERNAME, PASSWORD, (error) => {
				if (error) {
					console.log('error logging in', error);
					resolve(true);
				} else {
					console.log('logged in OK');
		console.log('logged in as', Meteor.user().username);
					
					resolve(true);
				}
			});
		})

	},{USERNAME, PASSWORD});

	if (!result1) {
		await browser.close()
	}

	//pageInterval = setInterval(viewPage, 20);
//console.log('pattern ids', process.env.PATTERN_IDS);
	
	//patternIds.forEach((patternId) => {
	for (let i = 0; i < 5; i += 1) {
		(async () => {
			console.log('pattern id', patternIds[i]);
			await page.goto(`${process.env.URL}/pattern/${patternIds[i]}`);
			console.log('after goto');
		})();
	}
	//}); 

	console.log('got to end');

	//await browser.close(); // problem - closing the browser kills the loop processes. But if not closed, the function never terminates...
})(); */

