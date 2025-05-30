/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

interface LineArrowLeftProps extends SvgProps {
  className?: string; // Not used in React Native, but included for compatibility
}

export const LineArrowLeft: React.FC<LineArrowLeftProps> = (props) => {
  return (
    <Svg
      height={24}
      width={25}
      viewBox="0 0 25 24"
      fill="none"
      {...props}
    >
      <Path
        d="M10.07 5.93005L4 12.0001L10.07 18.0701"
        stroke="#171717"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <Path
        d="M20.9999 12H4.16992"
        stroke="#171717"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </Svg>
  );
};
