const puppeteer = require('puppeteer');

(async () => {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  
  page.on('console', msg => console.log('PAGE LOG:', msg.text()));
  page.on('pageerror', error => console.log('PAGE ERROR:', error.message));
  
  console.log('Navigating to local dev server...');
  await page.goto('http://localhost:5000', { waitUntil: 'networkidle2' });
  
  console.log('Clicking on a product card...');
  // Click on the first product card
  await page.click('.group.relative.rounded-2xl.p-4');
  
  // wait 1 second to see if there is a crash
  await new Promise(resolve => setTimeout(resolve, 1000));
  
  console.log('Finished testing.');
  await browser.close();
})();
