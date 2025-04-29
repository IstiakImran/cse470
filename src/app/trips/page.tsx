"use client";
import { useEffect, useState } from "react";
import axios from "axios";
import { useSession } from "next-auth/react";

interface RideRequest {
  request_id: number;
  user_id: number;
  origin: string;
  destination: string;
  total_fare: number;
  vehicle_type: string;
  total_passengers: number;
  total_accepted: number;
  ride_time: string;
  status: string;
}

const RidesPage = () => {
  const { data: session } = useSession();
  const [createdRides, setCreatedRides] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(false); // For initial load
  const [deleting, setDeleting] = useState(false); // For delete loading

  useEffect(() => {
    if (session?.user) {
      fetchRides();
    }
  }, [session]);

  const fetchRides = async () => {
    setLoading(true); // Show loader while fetching data
    try {
      const userId = session?.user.id;
      const createdRidesResponse = await axios.get(
        `/api/ride-requests/created/${userId}`
      );
      setCreatedRides(createdRidesResponse.data);
    } catch (error) {
      console.error("Error fetching rides:", error);
    } finally {
      setLoading(false); // Hide loader after fetching data
    }
  };

  const handleDeleteRide = async (requestId: number) => {
    if (confirm("Are you sure you want to delete this ride?")) {
      try {
        setDeleting(true); // Show loader while deleting
        await axios.delete(`/api/ride-requests/${requestId}`);
        alert("Ride deleted successfully.");
        fetchRides();
      } catch (error) {
        console.error("Error deleting ride:", error);
        alert("Failed to delete the ride.");
      } finally {
        setDeleting(false); // Hide loader after delete operation
      }
    }
  };

  return (
    <div className="container mx-auto py-10 px-4">
      <h1 className="text-4xl font-bold text-purple-700 mb-8 text-center">
        My Created Rides
      </h1>

      <div className="mb-10">
        <h2 className="text-3xl font-semibold mb-6 text-purple-600">
          Rides I Created
        </h2>

        {/* Show loader while data is being fetched */}
        {loading ? (
          <div className="flex justify-center items-center">
            <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-purple-600"></div>
          </div>
        ) : createdRides.length === 0 ? (
          <p className="text-lg text-gray-500 text-center">
            No rides created yet.
          </p>
        ) : (
          <ul className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
            {createdRides.map((ride) => (
              <li
                key={ride.request_id}
                className="p-6 bg-white shadow-md rounded-lg transform transition duration-300 hover:scale-105"
              >
                <div className="bg-purple-100 rounded-md p-4 mb-4">
                  <p className="text-xl font-bold text-purple-700 mb-2">
                    Origin: {ride.origin}
                  </p>
                  <p className="text-xl font-bold text-purple-700 mb-2">
                    Destination: {ride.destination}
                  </p>
                </div>
                <p className="text-lg text-gray-600 mb-2">
                  <strong>Fare:</strong> ${ride.total_fare}
                </p>
                <p className="text-lg text-gray-600 mb-2">
                  <strong>Ride Time:</strong>{" "}
                  {new Date(ride.ride_time).toLocaleString()}
                </p>
                <p
                  className={`text-lg font-semibold mb-2 ${
                    ride.status === "pending"
                      ? "text-yellow-500"
                      : "text-green-500"
                  }`}
                >
                  <strong>Status:</strong> {ride.status}
                </p>
                <div className="flex justify-between mt-4">
                  <button
                    className={`bg-purple-600 hover:bg-purple-700 text-white font-bold py-2 px-4 rounded-lg shadow-lg transition-colors duration-200 ${
                      deleting ? "opacity-50 cursor-not-allowed" : ""
                    }`}
                    onClick={() => handleDeleteRide(ride.request_id)}
                    disabled={deleting}
                  >
                    {deleting ? "Deleting..." : "Delete Ride"}
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
};

export default RidesPage;
