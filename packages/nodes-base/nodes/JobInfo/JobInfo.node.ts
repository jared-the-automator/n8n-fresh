// ... [previous imports and interface] ...

        const page = await browser.newPage();
        
        // Set a reasonable timeout
        page.setDefaultTimeout(15000); // 15 seconds timeout
        
        await page.setUserAgent(
          "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
        );

        // Add additional headers to look more like a real browser
        await page.setExtraHTTPHeaders({
          'Accept-Language': 'en-US,en;q=0.9',
          'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
          'Accept-Encoding': 'gzip, deflate, br',
          'Connection': 'keep-alive',
        });

        try {
          const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(" OR ")}) (${industries.join(
            " OR "
          )}) (${locations.join(" OR ")})`;

          await page.goto("https://www.google.com", { 
            waitUntil: "networkidle0",
            timeout: 30000 // 30 seconds timeout for initial load
          });

          // Wait a bit before typing
          await page.waitForTimeout(1000);

          const searchInput = await page.waitForSelector('input[name="q"]', {
            visible: true,
            timeout: 5000
          });

          if (!searchInput) {
            throw new Error("Could not find search input");
          }

          // Type slowly to mimic human behavior
          await page.type('input[name="q"]', searchQuery, { delay: 100 });
          
          await page.waitForTimeout(500);
          await page.keyboard.press("Enter");

          // Wait for either search results or possible CAPTCHA
          await Promise.race([
            page.waitForSelector("#search", { timeout: 10000 }),
            page.waitForSelector("#captcha", { timeout: 10000 })
          ]);

          // Check if we hit a CAPTCHA
          const captcha = await page.$("#captcha");
          if (captcha) {
            throw new Error("Google CAPTCHA detected");
          }

          // ... [rest of the code stays the same] ...
