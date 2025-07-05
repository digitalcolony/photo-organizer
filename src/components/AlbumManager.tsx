import React, { useState } from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./AlbumManager.css";

interface ExpandedAlbums {
	[albumName: string]: {
		isExpanded: boolean;
		photos: string[];
		isLoading: boolean;
		error?: string;
	};
}

const AlbumManager: React.FC = () => {
	const { state, dispatch } = usePhotoContext();
	const [expandedAlbums, setExpandedAlbums] = useState<ExpandedAlbums>({});

	const navigateToPhoto = (photoName: string) => {
		if (!state.sourceFolder) return;

		const photoIndex = state.photos.findIndex((photo) => photo.path.includes(photoName));
		if (photoIndex !== -1) {
			dispatch({ type: "SET_CURRENT_PHOTO", payload: photoIndex });
		}
	};

	const toggleAlbum = async (albumName: string) => {
		const currentState = expandedAlbums[albumName];

		if (currentState?.isExpanded) {
			// Collapse the album
			setExpandedAlbums((prev) => ({
				...prev,
				[albumName]: { ...currentState, isExpanded: false },
			}));
		} else {
			// Expand the album - fetch photos if not already loaded
			if (!currentState?.photos && window.electronAPI && state.destinationFolder) {
				// Set loading state
				setExpandedAlbums((prev) => ({
					...prev,
					[albumName]: { isExpanded: true, photos: [], isLoading: true },
				}));

				try {
					const photos = await window.electronAPI.getAlbumPhotos(
						state.destinationFolder,
						albumName
					);
					setExpandedAlbums((prev) => ({
						...prev,
						[albumName]: { isExpanded: true, photos, isLoading: false },
					}));
				} catch (error) {
					console.error("Error loading album photos:", error);
					setExpandedAlbums((prev) => ({
						...prev,
						[albumName]: {
							isExpanded: false,
							photos: [],
							isLoading: false,
							error: "Failed to load photos",
						},
					}));
				}
			} else {
				// Just expand using existing data
				setExpandedAlbums((prev) => ({
					...prev,
					[albumName]: {
						...currentState,
						isExpanded: true,
						photos: currentState?.photos || [],
					},
				}));
			}
		}
	};

	return (
		<div className="album-manager">
			<div className="album-header">
				<h3>Albums</h3>
				<span className="album-count">
					{state.albums.length} album{state.albums.length !== 1 ? "s" : ""}
				</span>
			</div>

			<div className="album-list">
				{state.albums.length === 0 ? (
					<div className="no-albums">
						<p>No albums created yet</p>
						<p className="hint">Create an album while organizing photos</p>
					</div>
				) : (
					state.albums.map((album) => {
						const albumState = expandedAlbums[album.name];
						const isExpanded = albumState?.isExpanded || false;
						const isLoading = albumState?.isLoading || false;
						const photos = albumState?.photos || [];
						const hasError = albumState?.error;

						return (
							<div key={album.name} className="album-item">
								<div
									className="album-header-item"
									onClick={() => toggleAlbum(album.name)}
									style={{ cursor: "pointer" }}
								>
									<div className="album-toggle">{isExpanded ? "📂" : "📁"}</div>
									<div className="album-details">
										<div className="album-name">{album.name}</div>
										<div className="album-info">
											{album.photoCount} photo{album.photoCount !== 1 ? "s" : ""}
										</div>
									</div>
									<div className="album-expand-icon">{isExpanded ? "▼" : "▶"}</div>
								</div>

								{isExpanded && (
									<div className="album-photos">
										{isLoading ? (
											<div className="photos-loading">
												<span className="loading-spinner">⏳</span>
												Loading photos...
											</div>
										) : hasError ? (
											<div className="photos-error">
												<span className="error-icon">⚠️</span>
												{hasError}
											</div>
										) : photos.length === 0 ? (
											<div className="no-photos-in-album">No photos in this album</div>
										) : (
											<ul className="photo-list">
												{photos.map((photoName, index) => (
													<li
														key={index}
														className="photo-item"
														onClick={() => navigateToPhoto(photoName)}
														title={`Click to view ${photoName}`}
													>
														<span className="photo-icon">🖼️</span>
														<span className="photo-name">{photoName}</span>
													</li>
												))}
											</ul>
										)}
									</div>
								)}
							</div>
						);
					})
				)}
			</div>

			<div className="album-stats">
				<div className="stat-item">
					<div className="stat-label">Total Photos</div>
					<div className="stat-value">{state.photos.length}</div>
				</div>
				<div className="stat-item">
					<div className="stat-label">Current Position</div>
					<div className="stat-value">
						{state.photos.length > 0 ? state.currentPhotoIndex + 1 : 0}
					</div>
				</div>
				<div className="stat-item">
					<div className="stat-label">Remaining</div>
					<div className="stat-value">
						{Math.max(0, state.photos.length - state.currentPhotoIndex - 1)}
					</div>
				</div>
			</div>
		</div>
	);
};

export default AlbumManager;
