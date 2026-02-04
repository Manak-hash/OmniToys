import { zip, strToU8 } from 'fflate';

export type Platform = 'ios' | 'android' | 'web';

export interface IconLayer {
  image?: HTMLImageElement;
  color?: string;
  panning?: { x: number, y: number };
  scale?: number;
}

export interface IconConfig {
  foreground: IconLayer;
  background: IconLayer;
  padding: number;
  borderRadius: number;
  useGloss?: boolean;
}

const IOS_SIZES = [
  { size: 1024, name: '1024' }, // App Store
  { size: 180, name: '60x60@3x' },
  { size: 120, name: '60x60@2x' },
  { size: 167, name: '83.5x83.5@2x' },
  { size: 152, name: '76x76@2x' },
  { size: 76, name: '76x76@1x' },
  { size: 40, name: '20x20@2x' },
  { size: 60, name: '20x20@3x' },
  { size: 58, name: '29x29@2x' },
  { size: 87, name: '29x29@3x' },
];

const ANDROID_SIZES = [
  { size: 512, name: 'play_store_512' },
  { size: 192, name: 'mipmap-xxxhdpi' },
  { size: 144, name: 'mipmap-xxhdpi' },
  { size: 96, name: 'mipmap-xhdpi' },
  { size: 72, name: 'mipmap-hdpi' },
  { size: 48, name: 'mipmap-mdpi' },
];

const SPLASH_SIZES = [
  { width: 1242, height: 2688, name: 'ios-portrait-max' },
  { width: 828, height: 1792, name: 'ios-portrait-regular' },
  { width: 1125, height: 2436, name: 'ios-portrait-small' },
  { width: 1080, height: 1920, name: 'android-1080p' },
];

async function renderToCanvas(
  config: IconConfig,
  width: number,
  height: number,
  isSplash: boolean = false
): Promise<Uint8Array> {
  const canvas = document.createElement('canvas');
  canvas.width = width;
  canvas.height = height;
  const ctx = canvas.getContext('2d');
  if (!ctx) throw new Error('Canvas context failed');

  // 1. Draw Background
  if (config.background.color) {
    ctx.fillStyle = config.background.color;
    ctx.fillRect(0, 0, width, height);
  }
  if (config.background.image) {
    // Fill/Cover background
    const img = config.background.image;
    const ratio = Math.max(width / img.width, height / img.height);
    const nw = img.width * ratio;
    const nh = img.height * ratio;
    ctx.drawImage(img, (width - nw) / 2, (height - nh) / 2, nw, nh);
  }

  // 2. Draw Foreground (Logo)
  if (config.foreground.image) {
    const img = config.foreground.image;
    
    // Scale logic
    let targetSize = Math.min(width, height);
    if (!isSplash) {
        targetSize = targetSize * (1 - config.padding);
    } else {
        // Splash logo is usually 1/4 or 1/3 of the width
        targetSize = width * 0.35 * (config.foreground.scale || 1);
    }
    
    const ratio = Math.min(targetSize / img.width, targetSize / img.height);
    const nw = img.width * ratio * (isSplash ? 1 : (config.foreground.scale || 1));
    const nh = img.height * ratio * (isSplash ? 1 : (config.foreground.scale || 1));
    
    const x = (width - nw) / 2 + (config.foreground.panning?.x || 0) * width;
    const y = (height - nh) / 2 + (config.foreground.panning?.y || 0) * height;
    
    ctx.drawImage(img, x, y, nw, nh);
  }

  // 3. Effects (Gloss)
  if (config.useGloss && !isSplash) {
    const gradient = ctx.createLinearGradient(0, 0, 0, height / 2);
    gradient.addColorStop(0, 'rgba(255, 255, 255, 0.1)');
    gradient.addColorStop(1, 'rgba(255, 255, 255, 0)');
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height / 2);
  }

  return new Promise((resolve, reject) => {
    canvas.toBlob((blob) => {
      if (!blob) return reject('Blob failed');
      const reader = new FileReader();
      reader.onload = () => {
        if (reader.result instanceof ArrayBuffer) resolve(new Uint8Array(reader.result));
        else reject('Buffer failure');
      };
      reader.readAsArrayBuffer(blob);
    }, 'image/png');
  });
}

export async function generateAssetPack(config: IconConfig): Promise<Uint8Array> {
  const files: Record<string, Uint8Array> = {};

  // iOS Icons
  const iosContent = { 
    images: [] as Array<{ size: string, idiom: string, filename: string, scale: string }>, 
    info: { version: 1, author: "OmniToys" } 
  };
  for (const s of IOS_SIZES) {
    const data = await renderToCanvas(config, s.size, s.size);
    const filename = `Icon-${s.name}.png`;
    files[`ios/AppIcon.appiconset/${filename}`] = data;
    iosContent.images.push({ size: `${s.size}x${s.size}`, idiom: "universal", filename, scale: "1x" });
  }
  files['ios/AppIcon.appiconset/Contents.json'] = strToU8(JSON.stringify(iosContent, null, 2));

  // Android Icons
  for (const s of ANDROID_SIZES) {
    const data = await renderToCanvas(config, s.size, s.size);
    if (s.name === 'play_store_512') files[`android/play_store_512.png`] = data;
    else files[`android/res/${s.name}/ic_launcher.png`] = data;
  }

  // Splash Screens
  for (const s of SPLASH_SIZES) {
    const data = await renderToCanvas(config, s.width, s.height, true);
    files[`splashes/${s.name}.png`] = data;
  }

  return new Promise((resolve, reject) => {
    zip(files, (err, data) => err ? reject(err) : resolve(data));
  });
}
