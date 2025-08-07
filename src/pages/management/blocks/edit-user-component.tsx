import { createUser, FormUserModel, getUserModel, updateUser } from '@/api/user';
import { Contact, Information, InformationAccount } from '@/pages/user/add-user';
import { CompanyInformation } from '@/pages/user/add-user/blocks/CompanyInformation';
import React, { useEffect, useState } from 'react';
import { createPortal } from 'react-dom';
import { enqueueSnackbar } from 'notistack';
import axios, { AxiosError } from 'axios';
import { FormattedMessage } from 'react-intl';
import { ResponseModel } from '@/api/response';
import { CircularProgress } from '@mui/material';
import logger from '@/utils/Logger';
import { ParentUser } from '@/pages/user/add-user/blocks/ParentUser';

const SaveButtonPortal = ({ formId, isLoading }: { formId: string; isLoading: boolean }) => {
  const [container, setContainer] = useState<HTMLElement | null>(null);

  useEffect(() => {
    const buttonContainer = document.getElementById('form-action-button-container');
    if (buttonContainer) {
      setContainer(buttonContainer);
    }
  }, []);

  const btn = (
    <button
      type="submit"
      form={formId}
      disabled={isLoading}
      className="btn btn-success flex items-center justify-center w-44"
    >
      {isLoading ? (
        <>
          <CircularProgress size={20} color="inherit" className="mr-2" />
          <FormattedMessage id="COMMON.SAVING" defaultMessage="Saving..." />
        </>
      ) : (
        <>
          <FormattedMessage id="COMMON.SAVE" defaultMessage="Save" />
        </>
      )}
    </button>
  );

  return (
    <>
      <div className="m-4 flex justify-center">{btn}</div>
      {/* this portal is used in manage user add/edit pages, where we wanna insert the save button on the top in the header */}
      {container && createPortal(btn, container)}
    </>
  );
};

export function EditUserComponent({
  id,
  roleEditable,
  defaultModel,
  submitCallback
}: {
  id: string | undefined;
  roleEditable: boolean;
  defaultModel?: FormUserModel | null;
  submitCallback?: (user: FormUserModel) => void;
}) {
  const [user, setUser] = useState<FormUserModel | null>(defaultModel || null);
  const [isLoading, setIsLoading] = useState(false);
  const formId = 'edit-user-form';

  const fetchUserData = async (userId: string) => {
    try {
      const data = await getUserModel(userId);
      setUser(data);
    } catch (error) {
      console.error('Error fetching user data:', error);
    }
  };

  useEffect(() => {
    if (!id) return;
    fetchUserData(id);
  }, [id]);

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    const data = new FormData(e.target as HTMLFormElement);
    logger.debug('Submitting user form with data:', Object.fromEntries(data.entries()));

    setIsLoading(true);
    try {
      const response = id ? await updateUser(id, data) : await createUser(data);
      enqueueSnackbar(response.message, {
        variant: 'success'
      });
      const result = response.result;
      if (!result) {
        return;
      }
      if (submitCallback) {
        submitCallback(result);
        return;
      }
    } catch (error) {
      console.error('Error saving user:', error);
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<ResponseModel<never>>;
        enqueueSnackbar(
          axiosError.response?.data.message || <FormattedMessage id="COMMON.ERROR" />,
          {
            variant: 'error'
          }
        );
      } else {
        enqueueSnackbar(<FormattedMessage id="COMMON.ERROR" />, {
          variant: 'error'
        });
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id={formId} onSubmit={submit}>
      <div className="card col-span-2">
        <Information user={user || undefined} roleEditable={roleEditable} />
        <InformationAccount user={user || undefined} />
        <Contact user={user || undefined} />
        <CompanyInformation user={user || undefined} />
        <ParentUser user={user || undefined} />

        <SaveButtonPortal formId={formId} isLoading={isLoading} />
      </div>
    </form>
  );
}
