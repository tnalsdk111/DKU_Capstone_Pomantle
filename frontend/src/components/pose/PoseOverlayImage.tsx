import React, { useEffect, useRef } from "react";
import type { PoseOverlayData } from "../../models/PoseOverlay";

const HAND_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [0, 1], [1, 2], [2, 3], [3, 4],
  [0, 5], [5, 6], [6, 7], [7, 8],
  [5, 9], [9, 10], [10, 11], [11, 12],
  [9, 13], [13, 14], [14, 15], [15, 16],
  [13, 17], [17, 18], [18, 19], [19, 20],
  [0, 17],
];

const POSE_CONNECTIONS: ReadonlyArray<readonly [number, number]> = [
  [1, 0],
  [1, 3],
  [0, 2],
];

function drawLine(
  ctx: CanvasRenderingContext2D,
  p1: [number, number],
  p2: [number, number],
  stroke: string,
  width: number
) {
  ctx.beginPath();
  ctx.moveTo(p1[0], p1[1]);
  ctx.lineTo(p2[0], p2[1]);
  ctx.strokeStyle = stroke;
  ctx.lineWidth = width;
  ctx.stroke();
}

function drawJointOverlay(
  ctx: CanvasRenderingContext2D,
  overlayData: PoseOverlayData
) {
  const { width, height } = overlayData.sourceSize;
  ctx.clearRect(0, 0, width, height);

  for (const [a, b] of POSE_CONNECTIONS) {
    const p1 = overlayData.pose[a];
    const p2 = overlayData.pose[b];
    if (p1 && p2) drawLine(ctx, p1, p2, "#00cc66", 3);
  }

  for (const hand of [overlayData.leftHand, overlayData.rightHand]) {
    for (const [a, b] of HAND_CONNECTIONS) {
      const p1 = hand[a];
      const p2 = hand[b];
      if (p1 && p2) drawLine(ctx, p1, p2, "#00cc66", 2.5);
    }
  }

  const bridges: [([number, number] | null), ([number, number] | null)][] = [
    [overlayData.pose[2], overlayData.leftHand[0]],
    [overlayData.pose[3], overlayData.rightHand[0]],
  ];
  for (const [p1, p2] of bridges) {
    if (p1 && p2) drawLine(ctx, p1, p2, "#00cc66", 2.5);
  }

  ctx.fillStyle = "#ff3b30";
  for (const p of [
    ...overlayData.pose,
    ...overlayData.leftHand,
    ...overlayData.rightHand,
  ]) {
    if (!p) continue;
    ctx.beginPath();
    ctx.arc(p[0], p[1], 3, 0, Math.PI * 2);
    ctx.fill();
  }
}

type PoseOverlayImageProps = {
  imgSrc: string;
  overlayData?: PoseOverlayData | null;
  width?: string;
  maxWidth?: string;
  alt?: string;
  borderRadius?: string;
};

const PoseOverlayImage = ({
  imgSrc,
  overlayData,
  width = "100%",
  maxWidth,
  alt = "촬영 미리보기",
  borderRadius = "8px",
}: PoseOverlayImageProps) => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas || !overlayData) return;

    const { width: w, height: h } = overlayData.sourceSize;
    canvas.width = w;
    canvas.height = h;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    drawJointOverlay(ctx, overlayData);
  }, [overlayData]);

  return (
    <div
      style={{
        position: "relative",
        width,
        maxWidth,
        aspectRatio: overlayData
          ? `${overlayData.sourceSize.width} / ${overlayData.sourceSize.height}`
          : "4 / 3",
        borderRadius,
        overflow: "hidden",
        background: "#ddd",
      }}
    >
      <img
        src={imgSrc}
        alt={alt}
        style={{
          width: "100%",
          height: "100%",
          objectFit: "cover",
          display: "block",
        }}
      />
      {overlayData ? (
        <canvas
          ref={canvasRef}
          style={{
            position: "absolute",
            inset: 0,
            width: "100%",
            height: "100%",
            pointerEvents: "none",
          }}
        />
      ) : null}
    </div>
  );
};

export default PoseOverlayImage;
