import React, { useState, useEffect } from "react";
import { PhotoProvider } from "./context/PhotoContext";
import FolderSelector from "./components/FolderSelector";
import PhotoViewer from "./components/PhotoViewer";
import AlbumManager from "./components/AlbumManager";
import StatusBar from "./components/StatusBar";
import "./App.css";

declare global {
	interface Window {
		electronAPI: {
			selectSourceFolder: () => Promise<string | null>;
			selectDestinationFolder: () => Promise<string | null>;
			scanFolder: (folderPath: string) => Promise<string[]>;
			generateThumbnail: (imagePath: string) => Promise<string | null>;
			getImageData: (imagePath: string) => Promise<string | null>;
			copyFileToAlbum: (
				sourcePath: string,
				destinationPath: string,
				albumName: string
			) => Promise<any>;
			createAlbum: (destinationPath: string, albumName: string) => Promise<any>;
			getAlbums: (destinationPath: string) => Promise<{ name: string; photoCount: number }[]>;
			getSavedFolders: () => Promise<{
				sourceFolder: string | null;
				destinationFolder: string | null;
			}>;
			saveFolders: (sourceFolder: string | null, destinationFolder: string | null) => Promise<void>;
		};
	}
}

const App: React.FC = () => {
	const [isSetupComplete, setIsSetupComplete] = useState(false);
	const isElectron = !!(window as any).electronAPI;

	return (
		<PhotoProvider>
			<div className="app">
				<header className="app-header">
					<h1>Photo Organizer</h1>
					{!isElectron && (
						<div className="browser-warning">
							⚠️ Running in browser mode - Please use the desktop application for full functionality
						</div>
					)}
				</header>

				<main className="app-main">
					{!isSetupComplete ? (
						<FolderSelector onSetupComplete={() => setIsSetupComplete(true)} />
					) : (
						<div className="organizer-layout">
							<div className="sidebar">
								<AlbumManager />
							</div>
							<div className="main-content">
								<PhotoViewer />
							</div>
						</div>
					)}
				</main>

				<StatusBar />
			</div>
		</PhotoProvider>
	);
};

export default App;
