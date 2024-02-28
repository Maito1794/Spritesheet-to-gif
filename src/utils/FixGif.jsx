export const FixGif = async (blob) => {
    const buf = Buffer.from(await blob.arrayBuffer());
    let pos = buf.length - 1;
    while (buf[pos] === 0) {
        pos--;
    }
    if (pos < buf.length) {
        console.log('trimmed ' + (buf.length - pos) + ' null bytes');
    }
    const trimmed = buf.subarray(0, pos + 1);

    const sanity = trimmed.subarray(-1)[0];
    if (sanity !== 0x3b /* end of file = ; */) {
        throw new Error('unexpected last non-null byte: ' + sanity);
    }

    return new Blob([trimmed], {
        type: blob.type,
    });
};