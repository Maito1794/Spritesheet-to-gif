import { createCanvas, loadImage } from 'canvas';
import { encode } from 'modern-gif'

export const generateGif = async (spriteSheetUrl, frameWidth, frameHeight, delay) => {
    return new Promise(async (resolve, reject) => {
        if (!spriteSheetUrl || !frameWidth || !frameHeight || !delay) {
            reject("Invalid input parameters");
            return;
        }

        frameWidth = Number(frameWidth);
        frameHeight = Number(frameHeight);

        const spriteSheet = await loadImage(spriteSheetUrl);
        const framesArray = [];

        const numFramesX = Math.floor(spriteSheet.width / frameWidth);
        const numFramesY = Math.floor(spriteSheet.height / frameHeight);

        const canvas = createCanvas(frameWidth, frameHeight);
        const ctx = canvas.getContext('2d');

        for (let y = 0; y < numFramesY; y++) {
            for (let x = 0; x < numFramesX; x++) {
                const sourceX = x * frameWidth;
                const sourceY = y * frameHeight;
                ctx.clearRect(0, 0, canvas.width, canvas.height);
                ctx.drawImage(spriteSheet, sourceX, sourceY, frameWidth, frameHeight, 0, 0, canvas.width, canvas.height);
                const frameImageData = ctx.getImageData(0, 0, canvas.width, canvas.height);
                const frameBuffer = Buffer.from(frameImageData.data.buffer);
                framesArray.push({
                    data: frameBuffer,
                    delay: delay
                });
            }
        }

        const output = await encode({
            width: frameWidth,
            height: frameHeight,
            frames: framesArray
        });

        const blob = new Blob([output], { type: 'image/gif' })

        resolve(blob);
    });
};
