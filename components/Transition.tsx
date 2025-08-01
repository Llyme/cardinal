import { easyContext } from "@/lib/contexting";
import html2canvas from "html2canvas-pro";
import { useRef } from "react";

export const Transition = easyContext(function (children) {
    const canvasRef = useRef<HTMLCanvasElement>(null);

    async function draw({
        scale,
        imageSmoothingEnabled,
        imageSmoothingQuality,
    }: {
        scale: number;
        imageSmoothingEnabled: boolean;
        imageSmoothingQuality: ImageSmoothingQuality;
    }) {
        const width = window.innerWidth;
        const height = window.innerHeight;
        const scaledWidth = width / scale;
        const scaledHeight = height / scale;
        const canvas = await html2canvas(document.body, {
            foreignObjectRendering: true,
            scale: scale,
            logging: false,
            useCORS: true,
            allowTaint: true,
            width: scaledWidth,
            height: scaledHeight,
        });

        const targetCanvas = canvasRef.current;

        if (!targetCanvas) return;

        const ctx = targetCanvas.getContext("2d");
        if (!ctx) return;

        targetCanvas.width = width;
        targetCanvas.height = height;

        // Scale the canvas context to match the resolution
        ctx.imageSmoothingEnabled = imageSmoothingEnabled;
        ctx.imageSmoothingQuality = imageSmoothingQuality;

        // Draw the screenshot scaled to fit the target resolution
        ctx.drawImage(canvas, 0, 0, scaledWidth, scaledHeight);

        canvas.remove();

        return ctx;
    }

    async function show({
        scale = 1,
        imageSmoothingEnabled = true,
        imageSmoothingQuality = "high",
    }: {
        scale?: number;
        imageSmoothingEnabled?: boolean;
        imageSmoothingQuality?: ImageSmoothingQuality;
    } = {}) {
        const ctx = await draw({
            scale,
            imageSmoothingEnabled,
            imageSmoothingQuality,
        });

        if (!ctx) return;
    }

    async function hide({
        tileSize = 96,
        fadeDuration = 200,
        staggerDelay = 300,
        startX,
        startY,
    }: {
        tileSize?: number;
        fadeDuration?: number;
        staggerDelay?: number;
        startX?: number;
        startY?: number;
    } = {}) {
        const canvas = canvasRef.current;

        if (!canvas) return;

        const ctx = canvas.getContext("2d");

        if (!ctx) return;

        const width = canvas.width;
        const height = canvas.height;

        // Calculate center point
        const centerX = startX ?? width / 2;
        const centerY = startY ?? height / 2;
        const maxDistance = Math.sqrt(centerX * centerX + centerY * centerY);

        // Create tiles for the transition animation
        const tilesX = Math.ceil(width / tileSize);
        const tilesY = Math.ceil(height / tileSize);
        const tiles: Array<{
            x: number;
            y: number;
            width: number;
            height: number;
            imageData: ImageData;
            startTime: number;
            opacity: number;
        }> = [];

        // Store image data for each tile
        for (let row = 0; row < tilesY; row++) {
            for (let col = 0; col < tilesX; col++) {
                const x = col * tileSize;
                const y = row * tileSize;
                const tileWidth = Math.min(tileSize, width - x);
                const tileHeight = Math.min(tileSize, height - y);

                const imageData = ctx.getImageData(x, y, tileWidth, tileHeight);

                // Calculate tile center position
                const tileCenterX = x + tileWidth / 2;
                const tileCenterY = y + tileHeight / 2;

                // Calculate distance from screen center
                const distanceFromCenter = Math.sqrt(
                    Math.pow(tileCenterX - centerX, 2) +
                        Math.pow(tileCenterY - centerY, 2)
                );

                // Normalize distance (0 = center, 1 = edge)
                const normalizedDistance = distanceFromCenter / maxDistance;

                // Add glitching randomness - tiles closer to center have less randomness
                const randomFactor =
                    (Math.random() - 0.5) * 0.3 * normalizedDistance;

                // Start from center (distance 0) and work outward, with glitch randomness
                const delayMultiplier = normalizedDistance + randomFactor;

                tiles.push({
                    x,
                    y,
                    width: tileWidth,
                    height: tileHeight,
                    imageData,
                    startTime:
                        performance.now() +
                        Math.max(0, delayMultiplier * staggerDelay * 3),
                    opacity: 1,
                });
            }
        }

        // Animation function
        return await new Promise<void>((resolve) => {
            const animateTiles = () => {
                const currentTime = performance.now();
                ctx.clearRect(0, 0, width, height);

                let allTilesFaded = true;

                tiles.forEach((tile) => {
                    if (currentTime >= tile.startTime) {
                        const elapsed = currentTime - tile.startTime;
                        const progress = Math.min(elapsed / fadeDuration, 1);

                        // Create irregular, stepped fading instead of smooth
                        const steps = 12;
                        const stepProgress =
                            Math.floor(progress * steps) / steps;

                        // Add slight random variation per tile (but consistent per tile)
                        const tileRandomSeed =
                            ((tile.x + tile.y) % 1000) / 1000;
                        const variation =
                            Math.sin(tileRandomSeed * Math.PI * 2) * 0.1;

                        // Slightly irregular timing per step
                        const adjustedProgress = Math.min(
                            1,
                            stepProgress + variation * (1 - progress)
                        );

                        tile.opacity = Math.max(0, 1 - adjustedProgress);
                    }

                    if (tile.opacity > 0) {
                        allTilesFaded = false;

                        // Create temporary canvas for this tile
                        const tempCanvas = document.createElement("canvas");
                        tempCanvas.width = tile.width;
                        tempCanvas.height = tile.height;
                        const tempCtx = tempCanvas.getContext("2d");

                        if (tempCtx) {
                            // Draw image data to temporary canvas
                            tempCtx.putImageData(tile.imageData, 0, 0);

                            // Save context state
                            ctx.save();

                            // Set opacity for smooth transparency
                            ctx.globalAlpha = tile.opacity;

                            // Draw the temporary canvas with transparency
                            ctx.drawImage(tempCanvas, tile.x, tile.y);

                            // Calculate darkening amount (increases as tile fades)
                            const tintAmount = (1 - tile.opacity) * 0.5;

                            if (tintAmount > 0) {
                                // Apply darkening overlay
                                ctx.globalAlpha = tintAmount;
                                ctx.fillStyle = "red";

                                ctx.fillRect(
                                    tile.x,
                                    tile.y,
                                    tile.width,
                                    tile.height
                                );
                            }

                            // Restore context state
                            ctx.restore();
                        }
                    }
                });

                if (!allTilesFaded) {
                    requestAnimationFrame(animateTiles);
                } else {
                    resolve();
                }
            };

            // Start the animation
            requestAnimationFrame(animateTiles);
        });
    }

    return {
        value: {
            show,
            hide,
        },
        children: (
            <>
                {children}
                <canvas
                    className="absolute z-[999] top-0 left-0 right-0 bottom-0 w-full h-full pointer-events-none"
                    ref={canvasRef}
                />
            </>
        ),
    };
});
