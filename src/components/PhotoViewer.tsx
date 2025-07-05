import React, { useState, useEffect } from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./PhotoViewer.css";

const PhotoViewer: React.FC = () => {
	const { state, dispatch } = usePhotoContext();
	const [currentImageSrc, setCurrentImageSrc] = useState<string>("");
	const [selectedAlbum, setSelectedAlbum] = useState<string>("");
	const [newAlbumName, setNewAlbumName] = useState<string>("");
	const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);
	const [fileExistsInAlbum, setFileExistsInAlbum] = useState<boolean>(false);
	const [assignmentError, setAssignmentError] = useState<string>("");
	const [successMessage, setSuccessMessage] = useState<string>("");

	const currentPhoto = state.photos[state.currentPhotoIndex];

	useEffect(() => {
		const loadImage = async () => {
			if (currentPhoto && window.electronAPI) {
				try {
					const imageData = await window.electronAPI.getImageData(currentPhoto.path);
					if (imageData) {
						setCurrentImageSrc(imageData);
					}
				} catch (error) {
					console.error("Error loading image:", error);
				}
			}
		};

		loadImage();
	}, [currentPhoto]);

	// Check if file already exists in selected album
	useEffect(() => {
		const checkFileExists = async () => {
			if (currentPhoto && selectedAlbum && state.destinationFolder && window.electronAPI) {
				try {
					const exists = await window.electronAPI.checkFileExistsInAlbum(
						currentPhoto.path,
						state.destinationFolder,
						selectedAlbum
					);
					setFileExistsInAlbum(exists);
					if (exists) {
						setAssignmentError("File already exists in this album");
					} else {
						setAssignmentError("");
					}
					// Don't clear success message here - let it clear on its own timer
				} catch (error) {
					console.error("Error checking file existence:", error);
					setFileExistsInAlbum(false);
					setAssignmentError("");
				}
			} else {
				setFileExistsInAlbum(false);
				setAssignmentError("");
				// Don't clear success message here either
			}
		};

		checkFileExists();
	}, [currentPhoto, selectedAlbum, state.destinationFolder]);

	// Save photo index whenever it changes
	useEffect(() => {
		const savePhotoIndex = async () => {
			if (state.sourceFolder && window.electronAPI.savePhotoIndex) {
				try {
					await window.electronAPI.savePhotoIndex(state.sourceFolder, state.currentPhotoIndex);
				} catch (error) {
					console.error("Error saving photo index:", error);
				}
			}
		};

		// Only save if we have photos and a valid index
		if (state.photos.length > 0 && state.currentPhotoIndex >= 0) {
			savePhotoIndex();
		}
	}, [state.currentPhotoIndex, state.sourceFolder, state.photos.length]);

	useEffect(() => {
		const handleKeyPress = (e: KeyboardEvent) => {
			switch (e.key) {
				case "ArrowLeft":
					handlePreviousPhoto();
					break;
				case "ArrowRight":
					handleNextPhoto();
					break;
				case " ":
					e.preventDefault();
					handleAssignPhoto();
					break;
				case "Escape":
					setIsCreatingAlbum(false);
					setNewAlbumName("");
					break;
			}
		};

		window.addEventListener("keydown", handleKeyPress);
		return () => window.removeEventListener("keydown", handleKeyPress);
	}, [state.currentPhotoIndex, selectedAlbum]);

	const handlePreviousPhoto = () => {
		dispatch({ type: "PREVIOUS_PHOTO" });
	};

	const handleNextPhoto = () => {
		dispatch({ type: "NEXT_PHOTO" });
	};

	const handleCreateAlbum = async () => {
		if (!newAlbumName.trim() || !state.destinationFolder) return;

		try {
			const result = await window.electronAPI.createAlbum(
				state.destinationFolder,
				newAlbumName.trim()
			);
			if (result.success) {
				dispatch({ type: "ADD_ALBUM", payload: newAlbumName.trim() });
				setSelectedAlbum(newAlbumName.trim());
				setNewAlbumName("");
				setIsCreatingAlbum(false);
				setAssignmentError("");
			}
		} catch (error) {
			console.error("Error creating album:", error);
		}
	};

	const handleAssignPhoto = async () => {
		if (!currentPhoto || !selectedAlbum || !state.destinationFolder || fileExistsInAlbum) return;

		dispatch({ type: "SET_LOADING", payload: true });
		setAssignmentError("");
		setSuccessMessage("");

		try {
			const result = await window.electronAPI.copyFileToAlbum(
				currentPhoto.path,
				state.destinationFolder,
				selectedAlbum
			);

			if (result.success) {
				// Increment album count
				dispatch({ type: "INCREMENT_ALBUM_COUNT", payload: selectedAlbum });
				// Show local success message
				setSuccessMessage(`Copied to ${selectedAlbum}`);
				// Auto-advance to next photo
				handleNextPhoto();
				// Clear success message after 3 seconds
				setTimeout(() => {
					setSuccessMessage("");
				}, 3000);
			} else {
				// Handle local assignment error instead of global operation
				if (result.error === "File already exists") {
					setAssignmentError("File already exists in this album");
					setFileExistsInAlbum(true);
				} else {
					setAssignmentError(result.error || "Error copying file");
				}
			}
		} catch (error) {
			console.error("Error assigning photo:", error);
			setAssignmentError("Error copying file");
		} finally {
			dispatch({ type: "SET_LOADING", payload: false });
		}
	};

	if (!currentPhoto) {
		return (
			<div className="photo-viewer no-photos">
				<div className="no-photos-message">
					<h3>No photos found</h3>
					<p>Please select a folder containing images to organize.</p>
				</div>
			</div>
		);
	}

	return (
		<div className="photo-viewer">
			<div className="photo-header">
				<div className="photo-info">
					<h3>{currentPhoto.name}</h3>
					<span className="photo-counter">
						{state.currentPhotoIndex + 1} of {state.photos.length}
					</span>
				</div>

				<div className="photo-controls">
					<button
						className="btn"
						onClick={handlePreviousPhoto}
						disabled={state.currentPhotoIndex === 0}
					>
						← Previous
					</button>
					<button
						className="btn"
						onClick={handleNextPhoto}
						disabled={state.currentPhotoIndex === state.photos.length - 1}
					>
						Next →
					</button>
				</div>
			</div>

			<div className="photo-content">
				<div className="image-container">
					<img
						src={currentImageSrc}
						alt={currentPhoto.name}
						className="main-image"
						onError={(e) => {
							console.error("Error loading image:", currentPhoto.path);
							(e.target as HTMLImageElement).src =
								"data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMjAwIiBoZWlnaHQ9IjIwMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjVmNWY1Ii8+PHRleHQgeD0iNTAlIiB5PSI1MCUiIGZvbnQtZmFtaWx5PSJBcmlhbCIgZm9udC1zaXplPSIxNCIgZmlsbD0iIzk5OSIgdGV4dC1hbmNob3I9Im1pZGRsZSIgZHk9Ii4zZW0iPkltYWdlIG5vdCBmb3VuZDwvdGV4dD48L3N2Zz4=";
						}}
					/>
				</div>{" "}
				<div className="assignment-panel">
					{successMessage && <div className="success-message">{successMessage}</div>}

					<h4>Assign to Album</h4>

					<div className="album-selection">
						<select
							value={selectedAlbum}
							onChange={(e) => {
								setSelectedAlbum(e.target.value);
								setAssignmentError("");
								setSuccessMessage("");
							}}
							className="album-select"
						>
							<option value="">Select an album...</option>
							{state.albums.map((album) => (
								<option key={album.name} value={album.name}>
									{album.name}
								</option>
							))}
						</select>

						<button
							className="btn"
							onClick={() => {
								setIsCreatingAlbum(true);
								setSuccessMessage("");
							}}
						>
							New Album
						</button>
					</div>

					{isCreatingAlbum && (
						<div className="new-album-form">
							<input
								type="text"
								value={newAlbumName}
								onChange={(e) => setNewAlbumName(e.target.value)}
								placeholder="Enter album name..."
								className="input"
								onKeyPress={(e) => e.key === "Enter" && handleCreateAlbum()}
								autoFocus
							/>
							<div className="form-actions">
								<button className="btn btn-primary" onClick={handleCreateAlbum}>
									Create
								</button>
								<button
									className="btn"
									onClick={() => {
										setIsCreatingAlbum(false);
										setNewAlbumName("");
									}}
								>
									Cancel
								</button>
							</div>
						</div>
					)}

					<button
						className={`btn btn-primary assign-btn ${
							!selectedAlbum || fileExistsInAlbum ? "disabled" : ""
						}`}
						onClick={handleAssignPhoto}
						disabled={!selectedAlbum || state.isLoading || fileExistsInAlbum}
					>
						{state.isLoading ? "Copying..." : "Assign Photo (Space)"}
					</button>

					{assignmentError && <div className="assignment-error">{assignmentError}</div>}
				</div>
			</div>
		</div>
	);
};

export default PhotoViewer;
