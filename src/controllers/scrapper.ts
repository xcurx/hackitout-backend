import puppeteer from "puppeteer";
import { asyncHandler } from "../utils/asyncHandler.js";
import { Request, Response } from "express";

const getComments = asyncHandler(async (req: Request, res: Response) => {
    const url: string | undefined = req.query.url as string;
    const limit: number = req.query.limit ? parseInt(req.query.limit as string, 10) : 50; // Default to 50 comments
  
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
  
      // Scroll to load more comments, but stop when the limit is reached
      let prevHeight = 0;
      let comments: string[] = [];
      while (true) {
        comments = await page.evaluate(() => {
          return Array.from(document.querySelectorAll("#content-text")).map(el => el.textContent || "");
        });
  
        if (comments.length >= limit) break; // Stop when we reach the desired count
  
        prevHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
        await new Promise(resolve => setTimeout(resolve, 2000)); // Wait for comments to load
  
        const newHeight = await page.evaluate(() => document.documentElement.scrollHeight);
        if (newHeight === prevHeight) break; // Stop if no new comments load
      }
  
      await browser.close();
  
      res.json({ url, comments: comments.slice(0, limit) }); // Return only the required number of comments
  
    } catch (error) {
      console.error("Error scraping comments:", error);
      res.status(500).json({ error: "Failed to scrape comments" });
    }
  });

export { getComments };

