import React from "react";

const UserProfile: React.FC = () => {
  return (
    <div
      className="relative flex size-full min-h-screen flex-col bg-[#fcf8f8] group/design-root overflow-x-hidden"
      style={{ fontFamily: "Manrope, 'Noto Sans', sans-serif" }}
    >
      <div className="layout-container flex h-full grow flex-col">
        <div className="layout-content-container flex flex-col max-w-[960px] flex-1">
          <div className="flex flex-wrap justify-between gap-3 p-4">
            <p className="text-[#1b0d0d] tracking-light text-[32px] font-bold leading-tight min-w-72">
              Your Profile
            </p>
          </div>
          <div className="flex flex-col gap-3 p-4">
            <div className="flex gap-6 justify-between">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal">
                Profile Completeness
              </p>
              <p className="text-[#1b0d0d] text-sm font-normal leading-normal">
                60%
              </p>
            </div>
            <div className="rounded bg-[#e7cfcf]">
              <div
                className="h-2 rounded bg-[#ec1313]"
                style={{ width: "60%" }}
              ></div>
            </div>
            <p className="text-[#9a4c4c] text-sm font-normal leading-normal">
              12/20 fields completed
            </p>
          </div>
          <div className="flex items-center gap-4 bg-[#fcf8f8] px-4 min-h-14">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full h-10 w-fit"
              style={{
                backgroundImage:
                  'url("https://cdn.usegalileo.ai/stability/6bc412b1-40b2-45f6-ada9-e1acb022f930.png")',
              }}
            ></div>
            <p className="text-[#1b0d0d] text-base font-normal leading-normal flex-1 truncate">
              Isabella Rodriguez
            </p>
          </div>

          {/* Personal Information */}
          <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Personal Information
          </h3>
          <div className="flex items-center gap-4 bg-[#fcf8f8] px-4 min-h-[72px] py-2">
            <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-[#f3e7e7] shrink-0 size-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M174,47.75a254.19,254.19,0,0,0-41.45-38.3,8,8,0,0,0-9.18,0A254.19,254.19,0,0,0,82,47.75C54.51,79.32,40,112.6,40,144a88,88,0,0,0,176,0C216,112.6,201.49,79.32,174,47.75ZM128,216a72.08,72.08,0,0,1-72-72c0-57.23,55.47-105,72-118,16.53,13,72,60.75,72,118A72.08,72.08,0,0,1,128,216Zm55.89-62.66a57.6,57.6,0,0,1-46.56,46.55A8.75,8.75,0,0,1,136,200a8,8,0,0,1-1.32-15.89c16.57-2.79,30.63-16.85,33.44-33.45a8,8,0,0,1,15.78,2.68Z"></path>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                Blood Type
              </p>
              <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                O+
              </p>
            </div>
          </div>

          {/* Additional Personal Information */}
          <div className="flex flex-col gap-3 px-4 min-h-[72px]">
            {/* Location */}
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                Location
              </p>
              <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                Los Angeles, CA
              </p>
            </div>
            {/* Contact Number */}
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                Contact Number
              </p>
              <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                123-456-7890
              </p>
            </div>
          </div>

          {/* Medical History */}
          <h3 className="text-[#1b0d0d] text-lg font-bold leading-tight tracking-[-0.015em] px-4 pb-2 pt-4">
            Medical History
          </h3>
          <div className="flex items-center gap-4 bg-[#fcf8f8] px-4 min-h-[72px] py-2">
            <div className="text-[#1b0d0d] flex items-center justify-center rounded-lg bg-[#f3e7e7] shrink-0 size-12">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="24px"
                height="24px"
                fill="currentColor"
                viewBox="0 0 256 256"
              >
                <path d="M140,180a12,12,0,1,1-12-12A12,12,0,0,1,140,180ZM128,72c-22.06,0-40,16.15-40,36v4a8,8,0,0,0,16,0v-4c0-11,10.77-20,24-20s24,9,24,20-10.77,20-24,20a8,8,0,0,0-8,8v8a8,8,0,0,0,16,0v-.72c18.24-3.35,32-17.9,32-35.28C168,88.15,150.06,72,128,72Zm104,56A104,104,0,1,1,128,24,104.11,104.11,0,0,1,232,128Zm-16,0a88,88,0,1,0-88,88A88.1,88.1,0,0,0,216,128Z"></path>
              </svg>
            </div>
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                Have you ever received a blood transfusion?
              </p>
              <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                Yes
              </p>
            </div>
          </div>
          {/* Additional Medical Information */}
          <div className="flex flex-col gap-3 px-4 min-h-[72px]">
            {/* Medication */}
            <div className="flex flex-col justify-center">
              <p className="text-[#1b0d0d] text-base font-medium leading-normal line-clamp-1">
                Are you currently taking any medications?
              </p>
              <p className="text-[#9a4c4c] text-sm font-normal leading-normal line-clamp-2">
                No
              </p>
            </div>
          </div>

          {/* Add other sections similarly */}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
