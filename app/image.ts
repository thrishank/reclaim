import data from "@/model/data";
import { createCanvas } from "canvas";

interface LeaderboardEntry {
  username: string;
  accuracy: number;
  wpm: number;
}

export async function generateimage() {
  const canvas = createCanvas(800, 600);
  const ctx = canvas.getContext("2d");

  // Get and filter data with type annotations
  const x: any[] = await data.find();
  const valid_data: LeaderboardEntry[] = x
    .filter((entry: any) => entry.accuracy != null && entry.username != null)
    .map((entry: any) => ({
      username: entry.username as string,
      accuracy: entry.accuracy as number,
      wpm: entry.wpm as number,
    }));

  // Set background
  ctx.fillStyle = "#f8f8f8";
  ctx.fillRect(0, 0, canvas.width, canvas.height);

  // Draw title
  ctx.font = "bold 24px Arial";
  ctx.fillStyle = "#333";
  ctx.textAlign = "center";
  ctx.fillText("Leaderboard", canvas.width / 2, 40);

  // Draw table
  const startY = 80;
  const rowHeight = 40;
  const colWidths = [300, 250, 250];

  // Draw header
  ctx.fillStyle = "#4CAF50";
  ctx.fillRect(0, startY, canvas.width, rowHeight);

  ctx.font = "bold 20px Arial";
  ctx.fillStyle = "white";
  ctx.textAlign = "center";
  ctx.fillText("Username", colWidths[0] / 2, startY + 28);
  ctx.fillText("Speed (WPM)", colWidths[0] + colWidths[1] / 2, startY + 28);
  ctx.fillText(
    "Accuracy",
    colWidths[0] + colWidths[1] + colWidths[2] / 2,
    startY + 28
  );

  // Draw rows
  ctx.font = "18px Arial";
  ctx.fillStyle = "#333";
  valid_data.forEach((item, index) => {
    const y = startY + (index + 1) * rowHeight;

    // Alternating row colors
    ctx.fillStyle = index % 2 === 0 ? "#ffffff" : "#f2f2f2";
    ctx.fillRect(0, y, canvas.width, rowHeight);

    ctx.fillStyle = "#333";
    ctx.fillText(item.username, colWidths[0] / 2, y + 28);
    ctx.fillText(item.wpm.toString(), colWidths[0] + colWidths[1] / 2, y + 28);
    ctx.fillText(
      item.accuracy.toString(),
      colWidths[0] + colWidths[1] + colWidths[2] / 2,
      y + 28
    );
  });

  // Draw table borders
  ctx.strokeStyle = "#000";
  ctx.lineWidth = 1;
  for (let i = 0; i <= valid_data.length + 1; i++) {
    const y = startY + i * rowHeight;
    ctx.beginPath();
    ctx.moveTo(0, y);
    ctx.lineTo(canvas.width, y);
    ctx.stroke();
  }
  for (let i = 0; i <= 3; i++) {
    const x = i === 0 ? 0 : colWidths.slice(0, i).reduce((a, b) => a + b, 0);
    ctx.beginPath();
    ctx.moveTo(x, startY);
    ctx.lineTo(x, startY + (valid_data.length + 1) * rowHeight);
    ctx.stroke();
  }

  // Convert canvas to buffer
  const buffer = canvas.toBuffer("image/png");
  return `data:image/png;base64,${buffer.toString("base64")}`;
}
