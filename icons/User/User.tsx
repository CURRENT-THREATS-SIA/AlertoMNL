/*
We're constantly improving the code you see. 
Please share your feedback here: https://form.asana.com/?k=uvp-HPgd3_hyoXRBw1IcNg&d=1152665201300829
*/

import React from "react";
import type { SvgProps } from "react-native-svg";
import Svg, { Path } from "react-native-svg";

interface UserProps extends SvgProps {
  className?: string; // Not used in React Native, but included for compatibility
}

export const User: React.FC<UserProps> = (props) => {
  return (
    <Svg
      height={50}
      width={51}
      viewBox="0 0 51 50"
      fill="none"
      {...props}
    >
      <Path
        d="M25.4997 25C31.2526 25 35.9163 20.3363 35.9163 14.5833C35.9163 8.83033 31.2526 4.16663 25.4997 4.16663C19.7467 4.16663 15.083 8.83033 15.083 14.5833C15.083 20.3363 19.7467 25 25.4997 25Z"
        fill="white"
      />
      <Path
        d="M25.5 30.2084C15.0625 30.2084 6.5625 37.2084 6.5625 45.8334C6.5625 46.4167 7.02083 46.875 7.60417 46.875H43.3958C43.9792 46.875 44.4375 46.4167 44.4375 45.8334C44.4375 37.2084 35.9375 30.2084 25.5 30.2084Z"
        fill="white"
      />
    </Svg>
  );
};
