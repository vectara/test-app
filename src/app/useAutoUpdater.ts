import axios from "axios";
import { useEffect, useState } from "react";
import data from "../../package.json";
import { compareVersions } from "compare-versions";

export const useAutoUpdater = (
  onSearchForUpdates: () => void,
  onReceivedNewestVersion: (
    newestVersion: string,
    shouldUpdate: boolean
  ) => void
) => {
  const [currentVersion, setCurrentVersion] = useState<string>(data.version);
  const [isCheckingForUpdates, setIsCheckingForUpdates] =
    useState<boolean>(false);
  const [didReceiveUpdateNotification, setDidReceiveUpdateNotification] =
    useState<boolean>(false);

  useEffect(() => {
    const onFocus = async () => {
      if (didReceiveUpdateNotification || isCheckingForUpdates) return;

      setIsCheckingForUpdates(true);

      onSearchForUpdates();

      const res = await axios.get("api/get-latest-version");

      const updateVersion = res.data.version ?? data.version;

      window.setTimeout(
        () => {
          setDidReceiveUpdateNotification(true);
          onReceivedNewestVersion(
            updateVersion,
            compareVersions(currentVersion, updateVersion) !== 0
          );
          setIsCheckingForUpdates(false);
        },

        3000
      );
    };

    window.addEventListener("focus", onFocus);

    return () => {
      window.removeEventListener("focus", onFocus);
    };
  }, [currentVersion, didReceiveUpdateNotification, isCheckingForUpdates]);

  const forceUpdate = async (version: string) => {
    await axios.get("api/purge-cache");
    setCurrentVersion(version);
    setDidReceiveUpdateNotification(false);
  };

  return {
    forceUpdate,
  };
};
