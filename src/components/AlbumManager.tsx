import React from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./AlbumManager.css";

const AlbumManager: React.FC = () => {
	const { state } = usePhotoContext();

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
					state.albums.map((album) => (
						<div key={album.name} className="album-item">
							<div className="album-icon">📁</div>
							<div className="album-details">
								<div className="album-name">{album.name}</div>
								<div className="album-info">
									{album.photoCount} photo{album.photoCount !== 1 ? "s" : ""}
								</div>
							</div>
						</div>
					))
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
