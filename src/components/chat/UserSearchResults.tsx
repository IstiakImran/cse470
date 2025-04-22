// components/chat/UserSearchResults.tsx
import Image from "next/image";

interface User {
  _id: string;
  firstName: string;
  lastName: string;
  email: string;
  profilePicture?: string;
  status?: string;
}

interface UserSearchResultsProps {
  users: User[];
  onSelectUser: (userId: string) => void;
}

export default function UserSearchResults({
  users,
  onSelectUser,
}: UserSearchResultsProps) {
  if (users.length === 0) {
    return <div className="p-6 text-center text-gray-500">No users found</div>;
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => (
        <div
          key={user._id}
          onClick={() => onSelectUser(user._id)}
          className="p-4 flex items-center cursor-pointer hover:bg-gray-50"
        >
          <div className="relative">
            {user.profilePicture ? (
              <Image
                src={user.profilePicture}
                alt={`${user.firstName} ${user.lastName}`}
                width={48}
                height={48}
                className="rounded-full object-cover"
              />
            ) : (
              <div className="w-12 h-12 rounded-full bg-gray-300 flex items-center justify-center text-gray-600">
                {user.firstName?.[0]}
                {user.lastName?.[0]}
              </div>
            )}
            {user.status === "online" && (
              <span className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></span>
            )}
          </div>
          <div className="ml-3">
            <h3 className="font-medium text-gray-900">
              {user.firstName} {user.lastName}
            </h3>
            <p className="text-sm text-gray-500">{user.email}</p>
          </div>
        </div>
      ))}
    </div>
  );
}
