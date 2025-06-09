import { FC } from "react";
import Deck from "@deck.gl/react";
import { ScatterplotLayer, PolygonLayer, ColumnLayer } from "@deck.gl/layers";
import Map, { NavigationControl } from "react-map-gl/maplibre";
import maplibregl from "maplibre-gl";
import { FeatureWithPolygon, FeatureWithPoint, ViewState } from "../types";
import s from "./MapVisualization.module.css";

const INITIAL_VIEW_STATE: ViewState = {
	longitude: 30.2622,
	latitude: 59.9406,
	zoom: 14,
	pitch: 45,
	bearing: 0,
};

type Props = {
	buildings: FeatureWithPolygon[];
	points: FeatureWithPoint[];
	is3D: boolean;
	setIs3D: (value: boolean) => void;
};

export const MapVisualization: FC<Props> = ({ buildings, points, is3D, setIs3D }) => {
	const layers = [];

	if (is3D) {
		layers.push(
			new PolygonLayer<FeatureWithPolygon>({
				id: "buildings",
				data: buildings,
				extruded: true,
				getPolygon: (f) => f.geometry.coordinates[0],
				getElevation: (f) => Number(f.properties.AGL),
				getFillColor: [0, 0, 0, 60],
				getLineColor: [0, 0, 0, 80],
				getLineWidth: 1,
				lineWidthMinPixels: 1,
				pickable: true,
				wireframe: false,
				opacity: 0.25,
			})
		);
		layers.push(
			new ColumnLayer<FeatureWithPoint>({
				id: "points-3d",
				data: points,
				diskResolution: 4,
				radius: 1,
				getPosition: (f) => [f.geometry.coordinates[0], f.geometry.coordinates[1], 0],
				getElevation: 1.8,
				getFillColor: [255, 0, 0, 255],
				pickable: true,
				extruded: true,
				coverage: 1,
				parameters: {
					// @ts-ignore
					depthTest: false,
				},
			})
		);
	} else {
		layers.push(
			new PolygonLayer<FeatureWithPolygon>({
				id: "buildings",
				data: buildings,
				extruded: false,
				getPolygon: (f) => f.geometry.coordinates[0],
				getFillColor: [140, 170, 180, 200],
				getLineColor: [0, 0, 0, 100],
				getLineWidth: 1,
				lineWidthMinPixels: 1,
				pickable: true,
				wireframe: false,
			})
		);
		layers.push(
			new ScatterplotLayer<FeatureWithPoint>({
				id: "points-2d",
				data: points,
				getPosition: (f) => [f.geometry.coordinates[0], f.geometry.coordinates[1], f.properties.height],
				getRadius: 3,
				getFillColor: [0, 0, 255, 200],
				radiusUnits: "pixels",
				pickable: true,
			})
		);
	}

	return (
		<div className={s.container}>
			<button
				className={s.button}
				onClick={() => setIs3D(!is3D)}>
				{is3D ? "3D" : "2D"}
			</button>
			<Deck
				initialViewState={{ ...INITIAL_VIEW_STATE, pitch: is3D ? 45 : 0 }}
				controller={true}
				layers={layers}
				style={{ position: "relative", width: "100%", height: "100%" }}>
				<Map
					mapStyle="https://tiles.stadiamaps.com/styles/osm_bright.json"
					reuseMaps
					style={{ width: "100%", height: "100%" }}
					mapLib={maplibregl}>
					<NavigationControl
						position="top-right"
						showCompass={false}
					/>
				</Map>
			</Deck>
		</div>
	);
};
