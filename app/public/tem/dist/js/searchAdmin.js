
var geo = document.getElementById("geo").value;
var geo1 = document.getElementById("geo1").value;
var anh = document.getElementById("geo2").value;

var endL = document.getElementById("edL").value;
var startL = document.getElementById("sdL").value;
var endR = document.getElementById("edR").value;
var startR = document.getElementById("sdR").value;
var da_ta = document.getElementById("data").value;
var provinceLat = document.getElementById("provinceLat").value;
var provinceLong = document.getElementById("provinceLong").value;
var cities = L.layerGroup();
var nen = L.tileLayer('http://{s}.google.com/vt/lyrs=m&x={x}&y={y}&z={z}', {
    maxZoom: 20,
    subdomains: ['mt0', 'mt1', 'mt2', 'mt3']
});
var anhCoSan = L.tileLayer(anh);

if (anh != "") {
    var map = L.map('map', {
        center: [provinceLat, provinceLong],
        zoom: 9,
        layers: [nen, cities, anhCoSan]
    });
    // anhCoSan.addTo(map);
    // var get_bound = map.fitBounds(anhCoSan.getBounds());
    // var center = get_bound.getCenter();
    // map.setView(center, 10);
} else {
    if (provinceLat == "" || provinceLong == "") {
        var map = L.map('map', {
            center: [16.2465553, 103.8396512],
            zoom: 5.5,
            layers: [nen, cities]
        });
    } else {
        var map = L.map('map', {
            center: [provinceLat, provinceLong],
            zoom: 9,
            layers: [nen, cities]
        });
    };
}



var markersLayer = new L.LayerGroup(); //layer contain searched elements
map.addLayer(markersLayer);

map.addControl(new L.Control.Search({
    layer: markersLayer,
    initial: false,
    zoom: 15,
    marker: false
})); //inizialize search control



////////////populate map with markers from sample data
var da_ta = document.getElementById("data").value;

var lay = [];
var id_anh = document.getElementById("id_anh").value;
if (data != "" && id_anh == "" && provinceLat != "" || provinceLong != "") {
    // var dt = JSON.stringify(da_ta);
    var data = JSON.parse(da_ta);
    for (i in data) {
        var title = data[i].title, //value searched
            loc = data[i].loc,
            ten_dv = data[i].ten_dv,
            stt = data[i].stt,
            cong_suat = data[i].congsuat, //position found
            marker = new L.Marker(new L.latLng(loc), {
                title: title
            });
        var label = L.marker(loc, {
            icon: L.divIcon({
                className: 'label',
                html: "<p style='text-shadow: 0 0.25px 0 #fff;color: yellow;padding: 5px;font-size: 15px;text-align:center'>" + title + "</p>",
                iconSize: [200, 80]
            })
        });
        lay.push(label); //se property searched
        marker.bindPopup('Tên đơn vị: ' + ten_dv + "<br/>" + "Mã khách hàng: " + title + "<br/>" + "Công suất: " + cong_suat + "<br/>" + "Số thứ tự: " + stt);
        markersLayer.addLayer(marker);
    };
} else if (data != "" && id_anh != "" && provinceLat != "" || provinceLong != "") {
    var data = JSON.parse(da_ta);
    for (i in data) {
        var title = data[i].title, //value searched
            loc = data[i].loc,
            ten_dv = data[i].ten_dv,
            stt = data[i].stt,
            cong_suat = data[i].congsuat, //position found
            marker = new L.Marker(new L.latLng(loc), {
                title: title
            });
        var label = L.marker(loc, {
            icon: L.divIcon({
                className: 'label',
                html: "<p style='text-shadow: 0 0.25px 0 #fff;color: yellow;padding: 5px;font-size: 15px;text-align:center'>" + title + "</p>",
                iconSize: [200, 80]
            })
        });
        lay.push(label); //se property searched
        marker.bindPopup('Tên đơn vị: ' + ten_dv + "<br/>" + "Mã khách hàng: " + title + "<br/>" + "Công suất: " + cong_suat + "<br/>" + "Số thứ tự: " + stt +"</br><form action='/taianhAdmin' method='POST'><input type='hidden' name='id_anh' value='"+id_anh+"'><input type='hidden' name='check_ma_kh' value='" + title + "'><button type='submit' class='btn btn-primary'>Tải ảnh</button></form>");
        markersLayer.addLayer(marker);
    };
} else {

};

map.on('zoomend', function () {
    if (map.getZoom() >= 17) {
        lay.forEach(e => {
            map.addLayer(e);
        });
    }
    if (map.getZoom() < 17) {
        lay.forEach(e => {
            map.removeLayer(e);
        });
    }
});
// var get_bound = map.fitBounds(markersLayer.getBounds());
// var center = get_bound.getCenter();
// map.setView(center, 10);

markersLayer.addTo(map);
if (endR != " " && startL != " " && endL != " " && startR != " ") {
    var command = L.control({
        position: 'bottomleft'
    });

    command.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'command');
        div.innerHTML = '<div style="background-color: #fff; padding: 7px; border-radius: 3%"><p class="text-monospace" style="padding: 5px; margin: 0; border: 1px solid #d9d9d9; border-radius: 3%; color: #000; background: #f4f4f4">Ảnh từ ngày ' + startL + ' đến ' + endL + ' </p></div>';
        return div;
    };

    command.addTo(map);
    var command = L.control({
        position: 'bottomright'
    });

    command.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'command');
        div.innerHTML = '<div style="background-color: #fff; padding: 7px; border-radius: 3%"><p class="text-monospace" style="padding: 5px; margin: 0; border: 1px solid #d9d9d9; border-radius: 3%; color: #000; background: #f4f4f4">Ảnh từ ngày ' + startR + ' đến ' + endR + ' </p></div>';
        return div;
    };
    command.addTo(map);

}
var osmLayer = L.tileLayer(geo1).addTo(map);
var stamenLayer = L.tileLayer(geo).addTo(map)

// L.control.sideBySide(stamenLayer, osmLayer).addTo(map);

L.control.measure({
    primaryLengthUnit: 'kilometers',
    secondaryLengthUnit: 'meter',
    primaryAreaUnit: 'sqmeters',
    secondaryAreaUnit: undefined
}).addTo(map);

map.on('measurefinish', function (evt) {
    writeResults(evt);
});

function writeResults(results) {
    document.getElementById('eventoutput').innerHTML = JSON.stringify({
        area: results.area,
        areaDisplay: results.areaDisplay,
        lastCoord: results.lastCoord,
        length: results.length,
        lengthDisplay: results.lengthDisplay,
        pointCount: results.pointCount,
        points: results.points
    },
        null,
        2
    );
}

