import { Link } from 'react-router';
import { UserModel, getUserModel } from '@/api/user';
import { useEffect, useMemo, useState } from 'react';
import UserStatusTag from '@/pages/user/components/UserStatusTag';
import { toAbsoluteUrl } from '@/utils';
import { FormattedMessage, useIntl } from 'react-intl';
import FileList, { FileInfo } from '@/components/FileList';

export function ViewUserComponent({
  id,
  hideEditButton = false,
  hideFiles = false
}: {
  id: string | undefined;
  hideEditButton?: boolean;
  hideFiles?: boolean;
}) {
  const intl = useIntl();
  const [user, setUser] = useState<UserModel | null>(null);

  const fetchUserData = async (userId: string) => {
    try {
      const data = await getUserModel(userId);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  const files = useMemo(() => {
    if (!user) return [];

    const files: FileInfo[] = [];

    files.push({
      name: intl.formatMessage({ id: 'USER.ADD.INFORMATION.FRONT_PHOTO' }),
      url: user.frontPhotoNationalId ?? undefined
    });
    files.push({
      name: intl.formatMessage({ id: 'USER.ADD.INFORMATION.BACK_PHOTO' }),
      url: user.nationalIdBackground ?? undefined
    });
    files.push({
      name: intl.formatMessage({ id: 'USER.ADD.COMPANY_INFO.CONTRACT_PDF' }),
      url: user.contractPdf ?? undefined
    });
    files.push({
      name: intl.formatMessage({ id: 'USER.ADD.COMPANY_INFO.TAX_PLATE' }),
      url: user.taxPlate ?? undefined
    });

    return files;
  }, [user, intl]);

  useEffect(() => {
    if (!id) return;
    fetchUserData(id);
  }, [id]);

  return (
    <div className="flex flex-col gap-4">
      <div className="card overflow-hidden">
        <div className="card-body p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user?.name}</h2>
            <p className="text-gray-400">{user?.country}</p>
          </div>
          <div className="flex items-center gap-6">
            {!hideEditButton && (
              <Link
                to={`/management/users/edit/${id}`}
                className="flex justify-center items-center gap-2 font-semibold"
              >
                <img src={toAbsoluteUrl('/media/icons/edit-light.svg')} />
                Edit
              </Link>
            )}
            <UserStatusTag status={!!user?.status} />
          </div>
        </div>
      </div>
      <div className="card col-span-2">
        <div className="card-body grid grid-cols-2">
          <div className="border-e p-3 flex flex-col gap-3">
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.IDENTIFY_NUMBER" />
              </p>
              <p className="text-gray-800 font-semibold">{user?.identifyNumber}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.SUBSCRIPTION_START_DATE" />
              </p>
              <p className="text-gray-800 font-semibold">{user?.subscriptionStartDate}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.PHONE" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
                <span>
                  {user?.phoneCode} {user?.phone}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.COUNTRY" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user?.country}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.AREA" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user?.state}</span>
              </p>
            </div>
          </div>

          <div className="p-3 flex flex-col gap-3">
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.TIMEZONE" />
              </p>
              <p className="text-gray-800 font-semibold">{user?.timezone}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.ROLE" />
              </p>
              <p className="text-gray-800 font-semibold">{user?.role}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.PHONE2" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
                <span>
                  {user?.secondaryPhoneCode} {user?.secondaryPhone}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.CITY" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user?.city}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.ADDRESS" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user?.address}</span>
              </p>
            </div>
          </div>
        </div>

        <div className="px-8 w-full">
          <div className="w-full border-b" />
        </div>

        {!hideFiles && (
          <div className="card-body p-8">
            <div className="flex gap-3 items-center"></div>
            <div className="flex flex-col space-y-4">
              <h2 className="text-xl font-semibold text-dark dark:text-white/70">
                <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
              </h2>
              <FileList files={files} />
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
