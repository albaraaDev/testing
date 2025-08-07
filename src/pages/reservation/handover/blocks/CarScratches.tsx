import { createScratch, getScratches, ScratchDTO, updateScratch } from '@/api/cars';
import { ResponseModel } from '@/api/response';
import { DownloadableImage } from '@/components/DownloadableImage';
import CarDiagram from '@/pages/vehicle/add-vehicle/blocks/CarDiagram';
import Dropzone from '@/pages/vehicle/add-vehicle/components/Dropzone';
import { EditIcon } from '@/pages/vehicle/blocks/svg';
import { CircularProgress } from '@mui/material';
import axios, { AxiosError } from 'axios';
import { useSnackbar } from 'notistack';
import React, { useEffect, useState } from 'react';
import { FormattedMessage, useIntl } from 'react-intl';

interface CarScratchesProps {
  vehicleId: string;
}

const ScratchesBox = ({
  idx,
  vehicleId,
  existingScratch,
  onRefresh
}: {
  idx: number;
  vehicleId: string;
  existingScratch?: ScratchDTO;
  onRefresh: () => void;
}) => {
  const { enqueueSnackbar } = useSnackbar();
  const intl = useIntl();
  const [currentFile, setCurrentFile] = useState<File | null>(null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (file: File | null) => {
    if (!file) return;

    setIsUploading(true);
    try {
      const formData = new FormData();
      formData.append('scratches[0].place', idx.toString());
      formData.append('scratches[0].vehicleId', vehicleId);
      formData.append('scratches[0].imageFile', file);
      formData.append('scratches[0].explanationOf', '');

      let response;
      if (existingScratch?.id) {
        formData.append('scratches[0].id', existingScratch.id);
        response = await updateScratch(formData);
      } else {
        response = await createScratch(formData);
      }

      enqueueSnackbar(response.message, { variant: 'success' });
      setCurrentFile(file);
      onRefresh();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message || intl.formatMessage({ id: 'COMMON.ERROR' }),
          { variant: 'error' }
        );
      } else {
        enqueueSnackbar(intl.formatMessage({ id: 'COMMON.ERROR' }), { variant: 'error' });
      }
    } finally {
      setIsUploading(false);
    }
  };

  const displayFile = currentFile || (existingScratch?.image ? new File([], '__existing__') : null);

  return (
    <div className="relative rounded-xl overflow-hidden bg-gray-100 h-[270px] grid place-content-center">
      <div className="absolute top-2.5 ltr:left-2.5 rtl:right-2.5 z-50">
        <div className="size-8 bg-[#5E627815] rounded-full grid place-items-center">
          <span className="text-gray-600 font-semibold text-lg">{idx}</span>
        </div>
      </div>

      {isUploading ? (
        <div className="absolute top-0 left-0 size-full z-40 bg-black flex flex-col items-center justify-center gap-2">
          <CircularProgress size={40} />
          <span className="text-sm text-white">
            <FormattedMessage id="COMMON.UPLOADING" />
          </span>
        </div>
      ) : (
        <div className="p-3">
          <Dropzone onDrop={handleFileChange}>
            <label className="relative border border-gray-600 rounded-lg flex flex-col items-center justify-center text-center p-2 gap-4 cursor-pointer h-[250px]">
              {displayFile && (
                <button className="absolute top-0 ltr:right-0 rtl:left-0 z-50">
                  <div className="size-8 bg-[#5E627810] rounded-full grid place-items-center">
                    <EditIcon className="size-4" />
                  </div>
                </button>
              )}
              <span className="text-gray-500">
                <FormattedMessage id="FILE_UPLOAD.DRAG_DROP" />
              </span>
              <span className="bg-indigo-600 text-white px-4 py-2 rounded-lg text-sm hover:bg-indigo-700 transition-colors">
                <FormattedMessage id="FILE_UPLOAD.CHOOSE_FILES" />
              </span>
            </label>
          </Dropzone>
        </div>
      )}

      <UploadedFilePreview file={currentFile} imageUrl={existingScratch?.image || ''} />
    </div>
  );
};

const CarScratches: React.FC<CarScratchesProps> = ({ vehicleId }) => {
  const [scratches, setScratches] = useState<ScratchDTO[]>();
  const [isInitialLoading, setIsInitialLoading] = useState(true);
  const [isRefreshing, setIsRefreshing] = useState(false);

  const handleRefresh = async () => {
    if (scratches?.length) {
      setIsRefreshing(true);
    } else {
      setIsInitialLoading(true);
    }

    try {
      const res = await getScratches(vehicleId, { start: 0, end: 10000 });
      setScratches(res);
    } catch (error) {
      console.error('Error fetching scratches:', error);
      setScratches([]);
    } finally {
      setIsInitialLoading(false);
      setIsRefreshing(false);
    }
  };

  useEffect(() => {
    handleRefresh();
  }, [vehicleId]);

  if (isInitialLoading && !scratches) {
    return <CircularProgress />;
  }

  const scratchesByPlace = (scratches || []).reduce(
    (acc, scratch) => {
      acc[scratch.place] = scratch;
      return acc;
    },
    {} as Record<number, ScratchDTO>
  );

  return (
    <div className="card pb-2.5">
      <div className="card-header">
        <h3 className="card-title">
          <FormattedMessage id="VEHICLE.SCRATCHES.TITLE" />
        </h3>
        {isRefreshing && (
          <div className="flex items-center gap-2 text-blue-600">
            <CircularProgress size={16} />
            <span className="text-sm">
              <FormattedMessage id="COMMON.UPDATING" />
            </span>
          </div>
        )}
      </div>
      <div
        className={`card-body grid gap-5 grid-cols-1 md:grid-cols-[1fr,300px] transition-opacity`}
      >
        {/* Left Column - Scratches */}
        <div className="grid grid-cols-3 gap-4">
          {Array.from({ length: 12 }, (_, i) => i + 1).map((num) => (
            <ScratchesBox
              key={num}
              idx={num}
              vehicleId={vehicleId}
              existingScratch={scratchesByPlace[num]}
              onRefresh={handleRefresh}
            />
          ))}
        </div>

        {/* Right Column - Image Space */}
        <CarDiagram />
      </div>
    </div>
  );
};

type UploadedFilePreviewProps = {
  file?: File | null;
  imageUrl?: string;
};

function UploadedFilePreview({ file, imageUrl }: UploadedFilePreviewProps) {
  if (!file && !imageUrl) return null;

  return (
    <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 size-full bg-gray-200 rounded-lg shadow-lg flex justify-center items-center group">
      {file && file.name !== '__existing__' ? (
        <img
          src={URL.createObjectURL(file)}
          alt={file.name}
          className="object-cover size-full group-hover:object-contain"
        />
      ) : imageUrl ? (
        <DownloadableImage
          src={imageUrl}
          alt="scratch"
          className="object-cover size-full group-hover:object-contain"
        />
      ) : null}
    </div>
  );
}

export { CarScratches };
