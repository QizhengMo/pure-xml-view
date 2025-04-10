import React, { forwardRef, useEffect, useRef } from "react";
import { PureXml } from "./pure-xml-view";

// Ensure the web component is defined
if (typeof window !== "undefined") {
  // This is to ensure the component is only registered once
  if (!customElements.get("pure-xml-view")) {
    customElements.define("pure-xml-view", PureXml);
  }
}

export interface Props {
  data: string;
}

export const PureXmlView = forwardRef<HTMLElement, Props>(({ data }, ref) => {
  const componentRef = useRef<HTMLElement | null>(null);

  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === "function") {
        ref(componentRef.current);
      } else {
        ref.current = componentRef.current;
      }
    }
  }, [ref]);

  return (
    // @ts-ignore
    <pure-xml-view ref={ref} data={data} />
  );
});

PureXmlView.displayName = "Pure-Xml-View";
