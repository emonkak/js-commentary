export interface Chat {
    readonly id: number;
    readonly content: string;
    readonly position: ChatPosition;
    readonly size: ChatSize;
    readonly color: string;
    readonly font: string;
    readonly stagedAt: number;
    readonly removedAt: number;
    readonly commands: string[];
}

export type ChatSize = 'small' | 'medium' | 'big';

export type ChatPosition = 'shita' | 'ue' | 'naka';

export interface StagingSlot {
    readonly chat: Chat;
    readonly fontFamily: FontFamily;
    readonly dimension: Dimension;
    readonly motion: Motion;
    readonly x: number;
    readonly y: number;
}

export interface FontFamily {
    readonly name: string;
    readonly weight: number;
}

export interface Dimension {
    readonly width: number;
    readonly height: number;
    readonly characterSize: number;
    readonly lineHeight: number;
    readonly lineCount: number;
    readonly actualCharacterSize: number;
    readonly adjusterScale: number;
}

export interface Motion {
    readonly initialX: number;
    readonly targetX: number;
}

export interface RenderScreen {
    readonly width: number;
    readonly height: number;
    readonly baseWidth: number;
    readonly baseHeight: number;
}

export interface TextMeasurer {
    measure(text: string, fontFamily: FontFamily, characterSize: number, lineHeight: number): Dimension;
}

export interface FontResolver {
    resolve(familyName: string): FontFamily;
}
