import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import React, { useEffect, useState } from 'react';
import io from 'socket.io-client';

// WebSocket URL (replace with your backend)
const SOCKET_SERVER_URL = "http://localhost:3000";

const Home = () => {
	const {data} = useQuery({queryKey: ["authUser"]});
	const queryClient = useQueryClient();

  const [collisionData, setCollisionData] = useState(null);
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const socket = io(SOCKET_SERVER_URL, { transports: ['websocket'] });

    // Listen for new collision data from the server
    socket.on("newCollisionData", (data) => {
      console.log("Collision data received:", data);
      
      // If multiple new collisions, we can set the latest one
      if (data && data.length > 0) {
        setCollisionData(data[data.length - 1]); // Get the latest collision data
      }
    });

    socket.on("connect", () => {
      console.log("Connected to server");
      setIsConnected(true);
    });

    socket.on("disconnect", () => {
      console.log("Disconnected from server");
      setIsConnected(false);
    });

    return () => {
      socket.disconnect();
    };
  }, []);

  const {mutate:logoutMutation, isPending} = useMutation({
		mutationFn: async () => {
			try {
				const res = await fetch("http://localhost:3000/logout", {
					method: "POST",
					headers: {
						"Content-Type": "application/json",
					}
				});
				
				const data = await res.json();

				if(!res.ok){
					throw new Error(data.error || "Failed to create account");
				}

				console.log(data);
				return data;
			} catch (error) {
				throw error;
			}
		},

		onSuccess: () => {
			queryClient.invalidateQueries({queryKey: ["authUser"]});
		}
	});

  const handleLogout = (e) => {
		e.preventDefault();
		logoutMutation();
	}

  return (
    <div className="min-h-screen bg-gray-100 flex flex-col items-center justify-center py-10">
      <h2 className="text-3xl font-bold text-gray-800 mb-6">
        Collision Detection System
      </h2>

      {isConnected ? (
        <>
          {collisionData ? (
            <div className="bg-white shadow-lg rounded-lg p-6 w-full max-w-md mx-auto">
              <h3 className="text-xl font-semibold text-red-600">
                Collision Detected!
              </h3>
              <p className="mt-2 text-gray-700">
                <span className="font-bold">Impact Level:</span> {collisionData.impact}
              </p>
              <p className="mt-2 text-gray-700">
                <span className="font-bold">Temperature:</span> {collisionData.temperature}°C
              </p>
              <p className="mt-2 text-gray-700">
                <span className="font-bold">Orientation:</span> {collisionData.orientation}
              </p>
              <p className="mt-2 text-gray-700">
                <span className="font-bold">Location:</span> Lat: {collisionData.location.lat}, Long: {collisionData.location.long}
              </p>
            </div>
          ) : (
            <p className="text-gray-700 text-lg">No collisions detected</p>
          )}
        </>
      ) : (
        <p className="text-gray-500 text-lg">Connecting to server...</p>
      )}

      {/* <button
        className="mt-4 bg-red-500 hover:bg-red-700 text-white font-bold py-2 px-4 rounded"
        onClick={handleLogout}
      >
        Logout
      </button> */}
    </div>
  );
}

export default Home;
