import { FC, useRef, useEffect } from "react";
import Deck from "@deck.gl/react";
import { ScatterplotLayer, PolygonLayer } from "@deck.gl/layers";
import Map, { NavigationControl, MapRef } from "react-map-gl/maplibre";
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
	const mapRef = useRef<MapRef | null>(null);

	function pointToSquareMeter([lng, lat]: [number, number]): number[][] {
		const dLat = 1 / 111320;
		const dLng = 1 / (111320 * Math.cos((lat * Math.PI) / 180));
		return [
			[lng - dLng / 2, lat - dLat / 2],
			[lng + dLng / 2, lat - dLat / 2],
			[lng + dLng / 2, lat + dLat / 2],
			[lng - dLng / 2, lat + dLat / 2],
			[lng - dLng / 2, lat - dLat / 2],
		];
	}

	const pointsGeojson = {
		type: "FeatureCollection" as const,
		features: points.map((f) => ({
			type: "Feature" as const,
			geometry: {
				type: "Polygon" as const,
				coordinates: [pointToSquareMeter(f.geometry.coordinates as [number, number])],
			},
			properties: {
				height: 2,
				color: "#ff0000",
			},
		})),
	};

	useEffect(() => {
		const map = mapRef.current?.getMap();
		if (!map) return;

		if (is3D) {
			if (map.getLayer("points-3d-extrusion")) map.removeLayer("points-3d-extrusion");
			if (map.getSource("points-3d")) map.removeSource("points-3d");
			map.addSource("points-3d", {
				type: "geojson",
				data: pointsGeojson,
			});
			map.addLayer({
				id: "points-3d-extrusion",
				type: "fill-extrusion",
				source: "points-3d",
				paint: {
					"fill-extrusion-color": "#ff0000",
					"fill-extrusion-height": ["get", "height"],
					"fill-extrusion-base": 0,
					"fill-extrusion-opacity": 1,
				},
			});
		} else {
			if (map.getLayer("points-3d-extrusion")) map.removeLayer("points-3d-extrusion");
			if (map.getSource("points-3d")) map.removeSource("points-3d");
		}

		return () => {
			if (map.getLayer("points-3d-extrusion")) map.removeLayer("points-3d-extrusion");
			if (map.getSource("points-3d")) map.removeSource("points-3d");
		};
	}, [is3D, points]);

	if (is3D) {
		layers.push(
			new PolygonLayer<FeatureWithPolygon>({
				id: "buildings",
				data: buildings,
				extruded: true,
				getPolygon: (f) => f.geometry.coordinates[0],
				getElevation: (f) => Number(f.properties.AGL),
				getFillColor: [0, 0, 0, 60],
				getLineColor: [0, 0, 0, 90],
				getLineWidth: 1,
				lineWidthMinPixels: 1,
				pickable: true,
				wireframe: false,
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
				getPosition: (f) => [f.geometry.coordinates[0], f.geometry.coordinates[1]],
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
					mapLib={maplibregl}
					ref={mapRef}>
					<NavigationControl
						position="top-right"
						showCompass={false}
					/>
				</Map>
			</Deck>
		</div>
	);
};
