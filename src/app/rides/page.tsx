// app/rides/page.tsx
"use client";

import { useState, useEffect } from "react";
import { useSession } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { format } from "date-fns";

// Types
interface RideRequest {
  conversation: any;
  _id: string;
  origin: string;
  destination: string;
  totalFare: number;
  vehicleType: "AutoRickshaw" | "CNG" | "Car" | "Hicks";
  totalPassengers: number;
  totalAccepted: number;
  rideTime: string;
  note: string;
  status: "pending" | "accepted" | "completed" | "cancelled";
  user: {
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  };
  participants: Array<{
    _id: string;
    firstName: string;
    lastName: string;
    profilePicture?: string;
  }>;
  preferences: Array<{
    gender?: "Male" | "Female" | "Other";
    ageRange?: string;
    institution?: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Component for creating a new ride request (FR 1)
const CreateRideForm = ({ onCreated }: { onCreated: () => void }) => {
  const [isOpen, setIsOpen] = useState(false);
  const [formData, setFormData] = useState({
    origin: "",
    destination: "",
    totalFare: 0,
    vehicleType: "CNG" as const,
    totalPassengers: 1,
    rideTime: "",
    note: "",
    preferences: [] as Array<{
      gender?: "Male" | "Female" | "Other";
      ageRange?: string;
      institution?: string;
    }>,
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const handleChange = (
    e: React.ChangeEvent<
      HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement
    >
  ) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]:
        name === "totalFare" || name === "totalPassengers"
          ? parseInt(value) || 0
          : value,
    }));
  };

  const handlePreferenceChange = (
    index: number,
    field: string,
    value: string
  ) => {
    const updatedPreferences = [...formData.preferences];
    if (!updatedPreferences[index]) {
      updatedPreferences[index] = {};
    }
    (updatedPreferences[index] as any)[field] = value;
    setFormData((prev) => ({
      ...prev,
      preferences: updatedPreferences,
    }));
  };

  const addPreference = () => {
    setFormData((prev) => ({
      ...prev,
      preferences: [...prev.preferences, {}],
    }));
  };

  const removePreference = (index: number) => {
    const updatedPreferences = [...formData.preferences];
    updatedPreferences.splice(index, 1);
    setFormData((prev) => ({
      ...prev,
      preferences: updatedPreferences,
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setError(null);

    try {
      const response = await fetch("/api/ride-request", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(formData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to create ride request");
      }

      // Reset form and close modal
      setFormData({
        origin: "",
        destination: "",
        totalFare: 0,
        vehicleType: "CNG",
        totalPassengers: 1,
        rideTime: "",
        note: "",
        preferences: [],
      });
      setIsOpen(false);
      onCreated();
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="mb-8">
      {!isOpen ? (
        <button
          onClick={() => setIsOpen(true)}
          className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
        >
          Create Ride Request
        </button>
      ) : (
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <div className="flex justify-between items-center mb-4">
            <h2 className="text-2xl font-bold">Create New Ride Request</h2>
            <button
              onClick={() => setIsOpen(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <span className="text-2xl">&times;</span>
            </button>
          </div>

          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit}>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
              <div>
                <label
                  htmlFor="origin"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Origin
                </label>
                <input
                  type="text"
                  id="origin"
                  name="origin"
                  value={formData.origin}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="destination"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Destination
                </label>
                <input
                  type="text"
                  id="destination"
                  name="destination"
                  value={formData.destination}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="totalFare"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Fare (Tk)
                </label>
                <input
                  type="number"
                  id="totalFare"
                  name="totalFare"
                  value={formData.totalFare}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="0"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="vehicleType"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Vehicle Type
                </label>
                <select
                  id="vehicleType"
                  name="vehicleType"
                  value={formData.vehicleType}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                >
                  <option value="AutoRickshaw">Auto Rickshaw</option>
                  <option value="CNG">CNG</option>
                  <option value="Car">Car</option>
                  <option value="Hicks">Hiace</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="totalPassengers"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Total Passengers
                </label>
                <input
                  type="number"
                  id="totalPassengers"
                  name="totalPassengers"
                  value={formData.totalPassengers}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  min="1"
                  max="4"
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="rideTime"
                  className="block text-sm font-medium text-gray-700 mb-1"
                >
                  Ride Time
                </label>
                <input
                  type="datetime-local"
                  id="rideTime"
                  name="rideTime"
                  value={formData.rideTime}
                  onChange={handleChange}
                  className="w-full p-2 border border-gray-300 rounded-md"
                  required
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="note"
                className="block text-sm font-medium text-gray-700 mb-1"
              >
                Note
              </label>
              <textarea
                id="note"
                name="note"
                value={formData.note}
                onChange={handleChange}
                className="w-full p-2 border border-gray-300 rounded-md"
                rows={3}
              ></textarea>
            </div>

            <div className="mb-4">
              <div className="flex justify-between items-center mb-2">
                <label className="block text-sm font-medium text-gray-700">
                  Preferences
                </label>
                <button
                  type="button"
                  onClick={addPreference}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  + Add Preference
                </button>
              </div>

              {formData.preferences.map((pref, index) => (
                <div
                  key={index}
                  className="grid grid-cols-1 md:grid-cols-3 gap-4 p-3 border border-gray-200 rounded-md mb-2"
                >
                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Gender
                    </label>
                    <select
                      value={pref.gender || ""}
                      onChange={(e) =>
                        handlePreferenceChange(index, "gender", e.target.value)
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    >
                      <option value="">Any</option>
                      <option value="Male">Male</option>
                      <option value="Female">Female</option>
                      <option value="Other">Other</option>
                    </select>
                  </div>

                  <div>
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Age Range
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. 18-25"
                      value={pref.ageRange || ""}
                      onChange={(e) =>
                        handlePreferenceChange(
                          index,
                          "ageRange",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                  </div>

                  <div className="relative">
                    <label className="block text-xs font-medium text-gray-700 mb-1">
                      Institution
                    </label>
                    <input
                      type="text"
                      placeholder="e.g. BUET"
                      value={pref.institution || ""}
                      onChange={(e) =>
                        handlePreferenceChange(
                          index,
                          "institution",
                          e.target.value
                        )
                      }
                      className="w-full p-2 border border-gray-300 rounded-md text-sm"
                    />
                    <button
                      type="button"
                      onClick={() => removePreference(index)}
                      className="absolute right-2 top-8 text-red-500 hover:text-red-700"
                    >
                      &times;
                    </button>
                  </div>
                </div>
              ))}
            </div>

            <div className="flex justify-end space-x-3 mt-6">
              <button
                type="button"
                onClick={() => setIsOpen(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-100"
                disabled={isLoading}
              >
                Cancel
              </button>
              <button
                type="submit"
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:bg-blue-400"
                disabled={isLoading}
              >
                {isLoading ? "Creating..." : "Create Ride Request"}
              </button>
            </div>
          </form>
        </div>
      )}
    </div>
  );
};

// Individual Ride Card Component with enhanced capabilities (FR 3, FR 5)
const RideCard = ({
  ride,
  isOwner,
  onJoin,
  onCancelRide,
  onRemovePassenger,
  joinLoading,
}: {
  ride: RideRequest;
  isOwner: boolean;
  onJoin: (id: string) => void;
  onCancelRide: (id: string) => void;
  onRemovePassenger: (rideId: string, passengerId: string) => void;
  joinLoading: boolean;
}) => {
  const formattedDate = new Date(ride.rideTime).toLocaleString();
  const seatsLeft = ride.totalPassengers - ride.totalAccepted;
  const [showPassengers, setShowPassengers] = useState(false);

  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4 border-l-4 border-blue-500">
      <div className="flex justify-between items-start mb-3">
        <div>
          <h3 className="text-lg font-semibold">
            {ride.origin} → {ride.destination}
          </h3>
          <p className="text-sm text-gray-600">
            {format(new Date(ride.rideTime), "MMM dd, yyyy 'at' h:mm a")}
          </p>
        </div>
        <div className="text-right">
          <p className="text-lg font-bold">{ride.totalFare} Tk</p>
          <p className="text-sm bg-green-100 text-green-800 px-2 py-0.5 rounded-full inline-block">
            {ride.vehicleType}
          </p>
        </div>
      </div>

      <div className="grid grid-cols-2 gap-2 mb-3 text-sm">
        <div>
          <span className="text-gray-600">Posted by:</span>{" "}
          {ride.user.firstName} {ride.user.lastName}
        </div>
        <div>
          <span className="text-gray-600">Seats:</span> {seatsLeft} of{" "}
          {ride.totalPassengers} available
        </div>
      </div>

      {ride.note && (
        <div className="mb-3 text-sm bg-gray-50 p-2 rounded">
          <span className="font-medium text-gray-700">Note: </span>
          {ride.note}
        </div>
      )}

      {ride.preferences && ride.preferences.length > 0 && (
        <div className="mb-3">
          <p className="text-xs text-gray-500 mb-1">Preferences:</p>
          <div className="flex flex-wrap gap-1">
            {ride.preferences.map((pref, index) => (
              <div
                key={index}
                className="text-xs bg-blue-50 text-blue-800 px-2 py-1 rounded-full"
              >
                {pref.gender ? `${pref.gender}` : ""}
                {pref.ageRange ? ` • ${pref.ageRange}` : ""}
                {pref.institution ? ` • ${pref.institution}` : ""}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Show participants when owner or user has joined */}
      {ride.participants && ride.participants.length > 0 && (
        <div className="mb-3">
          <button
            onClick={() => setShowPassengers(!showPassengers)}
            className="text-xs text-blue-600 mb-1 flex items-center"
          >
            {showPassengers ? "Hide" : "Show"} Passengers (
            {ride.participants.length})
            <span className="ml-1">{showPassengers ? "▲" : "▼"}</span>
          </button>

          {showPassengers && (
            <div className="bg-gray-50 p-2 rounded text-sm">
              {ride.participants.map((participant, index) => (
                <div
                  key={index}
                  className="flex items-center justify-between mb-1"
                >
                  <span>
                    {participant.firstName} {participant.lastName}
                  </span>
                  {isOwner && ride.status === "pending" && (
                    <button
                      onClick={() =>
                        onRemovePassenger(ride._id, participant._id)
                      }
                      className="text-xs text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      )}

      <div className="flex justify-between items-center mt-4">
        <span
          className={`text-xs px-2 py-1 rounded-full ${
            ride.status === "pending"
              ? "bg-yellow-100 text-yellow-800"
              : ride.status === "accepted"
              ? "bg-green-100 text-green-800"
              : ride.status === "completed"
              ? "bg-blue-100 text-blue-800"
              : "bg-red-100 text-red-800"
          }`}
        >
          {ride.status.charAt(0).toUpperCase() + ride.status.slice(1)}
        </span>

        <div className="flex space-x-2">
          {isOwner ? (
            <div className="flex space-x-2">
              {ride.status === "pending" && (
                <button
                  className="text-sm px-3 py-1 bg-red-100 text-red-800 rounded hover:bg-red-200"
                  onClick={() => onCancelRide(ride._id)}
                >
                  Cancel Ride
                </button>
              )}
              {ride.status === "accepted" && (
                <button
                  className="text-sm px-3 py-1 bg-blue-100 text-blue-800 rounded hover:bg-blue-200"
                  onClick={() => {}}
                >
                  Mark Completed
                </button>
              )}
              <Link
                href={`/chat/${ride.conversation?._id || ""}`}
                className={`text-sm px-3 py-1 ${
                  ride.participants?.length > 0
                    ? "bg-green-100 text-green-800 rounded hover:bg-green-200"
                    : "bg-gray-100 text-gray-400 rounded cursor-not-allowed"
                }`}
              >
                Messages
              </Link>
            </div>
          ) : (
            <div className="flex space-x-2">
              {ride.status === "pending" && (
                <button
                  className="text-sm px-3 py-1 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:bg-blue-300"
                  onClick={() => onJoin(ride._id)}
                  disabled={joinLoading || seatsLeft === 0}
                >
                  {joinLoading ? "Joining..." : "Join Ride"}
                </button>
              )}
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Filter/Search Component (FR 2)
const RideFilters = ({
  filters,
  setFilters,
}: {
  filters: {
    status: string;
    search: string;
    dateRange: string;
    location: string;
    vehicleType: string;
  };
  setFilters: React.Dispatch<
    React.SetStateAction<{
      status: string;
      search: string;
      dateRange: string;
      location: string;
      vehicleType: string;
    }>
  >;
}) => {
  return (
    <div className="bg-white rounded-lg shadow-md p-4 mb-4">
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <div>
          <label
            htmlFor="status"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Status
          </label>
          <select
            id="status"
            value={filters.status}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, status: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Rides</option>
            <option value="pending">Pending</option>
            <option value="accepted">Accepted</option>
            <option value="completed">Completed</option>
            <option value="cancelled">Cancelled</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="location"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Location
          </label>
          <input
            type="text"
            id="location"
            value={filters.location}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, location: e.target.value }))
            }
            placeholder="Origin or destination"
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="dateRange"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Date
          </label>
          <input
            type="date"
            id="dateRange"
            value={filters.dateRange}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, dateRange: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>

        <div>
          <label
            htmlFor="vehicleType"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Vehicle Type
          </label>
          <select
            id="vehicleType"
            value={filters.vehicleType}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, vehicleType: e.target.value }))
            }
            className="w-full p-2 border border-gray-300 rounded-md"
          >
            <option value="all">All Types</option>
            <option value="AutoRickshaw">Auto Rickshaw</option>
            <option value="CNG">CNG</option>
            <option value="Car">Car</option>
            <option value="Hicks">Hicks</option>
          </select>
        </div>

        <div>
          <label
            htmlFor="search"
            className="block text-sm font-medium text-gray-700 mb-1"
          >
            Search
          </label>
          <input
            type="text"
            id="search"
            value={filters.search}
            onChange={(e) =>
              setFilters((prev) => ({ ...prev, search: e.target.value }))
            }
            placeholder="Search anything..."
            className="w-full p-2 border border-gray-300 rounded-md"
          />
        </div>
      </div>
    </div>
  );
};

// Notification Component for FR 4
const Notification = ({
  message,
  type,
  onClose,
}: {
  message: string;
  type: "success" | "error" | "info";
  onClose: () => void;
}) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 5000);

    return () => clearTimeout(timer);
  }, [onClose]);

  const bgColor =
    type === "success"
      ? "bg-green-100 border-green-400 text-green-700"
      : type === "error"
      ? "bg-red-100 border-red-400 text-red-700"
      : "bg-blue-100 border-blue-400 text-blue-700";

  return (
    <div className={`${bgColor} px-4 py-3 rounded border relative mb-4`}>
      <strong className="font-bold mr-1">
        {type === "success"
          ? "Success!"
          : type === "error"
          ? "Error!"
          : "Info:"}
      </strong>
      <span className="block sm:inline">{message}</span>
      <button
        onClick={onClose}
        className="absolute top-0 bottom-0 right-0 px-4 py-3"
      >
        <span className="text-xl">&times;</span>
      </button>
    </div>
  );
};

// Main Page Component
export default function RideSharingPage() {
  const { data: session, status } = useSession();
  const router = useRouter();
  const [rideRequests, setRideRequests] = useState<RideRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [joinLoading, setJoinLoading] = useState(false);
  const [notification, setNotification] = useState<{
    show: boolean;
    message: string;
    type: "success" | "error" | "info";
  }>({
    show: false,
    message: "",
    type: "info",
  });
  const [filters, setFilters] = useState({
    status: "all",
    search: "",
    dateRange: "",
    location: "",
    vehicleType: "all",
  });

  // Fetch ride requests
  const fetchRideRequests = async () => {
    setLoading(true);
    try {
      const response = await fetch("/api/ride-request");
      if (!response.ok) {
        throw new Error("Failed to fetch ride requests");
      }
      const data = await response.json();
      setRideRequests(data.rideRequests);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    if (status === "authenticated") {
      fetchRideRequests();
    } else if (status === "unauthenticated") {
      router.push("/auth/signin");
    }
  }, [status, router]);

  // Handle joining a ride (FR 3)
  const handleJoinRide = async (rideId: string) => {
    if (!session?.user) return;

    setJoinLoading(true);
    try {
      const response = await fetch(`/api/ride-request/join/${rideId}`, {
        method: "POST",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to join ride");
      }

      const data = await response.json();

      // Show confirmation notification (FR 4)
      setNotification({
        show: true,
        message: "You have successfully joined the ride!",
        type: "success",
      });

      // Redirect to conversation if there is one
      if (data.conversationId) {
        router.push(`/chat/${data.conversationId}`);
      } else {
        // Just refresh the ride list
        fetchRideRequests();
      }
    } catch (err) {
      setNotification({
        show: true,
        message: (err as Error).message,
        type: "error",
      });
    } finally {
      setJoinLoading(false);
    }
  };

  // Handle canceling a ride (FR 5)
  const handleCancelRide = async (rideId: string) => {
    if (!confirm("Are you sure you want to cancel this ride?")) {
      return;
    }

    try {
      const response = await fetch(`/api/ride-request/${rideId}/cancel`, {
        method: "PUT",
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to cancel ride");
      }

      setNotification({
        show: true,
        message: "Ride has been cancelled successfully",
        type: "success",
      });

      fetchRideRequests();
    } catch (err) {
      setNotification({
        show: true,
        message: (err as Error).message,
        type: "error",
      });
    }
  };

  // Handle removing a passenger (FR 5)
  const handleRemovePassenger = async (rideId: string, passengerId: string) => {
    if (!confirm("Are you sure you want to remove this passenger?")) {
      return;
    }

    try {
      const response = await fetch(
        `/api/ride-request/${rideId}/passenger/${passengerId}`,
        {
          method: "DELETE",
        }
      );

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Failed to remove passenger");
      }

      setNotification({
        show: true,
        message: "Passenger has been removed successfully",
        type: "success",
      });

      fetchRideRequests();
    } catch (err) {
      setNotification({
        show: true,
        message: (err as Error).message,
        type: "error",
      });
    }
  };

  // Filter ride requests (FR 2)
  const filteredRideRequests = rideRequests.filter((ride) => {
    // Filter by status
    if (filters.status !== "all" && ride.status !== filters.status) {
      return false;
    }

    // Filter by date range
    if (
      filters.dateRange &&
      new Date(ride.rideTime).toDateString() !==
        new Date(filters.dateRange).toDateString()
    ) {
      return false;
    }

    // Filter by location (origin or destination)
    if (
      filters.location &&
      !ride.origin.toLowerCase().includes(filters.location.toLowerCase()) &&
      !ride.destination.toLowerCase().includes(filters.location.toLowerCase())
    ) {
      return false;
    }

    // Filter by vehicle type
    if (
      filters.vehicleType !== "all" &&
      ride.vehicleType !== filters.vehicleType
    ) {
      return false;
    }

    // Filter by search term (match against multiple fields)
    if (filters.search) {
      const searchTerm = filters.search.toLowerCase();
      const searchableFields = [
        ride.origin.toLowerCase(),
        ride.destination.toLowerCase(),
        ride.vehicleType.toLowerCase(),
        ride.note?.toLowerCase() || "",
        `${ride.user.firstName} ${ride.user.lastName}`.toLowerCase(),
      ];

      if (!searchableFields.some((field) => field.includes(searchTerm))) {
        return false;
      }
    }

    return true;
  });

  // Check if user owns a particular ride
  const isRideOwner = (ride: RideRequest) => {
    return session?.user?.id === ride.user._id;
  };

  // Check if a user has already joined a ride
  const hasUserJoined = (ride: RideRequest) => {
    return ride.participants.some((p) => p._id === session?.user?.id);
  };

  // Clear notification
  const clearNotification = () => {
    setNotification({ show: false, message: "", type: "info" });
  };

  if (status === "loading") {
    return (
      <div className="container mx-auto px-4 py-8">
        <h1 className="text-2xl font-bold mb-6">Ride Sharing</h1>
        <div className="flex justify-center items-center h-64">
          <p className="text-gray-500">Loading ride requests...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Ride Sharing</h1>

      {notification.show && (
        <Notification
          message={notification.message}
          type={notification.type}
          onClose={clearNotification}
        />
      )}

      <CreateRideForm onCreated={fetchRideRequests} />

      <RideFilters filters={filters} setFilters={setFilters} />

      <div className="mb-6">
        <h2 className="text-xl font-semibold mb-2">Available Rides</h2>

        {loading ? (
          <p className="text-gray-500">Loading ride requests...</p>
        ) : error ? (
          <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded">
            {error}
          </div>
        ) : filteredRideRequests.length === 0 ? (
          <div className="bg-gray-100 p-4 rounded-lg text-center">
            <p className="text-gray-600">No ride requests found.</p>
          </div>
        ) : (
          <div>
            {filteredRideRequests.map((ride) => (
              <RideCard
                key={ride._id}
                ride={ride}
                isOwner={isRideOwner(ride)}
                onJoin={handleJoinRide}
                onCancelRide={handleCancelRide}
                onRemovePassenger={handleRemovePassenger}
                joinLoading={joinLoading}
              />
            ))}
          </div>
        )}
      </div>

      {/* Implement ride request history or stats here if needed */}
      <div className="mt-8 bg-blue-50 rounded-lg p-6">
        <h2 className="text-xl font-semibold mb-4">Ride Sharing Tips</h2>
        <ul className="list-disc pl-5 space-y-2">
          <li>Share rides with verified users for better safety</li>
          <li>Always check the ride details before joining</li>
          <li>Communicate with other riders through the messaging system</li>
          <li>Be on time for your scheduled rides</li>
          <li>Cancel rides well in advance if you can&apos;t make it</li>
        </ul>
      </div>
    </div>
  );
}
