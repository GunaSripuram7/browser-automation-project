const puppeteer = require('puppeteer');
const { parseUserInput } = require('./parser');
const path = require('path');

const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

// Get Chrome user data directory
const userDataDir = path.join(process.env.LOCALAPPDATA, 'Google\\Chrome\\User Data');

(async () => {
    try {
        const userInput = `Go to https://google.com, search for AI tools, click the first link`;
        const tasks = parseUserInput(userInput);
        
        // Launch Chrome with existing profile
        const browser = await puppeteer.launch({ 
            headless: false,
            defaultViewport: null,
            executablePath: 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe',
            userDataDir: userDataDir,
            args: [
                '--no-sandbox',
                '--disable-setuid-sandbox',
                '--window-size=1366,768',
                '--profile-directory=Default'  // Use default profile
            ]
        });

        const page = await browser.newPage();
        console.log('Browser launched with user profile');

        for (const task of tasks) {
            console.log(`Executing task: ${task.action}`);
            
            switch (task.action) {
                case 'open':
                    await page.goto(task.target, { 
                        waitUntil: 'networkidle0',
                        timeout: 30000 
                    });
                    await delay(2000);
                    break;

                case 'search':
                    try {
                        const searchBox = await page.waitForSelector('textarea[name="q"]');
                        await searchBox.click();
                        await searchBox.type(task.query, { delay: 100 });
                        await delay(1000);
                        await page.keyboard.press('Enter');
                        
                        // Wait for search results
                        await page.waitForNavigation({ 
                            waitUntil: 'networkidle0',
                            timeout: 10000 
                        });
                    } catch (error) {
                        console.error('Search error:', error);
                        await page.screenshot({ path: 'search-error.png' });
                        // Prompt for manual intervention
                        console.log('Please complete any verification if needed...');
                        await delay(30000);
                    }
                    break;

                case 'click':
                    try {
                        await page.waitForSelector('#search a', { timeout: 5000 });
                        const results = await page.$$('#search a');
                        
                        if (results.length > 0) {
                            await Promise.all([
                                page.waitForNavigation({ timeout: 30000 }),
                                results[0].click()
                            ]);
                        }
                    } catch (error) {
                        console.error('Click error:', error);
                        await page.screenshot({ path: 'click-error.png' });
                    }
                    break;
            }
        }

        console.log('Tasks completed. Keeping browser open for review...');
        await delay(10000);
        await browser.close();
    } catch (error) {
        console.error('Main error:', error);
    }
})();