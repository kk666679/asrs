module.exports = {
  i18n: {
    defaultLocale: 'en',
    locales: ['en', 'es', 'fr', 'de'],
    localeDetection: true,
  },
  backend: {
    loadPath: '/locales/{{lng}}/{{ns}}.json',
  },
  reloadOnPrerender: process.env.NODE_ENV === 'development',
};
