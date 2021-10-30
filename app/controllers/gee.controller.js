const ee = require('@google/earthengine');
var pool_db = require("../config/crdb.config").pool_db;
const db = require("../models");
const config = require("../config/auth.config");
const User = db.user;
const Role = db.role;
const Province = db.province;
const { verifySignUp } = require("../middlewares");

// user
exports.taianh = async(req, res) => {
    var urlDownload = [];
    var dem = 1000;
    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2']
    };
    var a = 0.018018018;
    await pool_db.connect(async function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, async function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    var ma_khs = result;
                    var check = 0;
                    if (typeof req.body.check_ma_kh === "string") {
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var lat = parseFloat(result.rows[0].lat);
                                        var long = parseFloat(result.rows[0].long);
                                        var geometry = ee.Geometry.Polygon(
                                            [
                                                [
                                                    [long - a, lat + a],
                                                    [long - a, lat - a],
                                                    [long + a, lat - a],
                                                    [long + a, lat + a]
                                                ]
                                            ], null, false);

                                        var image = ee.Image("COPERNICUS/S2_SR/" + req.body.id_anh);
                                        var clipped = image.clip(geometry);
                                        var visualized = clipped.visualize(rgbVis);
                                        var downloadArgs = {
                                            name: 'sentinel2_' + req.body.check_ma_kh + "_" + req.body.id_anh,
                                            filePerBand: false,
                                            crs: 'EPSG:4326',
                                            scale: 10,
                                            region: geometry
                                        };
                                        var url = visualized.getDownloadURL(downloadArgs);
                                        urlDownload.push({
                                            "urlDownload": url,
                                            "urlFormat": visualized.getMap().urlFormat,
                                            "tenAnh": downloadArgs.name
                                        });
                                    }
                                });
                            }
                        });
                        dem += 3000;
                    } else {
                        await req.body.check_ma_kh.forEach(e => {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry = ee.Geometry.Polygon(
                                                [
                                                    [
                                                        [long - a, lat + a],
                                                        [long - a, lat - a],
                                                        [long + a, lat - a],
                                                        [long + a, lat + a]
                                                    ]
                                                ], null, false);
                                            var image = ee.Image("COPERNICUS/S2_SR/" + req.body.id_anh);
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'sentinel2_' + e + "_" + req.body.id_anh,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });
                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        });
                    }
                    var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                    var NumOfFile = AssetList.assets.length;
                    var dsanh = [];
                    for (var i = 0; i < NumOfFile; i++) {
                        dsanh.push({
                            "name": AssetList.assets[i].name,
                            "id": AssetList.assets[i].id
                        });
                    };
                    await setTimeout(async() => {
                        await res.render("linkAnh", { dsanh: dsanh, ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User });
                    }, dem);
                }
            });
        }
    });

};
exports.sentinel2 = async(req, res) => {
    var urlDownload = [];
    var dem = 1000;
    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2']
    };
    var a = 0.018018018;
    if (req.body.loai_anh == "sentinel2") {
        var s2 = ee.ImageCollection("COPERNICUS/S2_SR");
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        var check = 0;
                        if (typeof req.body.check_ma_kh === "string") {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry = ee.Geometry.Polygon(
                                                [
                                                    [
                                                        [long - a, lat + a],
                                                        [long - a, lat - a],
                                                        [long + a, lat - a],
                                                        [long + a, lat + a]
                                                    ]
                                                ], null, false);
                                            var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 90))
                                                .filter(ee.Filter.date(req.body.startDate, req.body.endDate))
                                                .filter(ee.Filter.bounds(geometry));
                                            console.log();
                                            if (filtered.size().getInfo() != 0) {
                                                var d = 0;
                                                d += 1;
                                                if (d > 0) {
                                                    check += 1;
                                                }
                                                check += 1;
                                            };
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'sentinel2_' + req.body.check_ma_kh + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });
                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        } else {
                            await req.body.check_ma_kh.forEach(e => {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var lat = parseFloat(result.rows[0].lat);
                                                var long = parseFloat(result.rows[0].long);
                                                var geometry = ee.Geometry.Polygon(
                                                    [
                                                        [
                                                            [long - a, lat + a],
                                                            [long - a, lat - a],
                                                            [long + a, lat - a],
                                                            [long + a, lat + a]
                                                        ]
                                                    ], null, false);
                                                var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 90))
                                                    .filter(ee.Filter.date(req.body.startDate, req.body.endDate))
                                                    .filter(ee.Filter.bounds(geometry));
                                                if (filtered.size().getInfo() != 0) {
                                                    var d = 0;
                                                    d += 1;
                                                    if (d > 0) {
                                                        check += 1;
                                                    }
                                                    check += 1;
                                                };
                                                var image = filtered.median();
                                                var clipped = image.clip(geometry);
                                                var visualized = clipped.visualize(rgbVis);
                                                var downloadArgs = {
                                                    name: 'sentinel2_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                    filePerBand: false,
                                                    crs: 'EPSG:4326',
                                                    scale: 10,
                                                    region: geometry
                                                };
                                                var url = visualized.getDownloadURL(downloadArgs);
                                                urlDownload.push({
                                                    "urlDownload": url,
                                                    "urlFormat": visualized.getMap().urlFormat,
                                                    "tenAnh": downloadArgs.name
                                                });
                                            }
                                        });
                                    }
                                });
                                dem += 3000;
                            });
                        }
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                        };
                        await setTimeout(async() => {
                            if (check == 0) {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var province = result;
                                                pool_db.connect(function(err, client, done) {
                                                    if (err) {
                                                        return console.log("error:" + err);
                                                    } else {
                                                        client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                                            done();
                                                            if (err) {
                                                                res.end();
                                                                return console.error('error running query1', err);
                                                            } else {
                                                                var data = [];
                                                                result.rows.forEach((e) => {
                                                                    data.push({
                                                                        "loc": [e.lat, e.long],
                                                                        "title": e.ma_kh,
                                                                        "ten_dv": e.ten_dv,
                                                                        "congsuat": e.cong_suat,
                                                                        "stt": e.stt,
                                                                    });
                                                                });
                                                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                                var NumOfFile = AssetList.assets.length;
                                                                var dsanh = [];
                                                                var dem = 1000;
                                                                for (var i = 0; i < NumOfFile; i++) {
                                                                    dsanh.push({
                                                                        "name": AssetList.assets[i].name,
                                                                        "id": AssetList.assets[i].id
                                                                    });
                                                                    dem += 1000;
                                                                }
                                                                setTimeout(() => {
                                                                    res.render('home', { alert: "khongcoanh", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                                                }, dem);
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            } else {
                                await res.render("linkAnh", { dsanh: dsanh, ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User });
                            }
                        }, dem);
                    }
                });
            }
        });

    } else {
        var rgbVis = {
            min: 0.0,
            max: 0.3,
            bands: ['B4', 'B3', 'B2']
        };
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        var check = 0;
                        if (typeof req.body.check_ma_kh === "object") {
                            await req.body.check_ma_kh.forEach(e => {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                                                var lat = parseFloat(result.rows[0].lat);
                                                var long = parseFloat(result.rows[0].long);
                                                var geometry =
                                                    ee.Geometry.Polygon(
                                                        [
                                                            [
                                                                [long - a, lat + a],
                                                                [long - a, lat - a],
                                                                [long + a, lat - a],
                                                                [long + a, lat + a]
                                                            ]
                                                        ], null, false);
                                                var filtered = land.filter(ee.Filter.date(req.body.startDate, req.body.endDate)).filter(ee.Filter.bounds(geometry));
                                                if (filtered.size().getInfo() != 0) {
                                                    var d = 0;
                                                    d += 1;
                                                    if (d > 0) {
                                                        check += 1;
                                                    }
                                                    check += 1;
                                                };
                                                var image = filtered.median();
                                                var clipped = image.clip(geometry);
                                                var visualized = clipped.visualize(rgbVis);
                                                var downloadArgs = {
                                                    name: 'landsat_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                    filePerBand: false,
                                                    crs: 'EPSG:4326',
                                                    scale: 10,
                                                    region: geometry
                                                };
                                                var url = visualized.getDownloadURL(downloadArgs);
                                                urlDownload.push({
                                                    "urlDownload": url,
                                                    "urlFormat": visualized.getMap().urlFormat,
                                                    "tenAnh": downloadArgs.name
                                                });

                                            }
                                        });
                                    }
                                });
                                dem += 3000;
                            });
                        } else {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry =
                                                ee.Geometry.Polygon(
                                                    [
                                                        [
                                                            [long - a, lat + a],
                                                            [long - a, lat - a],
                                                            [long + a, lat - a],
                                                            [long + a, lat + a]
                                                        ]
                                                    ], null, false);
                                            var filtered = land.filter(ee.Filter.date(req.body.startDate, req.body.endDate)).filter(ee.Filter.bounds(geometry));
                                            if (filtered.size().getInfo() != 0) {
                                                var d = 0;
                                                d += 1;
                                                if (d > 0) {
                                                    check += 1;
                                                }
                                                check += 1;
                                            };
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'landsat_' + req.body.check_ma_kh + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });

                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        }
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                        };

                        await setTimeout(async() => {
                            if (check == 0) {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var province = result;
                                                pool_db.connect(function(err, client, done) {
                                                    if (err) {
                                                        return console.log("error:" + err);
                                                    } else {
                                                        client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                                            done();
                                                            if (err) {
                                                                res.end();
                                                                return console.error('error running query1', err);
                                                            } else {
                                                                var data = [];
                                                                result.rows.forEach((e) => {
                                                                    data.push({
                                                                        "loc": [e.lat, e.long],
                                                                        "title": e.ma_kh,
                                                                        "ten_dv": e.ten_dv,
                                                                        "congsuat": e.cong_suat,
                                                                        "stt": e.stt,
                                                                    });
                                                                });
                                                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                                var NumOfFile = AssetList.assets.length;
                                                                var dsanh = [];
                                                                var dem = 1000;
                                                                for (var i = 0; i < NumOfFile; i++) {
                                                                    dsanh.push({
                                                                        "name": AssetList.assets[i].name,
                                                                        "id": AssetList.assets[i].id
                                                                    });
                                                                    dem += 1000;
                                                                }
                                                                setTimeout(() => {
                                                                    res.render('home', { alert: "khongcoanh", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                                                }, dem);
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            } else {
                                await res.render("linkAnh", { dsanh: dsanh, ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User });
                            }
                        }, dem);
                    }
                });
            }
        });

    };
};
exports.landsat = (req, res) => {
    if (req.body.kenhMau == 2 && req.body.level == 2) {
        var maskL8 = function(image) {
            var qa = image.select('BQA');
            var mask = qa.bitwiseAnd(1 << 4).eq(0);
            return image.updateMask(mask);
        };
        var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA').map(maskL8);
        var start = req.body.startDateLS;
        var end = req.body.endDateLS;
        var reg = req.body.regionLS;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level3");
        var urban = ur.filter(ee.Filter.eq('ADM3_NAME', reg))
        var geometry = urban.geometry()
        var filtered = land.filter(ee.Filter.date(start, end)).map(maskL8).filter(ee.Filter.bounds(geometry));
        var image = filtered.median();
        var nbr = image.normalizedDifference(['B5', 'B6']).rename(['nbr']);
        var nbrVis = { min: -0.5, max: 1.3, palette: ['#660066', '#ee0000', 'ff9933', 'ffff66', '33ff00', '#66cc33', '#336600'] };
        var clipped = nbr.clip(geometry);
        var visualized = clipped.visualize(nbrVis);
        var downloadArgs = {
            name: 'ee_image',
            filePerBand: false,
            crs: 'EPSG:4326',
            scale: 20,
            region: geometry
        };
        var url = visualized.getDownloadURL(downloadArgs);
        res.render("index", { urlFormat: visualized.getMap().urlFormat, searchSolarStation: null, linkDownloadLS: url, linkDownload: null, provinceId: req.session.provinceId });
    } else if (req.body.kenhMau == 2 && req.body.level == 1) {
        var maskL8 = function(image) {
            var qa = image.select('BQA');
            var mask = qa.bitwiseAnd(1 << 4).eq(0);
            return image.updateMask(mask);
        };
        var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA').map(maskL8);
        var start = req.body.startDateLS;
        var end = req.body.endDateLS;
        var reg = req.body.regionLS;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
        var urban = ur.filter(ee.Filter.eq('ADM2_NAME', reg))
        var geometry = urban.geometry()
        var filtered = land.filter(ee.Filter.date(start, end)).map(maskL8).filter(ee.Filter.bounds(geometry));
        var image = filtered.median();
        var nbr = image.normalizedDifference(['B5', 'B6']).rename(['nbr']);
        var nbrVis = { min: -0.5, max: 1.3, palette: ['#660066', '#ee0000', 'ff9933', 'ffff66', '33ff00', '#66cc33', '#336600'] };
        var clipped = nbr.clip(geometry);
        var visualized = clipped.visualize(nbrVis);
        var downloadArgs = {
            name: 'ee_image',
            filePerBand: false,
            crs: 'EPSG:4326',
            scale: 20,
            region: geometry
        };
        var url = visualized.getDownloadURL(downloadArgs);
        res.render("index", { urlFormat: visualized.getMap().urlFormat, searchSolarStation: null, searchSolarStation1: null, linkDownloadLS: url, linkDownload: null, provinceId: req.session.provinceId });
    } else if (req.body.kenhMau == 1 && req.body.level == 1) {
        var maskL8 = function(image) {
            var qa = image.select('BQA');
            var mask = qa.bitwiseAnd(1 << 4).eq(0);
            return image.updateMask(mask);
        };
        var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA').map(maskL8);
        var start = req.body.startDateLS;
        var end = req.body.endDateLS;
        var reg = req.body.regionLS;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
        var urban = ur.filter(ee.Filter.eq('ADM2_NAME', reg))
        var geometry = urban.geometry()
        var filtered = land.filter(ee.Filter.date(start, end)).map(maskL8).filter(ee.Filter.bounds(geometry));
        var image = filtered.median();
        var nbr = image.normalizedDifference(['B5', 'B6']).rename(['nbr']);
        var nbrVis = { min: -0.5, max: 1.3, palette: ['#660066', '#ee0000', 'ff9933', 'ffff66', '33ff00', '#66cc33', '#336600'] };
        var clipped = nbr.clip(geometry);
        var visualized = clipped.visualize(nbrVis);
        var downloadArgs = {
            name: 'ee_image',
            filePerBand: false,
            crs: 'EPSG:4326',
            scale: 20,
            region: geometry
        };
        var url = visualized.getDownloadURL(downloadArgs);
        res.render("index", { urlFormat: visualized.getMap().urlFormat, searchSolarStation: null, searchSolarStation1: null, linkDownloadLS: url, linkDownload: null, provinceId: req.session.provinceId });
    } else {
        var maskL8 = function(image) {
            var qa = image.select('BQA');
            var mask = qa.bitwiseAnd(1 << 4).eq(0);
            return image.updateMask(mask);
        };
        var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA').map(maskL8);
        var start = req.body.startDateLS;
        var end = req.body.endDateLS;
        var reg = req.body.regionLS;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level3");
        var urban = ur.filter(ee.Filter.eq('ADM3_NAME', reg))
        var geometry = urban.geometry()
        var filtered = land.filter(ee.Filter.date(start, end)).map(maskL8).filter(ee.Filter.bounds(geometry));
        var image = filtered.median();
        var clipped = image.clip(geometry);
        var rgbVis = {
            min: 0,
            max: 0.3,
            bands: ['B4', 'B3', 'B2'],
        }
        var visualized = clipped.visualize(rgbVis)
        var downloadArgs = {
            name: 'ee_image',
            filePerBand: false,
            crs: 'EPSG:4326',
            scale: 20,
            region: geometry
        };
        var url = visualized.getDownloadURL(downloadArgs);
        res.render("index", { urlFormat: visualized.getMap().urlFormat, linkDownloadLS: url, linkDownload: null, provinceId: req.session.provinceId, searchSolarStation: null, searchSolarStation1: null });
    };
};
exports.import = (req, res) => {
    pool_db.connect(function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`insert into solar_stations("ten_dv", "ma_kh", "cong_suat", "lat", "long", "provinceId", "geom") values('${req.body.ten_dv}', '${req.body.ma_kh}', ${req.body.cong_suat}, ${req.body.lat}000000, ${req.body.long}00000, ${req.session.provinceId}, ST_SetSRID(ST_MakePoint(${req.body.long}00000,${req.body.lat}000000),4326))`, function(err) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    res.redirect("../data");
                }
            });
        }
    });
};
exports.delete = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        var solarId = req.params.gid
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`DELETE FROM solar_stations WHERE "gid" = ${solarId}`, function(err) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        if (req.session.roles == "admin") {
                            res.redirect("../manager");
                        } else {
                            res.redirect("../data");
                        }
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    };
};
exports.updateStation = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        var solarId = req.params.gid
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`UPDATE solar_stations SET "ma_kh" = '${req.body.ma_kh}', "ten_dv" = '${req.body.ten_dv}', "cong_suat" = ${req.body.cong_suat}, "lat" = ${req.body.lat}, "long" = ${req.body.long}, "geom" = ST_SetSRID(ST_MakePoint(${req.body.long}00000,${req.body.lat}000000),4326) WHERE "gid" = ${solarId}`, function(err) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        if (req.session.roles == "admin") {
                            res.redirect("../manager");
                        } else {
                            res.redirect("../data");
                        }
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    };
};
exports.deleteAll = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`DELETE FROM solar_stations WHERE "provinceId" = ${req.session.provinceId}`, function(err) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        if (req.session.roles == "admin") {
                            res.redirect("../manager");
                        } else {
                            res.redirect("../data");
                        }
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    };
};
exports.data = (req, res) => {
    if (req.session.User && req.session.provinceId) {

        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var dstrampin = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT "provinceName" FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        };
                                        res.render("data", { anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: result });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    }
};
exports.home = (req, res) => {
    req.session.destroy();
    res.render('home', { dateL: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: null, province: province, data: null, dateR: null, anh: null, searchAnh: null, username: null, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
};
exports.homeUser = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var provinces = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var province = result;
                                        pool_db.connect(function(err, client, done) {
                                            if (err) {
                                                return console.log("error:" + err);
                                            } else {
                                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, async function(err, result, row) {
                                                    done();
                                                    if (err) {
                                                        res.end();
                                                        return console.error('error running query1', err);
                                                    } else {
                                                        var data = [];
                                                        result.rows.forEach((e) => {
                                                            data.push({
                                                                "loc": [e.lat, e.long],
                                                                "title": e.ma_kh,
                                                                "ten_dv": e.ten_dv,
                                                                "congsuat": e.cong_suat,
                                                                "stt": e.stt,
                                                            });
                                                        });
                                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                        var NumOfFile = AssetList.assets.length;
                                                        var dsanh = [];
                                                        var dem = 1000;
                                                        for (var i = 0; i < NumOfFile; i++) {
                                                            dsanh.push({
                                                                "name": AssetList.assets[i].name,
                                                                "id": AssetList.assets[i].id
                                                            });
                                                            dem += 1000;
                                                        }
                                                        setTimeout(() => {
                                                            res.render('home', { provinces: provinces, alert: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                                        }, dem);
                                                    }
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.search = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('search', { id_anh: null, alert: null, err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.anh = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        };
                                        var rgbVis = {
                                            min: 0.0,
                                            max: 2800,
                                            gamma: 1.15,
                                            bands: ['B4', 'B3', 'B2']
                                        };
                                        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
                                        var urban = ur.filter(ee.Filter.eq('ADM1_NAME', province.rows[0].provinceName));
                                        var geometry = urban.geometry();
                                        var image = ee.Image("COPERNICUS/S2_SR/" + req.params.id);
                                        var clipped = image.clip(geometry)
                                        var visualized = clipped.visualize(rgbVis)
                                        setTimeout(() => {
                                            res.render('search', { id_anh: req.params.id, alert: null, err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: visualized.getMap().urlFormat, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.searchAnh = (req, res) => {
    var dobL = new Date(req.body.startD);
    var dobR = new Date(req.body.endD);
    var monthL = dobL.getMonth();
    var dayL = dobL.getDate();
    var yearL = dobL.getFullYear();
    var monthR = dobR.getMonth();
    var dayR = dobR.getDate();
    var yearR = dobR.getFullYear();
    if (monthL == monthR && yearL == yearR && dayL >= dayR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('search', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else if (monthL > monthR && yearL == yearR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('search', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else if (yearL > yearR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('search', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        var listAnh = [];
        var dem = 1000;
        var col = ee.ImageCollection("COPERNICUS/S2_SR");
        var reg = req.body.region;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
        var urban = ur.filter(ee.Filter.eq('ADM1_NAME', reg));
        var geometry = urban.geometry();
        console.log(req.body.startD);
        console.log(req.body.endD);
        var filtered = col.filter(ee.Filter.date(req.body.startD, req.body.endD)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
        var s = filtered.size();
        if (s.getInfo() == 0) {
            pool_db.connect(function(err, client, done) {
                if (err) {
                    return console.log("error:" + err);
                } else {
                    client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('error running query', err);
                        } else {
                            var province = result;
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query1', err);
                                        } else {
                                            var data = [];
                                            result.rows.forEach((e) => {
                                                data.push({
                                                    "loc": [e.lat, e.long],
                                                    "title": e.ma_kh,
                                                    "ten_dv": e.ten_dv,
                                                    "congsuat": e.cong_suat,
                                                    "stt": e.stt,
                                                });
                                            });
                                            var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                            var NumOfFile = AssetList.assets.length;
                                            var dsanh = [];
                                            var dem = 1000;
                                            for (var i = 0; i < NumOfFile; i++) {
                                                dsanh.push({
                                                    "name": AssetList.assets[i].name,
                                                    "id": AssetList.assets[i].id
                                                });
                                                dem += 1000;
                                            }
                                            setTimeout(() => {
                                                res.render('search', { id_anh: null, alert: '<script>alert("Không tìm thấy ảnh")</script>', err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                            }, dem);
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            })
        } else {
            var li = filtered.toList(s);
            li.getInfo().forEach(element => {
                listAnh.push({
                    "id": element.id,
                    "link": element.id.replace("COPERNICUS/S2_SR/", ""),
                    "date": element.id.slice(17, 21) + "-" + element.id.slice(21, 23) + "-" + element.id.slice(23, 25),
                });
                console.log();
                dem += 500;
            });
            if (req.session.User && req.session.provinceId) {
                pool_db.connect(function(err, client, done) {
                    if (err) {
                        return console.log("error:" + err);
                    } else {
                        client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                            done();
                            if (err) {
                                res.end();
                                return console.error('error running query', err);
                            } else {
                                var dstrampin = result;
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT "provinceName" FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query1', err);
                                            } else {
                                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                var NumOfFile = AssetList.assets.length;
                                                var dsanh = [];
                                                for (var i = 0; i < NumOfFile; i++) {
                                                    dsanh.push({
                                                        "name": AssetList.assets[i].name,
                                                        "id": AssetList.assets[i].id
                                                    });
                                                };
                                                setTimeout(() => {
                                                    res.render("listAnh", { err: null, anh: null, listAnh: listAnh, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: result });
                                                }, dem);
                                            }
                                        });
                                    }
                                })
                            }
                        });
                    }
                });
            } else {
                res.redirect("../login");
            }
        }

    }

};
exports.splitPanel = (req, res) => {
    var dobL = new Date(req.body.dateLeft);
    var dobR = new Date(req.body.dateRight);
    var monthL = dobL.getMonth() + 1;
    var dayL = dobL.getDate();
    var yearL = dobL.getFullYear();
    var monthR = dobR.getMonth() + 1;
    var dayR = dobR.getDate();
    var yearR = dobR.getFullYear();
    if (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8 || monthR == 10 || monthR == 12) {
        if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR >= 10) {
            var startR = yearR + "-" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) >= 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 5 || monthR == 7)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 5 || monthR == 7)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 10)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 10)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 1)) {
            var startR = (yearR - 1) + "-" + (12) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 1)) {
            var startR = (yearR - 1) + "-" + (12) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 3) && (yearR % 4 == 0)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 3 && (yearR % 4 == 0))) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (28);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 3) && (yearR % 4 != 0)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (28);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 3 && (yearR % 4 != 0))) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (27);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 30 && (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 30 && (monthR == 10)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 30 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = (yearR + 1) + "-0" + (1) + "-0" + (1);
        } else if (dayR == 31 && (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 31 && (monthR == 10)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 31 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = (yearR + 1) + "-0" + (1) + "-0" + (2);
        } else {
            if (monthR >= 10) {
                var startR = yearR + "-" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-" + monthR + "-" + (dayR + 2);
            } else {
                var startR = yearR + "-0" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
            }
        }
    }
    if (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9 || monthR == 11) {
        if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR >= 10) {
            var startR = yearR + "-" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) >= 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 30 && (monthR == 4 || monthR == 6)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 30 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 30 && (monthR == 9)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 29 && (monthR == 2 || monthR == 4 || monthR == 6)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 29 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 29 && (monthR == 9)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 28 && (monthR == 2) && (yearR % 4 == 0)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 28 && (monthR == 2) && (yearR % 4 != 0)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else {
            if (monthR >= 10) {
                var startR = yearR + "-" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-" + monthR + "-" + (dayR + 2);
            } else {
                var startR = yearR + "-0" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
            }

        }
    }
    if (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8 || monthL == 10 || monthL == 12) {
        if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL >= 10) {
            var startL = yearL + "-" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) >= 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 5 || monthL == 7)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 5 || monthL == 7)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 10)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 10)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 1)) {
            var startL = (yearL - 1) + "-" + (12) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 1)) {
            var startL = (yearL - 1) + "-" + (12) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 3) && (yearL % 4 == 0)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 3 && (yearL % 4 == 0))) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (28);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 3) && (yearL % 4 != 0)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (28);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 3 && (yearL % 4 != 0))) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (27);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 30 && (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 30 && (monthL == 10)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 30 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = (yearL + 1) + "-0" + (1) + "-0" + (1);
        } else if (dayL == 31 && (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 31 && (monthL == 10)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 31 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = (yearL + 1) + "-0" + (1) + "-0" + (2);
        } else {
            if (monthL >= 10) {
                var startL = yearL + "-" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-" + monthL + "-" + (dayL + 2);
            } else {
                var startL = yearL + "-0" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
            }
        }
    }
    if (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9 || monthL == 11) {
        if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL >= 10) {
            var startL = yearL + "-" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) >= 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 30 && (monthL == 4 || monthL == 6)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 30 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 30 && (monthL == 9)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 29 && (monthL == 2 || monthL == 4 || monthL == 6)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 29 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 29 && (monthL == 9)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 28 && (monthL == 2) && (yearL % 4 == 0)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 28 && (monthL == 2) && (yearL % 4 != 0)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else {
            if (monthL >= 10) {
                var startL = yearL + "-" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-" + monthL + "-" + (dayL + 2);
            } else {
                var startL = yearL + "-0" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
            }

        }
    }

    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2'],
    }
    var col = ee.ImageCollection("COPERNICUS/S2_SR");
    var reg = req.body.region;
    var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
    var urban = ur.filter(ee.Filter.eq('ADM1_NAME', reg));
    var geometry = urban.geometry();
    var filtered = col.filter(ee.Filter.date(startL, endL)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
    var image = filtered.median();
    var filtered1 = col.filter(ee.Filter.date(startR, endR)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
    var image1 = filtered1.median();
    var clipped = image.clip(geometry);
    var visualized = clipped.visualize(rgbVis);
    var clipped1 = image1.clip(geometry);
    var visualized1 = clipped1.visualize(rgbVis);
    if (req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        };

                                        res.render("home", { alert: null, sdL: startL, edL: endL, sdR: startR, edR: endR, ma_khs: result, province: province, data: JSON.stringify(data), dateL: req.body.dateLeft, dateR: req.body.dateRight, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, urlFormat1: visualized1.getMap().urlFormat, urlFormat: visualized.getMap().urlFormat, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: null });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    } else {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations where "provinceId" = 0`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query1', err);
                    } else {
                        var data = [];
                        result.rows.forEach((e) => {
                            data.push({
                                "loc": [e.lat, e.long],
                                "title": e.ma_kh,
                                "ten_dv": e.ten_dv,
                                "congsuat": e.cong_suat,
                                "stt": e.stt,
                            });
                        });
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        var dem = 1000;
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                            dem += 1000;
                        };
                        res.render("home", { alert: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: null, data: JSON.stringify(data), dateL: req.body.dateLeft, dateR: req.body.dateRight, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, urlFormat1: visualized1.getMap().urlFormat, urlFormat: visualized.getMap().urlFormat, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: null });
                    }
                });
            }
        });
    };


};
exports.xemAnhCoSan = (req, res) => {
    console.log(req.body.anh);
    pool_db.connect(function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`SELECT * FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    var province = result;
                    pool_db.connect(function(err, client, done) {
                        if (err) {
                            return console.log("error:" + err);
                        } else {
                            client.query(`SELECT * FROM solar_stations where "provinceId" = ${req.session.provinceId}`, function(err, result, row) {
                                done();
                                if (err) {
                                    res.end();
                                    return console.error('error running query1', err);
                                } else {
                                    var data = [];
                                    result.rows.forEach((e) => {
                                        data.push({
                                            "loc": [e.lat, e.long],
                                            "title": e.ma_kh,
                                            "ten_dv": e.ten_dv,
                                            "congsuat": e.cong_suat,
                                            "stt": e.stt,
                                        });
                                    });
                                    var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                    var NumOfFile = AssetList.assets.length;
                                    var dsanh = [];
                                    var dem = 1000;
                                    for (var i = 0; i < NumOfFile; i++) {
                                        dsanh.push({
                                            "name": AssetList.assets[i].name,
                                            "id": AssetList.assets[i].id
                                        });
                                        dem += 1000;
                                    }
                                    var anh = ee.Image(req.body.anh).getMap().urlFormat
                                    res.render('home', { alert: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: anh, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                }
                            });
                        }
                    })
                }
            });
        }
    });
};
//end user


