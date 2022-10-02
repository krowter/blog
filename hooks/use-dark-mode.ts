import { useState, useEffect } from 'react';

const localStorageKey = 'teknologi-umum-blog-theme';

type ColorPreference = 'os-default' | 'light' | 'dark';

const useDarkMode = (userPreference: ColorPreference | null) => {
  const [isDarkMode, setIsDarkMode] = useState(false);

  /**
   * listens to changes in user preference (i.e. through darkModeToggler)
   */
  useEffect(() => {
    if (userPreference === null) return;

    const devicePrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    if (userPreference === 'os-default') {
      setIsDarkMode(devicePrefersDark.matches);
    } else {
      setIsDarkMode(userPreference === 'dark');
    }
  }, [userPreference]);

  /**
   * listens to changes in device preference (i.e. prefers-color-scheme:dark)
   */
  useEffect(() => {
    const devicePrefersDark = window.matchMedia('(prefers-color-scheme: dark)');

    const setDevicePreference = (e) => {
      if (userPreference === 'os-default') setIsDarkMode(e.matches);
    };

    devicePrefersDark.addEventListener('change', setDevicePreference);

    return () => {
      devicePrefersDark.removeEventListener('change', setDevicePreference);
    };
  }, [userPreference]);

  /**
   * triggers actual dark mode change in DOM
   */
  useEffect(() => {
    if (isDarkMode) {
      document.documentElement.classList.add('dark');
    } else {
      document.documentElement.classList.remove('dark');
    }
  }, [isDarkMode]);

  /**
   * listens to changes from other hook instances
   */
  useEffect(() => {
    let observer = window.darkModeObserver;

    if (typeof window.darkModeObserver === 'undefined') {
      observer = new MutationObserver(callback);
      window.darkModeObserver = observer;
    }

    function callback(mutationList) {
      mutationList.forEach(function (mutation) {
        if (mutation.type === 'attributes' && mutation.attributeName === 'class') {
          setIsDarkMode(document.documentElement.classList.contains('dark'));
        }
      });
    }

    observer?.observe(document.documentElement, {
      attributes: true,
    });

    return () => observer?.disconnect();
  }, []);

  return isDarkMode;
};

export const usePersistedDarkMode = () => {
  const [colorPreference, setColorPreference] = useState<ColorPreference | null>(null);
  const isDarkMode = useDarkMode(colorPreference);

  useEffect(() => {
    const persistedValue = localStorage.getItem(localStorageKey);

    if (persistedValue === 'light' || persistedValue === 'dark') {
      setColorPreference(persistedValue);
    } else {
      setColorPreference('os-default');
    }
  }, []);

  const setAndPersistPreference = (preference: ColorPreference) => {
    setColorPreference(preference);

    if (preference === 'os-default') {
      localStorage.removeItem(localStorageKey);
    } else {
      localStorage.setItem(localStorageKey, preference);
    }
  };

  return { isDarkMode, colorPreference, setAndPersistPreference };
};
