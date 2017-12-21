import * as SortedArray from './SortedArray';
import VirtualScreen from './VirtualScreen';
import { Chat, RenderScreen, StagingSlot } from './types';

export default class ScreenRenderer {
    private _virtualScreen: VirtualScreen;

    private _renderScreen: RenderScreen;

    private _reservedChats: Chat[] = [];

    private _lastStagingSlots: StagingSlot[] = [];

    private _lastStagingChatIndex: number = -1;

    private _lastStagingChat: Chat | null = null;

    private _lastContentTime: number = -1;

    constructor(virtualScreen: VirtualScreen, renderScreen: RenderScreen) {
        this._virtualScreen = virtualScreen;
        this._renderScreen = renderScreen;
    }

    render(contentTime: number): StagingSlot[] {
        if (contentTime === this._lastContentTime) {
            return this._lastStagingSlots;
        }

        if (contentTime < this._lastContentTime) {
            this._resetStagingStatus();
        }

        const stagingChats = this._retrieveStagingChats(contentTime);
        const renderScreen = this._renderScreen;
        const stagingSlots = this._virtualScreen.render(this._lastStagingSlots, stagingChats, renderScreen, contentTime);

        this._lastStagingSlots = stagingSlots;
        this._lastContentTime = contentTime;

        return stagingSlots;
    }

    updateRenderScreen(renderScreen: RenderScreen): void {
        this._renderScreen = renderScreen;
        this._resetStagingStatus();
    }

    appendChat(chat: Chat): void {
        this._reservedChats = SortedArray.append(this._reservedChats, chat, compareChat);
        this._updateStagingChatIndex();
    }

    mergeChats(chats: Chat[]): void {
        this._reservedChats = SortedArray.merge(this._reservedChats, chats, compareChat);
        this._updateStagingChatIndex();
    }

    updateChats(chats: Chat[]): void {
        this._reservedChats = chats.slice().sort(compareChat);
        this._resetStagingStatus();
    }

    clearStagedChats(): void {
        if (this._lastStagingChatIndex > 0) {
            this._reservedChats = this._reservedChats.slice(this._lastStagingChatIndex);
            this._lastStagingChatIndex = 0;
        }
    }

    clearReservedChats(): void {
        this._reservedChats = [];
        this._resetStagingStatus();
    }

    private _resetStagingStatus(): void {
        this._lastStagingSlots = [];
        this._lastStagingChat = null;
        this._lastStagingChatIndex = -1;
    }

    private _retrieveStagingChats(contentTime: number): Chat[] {
        const reservedChats = this._reservedChats;
        const stagingChats = [];

        let lastStagingChatIndex = this._lastStagingChatIndex;
        let lastStagingChat = this._lastStagingChat;

        for (let i = lastStagingChatIndex + 1, l = reservedChats.length; i < l; i++) {
            const reservedChat = reservedChats[i];

            if (reservedChat.stagedAt > contentTime) {
                break;
            }

            if (contentTime < reservedChat.removedAt) {
                stagingChats.push(reservedChat);
            }

            lastStagingChatIndex = i;
            lastStagingChat = reservedChat;
        }

        this._lastStagingChatIndex = lastStagingChatIndex;
        this._lastStagingChat = lastStagingChat;

        return stagingChats;
    }

    private _updateStagingChatIndex(): void {
        if (this._lastStagingChat !== null) {
            this._lastStagingChatIndex = SortedArray.indexOf(
                this._reservedChats,
                this._lastStagingChat,
                compareChat
            );
        }
    }
}

function compareChat(x: Chat, y: Chat): number {
    if (x.stagedAt !== y.stagedAt) {
        return x.stagedAt - y.stagedAt;
    }
    return x.id - y.id;
}
