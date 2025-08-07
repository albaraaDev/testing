// eslint-disable-next-line no-unused-vars
export const throttle = (func: (...args: any[]) => void, limit: number) => {
  let lastFunc: any;
  let lastRan: number;
  return function (this: any, ...args: any[]) {
    if (!lastRan) {
      func.apply(this, args);
      lastRan = Date.now();
    } else {
      clearTimeout(lastFunc);
      lastFunc = setTimeout(
        () => {
          if (Date.now() - lastRan >= limit) {
            func.apply(this, args);
            lastRan = Date.now();
          }
        },
        limit - (Date.now() - lastRan)
      );
    }
  };
};

export const objectToFormData = (data: Record<string, any>) => {
  const formData = new FormData();
  Object.entries(data).forEach(([key, value]) => {
    if (Array.isArray(value)) {
      value.forEach((v) => formData.append(key, v));
    } else {
      formData.append(key, value);
    }
  });
  return formData;
};

export const arrayToFormData = (data: Record<string, any>[], mainKey: string) => {
  const formData = new FormData();
  data.forEach((item, idx) => {
    Object.entries(item).forEach(([key, value]) => {
      if (Array.isArray(value)) {
        value.forEach((v) => formData.append(`${mainKey}.${key}[${idx}]`, v));
      } else {
        formData.append(`${mainKey}.${key}[${idx}]`, value);
      }
    });
  });
  return formData;
};
export const downloadFile = async (response: Blob) => {
  const blob = new Blob([response], {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet'
  });

  const url = window.URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  document.body.appendChild(a);
  a.click();

  setTimeout(() => {
    document.body.removeChild(a);
    window.URL.revokeObjectURL(url);
  }, 100);
};
