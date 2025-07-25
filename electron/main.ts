import { app, BrowserWindow, ipcMain, dialog } from "electron";
import * as path from "path";
import * as fs from "fs-extra";
import sharp from "sharp";

interface AppSettings {
	lastSourceFolder?: string;
	lastDestinationFolder?: string;
	lastPhotoIndex?: number;
	lastSourceFolderHash?: string;
}

class PhotoOrganizerApp {
	private mainWindow: BrowserWindow | null = null;
	private isDev = !app.isPackaged;
	private settingsPath: string;

	constructor() {
		// Create settings file path in user data directory
		this.settingsPath = path.join(app.getPath("userData"), "settings.json");
		this.setupApp();
	}

	private async loadSettings(): Promise<AppSettings> {
		try {
			if (await fs.pathExists(this.settingsPath)) {
				const settingsData = await fs.readFile(this.settingsPath, "utf-8");
				return JSON.parse(settingsData);
			}
		} catch (error) {
			console.error("Error loading settings:", error);
		}
		return {};
	}

	private async saveSettings(settings: AppSettings): Promise<void> {
		try {
			await fs.ensureDir(path.dirname(this.settingsPath));
			await fs.writeFile(this.settingsPath, JSON.stringify(settings, null, 2));
		} catch (error) {
			console.error("Error saving settings:", error);
		}
	}

	private setupApp(): void {
		app.whenReady().then(() => {
			this.createMainWindow();
			this.setupIpcHandlers();
		});

		app.on("window-all-closed", () => {
			if (process.platform !== "darwin") {
				app.quit();
			}
		});

		app.on("activate", () => {
			if (BrowserWindow.getAllWindows().length === 0) {
				this.createMainWindow();
			}
		});
	}

	private createMainWindow(): void {
		this.mainWindow = new BrowserWindow({
			width: 1400,
			height: 900,
			minWidth: 1200,
			minHeight: 700,
			webPreferences: {
				nodeIntegration: false,
				contextIsolation: true,
				preload: path.join(__dirname, "preload.js"),
			},
			titleBarStyle: "default",
			show: false,
		});

		// Load the app
		const startUrl = this.isDev
			? "http://localhost:3000"
			: `file://${path.join(__dirname, "../../build/index.html")}`;

		this.mainWindow.loadURL(startUrl);

		// Show window when ready
		this.mainWindow.once("ready-to-show", () => {
			this.mainWindow?.show();
		});

		// Open DevTools in development (commented out to prevent auto-opening)
		// if (this.isDev) {
		// 	this.mainWindow.webContents.openDevTools();
		// }
	}

