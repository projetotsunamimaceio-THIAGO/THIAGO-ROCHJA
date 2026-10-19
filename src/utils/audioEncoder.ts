import lamejs from 'lamejs';

/**
 * Converts a base64 encoded string to an ArrayBuffer.
 */
export function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binaryString = window.atob(base64);
  const len = binaryString.length;
  const bytes = new Uint8Array(len);
  for (let i = 0; i < len; i++) {
    bytes[i] = binaryString.charCodeAt(i);
  }
  return bytes.buffer;
}

/**
 * Decodes base64 WAV audio into an AudioBuffer using the browser's AudioContext.
 */
export async function decodeAudioBase64(base64: string): Promise<AudioBuffer> {
  const arrayBuffer = base64ToArrayBuffer(base64);
  const audioCtx = new (window.AudioContext || (window as any).webkitAudioContext)({
    sampleRate: 24000,
  });
  try {
    const audioBuffer = await audioCtx.decodeAudioData(arrayBuffer.slice(0));
    return audioBuffer;
  } finally {
    if (audioCtx.state !== 'closed') {
      audioCtx.close().catch(() => {});
    }
  }
}

/**
 * Resamples or changes the speed of an AudioBuffer using an OfflineAudioContext.
 * If speed === 1.0, returns original audioBuffer.
 */
export async function renderAudioAtSpeed(
  sourceBuffer: AudioBuffer,
  speed: number
): Promise<AudioBuffer> {
  if (Math.abs(speed - 1.0) < 0.01) {
    return sourceBuffer;
  }

  const sampleRate = sourceBuffer.sampleRate;
  const channels = sourceBuffer.numberOfChannels;
  const newDuration = sourceBuffer.duration / speed;
  const newLength = Math.max(1, Math.round(newDuration * sampleRate));

  const offlineCtx = new OfflineAudioContext(channels, newLength, sampleRate);
  const bufferSource = offlineCtx.createBufferSource();
  bufferSource.buffer = sourceBuffer;
  bufferSource.playbackRate.value = speed;

  bufferSource.connect(offlineCtx.destination);
  bufferSource.start(0);

  const renderedBuffer = await offlineCtx.startRendering();
  return renderedBuffer;
}

/**
 * Encodes an AudioBuffer into an MP3 Blob using lamejs.
 * Supports configurable bitrate (128, 192, 320 kbps).
 */
