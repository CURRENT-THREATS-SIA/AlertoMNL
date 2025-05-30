/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

interface LineArrowRight1Props extends SvgProps {
  className?: string; // Not used in React Native, but included for compatibility
}

export const LineArrowRight1: React.FC<LineArrowRight1Props> = (props) => {
  return (
    <Svg
      height={24}
      width={34}
      viewBox="0 0 34 24"
      fill="none"
      {...props}
    >
      <Path
        d="M20.3413 5.93005L28.6876 12.0001L20.3413 18.0701"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
      <Path
        d="M5.3125 12H28.4537"
        stroke="white"
        strokeLinecap="round"
        strokeLinejoin="round"
        strokeMiterlimit={10}
        strokeWidth={1.5}
      />
    </Svg>
  );
};