	private async generateFolderHash(folderPath: string): Promise<string> {
		try {
			const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".tif"];
			const images: string[] = [];

			const scanRecursive = async (dir: string): Promise<void> => {
				const items = await fs.readdir(dir);

				for (const item of items) {
					const fullPath = path.join(dir, item);
					const stat = await fs.stat(fullPath);

					if (stat.isDirectory()) {
						await scanRecursive(fullPath);
					} else if (stat.isFile()) {
						const ext = path.extname(item).toLowerCase();
						if (imageExtensions.includes(ext)) {
							// Include both path and modification time for hash
							images.push(`${fullPath}:${stat.mtime.getTime()}`);
						}
					}
				}
			};

			await scanRecursive(folderPath);

			// Sort for consistent hash and create a simple hash
			const sortedImages = images.sort();
			const hashInput = sortedImages.join("|");

			// Simple hash function (for basic change detection)
			let hash = 0;
			for (let i = 0; i < hashInput.length; i++) {
				const char = hashInput.charCodeAt(i);
				hash = (hash << 5) - hash + char;
				hash = hash & hash; // Convert to 32-bit integer
			}

			return hash.toString();
		} catch (error) {
			console.error("Error generating folder hash:", error);
			return "";
		}
	}

	private setupIpcHandlers(): void {
		// Get saved folder paths
		ipcMain.handle("get-saved-folders", async () => {
			const settings = await this.loadSettings();
			return {
				sourceFolder: settings.lastSourceFolder || null,
				destinationFolder: settings.lastDestinationFolder || null,
			};
		});

		// Save folder paths
		ipcMain.handle(
			"save-folders",
			async (_, sourceFolder: string | null, destinationFolder: string | null) => {
				const settings = await this.loadSettings();
				if (sourceFolder) settings.lastSourceFolder = sourceFolder;
				if (destinationFolder) settings.lastDestinationFolder = destinationFolder;
				await this.saveSettings(settings);
			}
		);

		// Save current photo index
		ipcMain.handle("save-photo-index", async (_, sourceFolder: string, photoIndex: number) => {
			try {
				const settings = await this.loadSettings();
				const folderHash = await this.generateFolderHash(sourceFolder);

				settings.lastSourceFolder = sourceFolder;
				settings.lastPhotoIndex = photoIndex;
				settings.lastSourceFolderHash = folderHash;

				await this.saveSettings(settings);
			} catch (error) {
				console.error("Error saving photo index:", error);
			}
		});

		// Get saved photo index
		ipcMain.handle("get-saved-photo-index", async (_, sourceFolder: string) => {
			try {
				const settings = await this.loadSettings();

				// Check if it's the same folder as last time
				if (settings.lastSourceFolder === sourceFolder && settings.lastSourceFolderHash) {
					const currentHash = await this.generateFolderHash(sourceFolder);

					// If folder contents haven't changed, return saved index
					if (
						currentHash === settings.lastSourceFolderHash &&
						settings.lastPhotoIndex !== undefined
					) {
						return settings.lastPhotoIndex;
					}
				}

				// Return 0 if folder changed or no saved index
				return 0;
			} catch (error) {
				console.error("Error getting saved photo index:", error);
				return 0;
			}
		});

		// Serve image file
		ipcMain.handle("get-image-data", async (_, imagePath: string) => {
			try {
				const imageBuffer = await fs.readFile(imagePath);
				const ext = path.extname(imagePath).toLowerCase();
				let mimeType = "image/jpeg";

				switch (ext) {
					case ".png":
						mimeType = "image/png";
						break;
					case ".gif":
						mimeType = "image/gif";
						break;
					case ".tiff":
					case ".tif":
						mimeType = "image/tiff";
						break;
					default:
						mimeType = "image/jpeg";
				}

				return `data:${mimeType};base64,${imageBuffer.toString("base64")}`;
			} catch (error) {
				console.error("Error reading image:", error);
				return null;
			}
		});

		// Select source folder
		ipcMain.handle("select-source-folder", async () => {
			const result = await dialog.showOpenDialog(this.mainWindow!, {
				properties: ["openDirectory"],
				title: "Select Source Folder with Photos",
			});

			if (!result.canceled && result.filePaths.length > 0) {
				const selectedPath = result.filePaths[0];
				// Save the selected folder
				const settings = await this.loadSettings();
				settings.lastSourceFolder = selectedPath;
				await this.saveSettings(settings);
				return selectedPath;
			}
			return null;
		});

		// Select destination folder
		ipcMain.handle("select-destination-folder", async () => {
			const result = await dialog.showOpenDialog(this.mainWindow!, {
				properties: ["openDirectory"],
				title: "Select Destination Folder for Organized Photos",
			});

			if (!result.canceled && result.filePaths.length > 0) {
				const selectedPath = result.filePaths[0];
				// Save the selected folder
				const settings = await this.loadSettings();
				settings.lastDestinationFolder = selectedPath;
				await this.saveSettings(settings);
				return selectedPath;
			}
			return null;
		});

		// Scan folder for images
		ipcMain.handle("scan-folder", async (_, folderPath: string) => {
			try {
				const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".tif"];
				const images: string[] = [];

				const scanRecursive = async (dir: string): Promise<void> => {
					const items = await fs.readdir(dir);

					for (const item of items) {
						const fullPath = path.join(dir, item);
						const stat = await fs.stat(fullPath);

						if (stat.isDirectory()) {
							await scanRecursive(fullPath);
						} else if (stat.isFile()) {
							const ext = path.extname(item).toLowerCase();
							if (imageExtensions.includes(ext)) {
								images.push(fullPath);
							}
						}
					}
				};

				await scanRecursive(folderPath);
				return images;
			} catch (error) {
				console.error("Error scanning folder:", error);
				throw error;
			}
		});

		// Generate thumbnail
		ipcMain.handle("generate-thumbnail", async (_, imagePath: string) => {
			try {
				const thumbnailBuffer = await sharp(imagePath)
					.resize(300, 300, { fit: "inside", withoutEnlargement: true })
					.jpeg({ quality: 80 })
					.toBuffer();

				return `data:image/jpeg;base64,${thumbnailBuffer.toString("base64")}`;
			} catch (error) {
				console.error("Error generating thumbnail:", error);
				return null;
			}
		});

		// Check if file exists in album
		ipcMain.handle(
			"check-file-exists-in-album",
			async (_, sourcePath: string, destinationPath: string, albumName: string) => {
				try {
					const albumPath = path.join(destinationPath, albumName);
					const fileName = path.basename(sourcePath);
					const targetPath = path.join(albumPath, fileName);
					return await fs.pathExists(targetPath);
				} catch (error) {
					console.error("Error checking file existence:", error);
					return false;
				}
			}
		);

		// Copy file to album
		ipcMain.handle(
			"copy-file-to-album",
			async (_, sourcePath: string, destinationPath: string, albumName: string) => {
				try {
					const albumPath = path.join(destinationPath, albumName);
					await fs.ensureDir(albumPath);

					const fileName = path.basename(sourcePath);
					const targetPath = path.join(albumPath, fileName);

					// Check if file already exists
					if (await fs.pathExists(targetPath)) {
						return { success: false, error: "File already exists", existingPath: targetPath };
					}

					await fs.copy(sourcePath, targetPath);
					return { success: true, targetPath };
				} catch (error) {
					console.error("Error copying file:", error);
					return { success: false, error: (error as Error).message };
				}
			}
		);

		// Create album folder
		ipcMain.handle("create-album", async (_, destinationPath: string, albumName: string) => {
			try {
				const albumPath = path.join(destinationPath, albumName);
				await fs.ensureDir(albumPath);
				return { success: true, albumPath };
			} catch (error) {
				console.error("Error creating album:", error);
				return { success: false, error: (error as Error).message };
			}
		});

		// Get photos in a specific album
		ipcMain.handle("get-album-photos", async (_, destinationPath: string, albumName: string) => {
			try {
				const albumPath = path.join(destinationPath, albumName);

				if (!(await fs.pathExists(albumPath))) {
					return [];
				}

				const items = await fs.readdir(albumPath);
				const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".tif"];
				const photos: string[] = [];

				for (const item of items) {
					const itemPath = path.join(albumPath, item);
					const stat = await fs.stat(itemPath);

					if (stat.isFile()) {
						const ext = path.extname(item).toLowerCase();
						if (imageExtensions.includes(ext)) {
							photos.push(item); // Just return the filename, not full path
						}
					}
				}

				return photos.sort(); // Sort alphabetically
			} catch (error) {
				console.error("Error getting album photos:", error);
				return [];
			}
		});

		// Get existing albums with photo counts
		ipcMain.handle("get-albums", async (_, destinationPath: string) => {
			try {
				if (!(await fs.pathExists(destinationPath))) {
					return [];
				}

				const items = await fs.readdir(destinationPath);
				const albums: { name: string; photoCount: number }[] = [];
				const imageExtensions = [".jpg", ".jpeg", ".png", ".gif", ".tiff", ".tif"];

				for (const item of items) {
					const itemPath = path.join(destinationPath, item);
					const stat = await fs.stat(itemPath);
					if (stat.isDirectory()) {
						// Count images in the album folder
						try {
							const albumFiles = await fs.readdir(itemPath);
							const photoCount = albumFiles.filter((file) => {
								const ext = path.extname(file).toLowerCase();
								return imageExtensions.includes(ext);
							}).length;

							albums.push({ name: item, photoCount });
						} catch (error) {
							// If we can't read the folder, just add it with 0 count
							albums.push({ name: item, photoCount: 0 });
						}
					}
				}

				return albums;
			} catch (error) {
				console.error("Error getting albums:", error);
				return [];
			}
		});
	}
}

// Create app instance
new PhotoOrganizerApp();
