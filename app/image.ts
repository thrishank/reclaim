import data from "@/model/data";
import { Canvas, createCanvas } from "canvas";

import { v2 as cloudinary } from "cloudinary";

interface LeaderboardEntry {
  username: string;
  accuracy: number;
  wpm: number;
}

cloudinary.config({
  cloud_name: "dbe4r5mep",
  api_key: "889519336515641",
  api_secret: "MKx40Z2QYku1BokxfAe45JrhwTc",
});

async function upload(img_data: any, name: string) {
  try {
    const options = {
      public_id: name,
    };
    const uploadResult = await cloudinary.uploader.upload(img_data, options);
    return uploadResult.secure_url;
  } catch (error) {
    console.error(error);
  }
}

export default async function generateImage(
  username: string
): Promise<string | null> {
  const canvas: Canvas = createCanvas(800, 600);
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

    validData.sort((a, b) => b.wpm - a.wpm);

    const userRank =
      validData.findIndex((entry) => entry.username === username) + 1;

    // Determine which entries to display
    let displayEntries: LeaderboardEntry[];
    let userEntry: LeaderboardEntry | null = null;

    if (userRank <= 10 || validData.length <= 10) {
      displayEntries = validData.slice(0, Math.min(10, validData.length));
    } else {
      displayEntries = [
        ...validData.slice(0, 9),
        validData[userRank - 1],
        validData[validData.length - 1],
      ];
      userEntry = validData[userRank - 1];
    }

    // Drawing code
    ctx.fillStyle = "#f8f8f8";
    ctx.fillRect(0, 0, 800, 600);

    ctx.font = "bold 24px Arial";
    ctx.fillStyle = "#333";
    ctx.textAlign = "center";
    ctx.fillText("Leaderboard", 400, 40);

    const startY = 80;
    const rowHeight = 40;

    ctx.fillStyle = "#4CAF50";
    ctx.fillRect(0, startY, 800, rowHeight);

    ctx.font = "bold 20px Arial";
    ctx.fillStyle = "white";
    ctx.textAlign = "center";
    ctx.fillText("Rank", 50, startY + 28);
    ctx.fillText("Username", 250, startY + 28);
    ctx.fillText("Speed (WPM)", 500, startY + 28);
    ctx.fillText("Accuracy", 700, startY + 28);

    ctx.font = "18px Arial";
    displayEntries.forEach((item, i) => {
      const y = startY + (i + 1) * rowHeight;
      const rank = validData.indexOf(item) + 1;

      ctx.fillStyle =
        item.username === username
          ? "#FFF9C4"
          : i % 2 === 0
          ? "#ffffff"
          : "#f2f2f2";
      ctx.fillRect(0, y, 800, rowHeight);

      ctx.fillStyle = "#333";
      ctx.fillText(rank.toString(), 50, y + 28);
      ctx.fillText(item.username, 250, y + 28);
      ctx.fillText(item.wpm.toString(), 500, y + 28);
      ctx.fillText(item.accuracy.toFixed(2) + "%", 700, y + 28);

      if (i === 8 && userEntry) {
        ctx.fillStyle = "#BDBDBD";
        ctx.fillRect(0, y + rowHeight, 800, rowHeight);
        ctx.fillStyle = "#333";
        ctx.fillText("...", 400, y + rowHeight + 28);
      }
    });

    ctx.strokeStyle = "#000";
    ctx.lineWidth = 1;
    for (let i = 0; i <= displayEntries.length + 1; i++) {
      const y = startY + i * rowHeight;
      ctx.beginPath();
      ctx.moveTo(0, y);
      ctx.lineTo(800, y);
      ctx.stroke();
    }
    [0, 100, 400, 600, 800].forEach((x) => {
      ctx.beginPath();
      ctx.moveTo(x, startY);
      ctx.lineTo(x, startY + (displayEntries.length + 1) * rowHeight);
      ctx.stroke();
    });

    const buffer = canvas.toDataURL("image/png");
    const filename = `${Date.now()}.png`;
    const url = await upload(buffer, filename);
    return url || null;
  } catch (error) {
    console.error("Error generating image:", error);
    return null;
  }
}
