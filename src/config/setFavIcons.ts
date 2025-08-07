export const setFavicons = (logoname: string) => {
  const head = document.head;

  // Define the icons to inject
  const icons = [
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '32x32',
      href: `/media/app/logos/${logoname}/favicon-32x32.png`
    },
    {
      rel: 'icon',
      type: 'image/png',
      sizes: '16x16',
      href: `/media/app/logos/${logoname}/favicon-16x16.png`
    },
    {
      rel: 'icon',
      href: `/media/app/logos/${logoname}/favicon.ico`
    },
    {
      rel: 'apple-touch-icon',
      href: `/media/app/logos/${logoname}/apple-touch-icon.png`
    }
  ];

  // 🧹 Optional: remove existing favicon-related <link> elements
  Array.from(head.querySelectorAll('link[rel*="icon"]')).forEach((link) => link.remove());

  // 🧩 Inject the new icons
  icons.forEach((icon) => {
    const link = document.createElement('link');
    Object.entries(icon).forEach(([key, value]) => link.setAttribute(key, value));
    head.appendChild(link);
  });
};
