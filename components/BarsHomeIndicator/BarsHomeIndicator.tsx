import React from "react";
import { StyleSheet, View } from "react-native";

export const BarsHomeIndicator = ({ style, rectangleStyle }: any) => {
  return (
    <View style={[styles.indicator, style]}>
      <View style={[styles.rectangle, rectangleStyle]} />
    </View>
  );
};

export default BarsHomeIndicator;


const styles = StyleSheet.create({
  indicator: {
    // .bars-home-indicator { height:34px; width:375px; }
    height: 34,
    width: 375,
    backgroundColor: "transparent",  // or whatever background your parent has
  },
  rectangle: {
    // .bars-home-indicator .rectangle { … }
    backgroundColor: "#ffffff",
    borderRadius: 100,
    height: 7,
    width: 136,
    position: "relative",
    left: 120,
    top: 19,
  },
});


