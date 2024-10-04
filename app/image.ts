import data from "@/model/data";
import { createCanvas } from "canvas";
import fs from "fs";
import path from "path";

interface LeaderboardEntry {
  username: string;
  accuracy: number;
  wpm: number;
}

export default async function generateImage() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  try {
    const entries: any[] = await data.find();
    const validData: LeaderboardEntry[] = entries
      .filter((e: any) => e.accuracy != null && e.username != null)
      .map((e: any) => ({
        username: e.username,
        accuracy: e.accuracy,
        wpm: e.wpm,
      }));

    // Drawing code remains the same
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, 800, 600);

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("Leaderboard", 400, 40);

    const startY = 80;
    const rowHeight = 40;
    const colWidths = [300, 250, 250];

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, startY, 800, rowHeight);

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    ctx.fillText("Username", 150, startY + 28);
    ctx.fillText("Speed (WPM)", 425, startY + 28);
    ctx.fillText("Accuracy", 675, startY + 28);

    ctx.font = "18px Arial";
    validData.forEach((item, i) => {
      const y = startY + (i + 1) * rowHeight;
      ctx.fillStyle = i % 2 === 0 ? "#ffffff" : "#f2f2f2";
      ctx.fillRect(0, y, 800, rowHeight);
      ctx.fillStyle = "#333";
      ctx.fillText(item.username, 150, y + 28);
      ctx.fillText(item.wpm.toString(), 425, y + 28);
      ctx.fillText(item.accuracy.toString(), 675, y + 28);
    });

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let i = 0; i <= validData.length + 1; i++) {
      const y = startY + i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    [0, 300, 550, 800].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + (validData.length + 1) * rowHeight);
      ctx.stroke();
    });

    // Convert canvas to buffer
    const buffer = canvas.toBuffer("image/png");

    // Generate a unique filename using the current timestamp
    const filename = `${Date.now()}.png`;

    // Ensure the directory exists
    const dir = path.join(process.cwd(), "public", "leaderboard");
    if (!fs.existsSync(dir)) {
      fs.mkdirSync(dir, { recursive: true });
    }

    // Save the file
    const filepath = path.join(dir, filename);
    fs.writeFileSync(filepath, buffer);

    // Return the relative path to the file
    return `https://reclaim-qdn1.onrender.com/public/leaderboard/${filename}`;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Image generation failed");
  }
}
