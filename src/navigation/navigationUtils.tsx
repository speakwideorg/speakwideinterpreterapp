import React from 'react';

export function renderScreens<T extends Record<string, any>>(
  screens: Partial<Record<keyof T, React.ComponentType<any>>>,
  Navigator: any
) {
  return Object.entries(screens).map(([name, Component]) => (
    <Navigator.Screen key={name} name={name} component={Component!} />
  ));
}
