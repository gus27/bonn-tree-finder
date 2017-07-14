# Data Generation

The size of the tree data JSON file is [around 27 MB](http://stadtplan.bonn.de/geojson?Thema=21367&koordsys=4326) big. This would take too much time when loaded by an AJAX request. So I wrote a python script to split the data: one JSON file per district. The districts polygons can be found [here](http://stadtplan.bonn.de/geojson?Thema=21247&koordsys=4326). I used [shapely.geometry](https://pypi.python.org/pypi/Shapely) to determine which tree belongs to which district. Python's [rtree module](https://pypi.python.org/pypi/Rtree/) speeds up the process.

## File Structure
Polygon data as geo coordinates for districts of Bonn are available from [here](http://stadtplan.bonn.de/geojson?Thema=21247&koordsys=4326).

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

Locations of trees for the whole city of Bonn are available from [here](http://stadtplan.bonn.de/geojson?Thema=21367&koordsys=4326). There are more than 64,000 registered trees.

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

## Hints
Helpful hint for optimizing point in polygon detection: https://gis.stackexchange.com/a/103066
