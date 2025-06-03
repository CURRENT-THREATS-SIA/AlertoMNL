import React, { memo, useMemo } from 'react';
import { StyleSheet, View } from 'react-native';
import Animated, { useAnimatedStyle, withRepeat, withSequence, withTiming } from 'react-native-reanimated';

interface WaveformVisualizerProps {
  isRecording: boolean;
}

const NUM_BARS = 20;
const BAR_WIDTH = 2;
const BAR_GAP = 2;
const MAX_HEIGHT = 20;
const MIN_HEIGHT = 3;

const Bar = memo(({ isRecording, index }: { isRecording: boolean; index: number }) => {
  const animatedStyle = useAnimatedStyle(() => {
    if (!isRecording) {
      return { height: MIN_HEIGHT };
    }

    return {
      height: withRepeat(
        withSequence(
          withTiming(Math.random() * MAX_HEIGHT + MIN_HEIGHT, { duration: 300 }),
          withTiming(Math.random() * MAX_HEIGHT + MIN_HEIGHT, { duration: 300 })
        ),
        -1,
        true
      ),
    };
  });

  return (
    <Animated.View
      style={[
        styles.bar,
        animatedStyle,
        { 
          backgroundColor: isRecording 
            ? 'rgba(255, 255, 255, 0.8)' 
            : 'rgba(224, 35, 35, 0.3)' 
        }
      ]}
    />
  );
});

Bar.displayName = 'Bar';

const WaveformVisualizer: React.FC<WaveformVisualizerProps> = ({ isRecording }) => {
  const bars = useMemo(() => 
    Array.from({ length: NUM_BARS }, (_, index) => (
      <Bar key={index} isRecording={isRecording} index={index} />
    )),
    [isRecording]
  );

  return <View style={styles.container}>{bars}</View>;
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    height: MAX_HEIGHT + MIN_HEIGHT,
    paddingHorizontal: 16,
  },
  bar: {
    width: BAR_WIDTH,
    marginHorizontal: BAR_GAP,
    borderRadius: BAR_WIDTH / 2,
  },
});

export default WaveformVisualizer; 