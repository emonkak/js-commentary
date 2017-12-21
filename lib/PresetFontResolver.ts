import { FontFamily, FontResolver } from './types';

const DEFAULT_FONT_FAMILIES = {
    defont: {
        name: 'sans-serif',
        weight: 600
    },
    gothic: {
        name: 'sans-serif',
        weight: 400
    },
    mincho: {
        name: 'serif',
        weight: 400
    }
};

export default class PresetFontResolver implements FontResolver {
    constructor(private readonly _fontFamilies: { [key: string]: FontFamily } = DEFAULT_FONT_FAMILIES) {
    }

    resolve(familyName: string): FontFamily {
        return this._fontFamilies[familyName] || DEFAULT_FONT_FAMILIES.defont;
    }
}
