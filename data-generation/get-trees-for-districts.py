#!/usr/bin/env python
# -*- coding: utf-8 -*-

import sys
import urllib.request
import json
import re
#from pyproj import Proj, transform
from shapely.geometry import mapping, shape, asShape, Point
from rtree import index

urlDistrictsBonn = "http://stadtplan.bonn.de/geojson?Thema=21247&koordsys=4326"
urlTreesBonn = "http://stadtplan.bonn.de/geojson?Thema=21367&koordsys=4326"

def generateFilename(ustr):
    mapping = {
        ord(u"ä"): u"ae",
        ord(u"ö"): u"oe",
        ord(u"ü"): u"ue",
        ord(u"ß"): u"ss"
    }
    ustr = re.sub(' ', '', ustr.lower())
    ustr = ustr.translate(mapping)
    ustr = re.sub('[^a-z]', '_', ustr)
    return "trees-{}.json".format(ustr)

def addTreeToDistrict(district, feature):
    latin_name = feature['properties']['lateinischer_name']
    german_name = feature['properties']['deutscher_name']
    age = feature['properties']['alter']
    orgCoordinates = feature['geometry']['coordinates']
    coordinates = {
        'lat': orgCoordinates[1],
        'lng': orgCoordinates[0]
    }
    district['trees'].append({
        'coordinates': coordinates,
        'id': feature['properties']['baum_id'],
        'facility': feature['properties']['anlage'],
        'facility_id': feature['properties']['anlage_id'],
        'latin_name': latin_name.strip() if latin_name!=None else '',
        'german_name': german_name.strip() if german_name!=None else '',
        'age': age if age!=None else 0
    });

def loadDistricts():
    response = urllib.request.urlopen(urlDistrictsBonn)
    districtsData = json.loads(response.read().decode("iso8859-1","ignore"))
    districts = {}
    for feature in districtsData['features']:
        name = feature['properties']['ortsteil_bez']
        filename = generateFilename(name)
        print("Found district {}".format(name))

        orgCoordinates = feature['geometry']['coordinates'][0][0]
        coordinates = []
        for coordinate in orgCoordinates:
            coordinates.append({
                'lat': coordinate[1],
                'lng': coordinate[0]
            })

        geometry = feature['geometry']
        shape = asShape(geometry);
        districts[name] = {
            'name' : name.strip(),
            'filename': filename,
            'shape': shape,
            'coordinates': coordinates,
            'trees': []
        }
        #break # just for testing purpose
    return districts

def loadTrees(districts):
    print("Loading trees... ", flush=True)
    response = urllib.request.urlopen(urlTreesBonn)
    treesData = json.loads(response.read().decode("iso8859-1","ignore"))
    p = {
        "type": "Point",
        "crs": {
            "type": "name",
            "properties": {
                "name": "EPSG:4326"
            }
        },
        "coordinates": (0, 0)
    }
    print("Assigning {} trees... ".format(len(treesData['features'])), end='', flush=True)

    idx = index.Index()

    districtList = list(districts.items())
    for i, val in enumerate(districtList):
        name, district = val
        idx.insert(i, district['shape'].bounds)

    c = 1
    for feature in treesData['features']:
        if c % 100 == 0:
            print('*', end='', flush=True)
        c += 1
        p['coordinates'] = tuple(feature['geometry']['coordinates'])
        point = asShape(p)

        #for name, district in districts.items():
        hits = list()
        for idxno in idx.intersection(point.coords[0]):
            name, district = districtList[idxno]
            shape = district['shape']
            if shape.contains(point):
                addTreeToDistrict(district, feature)
                # break here, because a tree should only belong to one district
                break
    print()

def optimizeForJson(districts):
    # optimize district structure for JSON:
    for name, district in districts.items():
        # remove shape and coordinates from district - it is not needed in the resulting JSON
        del district['shape']
        
def getDistrictSummary(districts):
    summary = {'totalCount': len(districts), 'districts': []}
    for name, district in districts.items():
        summary['districts'].append({
            'name': district['name'],
            'filename': district['filename'],
            'totalTreeCount': len(district['trees']),
        })
    return summary

districts = loadDistricts()
loadTrees(districts)
districtSummary = getDistrictSummary(districts)
optimizeForJson(districts)

f = open("districts.json", "w")
f.write(json.dumps(districtSummary))
f.close()

for name, district in districts.items():
    print("Writing file {}".format(district['filename']), flush=True)
    f = open(district['filename'], "w")
    f.write(json.dumps(district))
    f.close()

