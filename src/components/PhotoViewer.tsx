import React, { useState, useEffect } from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./PhotoViewer.css";

const PhotoViewer: React.FC = () => {
	const { state, dispatch } = usePhotoContext();
	const [currentImageSrc, setCurrentImageSrc] = useState<string>("");
	const [selectedAlbum, setSelectedAlbum] = useState<string>("");
	const [newAlbumName, setNewAlbumName] = useState<string>("");
	const [isCreatingAlbum, setIsCreatingAlbum] = useState(false);

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
			}
		} catch (error) {
			console.error("Error creating album:", error);
		}
	};

	const handleAssignPhoto = async () => {
		if (!currentPhoto || !selectedAlbum || !state.destinationFolder) return;

		dispatch({ type: "SET_LOADING", payload: true });
		dispatch({ type: "SET_OPERATION", payload: `Copying to ${selectedAlbum}...` });

		try {
			const result = await window.electronAPI.copyFileToAlbum(
				currentPhoto.path,
				state.destinationFolder,
				selectedAlbum
			);

			if (result.success) {
				// Increment album count
				dispatch({ type: "INCREMENT_ALBUM_COUNT", payload: selectedAlbum });
				// Auto-advance to next photo
				handleNextPhoto();
				dispatch({ type: "SET_OPERATION", payload: `Copied to ${selectedAlbum}` });
				setTimeout(() => {
					dispatch({ type: "SET_OPERATION", payload: null });
				}, 2000);
			} else {
				dispatch({ type: "SET_OPERATION", payload: `Error: ${result.error}` });
			}
		} catch (error) {
			console.error("Error assigning photo:", error);
			dispatch({ type: "SET_OPERATION", payload: "Error copying file" });
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
				</div>

				<div className="assignment-panel">
					<h4>Assign to Album</h4>

					<div className="album-selection">
						<select
							value={selectedAlbum}
							onChange={(e) => setSelectedAlbum(e.target.value)}
							className="album-select"
						>
							<option value="">Select an album...</option>
							{state.albums.map((album) => (
								<option key={album.name} value={album.name}>
									{album.name}
								</option>
							))}
						</select>

						<button className="btn" onClick={() => setIsCreatingAlbum(true)}>
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
						className={`btn btn-primary assign-btn ${!selectedAlbum ? "disabled" : ""}`}
						onClick={handleAssignPhoto}
						disabled={!selectedAlbum || state.isLoading}
					>
						{state.isLoading ? "Copying..." : "Assign Photo (Space)"}
					</button>
				</div>
			</div>
		</div>
	);
};

export default PhotoViewer;
