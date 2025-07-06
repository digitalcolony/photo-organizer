import React, { createContext, useContext, useReducer, ReactNode } from "react";

export interface Photo {
	path: string;
	name: string;
	thumbnail?: string;
}

export interface Album {
	name: string;
	photoCount: number;
}

export interface PhotoState {
	sourceFolder: string | null;
	destinationFolder: string | null;
	photos: Photo[];
	currentPhotoIndex: number;
	albums: Album[];
	isLoading: boolean;
	currentOperation: string | null;
}

export type PhotoAction =
	| { type: "SET_SOURCE_FOLDER"; payload: string }
	| { type: "SET_DESTINATION_FOLDER"; payload: string }
	| { type: "SET_PHOTOS"; payload: Photo[] }
	| { type: "SET_CURRENT_PHOTO"; payload: number }
	| { type: "SET_ALBUMS"; payload: Album[] }
	| { type: "SET_LOADING"; payload: boolean }
	| { type: "SET_OPERATION"; payload: string | null }
	| { type: "NEXT_PHOTO" }
	| { type: "PREVIOUS_PHOTO" }
	| { type: "ADD_ALBUM"; payload: string }
	| { type: "INCREMENT_ALBUM_COUNT"; payload: string };

const initialState: PhotoState = {
	sourceFolder: null,
	destinationFolder: null,
	photos: [],
	currentPhotoIndex: 0,
	albums: [],
	isLoading: false,
	currentOperation: null,
};

function photoReducer(state: PhotoState, action: PhotoAction): PhotoState {
	switch (action.type) {
		case "SET_SOURCE_FOLDER":
			return { ...state, sourceFolder: action.payload };
		case "SET_DESTINATION_FOLDER":
			return { ...state, destinationFolder: action.payload };
		case "SET_PHOTOS":
			return { ...state, photos: action.payload, currentPhotoIndex: 0 };
		case "SET_CURRENT_PHOTO":
			return { ...state, currentPhotoIndex: action.payload };
		case "SET_ALBUMS":
			return { ...state, albums: action.payload.sort((a, b) => a.name.localeCompare(b.name)) };
		case "SET_LOADING":
			return { ...state, isLoading: action.payload };
		case "SET_OPERATION":
			return { ...state, currentOperation: action.payload };
		case "NEXT_PHOTO":
			return {
				...state,
				currentPhotoIndex:
					state.currentPhotoIndex < state.photos.length - 1
						? state.currentPhotoIndex + 1
						: state.currentPhotoIndex,
			};
		case "PREVIOUS_PHOTO":
			return {
				...state,
				currentPhotoIndex:
					state.currentPhotoIndex > 0 ? state.currentPhotoIndex - 1 : state.currentPhotoIndex,
			};
		case "ADD_ALBUM":
			return {
				...state,
				albums: [...state.albums, { name: action.payload, photoCount: 0 }].sort((a, b) =>
					a.name.localeCompare(b.name)
				),
			};
		case "INCREMENT_ALBUM_COUNT":
			return {
				...state,
				albums: state.albums.map((album) =>
					album.name === action.payload ? { ...album, photoCount: album.photoCount + 1 } : album
				),
			};
		default:
			return state;
	}
}

const PhotoContext = createContext<{
	state: PhotoState;
	dispatch: React.Dispatch<PhotoAction>;
} | null>(null);

export const PhotoProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
	const [state, dispatch] = useReducer(photoReducer, initialState);

	return <PhotoContext.Provider value={{ state, dispatch }}>{children}</PhotoContext.Provider>;
};

export const usePhotoContext = () => {
	const context = useContext(PhotoContext);
	if (!context) {
		throw new Error("usePhotoContext must be used within a PhotoProvider");
	}
	return context;
};
