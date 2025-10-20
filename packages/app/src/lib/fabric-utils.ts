import { fabric } from 'fabric';

export function addTextToCanvas(
  canvas: fabric.Canvas,
  text: string,
  options: {
    left?: number;
    top?: number;
    fontSize?: number;
    fill?: string;
    fontFamily?: string;
  } = {}
) {
  const textObject = new fabric.Text(text, {
    left: options.left || 50,
    top: options.top || 50,
    fontSize: options.fontSize || 24,
    fill: options.fill || '#D4AF37',
    fontFamily: options.fontFamily || 'Playfair Display',
    ...options
  });

  canvas.add(textObject);
  canvas.renderAll();
  return textObject;
}

export function addImageToCanvas(
  canvas: fabric.Canvas,
  imageUrl: string,
  options: {
    left?: number;
    top?: number;
    scaleX?: number;
    scaleY?: number;
  } = {}
) {
  fabric.Image.fromURL(imageUrl, (img) => {
    if (img) {
      img.set({
        left: options.left || 0,
        top: options.top || 0,
        scaleX: options.scaleX || 1,
        scaleY: options.scaleY || 1,
      });
      
      canvas.add(img);
      canvas.renderAll();
    }
  });
}

export function clearCanvas(canvas: fabric.Canvas) {
  canvas.clear();
  canvas.backgroundColor = '#000000';
  canvas.renderAll();
}

export function exportCanvasAsImage(canvas: fabric.Canvas, format: string = 'png'): string {
  return canvas.toDataURL({
    format: format,
    quality: 1
  });
}
