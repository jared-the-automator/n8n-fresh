// ... [previous imports and interface] ...

        const browser = await puppeteer.launch({
          headless: true,
          executablePath: "/usr/bin/chromium-browser",  // Specific to Render.com
          args: [
            "--no-sandbox",
            "--disable-setuid-sandbox",
            "--disable-dev-shm-usage",
            "--disable-gpu",
            "--no-first-run",
            "--no-zygote",
            "--single-process",
            "--disable-extensions"
          ],
          env: {
            CHROMIUM_PATH: "/usr/bin/chromium-browser"
          }
        });

// ... [rest of the code stays the same] ...
