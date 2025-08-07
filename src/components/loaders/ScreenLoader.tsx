import { toAbsoluteUrl } from '@/utils';
import { FormattedMessage } from 'react-intl';
import { ContentLoader } from './ContentLoader';
import { getMiniLogo } from '@/utils/getLogo';

const ScreenLoader = (props: { type?: 'text' | 'content'; mode?: 'transparent' | 'solid' }) => {
  const { type = 'text', mode = 'solid' } = props;
  return (
    <div
      className={`fixed inset-0 z-50 h-full ${mode === 'transparent' ? 'bg-white bg-opacity-80' : 'bg-white'}`}
    >
      {type === 'content' ? (
        <div className="h-full w-full flex flex-row items-center justify-center">
          <ContentLoader />
        </div>
      ) : (
        <TextLoader />
      )}
    </div>
  );
};

const TextLoader = () => {
  return (
    <div className="flex flex-col items-center gap-2 justify-center transition-opacity duration-700 ease-in-out h-full">
      <img className="h-[30px] max-w-none" src={getMiniLogo()} alt="logo" />
      <div className="text-gray-500 font-medium text-sm">
        <FormattedMessage id="COMMON.LOADING" />
      </div>
    </div>
  );
};

export { ScreenLoader };
