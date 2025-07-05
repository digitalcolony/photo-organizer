import React from "react";
import { usePhotoContext } from "../context/PhotoContext";
import "./StatusBar.css";

const StatusBar: React.FC = () => {
	const { state } = usePhotoContext();

	return (
		<div className="status-bar">
			<div className="status-left">
				{state.currentOperation ? (
					<span className="operation-status">{state.currentOperation}</span>
				) : state.photos.length > 0 ? (
					<span className="photo-status">
						Photo {state.currentPhotoIndex + 1} of {state.photos.length}
					</span>
				) : (
					<span className="ready-status">Ready</span>
				)}
			</div>

			<div className="status-right">
				{state.sourceFolder && (
					<span className="folder-info">Source: {state.sourceFolder.split(/[\\/]/).pop()}</span>
				)}
				{state.destinationFolder && (
					<span className="folder-info">
						Destination: {state.destinationFolder.split(/[\\/]/).pop()}
					</span>
				)}
			</div>
		</div>
	);
};

export default StatusBar;
