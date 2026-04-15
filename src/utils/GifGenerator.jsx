import { GIFEncoder, quantize, applyPalette } from 'gifenc';

const loadImage = (url) =>
    new Promise((resolve, reject) => {
        const img = new Image();
        img.onload = () => resolve(img);
        img.onerror = reject;
        img.src = url;
    });

export const detectSemiTransparency = (imageUrl) =>
    new Promise((resolve) => {
        const img = new Image();
        img.onload = () => {
            const canvas = document.createElement('canvas');
            canvas.width = img.width;
            canvas.height = img.height;
            const ctx = canvas.getContext('2d');
            ctx.drawImage(img, 0, 0);
            const { data } = ctx.getImageData(0, 0, img.width, img.height);
            for (let i = 3; i < data.length; i += 4) {
                if (data[i] > 0 && data[i] < 255) {
                    resolve(true);
                    return;
                }
            }
            resolve(false);
        };
        img.onerror = () => resolve(false);
        img.src = imageUrl;
    });

export const generateGif = async (
    spriteSheetUrl,
    frameWidth,
    frameHeight,
    delay,
    bgColor,
    transparent = false
) => {
    if (!spriteSheetUrl || !frameWidth || !frameHeight || !delay) {
        throw new Error('Invalid input parameters');
    }

    frameWidth = Number(frameWidth);
    frameHeight = Number(frameHeight);
    delay = Number(delay);

    const spriteSheet = await loadImage(spriteSheetUrl);
    const numFramesX = Math.floor(spriteSheet.width / frameWidth);
    const numFramesY = Math.floor(spriteSheet.height / frameHeight);
    const gif = GIFEncoder();

    for (let y = 0; y < numFramesY; y++) {
        for (let x = 0; x < numFramesX; x++) {
            const canvas = document.createElement('canvas');
            canvas.width = frameWidth;
            canvas.height = frameHeight;
            const ctx = canvas.getContext('2d');

            if (transparent) {
                ctx.clearRect(0, 0, frameWidth, frameHeight);
            } else {
                ctx.fillStyle = bgColor;
                ctx.fillRect(0, 0, frameWidth, frameHeight);
            }

            ctx.drawImage(
                spriteSheet,
                x * frameWidth, y * frameHeight,
                frameWidth, frameHeight,
                0, 0,
                frameWidth, frameHeight
            );

            const { data } = ctx.getImageData(0, 0, frameWidth, frameHeight);
            const totalPixels = frameWidth * frameHeight;

            if (transparent) {
                let opaqueCount = 0;
                for (let i = 0; i < totalPixels; i++) {
                    if (data[i * 4 + 3] >= 128) opaqueCount++;
                }

                const opaqueData = new Uint8Array(opaqueCount * 4);
                let j = 0;
                for (let i = 0; i < totalPixels; i++) {
                    if (data[i * 4 + 3] >= 128) {
                        opaqueData[j++] = data[i * 4];
                        opaqueData[j++] = data[i * 4 + 1];
                        opaqueData[j++] = data[i * 4 + 2];
                        opaqueData[j++] = 255;
                    }
                }

                const opaquePalette = opaqueCount > 0
                    ? quantize(opaqueData, 255, { format: 'rgb565' })
                    : [[0, 0, 0]];

                const palette = [[0, 0, 0], ...opaquePalette];

                const fullData = new Uint8Array(totalPixels * 4);
                for (let i = 0; i < totalPixels; i++) {
                    fullData[i * 4] = data[i * 4];
                    fullData[i * 4 + 1] = data[i * 4 + 1];
                    fullData[i * 4 + 2] = data[i * 4 + 2];
                    fullData[i * 4 + 3] = 255;
                }

                const opaqueIndex = applyPalette(fullData, opaquePalette, 'rgb565');

                const index = new Uint8Array(totalPixels);
                for (let i = 0; i < totalPixels; i++) {
                    index[i] = data[i * 4 + 3] < 128 ? 0 : opaqueIndex[i] + 1;
                }

                gif.writeFrame(index, frameWidth, frameHeight, {
                    palette,
                    delay,
                    transparent: true,
                    transparentIndex: 0,
                    dispose: 2,
                });
            } else {
                const palette = quantize(data, 256, { format: 'rgb565' });
                const index = applyPalette(data, palette, 'rgb565');
                gif.writeFrame(index, frameWidth, frameHeight, { palette, delay, dispose: 2 });
            }
        }
    }

    gif.finish();
    return new Blob([gif.bytesView()], { type: 'image/gif' });
};