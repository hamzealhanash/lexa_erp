import updater, { type UpdateInfo } from "electron-updater"
import { BrowserWindow } from "electron"
import { isDev } from "../utils.js"

const { autoUpdater } = updater
export type UpdateStatus =
    | { status: "up-to-date"; currentVersion: string }
    | { status: "update-available"; currentVersion: string; latestVersion: string; releaseNotes?: string }
    | { status: "downloading"; percent: number }
    | { status: "downloaded"; latestVersion: string }
    | { status: "error"; message: string };

export class UpdateService {
    constructor() {
        autoUpdater.autoDownload = false
        autoUpdater.autoInstallOnAppQuit = false
        isDev() && (autoUpdater.forceDevUpdateConfig = true)
        autoUpdater.setFeedURL({
            provider: "github",
            owner: "hamzealhanash",
            repo: "lexa_erp",
            private: true,
            token: process.env.GITHUB_TOKEN,
        })
    }

    /**
     * Check for updates. Returns either "up-to-date" or "update-available" with version info.
     */
    async checkForUpdates(currentVersion: string): Promise<UpdateStatus> {
        try {
            const result = await autoUpdater.checkForUpdates()
            if (!result || !result.updateInfo) {
                return { status: "up-to-date", currentVersion }
            }

            const latestVersion = result.updateInfo.version;

            // Compare versions — if latest is the same as current, we're up-to-date
            if (latestVersion === currentVersion) {
                return { status: "up-to-date", currentVersion };
            }

            const releaseNotes = typeof result.updateInfo.releaseNotes === "string"
                ? result.updateInfo.releaseNotes
                : undefined;

            return {
                status: "update-available",
                currentVersion,
                latestVersion,
                releaseNotes,
            };
        } catch (error: any) {
            return { status: "error", message: error?.message || "Unknown error while checking for updates" };
        }
    }

    /**
     * Download the available update. Sends progress events to the renderer via IPC.
     */
    async downloadUpdate(mainWindow: BrowserWindow | null): Promise<UpdateStatus> {
        return new Promise((resolve) => {
            autoUpdater.on("download-progress", (progress) => {
                // Send download progress to renderer
                if (mainWindow && !mainWindow.isDestroyed()) {
                    mainWindow.webContents.send("update-download-progress", {
                        percent: Math.round(progress.percent),
                        transferred: progress.transferred,
                        total: progress.total,
                    });
                }
            });

            autoUpdater.on("update-downloaded", (info: UpdateInfo) => {
                resolve({ status: "downloaded", latestVersion: info.version });
            });

            autoUpdater.on("error", (error) => {
                resolve({ status: "error", message: error?.message || "Download failed" });
            });

            autoUpdater.downloadUpdate();
        });
    }

    /**
     * Install the downloaded update and restart the app.
     */
    installUpdate(): void {
        autoUpdater.quitAndInstall(false, true);
    }
}