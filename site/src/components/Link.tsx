"use client";

import MuiLink from "@mui/material/Link";
import NextLink from "next/link";
import { type ComponentProps, forwardRef } from "react";

export default forwardRef<
  HTMLAnchorElement,
  ComponentProps<typeof MuiLink> & ComponentProps<typeof NextLink>
>(function Link(props, ref) {
  return (
    <MuiLink {...props} component={NextLink} href={props.href} ref={ref} />
  );
});
