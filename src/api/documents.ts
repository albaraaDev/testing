import { axios } from './axios';

export const getDocumentType = async (id: string): Promise<string> => {
  const response = await axios.head(`/api/documents/${id}`);
  return response.headers['content-type'];
};

export const downloadDocument = async (id: string, name: string): Promise<void> => {
  const response = await axios.get(`/api/documents/${id}`, {
    responseType: 'blob'
  });
  const url = window.URL.createObjectURL(new Blob([response.data]));
  const link = document.createElement('a');
  link.href = url;
  link.setAttribute('download', `${name}.${response.headers['content-type'].split('/')[1]}`);
  document.body.appendChild(link);
  link.click();
  window.URL.revokeObjectURL(url);
  document.body.removeChild(link);
};

export const getDocumentBase64 = async (id: string): Promise<string> => {
  const response = await axios.get(`/api/documents/${id}`, {
    responseType: 'blob'
  });
  const reader = new FileReader();
  return new Promise((resolve, reject) => {
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = reject;
    reader.readAsDataURL(response.data);
  });
};
