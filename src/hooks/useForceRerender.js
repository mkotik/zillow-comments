import { useState, useCallback } from "react";

export const useForceRerender = () => {
  const [, setValue] = useState(0);

  const forceRerender = useCallback(() => {
    setValue((value) => value + 1);
  }, []);

  return forceRerender;
};
