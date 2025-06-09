import { useEffect, useState } from "react";
import { MapVisualization } from "./components/MapVisualization";
import { FeatureWithPolygon, FeatureWithPoint, PointData, BuildingsData } from "./types";
import { POLYGONS_DATA_URL, POINTS_DATA_URL } from "./endpoints";
import { convertPointsToGeoJSON } from "./utils";

const App = () => {
	const [is3D, setIs3D] = useState<boolean>(true);
	const [buildings, setBuildings] = useState<FeatureWithPolygon[]>([]);
	const [points, setPoints] = useState<FeatureWithPoint[]>([]);
	const [loading, setLoading] = useState<boolean>(true);

	useEffect(() => {
		const fetchData = async () => {
			try {
				setLoading(true);
				const buildingsResponse = await fetch(POLYGONS_DATA_URL);
				const buildingsData: BuildingsData = await buildingsResponse.json();
				const pointsResponse = await fetch(POINTS_DATA_URL);
				const points: PointData = await pointsResponse.json();
				const pointsGeoJSON = convertPointsToGeoJSON(points.data);
				setBuildings(buildingsData.features);
				setPoints(pointsGeoJSON);
			} catch (err) {
				console.error("Ошибка при загрузке данных:", err);
			} finally {
				setLoading(false);
			}
		};
		fetchData();
	}, []);

	if (loading) {
		return <div>Загрузка карты...</div>;
	}

	return (
		<MapVisualization
			buildings={buildings}
			points={points}
			is3D={is3D}
			setIs3D={setIs3D}
		/>
	);
};

export default App;
