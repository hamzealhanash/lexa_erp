import os from "node:os";
import fs from "node:fs/promises";
import path from "node:path";
import { dialog } from "electron";
import Store from 'electron-store';

const schema = {
    appVersion: {
        type: 'string',
        default: '0.0.0'
    },
    settings: {
        type: 'object',
        default: {
            username: os.userInfo().username,
            theme: 'dark',
            language: 'en',
            profilePicture: "",
            email: "",
        }
    }
}

export const store = new Store({ schema })

export class SettingsService {
    getSettings() {
        return store.get('settings');
    }

    setSetting(key: string, value: any) {
        store.set(`settings.${key}`, value);
    }

    getAppVersion(): string {
        const version = store.get('appVersion');
        return version as string;
    }

    setAppVersion(version: string) {
        store.set('appVersion', version);
    }

    async chooseProfilePicture() {
        const { canceled, filePaths } = await dialog.showOpenDialog({
            properties: ['openFile'],
            filters: [{ name: 'Images', extensions: ['jpg', 'png', 'jpeg', 'webp'] }]
        })
        if (canceled || filePaths.length === 0) return null;

        const sourcePath = filePaths[0];
        const ext = path.extname(sourcePath).slice(1).toLowerCase();
        const mime = ext === 'jpg' ? 'jpeg' : ext;
        const buffer = await fs.readFile(sourcePath);
        return `data:image/${mime};base64,${buffer.toString('base64')}`;
    }

    getUserProfilePicture() {
        return store.get('settings.profilePicture') as string;
    }
}
