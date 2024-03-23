const canvas = document.getElementById('myCanvas');
const ctx = canvas.getContext('2d');
const fileInput = document.getElementById('fileInput');
const targetImageInput = document.getElementById('targetImageInput');
const createMontageBtn = document.getElementById('createMontage');

let images = [];
let targetImage;

fileInput.addEventListener('change', (event) => {
  const files = event.target.files;
  for (let i = 0; i < files.length; i++) {
    const file = files[i];
    const reader = new FileReader();
    reader.onload = () => {
      const img = new Image();
      img.src = reader.result;
      images.push(img);
    };
    reader.readAsDataURL(file);
  }
});

targetImageInput.addEventListener('change', (event) => {
  const file = event.target.files[0];
  const reader = new FileReader();
  reader.onload = () => {
    const img = new Image();
    img.src = reader.result;
    img.onload = () => {
      targetImage = img;
    };
  };
  reader.readAsDataURL(file);
});

createMontageBtn.addEventListener('click', () => {
  if (!targetImage) return;

  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const tileWidth = 100;
  const tileHeight = 100;
  const targetImageData = getImageData(targetImage);

  let x = 0;
  let y = 0;

  for (let i = 0; i < targetImageData.data.length; i += 4) {
    const targetPixel = [
      targetImageData.data[i],
      targetImageData.data[i + 1],
      targetImageData.data[i + 2],
      targetImageData.data[i + 3]
    ];

    const closestImage = findClosestImage(targetPixel);
    ctx.drawImage(closestImage, x, y, tileWidth, tileHeight);

    x += tileWidth;
    if (x + tileWidth > canvas.width) {
      x = 0;
      y += tileHeight;
    }
  }
});

function getImageData(image) {
  const tempCanvas = document.createElement('canvas');
  tempCanvas.width = image.width;
  tempCanvas.height = image.height;
  const tempCtx = tempCanvas.getContext('2d');
  tempCtx.drawImage(image, 0, 0);
  return tempCtx.getImageData(0, 0, image.width, image.height);
}

function findClosestImage(targetPixel) {
  let closestImage = null;
  let minDistance = Infinity;

  for (const image of images) {
    const imageData = getImageData(image);
    const palette = quantize(imageData.data, 8);
    const closestColor = palette.findClosestColor(targetPixel);
    const distance = colorDistance(targetPixel, closestColor);

    if (distance < minDistance) {
      minDistance = distance;
      closestImage = image;
    }
  }

  return closestImage;
}

function colorDistance(color1, color2) {
  const rmean = (color1[0] + color2[0]) / 512;
  const r = color1[0] - color2[0];
  const g = color1[1] - color2[1];
  const b = color1[2] - color2[2];
  return Math.sqrt((((512 + rmean) * r * r) >> 8) + 4 * g * g + (((767 - rmean) * b * b) >> 8));
}
