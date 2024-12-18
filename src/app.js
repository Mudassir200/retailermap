const express = require('express');
const puppeteer = require('puppeteer');
const path = require('path');

const app = express();
const port = 3000;

// Serve static files (e.g., images, CSS, JS) from the 'public' directory
app.use(express.static(path.join(__dirname, 'public')));

// Route to capture screenshot
app.get('/screenshot', async (req, res) => {
  const url = req.query.url; // URL to capture as a query parameter

  if (!url) {
    return res.status(400).send('URL parameter is required');
  }

  console.log(puppeteer.executablePath());
  

  try {
    // Launch Puppeteer browser
    const browser = await puppeteer.launch({ executablePath: puppeteer.executablePath() });
    const page = await browser.newPage();

    // Set the viewport size (optional, based on your needs)
    await page.setViewport({ width: 1280, height: 800 });

    // Go to the URL provided in the query
    await page.goto(url, { waitUntil: 'networkidle0' }); // Ensures page is fully loaded

    // Wait for all images and Google Maps to load (adjust selector if needed)
    await page.waitForSelector('img'); // Wait for all images to load
    await page.waitForSelector('#google-map'); // Wait for Google Map to load (change selector as per your map ID)

    // Capture the screenshot
    const date = new Date();

    // Get the individual components of the date and time
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');

    // Concatenate the components into the desired format
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;

    const screenshotPath = `${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });

    console.log('Screenshot captured successfully!');

    // Send the screenshot as a response
    res.sendFile(path.join(__dirname, screenshotPath));

    // Close the browser
    await browser.close();
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    res.status(500).send('Error capturing screenshot');
  }
});

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
