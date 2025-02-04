const puppeteer = require("puppeteer-core");

export async function searchLinkedInProfiles(
  jobTitles: string[],
  industries: string[],
  locations: string[]
) {
  const browser = await puppeteer.launch({
    headless: true,
    executablePath: "/tmp/chrome/chrome/opt/google/chrome/chrome",
    args: [
      "--no-sandbox",
      "--disable-setuid-sandbox",
      "--disable-dev-shm-usage",
      "--disable-gpu",
      "--no-first-run",
      "--single-process",
      "--disable-extensions",
      "--disable-software-rasterizer",
      "--disk-cache-dir=/tmp/chrome-cache",
      "--user-data-dir=/tmp/chrome-user-data"
    ],
  });

  try {
    const page = await browser.newPage();
    page.setDefaultTimeout(15000);

    await page.setUserAgent(
      "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36"
    );

    await page.setExtraHTTPHeaders({
      'Accept-Language': 'en-US,en;q=0.9',
      'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
      'Accept-Encoding': 'gzip, deflate, br',
      'Connection': 'keep-alive',
    });

    const searchQuery = `site:linkedin.com/in/ (${jobTitles.join(" OR ")}) (${industries.join(
      " OR "
    )}) (${locations.join(" OR ")})`;

    await page.goto("https://www.google.com", { 
      waitUntil: "networkidle0",
      timeout: 30000
    });

    const searchInput = await page.waitForSelector('input[name="q"]', {
      visible: true,
      timeout: 5000
    });

    if (!searchInput) {
      throw new Error("Could not find search input");
    }

    await page.type('input[name="q"]', searchQuery, { delay: 100 });
    await page.keyboard.press("Enter");

    await Promise.race([
      page.waitForSelector("#search", { timeout: 10000 }),
      page.waitForSelector("#captcha", { timeout: 10000 })
    ]);

    const captcha = await page.$("#captcha");
    if (captcha) {
      throw new Error("Google CAPTCHA detected");
    }

    const links = await page.evaluate(() => {
      const results = [];
      document.querySelectorAll("a").forEach((link) => {
        const href = link.getAttribute("href");
        if (href && href.includes("linkedin.com/in/")) {
          results.push({
            url: href,
            title: link.textContent || "",
          });
        }
      });
      return results;
    });

    return links;
  } finally {
    await browser.close();
  }
}
