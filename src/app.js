const express = require('express');
const puppeteer = require('puppeteer');
const puppeteercore = require('puppeteer-core');
const path = require('path');
const fs = require('fs');


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

  const pathmy = '/';
  logDirectoryContents(pathmy);

  try {
    const browser = await puppeteercore.launch({ 
      executablePath: puppeteer.executablePath(),
      headless: true 
    });

    const page = await browser.newPage();
    await page.setViewport({ width: 1280, height: 800 });
    await page.goto(url, { waitUntil: 'networkidle0' }); // Ensures page is fully loaded
    await page.waitForSelector('img'); // Wait for all images to load
    await page.waitForSelector('#google-map'); // Wait for Google Map to load (change selector as per your map ID)

    const date = new Date();
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, '0'); // Add leading zero if necessary
    const day = String(date.getDate()).padStart(2, '0');
    const hours = String(date.getHours()).padStart(2, '0');
    const minutes = String(date.getMinutes()).padStart(2, '0');
    const seconds = String(date.getSeconds()).padStart(2, '0');
    const timestamp = `${year}${month}${day}${hours}${minutes}${seconds}`;
    const screenshotPath = `${timestamp}.png`;
    await page.screenshot({ path: screenshotPath, fullPage: true });
    console.log('Screenshot captured successfully!');
    res.sendFile(path.join(__dirname, screenshotPath));
    await browser.close();
  } catch (err) {
    console.error('Error capturing screenshot:', err);
    res.status(500).send('Error capturing screenshot');
  }
});

function logDirectoryContents(dirPath, targetFolder) {
  if (fs.existsSync(dirPath)) {
    console.log(`✅ Directory found: ${dirPath}`);
    
    try {
      const items = fs.readdirSync(dirPath, { withFileTypes: true });
      console.log(items);

      for (const item of items) {
        const fullPath = path.join(dirPath, item.name);

        if (item.isDirectory()) {
          // Check if it's the target folder
          if (item.name === targetFolder) {
            console.log(`✅ Found folder: ${fullPath}`);
            return fullPath; // Return path if found
          }

          console.log(`📁 Directory: ${fullPath}`);
          // Recursively check sub-directories
          const found = logDirectoryContents(fullPath, targetFolder); 
          if (found) return found;
        }
      }
    } catch (err) {
      if (err.code === 'EACCES') {
        console.error(`❌ Permission denied: ${dirPath}`);
        // Skip this directory and continue
        return null;
      } else {
        throw err; // Re-throw the error if it's not a permission error
      }
    }
  } else {
    console.error(`❌ Directory not found: ${dirPath}`);
  }
}

// Start the server
app.listen(port, () => {
  console.log(`Server running at http://localhost:${port}`);
});
