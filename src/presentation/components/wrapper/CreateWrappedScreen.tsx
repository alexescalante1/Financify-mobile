import React from "react";
import { ScreenWrapper } from "@/presentation/components/wrapper/ScreenWrapper";

export const CreateWrappedScreen = <T extends object>(Component: React.ComponentType<T>) => {
  const WrappedComponent = React.memo((props: T) => (
    <ScreenWrapper>
      <Component {...props} />
    </ScreenWrapper>
  ));

  WrappedComponent.displayName = `Wrapped${Component.displayName || Component.name}`;
  return WrappedComponent;
};
