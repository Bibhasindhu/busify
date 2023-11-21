//Firebase Code
// TODO: Replace with your app's Firebase project configuration

const firebaseConfig = {
  apiKey: "AIzaSyB0SsbEkfZ-h-ggU2LbsLxQDEiVsOoIhzU",
  authDomain: "public-bus-locator.firebaseapp.com",
  databaseURL: "https://public-bus-locator-default-rtdb.asia-southeast1.firebasedatabase.app",
  projectId: "public-bus-locator",
  storageBucket: "public-bus-locator.appspot.com",
  messagingSenderId: "272521132248",
  appId: "1:272521132248:web:f63e9615781f06c0c6ffad",
  measurementId: "G-L99TXT8DNH"
};

firebase.initializeApp(firebaseConfig);

// Get a reference to the database service
var database = firebase.database();

let busId = "bus1"
async function getBusLocation() {
  var locationRef = firebase.database().ref('buses/' + busId + '/currentLocation');
  let data = await locationRef.once('value');
  return data.val();
}

//Mapbox Code
mapboxgl.accessToken =
  "pk.eyJ1IjoiYmliaGFzaW5kaHUiLCJhIjoiY2twOTY5YWRoMGgwaTJ1bjFma2MxbW14diJ9.iKAhcg-u92dqTfo-D_UFjw";

navigator.geolocation.getCurrentPosition(successLocation, errorLocation, {
  enableHighAccuracy: true,
});

function successLocation(position) {
  setupMap([position.coords.longitude, position.coords.latitude]);
}

function errorLocation() {
  setupMap([77.10898, 28.646519]);
}
let map = new mapboxgl.Map({
  container: "map",
  style: "mapbox://styles/mapbox/streets-v11",
  center: [77.10898, 28.646519],
  zoom: 15,
});
function setupMap(center) {
  map = new mapboxgl.Map({
    container: "map",
    style: "mapbox://styles/mapbox/streets-v11",
    center: center,
    zoom: 15,
  });

  const nav = new mapboxgl.NavigationControl();
  map.addControl(nav);

  const directions = new MapboxDirections({
    accessToken: mapboxgl.accessToken,
  });
  mapStart()
  //map.addControl(directions, "top-left");
}



async function mapStart() {
  // Get the initial location of the International Space Station (ISS).
  const geojson = await getLocation();
  // Add the ISS location as a source.
  map.loadImage(
    'favicon.png',
    (error, image) => {
      if (error) throw error;

      // Add the image to the map style.
      map.addImage('mybus', image);
    });
  map.addSource('iss', {
    type: 'geojson',
    data: geojson
  });
  // Add the rocket symbol layer to the map.
  map.addLayer({
    'id': 'iss',
    'type': 'symbol',
    'source': 'iss',
    'layout': {
      // This icon is a part of the Mapbox Streets style.
      // To view all images available in a Mapbox style, open
      // the style in Mapbox Studio and click the "Images" tab.
      // To add a new image to the style at runtime see
      // https://docs.mapbox.com/mapbox-gl-js/example/add-image/
      'icon-image': 'mybus',
      'icon-size': 0.08
    }
  });

  // Update the source from the API every 2 seconds.
  const updateSource = setInterval(async () => {
    const geojson = await getLocation(updateSource);
    map.getSource('iss').setData(geojson);
  }, 20000);

  async function getLocation(updateSource) {
    // Make a GET request to the API and return the location of the ISS.
    try {
      let response = await getBusLocation();
      console.log(response)
      latitude = response["latitude"];
      longitude = response["longitude"];
      // Fly the map to the location.

      map.flyTo({
        center: [longitude, latitude],
        speed: 0.5
      });
      // Return the location of the ISS as GeoJSON.
      return {
        'type': 'FeatureCollection',
        'features': [
          {
            'type': 'Feature',
            'geometry': {
              'type': 'Point',
              'coordinates': [longitude, latitude]
            }
          }
        ]
      };
    } catch (err) {
      // If the updateSource interval is defined, clear the interval to stop updating the source.
      if (updateSource) clearInterval(updateSource);
      throw new Error(err);
    }
  }
}


//getBusLocation();
