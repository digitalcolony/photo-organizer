import React, { useState } from "react";
import { usePhotoContext } from "../context/PhotoContext";

const DebugPanel: React.FC = () => {
	const { state } = usePhotoContext();
	const [debugInfo, setDebugInfo] = useState<any>(null);
	const [isVisible, setIsVisible] = useState(false);

	const handleGetDebugInfo = async () => {
		const electronAPI = (window as any).electronAPI;
		if (electronAPI && electronAPI.getSettingsDebug) {
			try {
				const info = await electronAPI.getSettingsDebug();
				setDebugInfo(info);
			} catch (error) {
				setDebugInfo({ error: error });
			}
		}
	};

	const handleSaveCurrentIndex = async () => {
		const electronAPI = (window as any).electronAPI;
		if (electronAPI && state.sourceFolder) {
			try {
				await electronAPI.savePhotoIndex(state.sourceFolder, state.currentPhotoIndex);
				alert("Current photo index saved successfully!");
			} catch (error) {
				alert("Error saving photo index: " + error);
			}
		}
	};

	const handleGetSavedIndex = async () => {
		const electronAPI = (window as any).electronAPI;
		if (electronAPI && state.sourceFolder) {
			try {
				const savedIndex = await electronAPI.getSavedPhotoIndex(state.sourceFolder);
				alert(`Saved photo index: ${savedIndex}`);
			} catch (error) {
				alert("Error getting saved photo index: " + error);
			}
		}
	};

	if (!isVisible) {
		return (
			<div
				style={{
					position: "fixed",
					top: "10px",
					right: "10px",
					zIndex: 1000,
				}}
			>
				<button
					onClick={() => setIsVisible(true)}
					style={{
						background: "#666",
						color: "white",
						border: "none",
						padding: "5px 10px",
						borderRadius: "3px",
						fontSize: "12px",
					}}
				>
					Debug
				</button>
			</div>
		);
	}

	return (
		<div
			style={{
				position: "fixed",
				top: "10px",
				right: "10px",
				width: "400px",
				background: "white",
				border: "1px solid #ccc",
				borderRadius: "5px",
				padding: "10px",
				zIndex: 1000,
				fontSize: "12px",
				maxHeight: "80vh",
				overflow: "auto",
			}}
		>
			<div
				style={{
					display: "flex",
					justifyContent: "space-between",
					alignItems: "center",
					marginBottom: "10px",
				}}
			>
				<h3 style={{ margin: 0 }}>Debug Panel</h3>
				<button
					onClick={() => setIsVisible(false)}
					style={{ background: "none", border: "none", fontSize: "16px" }}
				>
					×
				</button>
			</div>

			<div style={{ marginBottom: "10px" }}>
				<strong>Current State:</strong>
				<br />
				Photo Index: {state.currentPhotoIndex}
				<br />
				Total Photos: {state.photos.length}
				<br />
				Source Folder: {state.sourceFolder || "None"}
				<br />
			</div>

			<div style={{ marginBottom: "10px" }}>
				<button onClick={handleGetDebugInfo} style={{ marginRight: "5px", padding: "5px" }}>
					Get Settings Info
				</button>
				<button onClick={handleSaveCurrentIndex} style={{ marginRight: "5px", padding: "5px" }}>
					Save Current Index
				</button>
				<button onClick={handleGetSavedIndex} style={{ padding: "5px" }}>
					Get Saved Index
				</button>
			</div>

			{debugInfo && (
				<div style={{ background: "#f5f5f5", padding: "10px", borderRadius: "3px" }}>
					<strong>Debug Info:</strong>
					<pre style={{ fontSize: "11px", overflow: "auto" }}>
						{JSON.stringify(debugInfo, null, 2)}
					</pre>
				</div>
			)}
		</div>
	);
};

export default DebugPanel;
