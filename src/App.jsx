// src/App.js
import GeofencingMap from "./components/GeofencingMap";
import "./index.css";

function App() {
  return (
    <div className="App">
      <header className="bg-blue-500 text-white text-center py-4">
        <h1 className="text-2xl">Geofencing Map App</h1>
      </header>
      <main>
        <GeofencingMap />
      </main>
    </div>
  );
}

export default App;

/* 
// src/App.js
import { useState } from "react";
import Geofence from "./components/Geofence";

const geofence = [
  { latitude: 37.7749, longitude: -122.4194 },
  { latitude: 37.8049, longitude: -122.4294 },
  { latitude: 37.7949, longitude: -122.3994 },
];

const App = () => {
  const [log, setLog] = useState([]);

  const handleEnter = (position) => {
    alert("Entered geofence");
    const entry = {
      type: "enter",
      position,
      timestamp: new Date().toISOString(),
    };
    setLog([...log, entry]);
  };

  const handleExit = (position) => {
    alert("Exited geofence");
    const exit = {
      type: "exit",
      position,
      timestamp: new Date().toISOString(),
    };
    setLog([...log, exit]);
  };

  return (
    <div className="flex flex-col items-center justify-center">
      <h1 className="text-green-500">Geofencing App</h1>
      <Geofence geofence={geofence} onEnter={handleEnter} onExit={handleExit} />
      <h2>Log</h2>
      <pre>{JSON.stringify(log, null, 2)}</pre>
    </div>
  );
};

export default App;
*/
