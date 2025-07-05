import { contextBridge, ipcRenderer } from "electron";

export interface ElectronAPI {
	selectSourceFolder: () => Promise<string | null>;
	selectDestinationFolder: () => Promise<string | null>;
	scanFolder: (folderPath: string) => Promise<string[]>;
	generateThumbnail: (imagePath: string) => Promise<string | null>;
	getImageData: (imagePath: string) => Promise<string | null>;
	copyFileToAlbum: (sourcePath: string, destinationPath: string, albumName: string) => Promise<any>;
	createAlbum: (destinationPath: string, albumName: string) => Promise<any>;
	getAlbums: (destinationPath: string) => Promise<{ name: string; photoCount: number }[]>;
	getSavedFolders: () => Promise<{ sourceFolder: string | null; destinationFolder: string | null }>;
	saveFolders: (sourceFolder: string | null, destinationFolder: string | null) => Promise<void>;
}

const electronAPI: ElectronAPI = {
	selectSourceFolder: () => ipcRenderer.invoke("select-source-folder"),
	selectDestinationFolder: () => ipcRenderer.invoke("select-destination-folder"),
	scanFolder: (folderPath: string) => ipcRenderer.invoke("scan-folder", folderPath),
	generateThumbnail: (imagePath: string) => ipcRenderer.invoke("generate-thumbnail", imagePath),
	getImageData: (imagePath: string) => ipcRenderer.invoke("get-image-data", imagePath),
	copyFileToAlbum: (sourcePath: string, destinationPath: string, albumName: string) =>
		ipcRenderer.invoke("copy-file-to-album", sourcePath, destinationPath, albumName),
	createAlbum: (destinationPath: string, albumName: string) =>
		ipcRenderer.invoke("create-album", destinationPath, albumName),
	getAlbums: (destinationPath: string) => ipcRenderer.invoke("get-albums", destinationPath),
	getSavedFolders: () => ipcRenderer.invoke("get-saved-folders"),
	saveFolders: (sourceFolder: string | null, destinationFolder: string | null) =>
		ipcRenderer.invoke("save-folders", sourceFolder, destinationFolder),
};

contextBridge.exposeInMainWorld("electronAPI", electronAPI);
