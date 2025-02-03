// ... [previous imports] ...

        const browser = await puppeteer.launch({
          headless: true,
          executablePath: process.platform === 'linux' 
            ? '/usr/bin/chromium'  // Linux path
            : puppeteer.executablePath(), // Default for other platforms
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--single-process",
            "--no-zygote",
            "--disable-gpu",
            "--disable-software-rasterizer",
          ],
        });

// ... [rest of the code stays the same] ...
