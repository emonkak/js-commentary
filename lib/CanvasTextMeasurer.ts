import { FontFamily, Dimension, TextMeasurer } from './types';
import { getAdjusterCharacterSize } from './algorithm';

declare var OffscreenCanvas: any;

const NEW_LINE_PATTERN = /\r\n|\r|\n/;

export default class CanvasTextMeasurer implements TextMeasurer {
    private readonly _context: CanvasRenderingContext2D;

    constructor(context?: CanvasRenderingContext2D) {
        this._context = context || getCanvasContext();
    }

    measure(text: string, fontFamily: FontFamily, characterSize: number, lineHeight: number): Dimension {
        const lines = text.split(NEW_LINE_PATTERN);
        const lineCount = lines.length;
        const { actualCharacterSize, adjusterScale } = getAdjusterCharacterSize(characterSize);

        this._context.font = fontFamily.weight + ' ' + actualCharacterSize + 'px ' + fontFamily.name;

        const width = Math.max(
            ...lines.map((line) => Math.ceil(this._context.measureText(line).width * adjusterScale))
        );
        const height = lineCount > 1 ? lineHeight * (lineCount - 1) + characterSize : characterSize;

        return {
            width,
            height,
            characterSize,
            lineHeight,
            lineCount,
            actualCharacterSize,
            adjusterScale
        };
    }
}

function getCanvasContext(): CanvasRenderingContext2D {
    if (typeof OffscreenCanvas !== 'undefined') {
        const canvas = new OffscreenCanvas(0, 0);
        return canvas.getContext('2d')!;
    } else {
        const canvas = document.createElement('canvas');
        return canvas.getContext('2d')!;
    }
}