export function audioBufferToMp3(
  audioBuffer: AudioBuffer,
  bitrateKbps: number = 192
): Blob {
  const channels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const Mp3EncoderClass = lamejs.Mp3Encoder || (lamejs as any).default?.Mp3Encoder;
  const mp3encoder = new Mp3EncoderClass(channels >= 2 ? 2 : 1, sampleRate, bitrateKbps);
  const mp3Data: Uint8Array[] = [];

  const sampleBlockSize = 1152; // LAME standard block size

  if (channels >= 2) {
    const leftFloat = audioBuffer.getChannelData(0);
    const rightFloat = audioBuffer.getChannelData(1);
    const leftInt16 = floatToInt16(leftFloat);
    const rightInt16 = floatToInt16(rightFloat);

    for (let i = 0; i < leftInt16.length; i += sampleBlockSize) {
      const leftChunk = leftInt16.subarray(i, i + sampleBlockSize);
      const rightChunk = rightInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(leftChunk, rightChunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
  } else {
    const monoFloat = audioBuffer.getChannelData(0);
    const monoInt16 = floatToInt16(monoFloat);

    for (let i = 0; i < monoInt16.length; i += sampleBlockSize) {
      const chunk = monoInt16.subarray(i, i + sampleBlockSize);
      const mp3buf = mp3encoder.encodeBuffer(chunk);
      if (mp3buf.length > 0) {
        mp3Data.push(new Uint8Array(mp3buf));
      }
    }
  }

  const mp3End = mp3encoder.flush();
  if (mp3End.length > 0) {
    mp3Data.push(new Uint8Array(mp3End));
  }

  return new Blob(mp3Data as unknown as BlobPart[], { type: 'audio/mp3' });
}

/**
 * Encodes an AudioBuffer into a lossless WAV Blob.
 */
export function audioBufferToWav(audioBuffer: AudioBuffer): Blob {
  const numChannels = audioBuffer.numberOfChannels;
  const sampleRate = audioBuffer.sampleRate;
  const format = 1; // PCM
  const bitDepth = 16;

  let result: Float32Array;
  if (numChannels === 2) {
    const left = audioBuffer.getChannelData(0);
    const right = audioBuffer.getChannelData(1);
    result = new Float32Array(left.length + right.length);
    for (let i = 0; i < left.length; i++) {
      result[i * 2] = left[i];
      result[i * 2 + 1] = right[i];
    }
  } else {
    result = audioBuffer.getChannelData(0);
  }

  const bytesPerSample = bitDepth / 8;
  const blockAlign = numChannels * bytesPerSample;
  const buffer = new ArrayBuffer(44 + result.length * bytesPerSample);
  const view = new DataView(buffer);

  /* RIFF identifier */
  writeString(view, 0, 'RIFF');
  /* file length */
  view.setUint32(4, 36 + result.length * bytesPerSample, true);
  /* RIFF type */
  writeString(view, 8, 'WAVE');
  /* format chunk identifier */
  writeString(view, 12, 'fmt ');
  /* format chunk length */
  view.setUint32(16, 16, true);
  /* sample format (raw) */
  view.setUint16(20, format, true);
  /* channel count */
  view.setUint16(22, numChannels, true);
  /* sample rate */
  view.setUint32(24, sampleRate, true);
  /* byte rate (sample rate * block align) */
  view.setUint32(28, sampleRate * blockAlign, true);
  /* block align (channel count * bytes per sample) */
  view.setUint16(32, blockAlign, true);
  /* bits per sample */
  view.setUint16(34, bitDepth, true);
  /* data chunk identifier */
  writeString(view, 36, 'data');
  /* data chunk length */
  view.setUint32(40, result.length * bytesPerSample, true);

  // Write the PCM samples
  let offset = 44;
  for (let i = 0; i < result.length; i++, offset += 2) {
    const s = Math.max(-1, Math.min(1, result[i]));
    view.setInt16(offset, s < 0 ? s * 0x8000 : s * 0x7fff, true);
  }

  return new Blob([view], { type: 'audio/wav' });
}

function floatToInt16(floatArr: Float32Array): Int16Array {
  const int16 = new Int16Array(floatArr.length);
  for (let i = 0; i < floatArr.length; i++) {
    const s = Math.max(-1, Math.min(1, floatArr[i]));
    int16[i] = s < 0 ? s * 0x8000 : s * 0x7fff;
  }
  return int16;
}

function writeString(view: DataView, offset: number, string: string) {
  for (let i = 0; i < string.length; i++) {
    view.setUint8(offset + i, string.charCodeAt(i));
  }
}

/**
 * Triggers a browser download for a Blob with a specific filename.
 */
export function downloadBlob(blob: Blob, fileName: string) {
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.style.display = 'none';
  a.href = url;
  a.download = fileName;
  document.body.appendChild(a);
  a.click();
  setTimeout(() => {
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, 1000);
}

/**
 * High-level download helper that processes speed adjustment and target format (MP3 / WAV).
 */
export async function exportAndDownloadAudio(
  base64Wav: string,
  options: {
    format: 'mp3' | 'wav';
    speed: number;
    voiceName: string;
    applySpeedToExport: boolean;
    bitrateKbps?: number;
  }
) {
  const { format, speed, voiceName, applySpeedToExport, bitrateKbps = 192 } = options;
  const decodedBuffer = await decodeAudioBase64(base64Wav);

  const effectiveSpeed = applySpeedToExport ? speed : 1.0;
  const renderedBuffer = await renderAudioAtSpeed(decodedBuffer, effectiveSpeed);

  let blob: Blob;
  const speedLabel = applySpeedToExport && effectiveSpeed !== 1.0 ? `_${effectiveSpeed}x` : '';
  const dateStr = new Date().toISOString().slice(0, 10);
  const safeVoice = voiceName.toLowerCase().replace(/[^a-z0-9]/g, '-');
  const fileName = `vozcraft_${safeVoice}${speedLabel}_${dateStr}.${format}`;

  if (format === 'mp3') {
    blob = audioBufferToMp3(renderedBuffer, bitrateKbps);
  } else {
    blob = audioBufferToWav(renderedBuffer);
  }

  downloadBlob(blob, fileName);
  return { fileName, sizeBytes: blob.size, duration: renderedBuffer.duration };
}