//admin
exports.sentinel2Admin = async(req, res) => {
    var urlDownload = [];
    var dem = 1000;
    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2']
    };
    var a = 0.018018018;
    if (req.body.loai_anh == "sentinel2") {
        var s2 = ee.ImageCollection("COPERNICUS/S2_SR");
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        await req.body.check_ma_kh.forEach(e => {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry = ee.Geometry.Polygon(
                                                [
                                                    [
                                                        [long - a, lat + a],
                                                        [long - a, lat - a],
                                                        [long + a, lat - a],
                                                        [long + a, lat + a]
                                                    ]
                                                ], null, false);
                                            var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 90))
                                                .filter(ee.Filter.date(req.body.startDate, req.body.endDate))
                                                .filter(ee.Filter.bounds(geometry));
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'sentinel2_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });
                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        });
                        await setTimeout(async() => {
                            await res.render("linkAdmin", { ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User });
                        }, dem);
                    }
                });
            }
        });

    } else {
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        await req.body.check_ma_kh.forEach(e => {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry =
                                                ee.Geometry.Polygon(
                                                    [
                                                        [
                                                            [long - a, lat + a],
                                                            [long - a, lat - a],
                                                            [long + a, lat - a],
                                                            [long + a, lat + a]
                                                        ]
                                                    ], null, false);
                                            var filtered = land.filter(ee.Filter.date(req.body.startDate, req.body.endDate)).filter(ee.Filter.bounds(geometry));
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'landsat_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });

                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        });
                        await setTimeout(async() => {
                            console.log(dem);
                            await res.render("linkAdmin", { ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User });
                        }, dem);
                    }
                });
            }
        });

    };
};
exports.homeAdmin = (req, res) => {
    if (req.session.User && req.session.roles == "admin") {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        };
                                        res.render('admin', { alert: null, dstrampin: result, sdL: null, edL: null, sdR: null, edR: null, ma_khs: null, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.splitPanelAdmin = (req, res) => {
    var dobL = new Date(req.body.dateLeft);
    var dobR = new Date(req.body.dateRight);
    var monthL = dobL.getMonth() + 1;
    var dayL = dobL.getDate();
    var yearL = dobL.getFullYear();
    var monthR = dobR.getMonth() + 1;
    var dayR = dobR.getDate();
    var yearR = dobR.getFullYear();
    if (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8 || monthR == 10 || monthR == 12) {
        if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR >= 10) {
            var startR = yearR + "-" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) >= 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 5 || monthR == 7)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 5 || monthR == 7)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 10)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 10)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 1)) {
            var startR = (yearR - 1) + "-" + (12) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 1)) {
            var startR = (yearR - 1) + "-" + (12) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 3) && (yearR % 4 == 0)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (29);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 3 && (yearR % 4 == 0))) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (28);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 3) && (yearR % 4 != 0)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (28);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 3 && (yearR % 4 != 0))) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (27);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 30 && (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 30 && (monthR == 10)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 30 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = (yearR + 1) + "-0" + (1) + "-0" + (1);
        } else if (dayR == 31 && (monthR == 1 || monthR == 3 || monthR == 5 || monthR == 7 || monthR == 8)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 31 && (monthR == 10)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 31 && (monthR == 12)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = (yearR + 1) + "-0" + (1) + "-0" + (2);
        } else {
            if (monthR >= 10) {
                var startR = yearR + "-" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-" + monthR + "-" + (dayR + 2);
            } else {
                var startR = yearR + "-0" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
            }
        }
    }
    if (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9 || monthR == 11) {
        if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) < 10 && monthR >= 10) {
            var startR = yearR + "-" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-" + monthR + "-0" + (dayR + 2);
        } else if ((dayR - 2) > 0 && (dayR - 2) < 10 && (dayR + 2) >= 10 && monthR < 10) {
            var startR = yearR + "-0" + monthR + "-0" + (dayR - 2);
            var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 2 || monthR == 4 || monthR == 6 || monthR == 9)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 2 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (31);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 1 && (monthR == 8)) {
            var startR = yearR + "-0" + (monthR - 1) + "-" + (30);
            var endR = yearR + "-0" + (monthR) + "-0" + (dayR + 2);
        } else if (dayR == 30 && (monthR == 4 || monthR == 6)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 30 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 30 && (monthR == 9)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 29 && (monthR == 2 || monthR == 4 || monthR == 6)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else if (dayR == 29 && (monthR == 11)) {
            var startR = yearR + "-" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 29 && (monthR == 9)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 28 && (monthR == 2) && (yearR % 4 == 0)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (1);
        } else if (dayR == 28 && (monthR == 2) && (yearR % 4 != 0)) {
            var startR = yearR + "-0" + (monthR) + "-" + (dayR - 2);
            var endR = yearR + "-0" + (monthR + 1) + "-0" + (2);
        } else {
            if (monthR >= 10) {
                var startR = yearR + "-" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-" + monthR + "-" + (dayR + 2);
            } else {
                var startR = yearR + "-0" + monthR + "-" + (dayR - 2);
                var endR = yearR + "-0" + monthR + "-" + (dayR + 2);
            }

        }
    }
    if (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8 || monthL == 10 || monthL == 12) {
        if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL >= 10) {
            var startL = yearL + "-" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) >= 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 5 || monthL == 7)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 5 || monthL == 7)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 10)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 10)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 1)) {
            var startL = (yearL - 1) + "-" + (12) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 1)) {
            var startL = (yearL - 1) + "-" + (12) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 3) && (yearL % 4 == 0)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (29);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 3 && (yearL % 4 == 0))) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (28);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 3) && (yearL % 4 != 0)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (28);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 3 && (yearL % 4 != 0))) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (27);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 30 && (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 30 && (monthL == 10)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 30 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = (yearL + 1) + "-0" + (1) + "-0" + (1);
        } else if (dayL == 31 && (monthL == 1 || monthL == 3 || monthL == 5 || monthL == 7 || monthL == 8)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 31 && (monthL == 10)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 31 && (monthL == 12)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = (yearL + 1) + "-0" + (1) + "-0" + (2);
        } else {
            if (monthL >= 10) {
                var startL = yearL + "-" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-" + monthL + "-" + (dayL + 2);
            } else {
                var startL = yearL + "-0" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
            }
        }
    }
    if (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9 || monthL == 11) {
        if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) < 10 && monthL >= 10) {
            var startL = yearL + "-" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-" + monthL + "-0" + (dayL + 2);
        } else if ((dayL - 2) > 0 && (dayL - 2) < 10 && (dayL + 2) >= 10 && monthL < 10) {
            var startL = yearL + "-0" + monthL + "-0" + (dayL - 2);
            var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 2 || monthL == 4 || monthL == 6 || monthL == 9)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 2 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (31);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 1 && (monthL == 8)) {
            var startL = yearL + "-0" + (monthL - 1) + "-" + (30);
            var endL = yearL + "-0" + (monthL) + "-0" + (dayL + 2);
        } else if (dayL == 30 && (monthL == 4 || monthL == 6)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 30 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 30 && (monthL == 9)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 29 && (monthL == 2 || monthL == 4 || monthL == 6)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else if (dayL == 29 && (monthL == 11)) {
            var startL = yearL + "-" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 29 && (monthL == 9)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 28 && (monthL == 2) && (yearL % 4 == 0)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (1);
        } else if (dayL == 28 && (monthL == 2) && (yearL % 4 != 0)) {
            var startL = yearL + "-0" + (monthL) + "-" + (dayL - 2);
            var endL = yearL + "-0" + (monthL + 1) + "-0" + (2);
        } else {
            if (monthL >= 10) {
                var startL = yearL + "-" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-" + monthL + "-" + (dayL + 2);
            } else {
                var startL = yearL + "-0" + monthL + "-" + (dayL - 2);
                var endL = yearL + "-0" + monthL + "-" + (dayL + 2);
            }

        }
    }

    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2'],
    }
    var col = ee.ImageCollection("COPERNICUS/S2_SR");

    var reg = req.body.region;
    var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
    var urban = ur.filter(ee.Filter.eq('ADM1_NAME', reg));
    var geometry = urban.geometry();
    var filtered = col.filter(ee.Filter.date(startL, endL)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
    var image = filtered.median();
    var filtered1 = col.filter(ee.Filter.date(startR, endR)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
    var image1 = filtered1.median();
    var clipped = image.clip(geometry);
    var visualized = clipped.visualize(rgbVis);
    var clipped1 = image1.clip(geometry);
    var visualized1 = clipped1.visualize(rgbVis);
    if (req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces Where "provinceName" not like '${reg}' and "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query and', err);
                    } else {
                        var provinces = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM provinces where "provinceName" like '${reg}' and "provinceName" not like 'admin'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var province = result;
                                        pool_db.connect(function(err, client, done) {
                                            if (err) {
                                                return console.log("error:" + err);
                                            } else {
                                                client.query(`SELECT * FROM solar_stations where "provinceId" = ${province.rows[0].id}`, function(err, result, row) {
                                                    done();
                                                    if (err) {
                                                        res.end();
                                                        return console.error('error running query1', err);
                                                    } else {
                                                        var data = [];
                                                        result.rows.forEach((e) => {
                                                            data.push({
                                                                "loc": [e.lat, e.long],
                                                                "title": e.ma_kh,
                                                                "ten_dv": e.ten_dv,
                                                                "congsuat": e.cong_suat,
                                                                "stt": e.stt,
                                                            });
                                                        });
                                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                        var NumOfFile = AssetList.assets.length;
                                                        var dsanh = [];
                                                        var dem = 1000;
                                                        for (var i = 0; i < NumOfFile; i++) {
                                                            dsanh.push({
                                                                "name": AssetList.assets[i].name,
                                                                "id": AssetList.assets[i].id
                                                            });
                                                            dem += 1000;
                                                        };
                                                        res.render("admin", { alert: null, sdL: startL, edL: endL, sdR: startR, edR: endR, provinces: provinces, dstrampin: result, province: province, data: JSON.stringify(data), dateL: req.body.dateLeft, dateR: req.body.dateRight, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, urlFormat1: visualized1.getMap().urlFormat, urlFormat: visualized.getMap().urlFormat, provinceId: null });
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        });
    } else {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations where "provinceId" = 0`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query2', err);
                    } else {
                        var data = [];
                        result.rows.forEach((e) => {
                            data.push({
                                "loc": [e.lat, e.long],
                                "title": e.ma_kh,
                                "ten_dv": e.ten_dv,
                                "congsuat": e.cong_suat,
                                "stt": e.stt,
                            });
                        });
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        var dem = 1000;
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                            dem += 1000;
                        };
                        res.render("admin", { alert: null, sdL: startL, edL: endL, sdR: startR, edR: endR, provinces: null, ma_khs: null, province: null, data: JSON.stringify(data), dateL: req.body.dateLeft, dateR: req.body.dateRight, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, urlFormat1: visualized1.getMap().urlFormat, urlFormat: visualized.getMap().urlFormat, provinceId: null });
                    }
                });
            }
        });
    };


};
exports.manager = (req, res) => {
    if (req.session.User && req.session.roles == "admin") {

        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT solar_stations.*, provinces."provinceName" FROM solar_stations inner join provinces ON (solar_stations."provinceId" = provinces."id")`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var dstrampin = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT "provinceName" FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        };
                                        res.render("manager", { anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: result });
                                    }
                                });
                            }
                        })
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    }
};
exports.userAdmin = (req, res) => {
    if (req.session.User && req.session.roles == "admin") {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT solar_stations.*, provinces."provinceName" FROM solar_stations inner join provinces ON (solar_stations."provinceId" = provinces."id")`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var dstrampin = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var dstinh = result;
                                        pool_db.connect(function(err, client, done) {
                                            if (err) {
                                                return console.log("error:" + err);
                                            } else {
                                                client.query(`SELECT users.*, provinces."provinceName" FROM users inner join provinces ON (users."provinceId" = provinces."id")`, function(err, result, row) {
                                                    done();
                                                    if (err) {
                                                        res.end();
                                                        return console.error('error running query', err);
                                                    } else {
                                                        var dsuser = result;
                                                        pool_db.connect(function(err, client, done) {
                                                            if (err) {
                                                                return console.log("error:" + err);
                                                            } else {
                                                                client.query(`SELECT "provinceName" FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                                                    done();
                                                                    if (err) {
                                                                        res.end();
                                                                        return console.error('error running query1', err);
                                                                    } else {
                                                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                                        var NumOfFile = AssetList.assets.length;
                                                                        var dsanh = [];
                                                                        var dem = 1000;
                                                                        for (var i = 0; i < NumOfFile; i++) {
                                                                            dsanh.push({
                                                                                "name": AssetList.assets[i].name,
                                                                                "id": AssetList.assets[i].id
                                                                            });
                                                                            dem += 1000;
                                                                        };
                                                                        res.render("usersAdmin", { anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: result, dstinh: dstinh, dsuser: dsuser });
                                                                    }
                                                                });
                                                            }
                                                        })
                                                    }
                                                });
                                            }
                                        });
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    }
};
exports.provinceAdmin = (req, res) => {
    if (req.session.User && req.session.roles == "admin") {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT solar_stations.*, provinces."provinceName" FROM solar_stations inner join provinces ON (solar_stations."provinceId" = provinces."id")`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var dstrampin = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var dstinh = result;
                                        pool_db.connect(function(err, client, done) {
                                            if (err) {
                                                return console.log("error:" + err);
                                            } else {
                                                client.query(`SELECT "provinceName" FROM provinces where "id" = ${req.session.provinceId}`, function(err, result, row) {
                                                    done();
                                                    if (err) {
                                                        res.end();
                                                        return console.error('error running query1', err);
                                                    } else {
                                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                        var NumOfFile = AssetList.assets.length;
                                                        var dsanh = [];
                                                        var dem = 1000;
                                                        for (var i = 0; i < NumOfFile; i++) {
                                                            dsanh.push({
                                                                "name": AssetList.assets[i].name,
                                                                "id": AssetList.assets[i].id
                                                            });
                                                            dem += 1000;
                                                        };
                                                        res.render("provinceAdmin", { anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: result, dstinh: dstinh });
                                                    }
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                        });
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    }
};
exports.taianhAdmin = async(req, res) => {
    var urlDownload = [];
    var dem = 1000;
    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2']
    };
    var a = 0.018018018;
    await pool_db.connect(async function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`SELECT * FROM solar_stations`, async function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    var ma_khs = result;
                    var check = 0;
                    if (typeof req.body.check_ma_kh === "string") {
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var lat = parseFloat(result.rows[0].lat);
                                        var long = parseFloat(result.rows[0].long);
                                        var geometry = ee.Geometry.Polygon(
                                            [
                                                [
                                                    [long - a, lat + a],
                                                    [long - a, lat - a],
                                                    [long + a, lat - a],
                                                    [long + a, lat + a]
                                                ]
                                            ], null, false);

                                        var image = ee.Image("COPERNICUS/S2_SR/" + req.body.id_anh);
                                        var clipped = image.clip(geometry);
                                        var visualized = clipped.visualize(rgbVis);
                                        var downloadArgs = {
                                            name: 'sentinel2_' + req.body.check_ma_kh + "_" + req.body.id_anh,
                                            filePerBand: false,
                                            crs: 'EPSG:4326',
                                            scale: 10,
                                            region: geometry
                                        };
                                        var url = visualized.getDownloadURL(downloadArgs);
                                        urlDownload.push({
                                            "urlDownload": url,
                                            "urlFormat": visualized.getMap().urlFormat,
                                            "tenAnh": downloadArgs.name
                                        });

                                    }
                                });
                            }
                        });
                        dem += 3000;
                    } else {
                        await req.body.check_ma_kh.forEach(e => {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry = ee.Geometry.Polygon(
                                                [
                                                    [
                                                        [long - a, lat + a],
                                                        [long - a, lat - a],
                                                        [long + a, lat - a],
                                                        [long + a, lat + a]
                                                    ]
                                                ], null, false);
                                            var image = ee.Image("COPERNICUS/S2_SR/" + req.body.id_anh);

                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'sentinel2_' + e + "_" + req.body.id_anh,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });

                                        }
                                    });
                                }
                            });

                            dem += 3000;
                        });
                    }
                    var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                    var NumOfFile = AssetList.assets.length;
                    var dsanh = [];
                    for (var i = 0; i < NumOfFile; i++) {
                        dsanh.push({
                            "name": AssetList.assets[i].name,
                            "id": AssetList.assets[i].id
                        });
                    };
                    await setTimeout(async() => {
                        await res.render("linkAdmin", { ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh });
                    }, dem);
                }
            });
        }
    });


};
exports.downloadAdmin = async(req, res) => {
    var urlDownload = [];
    var dem = 1000;
    var rgbVis = {
        min: 0.0,
        max: 2800,
        gamma: 1.15,
        bands: ['B4', 'B3', 'B2']
    };
    var a = 0.018018018;
    if (req.body.loai_anh == "sentinel2") {
        var s2 = ee.ImageCollection("COPERNICUS/S2_SR");
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        var check = 0;
                        if (typeof req.body.check_ma_kh === "string") {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry = ee.Geometry.Polygon(
                                                [
                                                    [
                                                        [long - a, lat + a],
                                                        [long - a, lat - a],
                                                        [long + a, lat - a],
                                                        [long + a, lat + a]
                                                    ]
                                                ], null, false);
                                            var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 90))
                                                .filter(ee.Filter.date(req.body.startDate, req.body.endDate))
                                                .filter(ee.Filter.bounds(geometry));
                                            if (filtered.size().getInfo() != 0) {
                                                var d = 0;
                                                d += 1;
                                                if (d > 0) {
                                                    check += 1;
                                                }
                                                check += 1;
                                            };
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'sentinel2_' + req.body.check_ma_kh + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });

                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        } else {
                            await req.body.check_ma_kh.forEach(e => {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var lat = parseFloat(result.rows[0].lat);
                                                var long = parseFloat(result.rows[0].long);
                                                var geometry = ee.Geometry.Polygon(
                                                    [
                                                        [
                                                            [long - a, lat + a],
                                                            [long - a, lat - a],
                                                            [long + a, lat - a],
                                                            [long + a, lat + a]
                                                        ]
                                                    ], null, false);
                                                var filtered = s2.filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 90))
                                                    .filter(ee.Filter.date(req.body.startDate, req.body.endDate))
                                                    .filter(ee.Filter.bounds(geometry));
                                                if (filtered.size().getInfo() != 0) {
                                                    var d = 0;
                                                    d += 1;
                                                    if (d > 0) {
                                                        check += 1;
                                                    }
                                                    check += 1;
                                                };
                                                var image = filtered.median();
                                                var clipped = image.clip(geometry);
                                                var visualized = clipped.visualize(rgbVis);
                                                var downloadArgs = {
                                                    name: 'sentinel2_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                    filePerBand: false,
                                                    crs: 'EPSG:4326',
                                                    scale: 10,
                                                    region: geometry
                                                };
                                                var url = visualized.getDownloadURL(downloadArgs);
                                                urlDownload.push({
                                                    "urlDownload": url,
                                                    "urlFormat": visualized.getMap().urlFormat,
                                                    "tenAnh": downloadArgs.name
                                                });

                                            }
                                        });
                                    }
                                });

                                dem += 3000;
                            });
                        }
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                        };
                        await setTimeout(async() => {
                            if (check == 0) {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var province = result;
                                                pool_db.connect(function(err, client, done) {
                                                    if (err) {
                                                        return console.log("error:" + err);
                                                    } else {
                                                        client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                                            done();
                                                            if (err) {
                                                                res.end();
                                                                return console.error('error running query1', err);
                                                            } else {
                                                                var data = [];
                                                                result.rows.forEach((e) => {
                                                                    data.push({
                                                                        "loc": [e.lat, e.long],
                                                                        "title": e.ma_kh,
                                                                        "ten_dv": e.ten_dv,
                                                                        "congsuat": e.cong_suat,
                                                                        "stt": e.stt,
                                                                    });
                                                                });
                                                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                                var NumOfFile = AssetList.assets.length;
                                                                var dsanh = [];
                                                                var dem = 1000;
                                                                for (var i = 0; i < NumOfFile; i++) {
                                                                    dsanh.push({
                                                                        "name": AssetList.assets[i].name,
                                                                        "id": AssetList.assets[i].id
                                                                    });
                                                                    dem += 1000;
                                                                };
                                                                res.render('admin', { alert: "khongcoanh", dstrampin: result, sdL: null, edL: null, sdR: null, edR: null, ma_khs: null, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            } else {
                                await res.render("linkAdmin", { ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh });
                            }
                        }, dem);
                    }
                });
            }
        });

    } else {
        var rgbVis = {
            min: 0.0,
            max: 0.3,
            bands: ['B4', 'B3', 'B2']
        };
        await pool_db.connect(async function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM solar_stations`, async function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var ma_khs = result;
                        var check = 0;
                        if (typeof req.body.check_ma_kh === "string") {

                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations where "ma_kh" like '${req.body.check_ma_kh}'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                                            var lat = parseFloat(result.rows[0].lat);
                                            var long = parseFloat(result.rows[0].long);
                                            var geometry =
                                                ee.Geometry.Polygon(
                                                    [
                                                        [
                                                            [long - a, lat + a],
                                                            [long - a, lat - a],
                                                            [long + a, lat - a],
                                                            [long + a, lat + a]
                                                        ]
                                                    ], null, false);
                                            var filtered = land.filter(ee.Filter.date(req.body.startDate, req.body.endDate)).filter(ee.Filter.bounds(geometry));
                                            if (filtered.size().getInfo() != 0) {
                                                var d = 0;
                                                d += 1;
                                                if (d > 0) {
                                                    check += 1;
                                                }
                                                check += 1;
                                            };
                                            var image = filtered.median();
                                            var clipped = image.clip(geometry);
                                            var visualized = clipped.visualize(rgbVis);
                                            var downloadArgs = {
                                                name: 'landsat_' + req.body.check_ma_kh + "_" + req.body.startDate + "_" + req.body.endDate,
                                                filePerBand: false,
                                                crs: 'EPSG:4326',
                                                scale: 10,
                                                region: geometry
                                            };
                                            var url = visualized.getDownloadURL(downloadArgs);
                                            urlDownload.push({
                                                "urlDownload": url,
                                                "urlFormat": visualized.getMap().urlFormat,
                                                "tenAnh": downloadArgs.name
                                            });

                                        }
                                    });
                                }
                            });
                            dem += 3000;
                        } else {
                            await req.body.check_ma_kh.forEach(e => {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM solar_stations where "ma_kh" like '${e}'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var land = ee.ImageCollection('LANDSAT/LC08/C01/T1_TOA')
                                                var lat = parseFloat(result.rows[0].lat);
                                                var long = parseFloat(result.rows[0].long);
                                                var geometry =
                                                    ee.Geometry.Polygon(
                                                        [
                                                            [
                                                                [long - a, lat + a],
                                                                [long - a, lat - a],
                                                                [long + a, lat - a],
                                                                [long + a, lat + a]
                                                            ]
                                                        ], null, false);
                                                var filtered = land.filter(ee.Filter.date(req.body.startDate, req.body.endDate)).filter(ee.Filter.bounds(geometry));
                                                if (filtered.size().getInfo() != 0) {
                                                    var d = 0;
                                                    d += 1;
                                                    if (d > 0) {
                                                        check += 1;
                                                    }
                                                    check += 1;
                                                };
                                                var image = filtered.median();
                                                var clipped = image.clip(geometry);
                                                var visualized = clipped.visualize(rgbVis);
                                                var downloadArgs = {
                                                    name: 'landsat_' + e + "_" + req.body.startDate + "_" + req.body.endDate,
                                                    filePerBand: false,
                                                    crs: 'EPSG:4326',
                                                    scale: 10,
                                                    region: geometry
                                                };
                                                var url = visualized.getDownloadURL(downloadArgs);
                                                urlDownload.push({
                                                    "urlDownload": url,
                                                    "urlFormat": visualized.getMap().urlFormat,
                                                    "tenAnh": downloadArgs.name
                                                });

                                            }
                                        });
                                    }
                                });
                                dem += 3000;
                            });
                        }
                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                        var NumOfFile = AssetList.assets.length;
                        var dsanh = [];
                        for (var i = 0; i < NumOfFile; i++) {
                            dsanh.push({
                                "name": AssetList.assets[i].name,
                                "id": AssetList.assets[i].id
                            });
                        };
                        await setTimeout(async() => {
                            if (check == 0) {
                                pool_db.connect(function(err, client, done) {
                                    if (err) {
                                        return console.log("error:" + err);
                                    } else {
                                        client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                            done();
                                            if (err) {
                                                res.end();
                                                return console.error('error running query', err);
                                            } else {
                                                var province = result;
                                                pool_db.connect(function(err, client, done) {
                                                    if (err) {
                                                        return console.log("error:" + err);
                                                    } else {
                                                        client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                                            done();
                                                            if (err) {
                                                                res.end();
                                                                return console.error('error running query1', err);
                                                            } else {
                                                                var data = [];
                                                                result.rows.forEach((e) => {
                                                                    data.push({
                                                                        "loc": [e.lat, e.long],
                                                                        "title": e.ma_kh,
                                                                        "ten_dv": e.ten_dv,
                                                                        "congsuat": e.cong_suat,
                                                                        "stt": e.stt,
                                                                    });
                                                                });
                                                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                                var NumOfFile = AssetList.assets.length;
                                                                var dsanh = [];
                                                                var dem = 1000;
                                                                for (var i = 0; i < NumOfFile; i++) {
                                                                    dsanh.push({
                                                                        "name": AssetList.assets[i].name,
                                                                        "id": AssetList.assets[i].id
                                                                    });
                                                                    dem += 1000;
                                                                };
                                                                res.render('admin', { alert: "khongcoanh", dstrampin: result, sdL: null, edL: null, sdR: null, edR: null, ma_khs: null, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                                            }
                                                        });
                                                    }
                                                })
                                            }
                                        });
                                    }
                                })
                            } else {
                                await res.render("linkAdmin", { ma_khs: ma_khs, urlDownloads: urlDownload, searchSolarStation: null, searchSolarStation1: null, linkDownload: null, linkDownloadLS: null, provinceId: req.session.provinceId, dateL: null, sdL: null, edL: null, sdR: null, edR: null, province: null, data: null, dateR: null, urlFormat1: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh });
                            }
                        }, dem);
                    }
                });
            }
        });

    };
};
exports.searchAdmin = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('searchAdmin', { id_anh: null, alert: null, err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.anhAdmin = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var provinces = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM provinces where "provinceName" like '${req.session.tinhName}'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        var province = result;
                                        pool_db.connect(function(err, client, done) {
                                            if (err) {
                                                return console.log("error:" + err);
                                            } else {
                                                client.query(`SELECT * FROM solar_stations Where "provinceId" = ${province.rows[0].id}`, function(err, result, row) {
                                                    done();
                                                    if (err) {
                                                        res.end();
                                                        return console.error('error running query1', err);
                                                    } else {
                                                        var data = [];
                                                        result.rows.forEach((e) => {
                                                            data.push({
                                                                "loc": [e.lat, e.long],
                                                                "title": e.ma_kh,
                                                                "ten_dv": e.ten_dv,
                                                                "congsuat": e.cong_suat,
                                                                "stt": e.stt,
                                                            });
                                                        });
                                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                                        var NumOfFile = AssetList.assets.length;
                                                        var dsanh = [];
                                                        var dem = 1000;
                                                        for (var i = 0; i < NumOfFile; i++) {
                                                            dsanh.push({
                                                                "name": AssetList.assets[i].name,
                                                                "id": AssetList.assets[i].id
                                                            });
                                                            dem += 1000;
                                                        };
                                                        var rgbVis = {
                                                            min: 0.0,
                                                            max: 2800,
                                                            gamma: 1.15,
                                                            bands: ['B4', 'B3', 'B2']
                                                        };
                                                        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
                                                        var urban = ur.filter(ee.Filter.eq('ADM1_NAME', province.rows[0].provinceName));
                                                        var geometry = urban.geometry();
                                                        var image = ee.Image("COPERNICUS/S2_SR/" + req.params.id);
                                                        var clipped = image.clip(geometry)
                                                        var visualized = clipped.visualize(rgbVis)
                                                        setTimeout(() => {
                                                            res.render('searchAdmin', { id_anh: req.params.id, alert: null, err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: visualized.getMap().urlFormat, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null, province: province, provinces: provinces });
                                                        }, dem);
                                                    }
                                                });
                                            }
                                        })
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        res.redirect("../login");
    };
};
exports.searchAnhAdmin = (req, res) => {
    var dobL = new Date(req.body.startD);
    var dobR = new Date(req.body.endD);
    var monthL = dobL.getMonth();
    var dayL = dobL.getDate();
    var yearL = dobL.getFullYear();
    var monthR = dobR.getMonth();
    var dayR = dobR.getDate();
    var yearR = dobR.getFullYear();
    if (monthL == monthR && yearL == yearR && dayL >= dayR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('searchAdmin', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else if (monthL > monthR && yearL == yearR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('searchAdmin', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else if (yearL > yearR) {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        var province = result;
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query1', err);
                                    } else {
                                        var data = [];
                                        result.rows.forEach((e) => {
                                            data.push({
                                                "loc": [e.lat, e.long],
                                                "title": e.ma_kh,
                                                "ten_dv": e.ten_dv,
                                                "congsuat": e.cong_suat,
                                                "stt": e.stt,
                                            });
                                        });
                                        var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                        var NumOfFile = AssetList.assets.length;
                                        var dsanh = [];
                                        var dem = 1000;
                                        for (var i = 0; i < NumOfFile; i++) {
                                            dsanh.push({
                                                "name": AssetList.assets[i].name,
                                                "id": AssetList.assets[i].id
                                            });
                                            dem += 1000;
                                        }
                                        setTimeout(() => {
                                            res.render('searchAdmin', { id_anh: null, alert: null, err: "Ngày tháng bắt đầu phải nhỏ hơn ngày tháng kết thúc", sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                        }, dem);
                                    }
                                });
                            }
                        })
                    }
                });
            }
        })
    } else {
        var listAnh = [];
        var dem = 1000;
        var col = ee.ImageCollection("COPERNICUS/S2_SR");
        var reg = req.body.region;
        var ur = ee.FeatureCollection("FAO/GAUL_SIMPLIFIED_500m/2015/level2");
        var urban = ur.filter(ee.Filter.eq('ADM1_NAME', reg));
        var geometry = urban.geometry();
        console.log(req.body.startD);
        console.log(req.body.endD);
        var filtered = col.filter(ee.Filter.date(req.body.startD, req.body.endD)).filter(ee.Filter.lt('CLOUDY_PIXEL_PERCENTAGE', 100)).filter(ee.Filter.bounds(geometry));
        var s = filtered.size();
        if (s.getInfo() == 0) {
            pool_db.connect(function(err, client, done) {
                if (err) {
                    return console.log("error:" + err);
                } else {
                    client.query(`SELECT * FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('error running query', err);
                        } else {
                            var province = result;
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query1', err);
                                        } else {
                                            var data = [];
                                            result.rows.forEach((e) => {
                                                data.push({
                                                    "loc": [e.lat, e.long],
                                                    "title": e.ma_kh,
                                                    "ten_dv": e.ten_dv,
                                                    "congsuat": e.cong_suat,
                                                    "stt": e.stt,
                                                });
                                            });
                                            var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                            var NumOfFile = AssetList.assets.length;
                                            var dsanh = [];
                                            var dem = 1000;
                                            for (var i = 0; i < NumOfFile; i++) {
                                                dsanh.push({
                                                    "name": AssetList.assets[i].name,
                                                    "id": AssetList.assets[i].id
                                                });
                                                dem += 1000;
                                            }
                                            setTimeout(() => {
                                                res.render('searchAdmin', { id_anh: null, alert: "null", err: null, sdL: null, edL: null, sdR: null, edR: null, ma_khs: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: null, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                            }, dem);
                                        }
                                    });
                                }
                            })
                        }
                    });
                }
            })

        } else {
            var li = filtered.toList(s);
            li.getInfo().forEach(element => {
                listAnh.push({
                    "id": element.id,
                    "link": element.id.replace("COPERNICUS/S2_SR/", ""),
                    "date": element.id.slice(17, 21) + "-" + element.id.slice(21, 23) + "-" + element.id.slice(23, 25),
                });
                dem += 500;
            });
            if (req.session.User && req.session.provinceId) {
                pool_db.connect(function(err, client, done) {
                    if (err) {
                        return console.log("error:" + err);
                    } else {
                        client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                            done();
                            if (err) {
                                res.end();
                                return console.error('error running query', err);
                            } else {
                                var dstrampin = result;

                                var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                var NumOfFile = AssetList.assets.length;
                                var dsanh = [];
                                for (var i = 0; i < NumOfFile; i++) {
                                    dsanh.push({
                                        "name": AssetList.assets[i].name,
                                        "id": AssetList.assets[i].id
                                    });
                                };
                                req.session.tinhName = req.body.region;
                                setTimeout(() => {
                                    res.render("listAnhAdmin", { alert: null, err: null, anh: null, listAnh: listAnh, searchAnh: null, username: req.session.User, dsanh: dsanh, dstrampin: dstrampin, provinceName: req.body.region });
                                }, dem);

                            }
                        });
                    }
                });
            } else {
                res.redirect("../login");
            }
        };
    }
};
exports.xemAnhCoSanAdmin = (req, res) => {
    console.log(req.body.anh);
    pool_db.connect(function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`SELECT * FROM provinces`, function(err, result, row) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query', err);
                } else {
                    var province = result;
                    pool_db.connect(function(err, client, done) {
                        if (err) {
                            return console.log("error:" + err);
                        } else {
                            client.query(`SELECT * FROM solar_stations`, function(err, result, row) {
                                done();
                                if (err) {
                                    res.end();
                                    return console.error('error running query1', err);
                                } else {
                                    var data = [];
                                    result.rows.forEach((e) => {
                                        data.push({
                                            "loc": [e.lat, e.long],
                                            "title": e.ma_kh,
                                            "ten_dv": e.ten_dv,
                                            "congsuat": e.cong_suat,
                                            "stt": e.stt,
                                        });
                                    });
                                    var AssetList = ee.data.listAssets('projects/myprjmrngoc2707/assets/folder1');
                                    var NumOfFile = AssetList.assets.length;
                                    var dsanh = [];
                                    var dem = 1000;
                                    for (var i = 0; i < NumOfFile; i++) {
                                        dsanh.push({
                                            "name": AssetList.assets[i].name,
                                            "id": AssetList.assets[i].id
                                        });
                                        dem += 1000;
                                    }
                                    var anh = ee.Image(req.body.anh).getMap().urlFormat
                                    res.render('admin', { alert: null, sdL: null, edL: null, sdR: null, edR: null, dstrampin: result, province: province, data: JSON.stringify(data), dateL: null, dateR: null, anh: anh, searchAnh: null, username: req.session.User, dsanh: dsanh, linkDownload: null, urlFormat: null, urlFormat1: null, linkDownloadLS: null, provinceId: null, searchSolarStation: null, searchSolarStation1: null });
                                }
                            });
                        }
                    })
                }
            });
        }
    });
};
exports.themTinh = (req, res) => {
    pool_db.connect(function(err, client, done) {
        if (err) {
            return console.log("error:" + err);
        } else {
            client.query(`select "id" from provinces order by "id" desc limit 1`, function(err, result) {
                done();
                if (err) {
                    res.end();
                    return console.error('error running query id', err);
                } else {
                    var id = parseInt(result.rows[0].id)
                    pool_db.connect(function(err, client, done) {
                        if (err) {
                            return console.log("error:" + err);
                        } else {
                            client.query(`insert into provinces("id", "provinceName", "lat", "long") values('${id + 1}', '${req.body.name}', ${req.body.lat}, ${req.body.long})`, function(err) {
                                done();
                                if (err) {
                                    res.end();
                                    return console.error('error running query', err);
                                } else {
                                    res.redirect("../provinceAdmin");
                                }
                            });
                        }
                    });
                }
            });
        }
    });
};
exports.deleteTinh = (req, res) => {
    if (req.session.User && req.session.provinceId) {
        var provinceId = req.params.id
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`DELETE FROM provinces WHERE "id" = ${provinceId}`, function(err) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        res.redirect("../provinceAdmin");
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    };
};
exports.deleteLuaChon = async(req, res) => {
    if (req.session.User && req.session.provinceId) {
        console.log(req.body.luachon);
        if (typeof req.body.luachon == "string") {
            pool_db.connect(function(err, client, done) {
                if (err) {
                    return console.log("error:" + err);
                } else {
                    client.query(`DELETE FROM solar_stations WHERE "gid" = ${req.body.luachon}`, function(err) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('error running query', err);
                        } else {
                            res.redirect("../data");
                        }
                    });
                }
            });
        } else {
            var dem = 1000;
            await req.body.luachon.forEach(e => {
                pool_db.connect(function(err, client, done) {
                    if (err) {
                        return console.log("error:" + err);
                    } else {
                        client.query(`DELETE FROM solar_stations WHERE "gid" = ${e}`, function(err) {
                            done();
                            if (err) {
                                res.end();
                                return console.error('error running query', err);
                            } else {
                                dem += 1000;
                            }
                        });
                    }
                });
            });
            await setTimeout(() => {
                res.redirect("../data");

            }, dem);
        }
    } else {
        res.redirect("../login");
    };
};
exports.themTaiKhoan = (req, res, next) => {
    // Save User to Database
    var errors = verifySignUp.checkvalidate(req, res, next);
    var message;
    var message1;
    var message2;
    if (!errors) {
        User.findOne({
            where: {
                username: req.body.username
            }
        }).then(user => {
            if (user) {
                pool_db.connect(function(err, client, done) {
                    if (err) {
                        return console.log("error:" + err);
                    } else {
                        client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                            done();
                            if (err) {
                                res.end();
                                return console.error('error running query', err);
                            } else {
                                res.render("./signup", { provinces: result, errors: errors, message: "Failed! Username is already in use!", message1: message1, message2: message2 });
                            }
                        });
                    }
                });
                // message = "Failed! Username is already in use!";
            } else {
                // Email
                User.findOne({
                    where: {
                        email: req.body.email
                    }
                }).then(user => {
                    if (user) {
                        pool_db.connect(function(err, client, done) {
                            if (err) {
                                return console.log("error:" + err);
                            } else {
                                client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                    done();
                                    if (err) {
                                        res.end();
                                        return console.error('error running query', err);
                                    } else {
                                        res.render("./signup", { provinces: result, errors: errors, message: message, message1: "Failed! Email is already in use!", message2: message2 });
                                    }
                                });
                            }
                        });
                        // message = "Failed! Email is already in use!";
                    } else {
                        if (req.body.re_password != req.body.password) {
                            pool_db.connect(function(err, client, done) {
                                if (err) {
                                    return console.log("error:" + err);
                                } else {
                                    client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                                        done();
                                        if (err) {
                                            res.end();
                                            return console.error('error running query', err);
                                        } else {
                                            res.render("./signup", { provinces: result, errors: errors, message: message, message1: message1, message2: "Failed! Re-enter incorrect password" });
                                        }
                                    });
                                }
                            });
                            // message2 = "Failed! Re-enter incorrect password";
                        } else {
                            User.create({
                                    username: req.body.username,
                                    email: req.body.email,
                                    provinceId: req.body.provinceId,
                                    password: bcrypt.hashSync(req.body.password, 8)
                                })
                                .then(user => {
                                    if (req.body.roles) {
                                        Role.findAll({
                                            where: {
                                                name: {
                                                    [Op.or]: req.body.roles
                                                }
                                            }
                                        }).then(roles => {
                                            user.setRoles(roles).then(() => {
                                                res.send({ message: "User was registered successfully!" });
                                            });
                                        });
                                    } else {
                                        // user role = 1
                                        user.setRoles([1]).then(() => {
                                            res.redirect("./login");
                                        });
                                    }
                                })
                                .catch(err => {
                                    res.status(500).send({ message: err.message });
                                });
                        }
                    }

                });
            }

        });

    } else {
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`SELECT "id", "provinceName" FROM provinces where "provinceName" not like 'admin'`, function(err, result, row) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        res.render("./signup", { provinces: result, errors: errors, message: message, message1: message1, message2: message2 });
                    }
                });
            }
        });
    }

};
exports.deleteUser = (req, res) => {
    if (req.session.User && req.session.roles == "admin") {
        var userId = req.params.id
        pool_db.connect(function(err, client, done) {
            if (err) {
                return console.log("error:" + err);
            } else {
                client.query(`DELETE FROM users WHERE "id" = ${userId}`, function(err) {
                    done();
                    if (err) {
                        res.end();
                        return console.error('error running query', err);
                    } else {
                        res.redirect("../userAdmin");
                    }
                });
            }
        });
    } else {
        res.redirect("../login");
    };
};
//end admin

const XLSX = require("xlsx");
exports.xlsx = (req, res, next) => {
    const stations = XLSX.readFile("app/uploads/" + req.file.originalname);
    const sheet = stations.SheetNames;
    console.log(XLSX.utils.sheet_to_json(stations.Sheets[sheet[0]]));
    var data = XLSX.utils.sheet_to_json(stations.Sheets[sheet[0]]);
    if (req.session.User && req.session.provinceId) {
        var load = 0;
        data.forEach(e => {
            pool_db.connect(function(err, client, done) {
                if (err) {
                    return console.log("error:" + err);
                } else {
                    client.query(`insert into solar_stations("ten_dv", "ma_kh", "dia_chi", "cong_suat", "provinceId", "lat", "long", "geom") values('${e.ten_dv}', '${e.ma_kh}', '${e.dia_chi}', ${e.cong_suat}, ${req.session.provinceId}, ${e.lat}, ${e.long}, ST_SetSRID(ST_MakePoint(${e.long},${e.lat}),4326));`, function(err) {
                        done();
                        if (err) {
                            res.end();
                            return console.error('error running query', err);
                        } else {
                            load++;
                        }
                    });
                }
            });

        });
        setTimeout(() => {
            if (req.session.roles == "admin") {
                res.redirect("../manager");
            } else {
                res.redirect("../data");
            };
        }, 2000);
    } else {
        res.redirect("../login");
    };

};