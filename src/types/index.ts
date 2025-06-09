export type ViewState = {
	longitude: number;
	latitude: number;
	zoom: number;
	pitch: number;
	bearing: number;
};

export type PointFeature = {
	type: "Feature";
	geometry: {
		type: "Point";
		coordinates: [number, number];
	};
	properties: {
		servingcellrsrp: number;
		servingcellrsrq: number;
		height: number;
	};
};

export type FeatureWithPoint = GeoJSON.Feature<GeoJSON.Point, PointFeature["properties"]>;

export type PolygonFeatureProperties = {
	AGL: string;
};

export type FeatureWithPolygon = GeoJSON.Feature<GeoJSON.Polygon, PolygonFeatureProperties>;

export type PointData = {
	data: {
		latitude: number;
		longitude: number;
		height: number;
		servingcellrsrp: number;
		servingcellrsrq: number;
	}[];
};

export type BuildingsData = {
	type: "FeatureCollection";
	features: {
		type: "Feature";
		properties: {
			AGL: string;
		};
		geometry: {
			type: "Polygon";
			coordinates: number[][][];
		};
	}[];
};
