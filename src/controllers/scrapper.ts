import puppeteer from "puppeteer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { NextFunction, Request, Response } from "express";
// import axios from "axios";

const getCommentsYt = asyncHandler(async (req: Request, res: Response) => {
    const url: string | undefined = req.query.url as string;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 1000; // Default to 50 comments
  
    if (!url) {
      res.status(400).json({ error: "Missing videoId parameter" });
    }
    if (isNaN(limit) || limit <= 0) {
      res.status(400).json({ error: "Invalid limit value" });
    }
  
    try {
      const browser = await puppeteer.launch({ headless: true });
      const page = await browser.newPage();
      await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });
  
      let prevHeight = 0;
      let comments: string[] = [];
      while (true) {
        comments = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("#content-text")).map(el => el.textContent || "");
        });
  
        if (comments.length >= limit) break; 
  
        prevHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 2000)); 
  
        const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        if (newHeight === prevHeight) break;
      }
  
      await browser.close();
  
      res.json({ url, comments: comments.slice(0, limit) }); 
  
    } catch (error) {
      console.error("Error scraping comments:", error);
      res.status(500).json({ error: "Failed to scrape comments" });
    }
});

const getCommentsTwitter = asyncHandler(async (req: Request, res: Response) => {
    const url: string | undefined = req.query.url as string;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 50;

    if (!url) {
        res.status(400).json({ error: "Missing tweet URL" });
    }
    if (isNaN(limit) || limit <= 0) {
        res.status(400).json({ error: "Invalid limit value" });
    }

    try {
        const browser = await puppeteer.launch({ headless: false }); // Use headful mode for debugging
        const page = await browser.newPage();
        await page.setUserAgent("Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36");

        // Go to Twitter login page
        await page.goto("https://twitter.com/login", { waitUntil: "networkidle2" });

        // Enter email or username
        await page.waitForSelector('input[name="text"]', { timeout: 10000 });
        await page.type('input[name="text"]', process.env.TWITTER_EMAIL as string);
        await page.keyboard.press("Enter");
        await new Promise(resolve => setTimeout(resolve, 2000)); 

        // Check if Twitter asks for username confirmation
        if (await page.$('input[name="text"]')) {
            await page.type('input[name="text"]', process.env.TWITTER_USERNAME as string);
            await page.keyboard.press("Enter");
            await new Promise(resolve => setTimeout(resolve, 2000)); 
        }

        // Enter password
        await page.waitForSelector('input[name="password"]', { timeout: 10000 });
        await page.type('input[name="password"]', "suj5al78");
        await page.keyboard.press("Enter");

        // Wait for home page to load
        await page.waitForNavigation({ waitUntil: "networkidle2", timeout: 30000 });

        // Go to the tweet URL
        await page.goto(url, { waitUntil: "networkidle2", timeout: 30000 });

        let replies: string[] = [];
        let prevHeight = 0;

        while (true) {
            const newReplies = await page.evaluate(() => {
                return Array.from(document.querySelectorAll('article[role="article"] div[data-testid="tweetText"]'))
                    .map(el => el.textContent || "");
            });

            replies = [...new Set([...replies, ...newReplies])]; // Avoid duplicates

            if (replies.length >= limit) break;

            prevHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
            await new Promise(resolve => setTimeout(resolve, 2000)); 

            const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
            if (newHeight === prevHeight) break;
        }

        await browser.close();

        res.json({ url, replies: replies.slice(0, limit) });

    } catch (error) {
        console.error("Error scraping Twitter replies:", error);
        res.status(500).json({ error: "Failed to scrape Twitter replies" });
    }
});

const getComments = asyncHandler(async (req: Request, res: Response, next:NextFunction) => {
  const url: string | undefined = req.query.url as string;

  if (!url) {
    res.status(400).json({ error: "Missing videoId parameter" });
  }

  if(url.includes("youtube.com")) {
    getCommentsYt(req, res, next);
  } else if(url.includes
    ("x.com")) {
    getCommentsTwitter(req, res, next);
  } else{
    res.status(400).json({ error: url});
  }
})

  // const getComments = asyncHandler(async (req: Request, res: Response) => {
  //   const url: string | undefined = req.query.url as string;
  //   // const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; // Default to 50 comments
  
  //   if (!url) {
  //     res.status(400).json({ error: "Missing videoId parameter" });
  //   }
  //   // if (isNaN(limit) || limit <= 0) {
  //   //   res.status(400).json({ error: "Invalid limit value" });
  //   // }
  
  //   const resp = await axios.get(`https://www.googleapis.com/youtube/v3/commentThreads?part=snippet&videoId=${url}&maxResults=100&key=${process.env.API_KEY}`);

  //   res.json({ url, comments: resp.data.items }); // Return only the required number of comments    
  // });


export { getComments };


