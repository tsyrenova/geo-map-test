import { PointData, PointFeature } from "../types";

export const convertPointsToGeoJSON = (points: PointData["data"]): PointFeature[] => {
	return points.map((point) => ({
		type: "Feature",
		geometry: {
			type: "Point",
			coordinates: [point.longitude, point.latitude],
		},
		properties: {
			servingcellrsrp: point.servingcellrsrp,
			servingcellrsrq: point.servingcellrsrq,
			height: point.height,
		},
	}));
};