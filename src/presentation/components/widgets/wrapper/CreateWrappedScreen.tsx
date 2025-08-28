import React from "react";
import ScreenWrapper from "@/presentation/components/widgets/wrapper/ScreenWrapper";

const CreateWrappedScreen = <T extends object>(Component: React.ComponentType<T>) => {
  const WrappedComponent = (props: T) => (
    <ScreenWrapper>
      <Component {...props} />
    </ScreenWrapper>
  );
  
  WrappedComponent.displayName = `Wrapped${Component.displayName || Component.name}`;
  return WrappedComponent;
};

export default CreateWrappedScreen;