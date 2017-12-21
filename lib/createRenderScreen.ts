import { RenderScreen } from './types';

const DEFAULT_BASE_ASPECT_RATE = 4 / 3;

export default function createRenderScreen(width: number, height: number, baseAspectRate: number = DEFAULT_BASE_ASPECT_RATE): RenderScreen {
    return width / height >= baseAspectRate ? {
        width,
        height,
        baseWidth: Math.ceil(height * baseAspectRate),
        baseHeight: height
    } : {
        width,
        height,
        baseWidth: width,
        baseHeight: height
    };
}

