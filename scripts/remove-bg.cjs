const Jimp = require('jimp');
const path = require('path');

async function removeGreenScreen() {
  const inputPath = path.join(__dirname, '../public/workspace-green.png');
  const outputPath = path.join(__dirname, '../public/workspace-transparent.png');

  console.log('Loading image for advanced chroma keying...');
  try {
    const image = await Jimp.read(inputPath);
    console.log('Processing pixels with spill suppression...');
    
    image.scan(0, 0, image.bitmap.width, image.bitmap.height, function(x, y, idx) {
      const r = this.bitmap.data[idx + 0];
      let g = this.bitmap.data[idx + 1];
      const b = this.bitmap.data[idx + 2];
      
      // Calculate how "green" the pixel is compared to red and blue
      // Green dominant difference
      const maxRB = Math.max(r, b);
      const diff = g - maxRB;
      
      let alpha = 255;
      
      // Thresholds for the bright green screen
      const THRESHOLD_FULL_TRANSPARENT = 30; // If green is stronger than max(R,B) by this much -> alpha=0
      const THRESHOLD_PARTIAL = 0; // If green is slightly stronger -> partial alpha
      
      if (diff > THRESHOLD_FULL_TRANSPARENT) {
        // Pure green background
        alpha = 0;
      } else if (diff > THRESHOLD_PARTIAL) {
        // Edge pixel (anti-aliased)
        // Calculate partial transparency
        const range = THRESHOLD_FULL_TRANSPARENT - THRESHOLD_PARTIAL;
        const factor = (diff - THRESHOLD_PARTIAL) / range; // 0 to 1
        alpha = Math.floor(255 * (1 - factor));
        
        // Spill suppression: reduce the green glow on the edge
        g = maxRB; 
      }
      
      // For any pixel, if it still looks slightly green-tinted (spill), suppress it
      if (g > maxRB && alpha > 0) {
          g = maxRB;
      }

      this.bitmap.data[idx + 1] = g;
      this.bitmap.data[idx + 3] = alpha;
    });

    console.log('Writing high-fidelity transparent image...');
    await image.writeAsync(outputPath);
    console.log('Done! Saved to public/workspace-transparent.png');
  } catch (error) {
    console.error('Error processing image:', error);
  }
}

removeGreenScreen();
