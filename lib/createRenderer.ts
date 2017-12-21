import CanvasTextMeasurer from './CanvasTextMeasurer';
import PresetFontResolver from './PresetFontResolver';
import ScreenRenderer from './ScreenRenderer';
import VirtualScreen from './VirtualScreen';
import createRenderScreen from './createRenderScreen';
import { FontFamily } from './types';

export default function createRenderer(options: {
    width: number,
    height: number,
    baseAspectRate?: number,
    slotLimit?: number,
    fontFamilies?: { [key: string]: FontFamily },
    canvasContext?: CanvasRenderingContext2D
}): ScreenRenderer {
    return new ScreenRenderer(
        new VirtualScreen(
            new CanvasTextMeasurer(options.canvasContext),
            new PresetFontResolver(options.fontFamilies),
        ),
        createRenderScreen(options.width, options.height, options.baseAspectRate)
    );
}
