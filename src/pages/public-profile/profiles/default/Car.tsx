import { toAbsoluteUrl } from '@/utils/Assets';
import React from 'react';

const Car = () => {
  return (
    <div className="card flex flex-col justify-center h-full p-8 ">
      <div className="flex w-full justify-center gap-8 mb-8 p-4">
        {/* Signal Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#5151F9] flex items-center justify-center">
            <svg
              width="33"
              height="33"
              viewBox="0 0 33 33"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <g filter="url(#filter0_d_687_14478)">
                <rect x="6.33984" y="2.5" width="21" height="21" rx="6" fill="#5151F9" />
              </g>
              <g clip-path="url(#clip0_687_14478)">
                <g clip-path="url(#clip1_687_14478)">
                  <g clip-path="url(#clip2_687_14478)">
                    <path
                      d="M16.2867 11.2197C15.588 11.2197 15.0195 11.8011 15.0195 12.5157C15.0195 13.1078 15.4099 13.608 15.9411 13.7623V17.7938C15.9411 17.989 16.0958 18.1472 16.2867 18.1472C16.4776 18.1472 16.6323 17.989 16.6323 17.7938V13.7623C17.1635 13.608 17.5539 13.1078 17.5539 12.5157C17.5539 11.8011 16.9854 11.2197 16.2867 11.2197Z"
                      fill="white"
                    />
                    <path
                      d="M14.6879 10.626C14.5529 10.488 14.3341 10.488 14.1992 10.626C13.1277 11.7217 13.1275 13.4955 14.1992 14.5914C14.3341 14.7295 14.5529 14.7295 14.6879 14.5914C14.8229 14.4534 14.8229 14.2296 14.6879 14.0916C13.8866 13.2721 13.8864 11.9455 14.6879 11.1258C14.8229 10.9878 14.8229 10.764 14.6879 10.626Z"
                      fill="white"
                    />
                    <path
                      d="M18.3741 10.626C18.2392 10.488 18.0204 10.488 17.8854 10.626C17.7504 10.764 17.7504 10.9878 17.8854 11.1258C18.6849 11.9435 18.6849 13.2739 17.8854 14.0916C17.7504 14.2296 17.7504 14.4534 17.8854 14.5914C18.0204 14.7294 18.2392 14.7294 18.3741 14.5914C19.4431 13.4982 19.4431 11.7192 18.3741 10.626Z"
                      fill="white"
                    />
                    <path
                      d="M13.6455 10.0594C13.7805 9.92139 13.7805 9.69759 13.6455 9.55956C13.5105 9.42155 13.2917 9.42155 13.1568 9.55956C11.5129 11.2408 11.5129 13.9764 13.1568 15.6577C13.2917 15.7957 13.5105 15.7958 13.6455 15.6577C13.7805 15.5197 13.7805 15.2959 13.6455 15.1578C12.2711 13.7522 12.2711 11.4651 13.6455 10.0594Z"
                      fill="white"
                    />
                    <path
                      d="M19.4171 9.55956C19.2822 9.42155 19.0633 9.42155 18.9284 9.55956C18.7934 9.69757 18.7934 9.92137 18.9284 10.0594C20.3028 11.4651 20.3028 13.7522 18.9284 15.1578C18.7934 15.2959 18.7934 15.5197 18.9284 15.6577C19.0634 15.7957 19.2821 15.7957 19.4171 15.6577C21.061 13.9764 21.061 11.2408 19.4171 9.55956Z"
                      fill="white"
                    />
                    <path
                      d="M12.6025 8.993C12.7374 8.85499 12.7374 8.63119 12.6025 8.49315C12.4675 8.35515 12.2487 8.35515 12.1137 8.49315C9.81115 10.848 9.81615 14.3742 12.1137 16.724C12.2486 16.862 12.4675 16.862 12.6025 16.724C12.7374 16.586 12.7374 16.3622 12.6025 16.2241C10.5871 14.1629 10.5871 11.0542 12.6025 8.993Z"
                      fill="white"
                    />
                    <path
                      d="M20.4591 8.49315C20.3242 8.35515 20.1053 8.35515 19.9704 8.49315C19.8354 8.63116 19.8354 8.85496 19.9704 8.993C21.9858 11.0542 21.9858 14.1629 19.9704 16.2241C19.8354 16.3621 19.8354 16.5859 19.9704 16.724C20.1054 16.862 20.3241 16.862 20.4591 16.724C22.7617 14.3691 22.7567 10.843 20.4591 8.49315Z"
                      fill="white"
                    />
                  </g>
                </g>
              </g>
              <defs>
                <filter
                  id="filter0_d_687_14478"
                  x="0.839843"
                  y="0.5"
                  width="32"
                  height="32"
                  filterUnits="userSpaceOnUse"
                  color-interpolation-filters="sRGB"
                >
                  <feFlood flood-opacity="0" result="BackgroundImageFix" />
                  <feColorMatrix
                    in="SourceAlpha"
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 127 0"
                    result="hardAlpha"
                  />
                  <feOffset dy="3.5" />
                  <feGaussianBlur stdDeviation="2.75" />
                  <feColorMatrix
                    type="matrix"
                    values="0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0 0.02 0"
                  />
                  <feBlend
                    mode="normal"
                    in2="BackgroundImageFix"
                    result="effect1_dropShadow_687_14478"
                  />
                  <feBlend
                    mode="normal"
                    in="SourceGraphic"
                    in2="effect1_dropShadow_687_14478"
                    result="shape"
                  />
                </filter>
                <clipPath id="clip0_687_14478">
                  <rect
                    width="12.6"
                    height="12.6"
                    fill="white"
                    transform="translate(10.1201 6.7002)"
                  />
                </clipPath>
                <clipPath id="clip1_687_14478">
                  <rect
                    width="12.0638"
                    height="11.7957"
                    fill="white"
                    transform="translate(10.3887 7.23633)"
                  />
                </clipPath>
                <clipPath id="clip2_687_14478">
                  <rect
                    width="11.7957"
                    height="12.0638"
                    fill="white"
                    transform="translate(10.3887 7.23633)"
                  />
                </clipPath>
              </defs>
            </svg>
          </div>
          <span className="text-gray-700">5</span>
        </div>

        {/* Signal Strength Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FFA800] flex items-center justify-center">
            <svg
              width="13"
              height="12"
              viewBox="0 0 13 12"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M4.17714 5.17578C3.61114 5.17578 3.15332 5.62368 3.15332 6.17668V9.09588C3.15332 9.64848 3.61114 10.0969 4.17714 10.0969H4.32914C4.89414 10.0969 5.35232 9.64878 5.35232 9.09598V6.17668C5.35232 5.62388 4.89414 5.17578 4.32914 5.17578H4.17714Z"
                fill="white"
              />
              <path
                d="M7.53279 10.0962H7.68579C8.25079 10.0962 8.70897 9.64808 8.70897 9.09528V4.50768C8.70897 3.95518 8.25079 3.50684 7.68579 3.50684H7.53279C6.96779 3.50684 6.50897 3.95498 6.50897 4.50768V9.09528C6.50897 9.64788 6.96779 10.0962 7.53279 10.0962Z"
                fill="white"
              />
              <path
                d="M11.0399 10.0967C11.6049 10.0967 12.0631 9.64848 12.0631 9.09578V2.17279C12.0631 1.62022 11.6049 1.17188 11.0399 1.17188H10.8869C10.3219 1.17188 9.86328 1.62001 9.86328 2.17279V9.09568C9.86328 9.64828 10.3219 10.0966 10.8869 10.0966L11.0399 10.0967Z"
                fill="white"
              />
              <path
                d="M1.17451 6.37109H1.02251C0.45651 6.37109 -0.00131226 6.81919 -0.00131226 7.37199V9.09599C-0.00131226 9.64859 0.45651 10.0969 1.02251 10.0969H1.17451C1.73951 10.0969 2.19769 9.64878 2.19769 9.09599V7.37199C2.19769 6.81919 1.73951 6.37109 1.17451 6.37109Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-gray-700">25%</span>
        </div>

        {/* Battery Icon */}
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-lg bg-[#FF0000] flex items-center justify-center">
            <svg
              width="10"
              height="6"
              viewBox="0 0 10 6"
              fill="none"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                d="M9.43401 4.60297V3.85677H9.99101V1.90817H9.43401V1.20037C9.43401 0.739773 9.05901 0.365234 8.59901 0.365234H1.17501C0.715015 0.365234 0.340015 0.739873 0.340015 1.20037V4.60297C0.340015 5.06377 0.715015 5.43817 1.17501 5.43817H8.59901C9.05901 5.43817 9.43401 5.06377 9.43401 4.60297ZM1.17501 4.88147C1.02101 4.88147 0.897015 4.75657 0.897015 4.60297V1.20037C0.897015 1.04677 1.02101 0.921934 1.17501 0.921934H8.59901C8.75201 0.921934 8.87701 1.04677 8.87701 1.20037V4.60297C8.87701 4.75657 8.75201 4.88147 8.59901 4.88147H1.17501ZM1.22601 4.57787V1.22547H2.44801V4.57787H1.22601ZM2.74901 4.57787V1.22547H3.97001V4.57787H2.74901ZM4.27101 4.57787V1.22547H5.49301V4.57787H4.27101Z"
                fill="white"
              />
            </svg>
          </div>
          <span className="text-gray-700">60%</span>
        </div>
      </div>
      <div className="relative w-64 h-64 mx-auto rotate-[-30deg]">
        {/* Rotating circles background */}
        <div className="absolute inset-0 animate-spin duration-3000 opacity-30">
          {/* Upper Circle (Larger than the borders) */}
          <div className="absolute top-[-10%] left-[-10%] w-[120%] h-[120%] bg-blue-100 rounded-full" />

          {/* Middle Circle */}
          <div className="absolute top-6 left-6 right-6 bottom-6 bg-blue-200 rounded-full" />

          {/* Inner Circle */}
          <div className="absolute top-16 left-16 right-16 bottom-16 bg-blue-300 rounded-full" />
        </div>

        {/* Corners */}
        <div className="absolute top-0 left-10 w-16 h-20 border-t-2 border-l-2 border-blue-500 rounded-tl-full" />
        <div className="absolute top-0 right-10 w-16 h-20 border-t-2 border-r-2 border-blue-500 rounded-tr-full" />
        <div className="absolute bottom-0 left-10 w-16 h-20 border-b-2 border-l-2 border-blue-500 rounded-bl-full shadow-xl" />
        <div className="absolute bottom-0 right-10 w-16 h-20 border-b-2 border-r-2 border-blue-500 rounded-br-full shadow-xl" />
        {/* Car shape */}

        <div className=" absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 p-2">
          <img
            src={toAbsoluteUrl('/media/images/car.png')}
            alt="Car top view"
            className="w-full h-auto "
          />
        </div>
      </div>
    </div>
  );
};

export default Car;
