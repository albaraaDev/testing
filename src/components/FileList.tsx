import { downloadDocument, getDocumentType } from '@/api/documents';
import { toAbsoluteUrl } from '@/utils';
import { Check, X } from 'lucide-react';
import React, { useEffect } from 'react';
import { useIntl } from 'react-intl';

export interface FileInfo {
  name: string;
  url?: string;
}

interface FileCardProps {
  file: FileInfo;
  onView?: () => void;
}

interface FileListProps {
  files: FileInfo[];
  columns?: number;
}

const FileCard: React.FC<FileCardProps> = ({ file }) => {
  const [type, setType] = React.useState('FILE');
  const intl = useIntl();

  useEffect(() => {
    if (file.url) {
      getDocumentType(file.url).then((type) => {
        setType(type.split('/')[0].toUpperCase());
      });
    }
  }, [file.url]);

  const getIconSrc = (type: string) =>
    toAbsoluteUrl(`/media/icons/${type !== 'FILE' ? type.toLowerCase() + '-' : ''}file-icon.svg`); // Placeholder for demo

  return (
    <div className="card hover:shadow-md p-4 w-full">
      <div className="flex items-center sm:flex-row flex-col">
        <img src={getIconSrc(type)} alt={`${type} Icon`} className="size-6 me-2" />
        <div>
          <p className="text-sm font-semibold">{file.name}</p>
        </div>

        {/* Aligning elements to the end */}
        <div className="ms-auto flex items-center gap-2">
          <button
            disabled={!file.url}
            className="btn text-blue-500 px-3 py-1 rounded border border-blue-500 hover:bg-blue-500 hover:text-white transition-colors"
            onClick={() => file.url && downloadDocument(file.url, file.name)}
          >
            {file.url
              ? intl.formatMessage({ id: 'FILE_LIST.VIEW' })
              : intl.formatMessage({ id: 'FILE_LIST.NO_FILE' })}
          </button>
          {file.url ? (
            <div className="flex items-center justify-center w-5 h-5 bg-green-500 rounded-full">
              <Check className="w-4 h-4 text-white" />
            </div>
          ) : (
            <div className="flex items-center justify-center w-5 h-5 bg-red-500 rounded-full">
              <X className="w-4 h-4 text-white" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

const FileList: React.FC<FileListProps> = ({ files, columns = 1 }) => {
  return (
    <div className="flex space-x-4">
      <div
        className="w-full grid gap-4"
        style={{
          gridTemplateColumns: `repeat(${columns}, 1fr)`
        }}
      >
        {files.map((file, index) => (
          <FileCard key={`${file.name}-${index}`} file={file} />
        ))}
      </div>
    </div>
  );
};

export default FileList;
