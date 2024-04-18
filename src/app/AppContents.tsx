"use client";
import React, { useRef, useState } from "react";
import {
  Box,
  Code,
  Flex,
  Heading,
  List,
  ListItem,
  Text,
  UnorderedList,
} from "@chakra-ui/react";
import { useAutoUpdater } from "./useAutoUpdater";
import { useToast } from "@chakra-ui/react";
import data from "../../package.json";

export const AppContents = () => {
  const toast = useToast();
  const updateToast = useRef<any>(null);

  const { forceUpdate } = useAutoUpdater(
    () =>
      toast({
        render: () => <SearchingForUpdatesNotification />,
        duration: 3500,
      }),
    (version: string, shouldUpdate: boolean) => {
      setNewestVersion(version);

      if (shouldUpdate) {
        updateToast.current = toast({
          render: () => (
            <UpdateNotification
              version={version}
              onReload={() => {
                toast.close(updateToast.current);
                onReload();
                forceUpdate(version);
                setCurrentVersion(version);
              }}
            />
          ),
          duration: 10000,
        });
      } else {
        toast({
          render: () => <NoUpdateNotification />,
          duration: 5000,
        });
      }
    }
  );

  const [currentVersion, setCurrentVersion] = useState<string>(data.version);
  const [newestVersion, setNewestVersion] = useState<string | undefined>();

  const onReload = () => {
    toast({
      render: () => <SimulateReloadNotification />,
      duration: 12000,
    });
  };

  return (
    <Flex
      style={appWrapperStyles}
      align="center"
      justify="center"
      direction="column"
    >
      <Flex style={panelStyles} direction={"column"}>
        <Flex align="center" gap={2}>
          <Heading color="gray.600" size="lg" fontWeight={700}>
            Local App Version:
          </Heading>
          <Heading color="green.500" size="lg" fontWeight={700}>
            {currentVersion}
          </Heading>
        </Flex>
        <Flex align="center" gap={2}>
          <Heading color="gray.600" size="lg" fontWeight={700}>
            Most Recent Version on Netlify:{" "}
          </Heading>
          <Heading color="blue.500">{newestVersion ?? "x.y.z"}</Heading>
        </Flex>
        <Instructions />
      </Flex>
      <a href="https://console.vectara.dev/login">Login to Vectara</a>
    </Flex>
  );
};

const Instructions = () => (
  <Box style={instructionsWrapperStyles}>
    <Heading size="md">How It Works</Heading>
    <Flex direction="column" gap={3} style={instructionsStyles}>
      <Flex gap={2} direction="column">
        <Heading style={instructionsHeaderStyles}>
          How To Trigger A Version Check
        </Heading>
        <Text>
          <strong>
            Click out of this browser and back again, or go to a different and
            back to this one
          </strong>
          . This makes a request to the Netlify site metadata API to verify the
          last deployed version.
        </Text>
      </Flex>
      <Flex gap={1} direction="column">
        <Heading style={instructionsHeaderStyles}>
          If Versions Don&apos;t Match
        </Heading>
        <Text>
          You will be shown a notification to reload the page.{" "}
          <strong>
            If you ignore this, we will stop version checks. In this case,
            you&apos;ll need to refresh the page to try again.
          </strong>
        </Text>
        <Text>
          Prior to reloading, we trigger a request to Netlify&apos;s cache purge
          API to ensure a fresh copy, as the user may have run into an old
          version.{" "}
        </Text>
        <Text>
          We do this because while Netlify states{" "}
          <a
            style={linkStyles}
            href="https://answers.netlify.com/t/does-netlify-clear-cache-every-deploy/31884"
            target="_blank"
          >
            they invalidate the cache on deploy
          </a>
          , we&apos;ve seen users needing a hard refresh.{" "}
        </Text>
      </Flex>
      <Flex gap={1} direction="column">
        <Heading style={instructionsHeaderStyles}>What We Need To Do</Heading>
        <Text>
          On every deploy, we&apos;ll need to{" "}
          <a
            style={linkStyles}
            href="https://docs.netlify.com/api/get-started/#site-metadata"
          >
            update Netlify with the latest version
          </a>
          . This means we&apos;ll need to make use of package.json versioning or
          some other way of tracking versions.
        </Text>
        <Text>We&apos;ll also need to create a minimal proxy APIs to:</Text>
        <UnorderedList pl="1rem">
          <ListItem>
            to read the latest version without exposing an API key (
            <a style={linkStyles} href="api/get-latest-version" target="_blank">
              working example
            </a>
            ).
          </ListItem>
          <ListItem>
            purge the Netlify cache (
            <a style={linkStyles} href="api/purge-cache" target="_blank">
              working example
            </a>
            )
          </ListItem>
        </UnorderedList>
      </Flex>
      <Flex gap={1} direction="column">
        <Heading style={instructionsHeaderStyles}>
          A note about rollbacks
        </Heading>
        <Text>
          After using Netlify&apos;s web UI to rollback to a previous version,
          we can hit their metadata API with a one-off request using curl
          command like:
        </Text>

        <Code fontSize=".7rem" mt={2} mb={2} p={2} textAlign={"left"}>
          {
            'curl -X PUT -H "Content-Type: application/json" -H "Authorization: Bearer <access-token>" -d \'{"version":"0.1.2"}\' https://api.netlify.com/api/v1/sites/<site-id>/metadata'
          }
        </Code>

        <Text>
          The next time a version check happens, this will result in a
          notification to reload the page.
        </Text>
      </Flex>
    </Flex>
  </Box>
);

