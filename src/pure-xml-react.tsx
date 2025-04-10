import React, { useRef, useEffect, forwardRef, ButtonHTMLAttributes } from 'react';
import { PureXml } from "./pure-xml-view";

// Ensure the web component is defined
if (typeof window !== 'undefined') {
  // This is to ensure the component is only registered once
  if (!customElements.get('pure-xml-view')) {
    customElements.define('pure-xml-view', PureXml);
  }
}

export interface ButtonProps extends Omit<ButtonHTMLAttributes<HTMLButtonElement>, 'onClick'> {
  variant?: 'primary' | 'secondary';
  onClick?: (event: CustomEvent) => void;
}

export const PureXmlView = forwardRef<HTMLElement, ButtonProps>(({
                                                              children,
                                                              variant = 'primary',
                                                              disabled,
                                                              onClick,
                                                              ...props
                                                            }, ref) => {
  const componentRef = useRef<HTMLElement | null>(null);

  // Combine refs
  useEffect(() => {
    if (ref) {
      if (typeof ref === 'function') {
        ref(componentRef.current);
      } else {
        ref.current = componentRef.current;
      }
    }
  }, [ref]);


  return (
    // @ts-ignore
    <pure-xml-view ref={ref}>
      {children}
    {/*// @ts-ignore*/}
    </pure-xml-view>
  );
});

PureXmlView.displayName = 'Pure-Xml-View';
