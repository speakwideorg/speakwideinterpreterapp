import { useState, useEffect } from 'react';
import { AppState, AppStateStatus } from 'react-native';

const useIsAppForeground = (): boolean => {
  const [isForeground, setIsForeground] = useState(
    AppState.currentState === 'active',
  );

  useEffect(() => {
    const handleChange = (nextAppState: AppStateStatus) => {
      setIsForeground(nextAppState === 'active');
    };

    const subscription = AppState.addEventListener('change', handleChange);

    return () => subscription.remove();
  }, []);

  return isForeground;
};
export default useIsAppForeground;
