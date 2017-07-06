'''
Polygon data as geo coordinates for districts of City Bonn are available from
    http://stadtplan.bonn.de/geojson?Thema=21247&koordsys=4326
Structure of the JSON data:
{
	"type": "FeatureCollection",
	"features": [{
			"type": "Feature",
			"geometry": {
				"type": "MultiPolygon",
				"crs": {
					"type": "name",
					"properties": {
						"name": "EPSG:4326"
					}
				},
				"coordinates": [[[[7.0628029591,50.7590564324], ...]]]
			},
			"properties": {
				"gid": 102,
				"ortsteil": 2,
				"ortsteil_bez": "Auerberg",
				"bezirk": 1,
				"bezirk_bez": "Bonn"
			}
		},
        ...

Locations of trees for the whole city of Bonn are available from
    http://stadtplan.bonn.de/geojson?Thema=21367&koordsys=4326
There are more than 64.000 registered trees.
Structure of the JSON data:
{
	"type": "FeatureCollection",
	"features": [{
			"type": "Feature",
			"geometry": {
				"type": "Point",
				"crs": {
					"type": "name",
					"properties": {
						"name": "EPSG:4326"
					}
				},
				"coordinates": [7.1636804156, 50.6786305516]
			},
			"properties": {
				"baum_id": 2,
				"anlage": "Zeppelinstr.",
				"anlage_id": 2150,
				"lateinischer_name": "Sorbus intermedia                                                                                   ",
				"deutscher_name": "Schwedische Mehl-/ Oxelbeere                      ",
				"alter": 38
			}
		}
	]
}

Helpful hint for optimizing point in polygon detection:
https://gis.stackexchange.com/a/103066
'''