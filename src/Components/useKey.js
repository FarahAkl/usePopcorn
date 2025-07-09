import { useEffect} from "react";

export function useKey(key, action) {
  const callback = (e) => {
    if (e.code.toLowerCase() === key.toLowerCase()) {
      action();
    }
  };

  useEffect(() => {
    document.addEventListener("keydown", callback);

    return () => {
      document.removeEventListener("keydown", callback);
    };
  }, [action, key]);
}
