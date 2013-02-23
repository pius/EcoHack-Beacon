(function () {
var m = L.map('mapID').setView([37.79, -122.20], 12);
var baseMaps = [
    "Stamen.Watercolor",
	"OpenStreetMap.Mapnik",
	"OpenStreetMap.DE",
	"Esri.WorldImagery",
	"MapQuestOpen.OSM"
];
var lc = L.control.layers.provided(baseMaps,{},{collapsed:false}).addTo(m);
m.addHash({lc:lc});
var data={}, layers={}, fills =[
    "rgb(197,27,125)",
	"rgb(222,119,174)",
	"rgb(213, 62, 79)",
	"rgb(84, 39, 136)",
	"rgb(247,64,247)",
	"rgb(244, 109, 67)",
	"rgb(184,225,134)",
	"rgb(127,188,65)",
	"rgb(69, 117, 180)"
];
d3.json("json/beacons.json", dealwithData);
function dealwithData(oa){
	data.json= oa.features.map(function(v){
        return v;// [v.geometry.coordinates[1],v.geometry.coordinates[0]];
	});
  	data.justCoordinates= oa.features.map(function(v){
        return [v.geometry.coordinates[1],v.geometry.coordinates[0]];
	});

  console.log("data.json is " + data.json);
    points();
    veronoi();
    delaunay();
    clusters();
    quadtree();
}
function points(){
    layers.points = L.layerGroup(data.json.map(function(beacon){
      var coordinates = L.latLng([beacon.geometry.coordinates[1], beacon.geometry.coordinates[0]]);

      var color = "green";

      var marker = L.marker(coordinates);
      marker.setOpacity(0.7);
      
      marker.bindPopup(beacon.properties.name + ' <br> Current reading: 12.3.').openPopup();

      return marker;


      //return L.circleMarker(L.latLng(v),
                            //{radius:15,stroke:false,fillOpacity:1,clickable:false,
                              //color:fills[Math.floor((Math.random()*9))]}).bindPopup('A pretty CSS3 popup. <br> Easily customizable.');
	}));
	lc.addOverlay(layers.points,"Beacons");
  //layers.points.map(function(beacon){
    //beacon.openPopup();
  //});
}
function veronoi(){
    data.veronoi = d3.geom.voronoi(data.justCoordinates);
    layers.veronoi = L.layerGroup(data.veronoi.map(function(v){
		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
	}));
	lc.addOverlay(layers.veronoi,"veronoi");
}
function delaunay(){
    data.delaunay = d3.geom.delaunay(data.justCoordinates);
    layers.delaunay = L.layerGroup(data.delaunay.map(function(v){
		return L.polygon(v,{stroke:false,fillOpacity:0.7,color:fills[Math.floor((Math.random()*9))]})
	}));
	lc.addOverlay(layers.delaunay,"delaunay");
}
function clusters(){
    layers.clusters= new L.MarkerClusterGroup();
	layers.clusters.addLayers(data.justCoordinates.map(function(v){
		return L.marker(L.latLng(v));
	}));
	lc.addOverlay(layers.clusters,"clusters");
}
function quadtree(){
    data.quadtree = d3.geom.quadtree(data.justCoordinates.map(function(v){return {x:v[0],y:v[1]};}));
	layers.quadtree = L.layerGroup();
	data.quadtree.visit(function(quad, lat1, lng1, lat2, lng2){
		layers.quadtree.addLayer(L.rectangle([[lat1,lng1],[lat2,lng2]],{fillOpacity:0,weight:1,color:"#000",clickable:false}));
	});
	lc.addOverlay(layers.quadtree,"quadtree");
}

layers.svg.bindPopup(function(p){
	var out =[];
	for(var key in p){
	if(key !== "FOURCOLOR"){
		out.push("<strong>"+key+"</strong>: "+p[key]);
		}
	}
	return out.join("<br/>");
	});

  //L.Control.Attribution({position: 'bottomleft', prefix: "Powered by Beacon"});

window.public = {};
window.public.data = data;
window.public.layers = layers;

}());
