import { getUserModel, UserModel } from '@/api/user';
import { Container } from '@/components';
import { toAbsoluteUrl } from '@/utils';
import { useEffect, useMemo, useState } from 'react';
import { useParams } from 'react-router';
import FileList, { FileInfo } from '@/components/FileList';
import { DeviceList } from '@/pages/device/blocks';
import Toolbar from './Toolbar';
import { FormattedMessage, useIntl } from 'react-intl';
import UserStatusTag from '../components/UserStatusTag';
import { useAppRouting } from '@/routing/useAppRouting';

const UserDetailsPage = () => {
  const intl = useIntl();
  const { id } = useParams();
  const navigate = useAppRouting();

  const [user, setUser] = useState<UserModel | null>(null);
  useEffect(() => {
    if (!id) return;
    getUserModel(id)
      .then((data) => {
        setUser(data);
      })
      .catch(() => {
        navigate('/error/404');
      });
  }, [id, navigate]);

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

  if (!id) {
    navigate('/error/404');
    return null;
  }

  if (!user) {
    return null;
  }

  return (
    <Container className="mb-10 flex flex-col gap-6">
      <Toolbar />

      <div className="card shadow-md rounded-lg overflow-hidden">
        <div className="card-body p-6 flex items-center justify-between">
          <div>
            <h2 className="text-2xl font-bold text-gray-800">{user.name}</h2>
            <p className="text-gray-400">{user.country}</p>
          </div>
          <UserStatusTag status={user.status} />
        </div>
      </div>
      <div className="grid md:grid-cols-3 gap-6">
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-body p-8">
            <div className="flex gap-3 items-center"></div>
            <div className="flex flex-col space-y-4 md:space-y-0 md:space-x-4">
              <h2 className="text-xl font-semibold mb-4 text-dark dark:text-white/70">
                <FormattedMessage id="VEHICLE.DETAILS.DOCUMENTS" />
              </h2>
              <FileList files={files} />
            </div>
          </div>
        </div>
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-body p-8 flex flex-col gap-6">
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.IDENTIFY_NUMBER" />
              </p>
              <p className="text-gray-800 font-semibold">{user.identifyNumber}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.SUBSCRIPTION_START_DATE" />
              </p>
              <p className="text-gray-800 font-semibold">{user.subscriptionStartDate}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.PHONE" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
                <span>
                  {user.phoneCode} {user.phone}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.COUNTRY" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user.country}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.AREA" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user.state}</span>
              </p>
            </div>
          </div>
        </div>
        <div className="card shadow-md rounded-lg overflow-hidden">
          <div className="card-body p-8 flex flex-col gap-6">
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.TIMEZONE" />
              </p>
              <p className="text-gray-800 font-semibold">{user.timezone}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.INFORMATION.ROLE" />
              </p>
              <p className="text-gray-800 font-semibold">{user.role}</p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.PHONE2" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/phone.svg')} />
                <span>
                  {user.secondaryPhoneCode} {user.secondaryPhone}
                </span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.CITY" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user.city}</span>
              </p>
            </div>
            <div>
              <p className="text-gray-400 dark:text-white/70 mb-1">
                <FormattedMessage id="USER.ADD.CONTACT.ADDRESS" />
              </p>
              <p className="text-gray-800 font-semibold flex gap-2 items-center">
                <img src={toAbsoluteUrl('/media/icons/city.svg')} />
                <span>{user.address}</span>
              </p>
            </div>
          </div>
        </div>
      </div>

      <DeviceList userId={id} />
    </Container>
  );
};

export default UserDetailsPage;
