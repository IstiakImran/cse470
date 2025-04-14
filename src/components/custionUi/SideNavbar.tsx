import React from "react";

const Navbar: React.FC = () => {
  return (
    <div className="layout-content-container flex flex-col w-80">
      <div className="flex h-full min-h-[700px] flex-col justify-between bg-[#fcf8f8] p-4">
        <div className="flex flex-col gap-4">
          <div className="flex gap-3">
            <div
              className="bg-center bg-no-repeat aspect-square bg-cover rounded-full size-10"
              style={{
                backgroundImage:
                  'url("https://cdn.usegalileo.ai/stability/84bf7bb3-0206-4312-8177-14b30a40cc7e.png")',
              }}
            ></div>
            <h1 className="text-[#1b0d0d] text-base font-medium leading-normal">
              Isabella Rodriguez
            </h1>
          </div>
          <div className="flex flex-col gap-2">
            <div className="flex items-center gap-3 px-3 py-2">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Dashboard
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Blood Requests
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Donation History
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Find a Donor
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Messages
              </p>
            </div>
            <div className="flex items-center gap-3 px-3 py-2 rounded-xl bg-[#f3e7e7]">
              <p className="text-[#1b0d0d] text-sm font-medium leading-normal">
                Profile
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Navbar;
