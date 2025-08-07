import React from 'react';
import { CarPlate } from '@/pages/dashboards/blocks/CarPlate';
import Image from '@/components/image/Image';
import { toAbsoluteUrl } from '@/utils';
import { CalendarIcon } from '@/assets/svg';

type ProfileProps = {
  profileImage?: string;
  name: string;
  nationality: string;
  dob: string;
  plate: string;
  email: string;
  phone: string;
  phone2: string;
  country: string;
  city: string;
  address: string;
};

const ProfileCard: React.FC<ProfileProps> = ({
  profileImage,
  name,
  nationality,
  dob,
  plate,
  email,
  phone,
  phone2,
  country,
  city,
  address
}) => {
  return (
    <div className="flex items-start gap-4 p-6">
      {/* Profile Image and Basic Info */}
      <div className="flex-shrink-0 self-center h-full aspect-square">
        <Image
          src={profileImage}
          alt={name}
          title={name}
          className="size-40 rounded-lg object-cover aspect-square"
          fallback={
            <div className="bg-neutral-200 size-40 aspect-square rounded-lg overflow-hidden flex items-center justify-center">
              <img src={toAbsoluteUrl('/media/avatars/avatar-placeholder.png')} />
            </div>
          }
        />
      </div>

      <div className="flex-grow">
        {/* Name and Badges Section */}
        <div className="flex items-center justify-between mb-4">
          <div>
            <h2 className="text-xl font-semibold text-gray-800">{name}</h2>
            <p className="text-gray-500">{nationality}</p>
          </div>
          <div className="flex items-center space-x-2">
            <CarPlate plate={plate} />
          </div>
        </div>

        {/* Contact Info Grid */}
        <div className="flex flex-wrap gap-x-6 gap-y-2 w-3/4 mb-8">
          <div className="flex items-center space-x-2 text-gray-600">
            <CalendarIcon />
            <span>{dob}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/email.svg')} />
            <span>{email}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
            <span>{phone}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
            <span>{phone2}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span>{country}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span>{city}</span>
          </div>
          <div className="flex items-center space-x-2 text-gray-600">
            <img src={toAbsoluteUrl('/media/icons/city.svg')} />
            <span>{address}</span>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ProfileCard;
