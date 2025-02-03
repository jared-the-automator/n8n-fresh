// ... [previous imports and interface] ...

        const browser = await puppeteer.launch({
          headless: "new",  // Use new headless mode
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--single-process",
            "--no-zygote"
          ],
        });

        // ... [rest of the code] ...
