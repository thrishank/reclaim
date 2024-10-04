import data from "@/model/data";
import puppeteer from "puppeteer";

export async function generateimage() {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();

  const x = await data.find();
  const valid_data = x
    .filter((entry) => entry.accuracy != null && entry.username != null)
    .map((entry) => ({
      username: entry.username,
      accuracy: entry.accuracy,
      wpm: entry.wpm,
    }));

  const htmlContent = `
    <html>
    <head>
      <style>
        body { font-family: Arial, sans-serif; text-align: center; background-color: #f8f8f8; }
        h1 { color: #333; }
        table { margin: auto; width: 60%; border-collapse: collapse; }
        table, th, td { border: 1px solid black; }
        th, td { padding: 15px; text-align: center; font-size: 20px; }
        th { background-color: #4CAF50; color: white; }
      </style>
    </head>
    <body>
      <h1>Leaderboard</h1>
      <table>
        <tr>
          <th>Username</th>
          <th>Speed (WPM)</th>
          <th>Accuracy</th>
        </tr>
        ${valid_data
          .map(
            (item) => `
              <tr>
                <td>${item.username}</td>
                <td>${item.wpm}</td>
                <td>${item.accuracy}</td>
              </tr>
            `
          )
          .join("")}
      </table>
    </body>
    </html>
  `;

  await page.setContent(htmlContent);
  await page.setViewport({ width: 800, height: 600 });

  const screenshot = await page.screenshot({ encoding: "base64" });

  await browser.close();

  return `data:image/png;base64,${screenshot}`;
}
