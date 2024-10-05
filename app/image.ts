import data from "@/model/data";
import { createCanvas } from "canvas";

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

    const buffer = canvas.toDataURL("image/png");

    const filename = `${Date.now()}.png`;

    const url = await upload(buffer, filename);
    return url;
  } catch (error) {
    console.error("Error generating image:", error);
    throw new Error("Image generation failed");
  }
}