const UpdateNotification = ({
  version,
  onReload,
}: {
  version: string;
  onReload: () => void;
}) => {
  return (
    <Box bg="green.500" style={updateNotificationStyles}>
      <Text fontSize=".75rem" fontWeight={700}>
        Auto-Updater
      </Text>
      <Text>{`We found an update: v${version}`}</Text>
      <Box onClick={onReload}>
        <Text style={reloaderLinkStyles}>Click here to reload the page.</Text>
      </Box>
    </Box>
  );
};

const SearchingForUpdatesNotification = () => {
  return (
    <Box bg="blue.500" style={updateNotificationStyles}>
      <Text fontSize=".75rem" fontWeight={700}>
        Auto-Updater
      </Text>
      <Text fontWeight={700}>Looking for updates from Netlify.</Text>
    </Box>
  );
};

const NoUpdateNotification = () => {
  return (
    <Box bg="green.500" style={updateNotificationStyles}>
      <Text fontSize=".75rem" fontWeight={700}>
        Auto-Updater
      </Text>
      <Text>You&apos;re up-to-date!</Text>
    </Box>
  );
};

const SimulateReloadNotification = () => {
  return (
    <Box bg="yellow.600" style={updateNotificationStyles}>
      <Text fontSize=".9rem">At this point, we&apos;d reload the page.</Text>
      <Text fontSize=".9rem">
        Just for this POC though, we&apos;ll simulate reloading by forcing a
        version match.
      </Text>
      <Text fontSize=".9rem">
        <strong>
          Now, try focusing out of this page and back again to see what happens
          when versions match.
        </strong>
      </Text>
    </Box>
  );
};

const updateNotificationStyles = {
  borderRadius: ".5rem",
  color: "white",
  padding: "1rem 1.5rem",
};

const reloaderLinkStyles = {
  fontSize: ".9rem",
  fontWeight: 700,
  cursor: "pointer",
  textDecoration: "underline",
};

const panelStyles = {
  alignItems: "center",
};

const appWrapperStyles = {
  height: "100%",
  padding: "2rem",
};

const instructionsWrapperStyles = {
  padding: "1.5rem",
  border: "1px solid #ddd",
  borderRadius: ".5rem",
  marginTop: "1rem",
  textAlign: "justify",
} as React.CSSProperties;

const instructionsHeaderStyles = {
  fontSize: "1rem",
  textDecoration: "underline",
};

const instructionsStyles = {
  borderRadius: ".5rem",
  fontSize: "0.85rem",
  marginTop: "1rem",
  maxWidth: "800px",
};

const linkStyles = {
  color: "blue",
  textDecoration: "underline",
};
