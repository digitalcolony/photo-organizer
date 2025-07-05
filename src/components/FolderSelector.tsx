import React, { useState, useEffect } from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./FolderSelector.css";

interface FolderSelectorProps {
	onSetupComplete: () => void;
}

const FolderSelector: React.FC<FolderSelectorProps> = ({ onSetupComplete }) => {
	const { state, dispatch } = usePhotoContext();
	const [isScanning, setIsScanning] = useState(false);

	// Load saved folders on component mount
	useEffect(() => {
		const loadSavedFolders = async () => {
			if (window.electronAPI) {
				try {
					const savedFolders = await window.electronAPI.getSavedFolders();
					if (savedFolders.sourceFolder) {
						dispatch({ type: "SET_SOURCE_FOLDER", payload: savedFolders.sourceFolder });
					}
					if (savedFolders.destinationFolder) {
						dispatch({ type: "SET_DESTINATION_FOLDER", payload: savedFolders.destinationFolder });
						// Load existing albums for the saved destination folder
						const albums = await window.electronAPI.getAlbums(savedFolders.destinationFolder);
						dispatch({ type: "SET_ALBUMS", payload: albums });
					}
				} catch (error) {
					console.error("Error loading saved folders:", error);
				}
			}
		};

		loadSavedFolders();
	}, [dispatch]);

	const handleSelectSourceFolder = async () => {
		try {
			if (!window.electronAPI) {
				alert("This feature is only available in the desktop application.");
				return;
			}
			const folderPath = await window.electronAPI.selectSourceFolder();
			if (folderPath) {
				dispatch({ type: "SET_SOURCE_FOLDER", payload: folderPath });
			}
		} catch (error) {
			console.error("Error selecting source folder:", error);
		}
	};

	const handleSelectDestinationFolder = async () => {
		try {
			if (!window.electronAPI) {
				alert("This feature is only available in the desktop application.");
				return;
			}
			const folderPath = await window.electronAPI.selectDestinationFolder();
			if (folderPath) {
				dispatch({ type: "SET_DESTINATION_FOLDER", payload: folderPath });
				// Load existing albums
				const albums = await window.electronAPI.getAlbums(folderPath);
				dispatch({ type: "SET_ALBUMS", payload: albums });
			}
		} catch (error) {
			console.error("Error selecting destination folder:", error);
		}
	};

	const handleStartOrganizing = async () => {
		if (!state.sourceFolder) return;

		setIsScanning(true);
		dispatch({ type: "SET_LOADING", payload: true });
		dispatch({ type: "SET_OPERATION", payload: "Scanning photos..." });

		try {
			const imagePaths = await window.electronAPI.scanFolder(state.sourceFolder);
			const photos = imagePaths.map((path) => ({
				path,
				name: path.split(/[\\/]/).pop() || "Unknown",
			}));

			dispatch({ type: "SET_PHOTOS", payload: photos });

			// Restore saved photo index if the folder contents haven't changed
			if (window.electronAPI.getSavedPhotoIndex) {
				const savedIndex = await window.electronAPI.getSavedPhotoIndex(state.sourceFolder);
				if (savedIndex > 0 && savedIndex < photos.length) {
					dispatch({ type: "SET_CURRENT_PHOTO", payload: savedIndex });
					dispatch({
						type: "SET_OPERATION",
						payload: `Resumed from photo ${savedIndex + 1} of ${photos.length}`,
					});
					setTimeout(() => {
						dispatch({ type: "SET_OPERATION", payload: null });
					}, 3000);
				} else {
					dispatch({ type: "SET_OPERATION", payload: null });
				}
			} else {
				dispatch({ type: "SET_OPERATION", payload: null });
			}

			onSetupComplete();
		} catch (error) {
			console.error("Error scanning folder:", error);
			dispatch({ type: "SET_OPERATION", payload: "Error scanning folder" });
		} finally {
			setIsScanning(false);
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	const canStart = state.sourceFolder && state.destinationFolder && !isScanning;

	return (
		<div className="folder-selector">
			<div className="folder-selector-content">
				<h2>Setup Photo Organization</h2>
				<p>
					{state.sourceFolder && state.destinationFolder
						? "Previously used folders have been loaded. You can change them or start organizing."
						: "Select your source folder containing photos and destination folder for organized albums."}
				</p>

				<div className="folder-selection-grid">
					<div className="folder-card">
						<h3>Source Folder</h3>
						<p>Folder containing photos to organize</p>
						<button className="btn btn-primary" onClick={handleSelectSourceFolder}>
							{state.sourceFolder ? "Change Source" : "Select Source Folder"}
						</button>
						{state.sourceFolder && (
							<div className="selected-path">
								<strong>Selected:</strong> {state.sourceFolder}
							</div>
						)}
					</div>

					<div className="folder-card">
						<h3>Destination Folder</h3>
						<p>Where organized albums will be created</p>
						<button className="btn btn-primary" onClick={handleSelectDestinationFolder}>
							{state.destinationFolder ? "Change Destination" : "Select Destination Folder"}
						</button>
						{state.destinationFolder && (
							<div className="selected-path">
								<strong>Selected:</strong> {state.destinationFolder}
							</div>
						)}
					</div>
				</div>

				<div className="start-section">
					<button
						className={`btn btn-primary ${!canStart ? "disabled" : ""}`}
						onClick={handleStartOrganizing}
						disabled={!canStart}
					>
						{isScanning ? "Scanning Photos..." : "Start Organizing"}
					</button>

					{state.currentOperation && (
						<div className="operation-status">{state.currentOperation}</div>
					)}
				</div>
			</div>
		</div>
	);
};

export default FolderSelector;
