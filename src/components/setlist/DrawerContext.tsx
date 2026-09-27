"use client";
import { TEndpointChannel } from "@/libraries/endpoint/type";
import { Setlist } from "@/libraries/oracledb/setlist/service";
import { ReactNode, createContext, use, useMemo, useState } from "react";

type SetlistDrawerActionContext = {
  onOpenChange: (value: boolean) => void;
  open: (
    setlist: Setlist,
    thumbnailUrl: string,
    channel?: TEndpointChannel,
  ) => void;
};

type SetlistDrawerContext = {
  open: boolean;
  setlist?: Setlist;
  thumbnailUrl?: string;
  channel?: TEndpointChannel;
};

// @ts-expect-error empty context
export const DrawerActionContext = createContext<SetlistDrawerActionContext>();
export const DrawerContext = createContext<SetlistDrawerContext>({
  open: false,
  setlist: undefined,
  thumbnailUrl: undefined,
  channel: undefined,
});

export function DrawerProvider({ children }: { children: ReactNode }) {
  const [drawerContext, setDrawerContext] = useState<SetlistDrawerContext>({
    open: false,
    setlist: undefined,
    thumbnailUrl: undefined,
    channel: undefined,
  });

  const actions = useMemo<SetlistDrawerActionContext>(
    () => ({
      onOpenChange: (value: boolean) => {
        setDrawerContext({
          ...drawerContext,
          open: value,
        });
      },
      open: (
        setlist: Setlist,
        thumbnailUrl: string,
        channel?: TEndpointChannel,
      ) => {
        setDrawerContext({
          open: true,
          setlist,
          thumbnailUrl,
          channel,
        });
      },
    }),
    [],
  );

  return (
    <DrawerActionContext value={actions}>
      <DrawerContext value={drawerContext}>{children}</DrawerContext>
    </DrawerActionContext>
  );
}

export function useDrawerActions() {
  return use(DrawerActionContext);
}

export function useDrawer() {
  return use(DrawerContext);
}
