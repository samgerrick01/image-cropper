import {useNavigation} from '@react-navigation/native';
import React, {useEffect, useState} from 'react';
import {
  View,
  Text,
  StyleSheet,
  Pressable,
  Dimensions,
  StyleProp,
  ViewStyle,
} from 'react-native';
import {
  Camera,
  useCameraDevice,
  useCameraFormat,
  useFrameProcessor,
} from 'react-native-vision-camera';
import {useSharedValue, Worklets} from 'react-native-worklets-core';
import {crop} from 'vision-camera-cropper';

const CameraScreen = props => {
  const navigation = useNavigation();

  const [cropRegion, setCropRegion] = useState({
    left: 15,
    top: 37,
    width: 70,
    height: 25,
  });

  const [isActive, setIsActive] = useState(true);
  const [hasPermission, setHasPermission] = useState(false);

  const device = useCameraDevice('back');
  const format = useCameraFormat(device, [
    {videoResolution: {width: 1920, height: 1080}},
    {fps: 60},
  ]);
  const [pressed, setPressed] = useState(false);
  const shouldTake = useSharedValue(false);

  useEffect(() => {
    (async () => {
      const status = await Camera.requestCameraPermission();
      if (status === 'granted') {
        setHasPermission(status === 'granted');
      } else {
        navigation.goBack();
      }
    })();
  }, []);

  const capture = () => {
    setIsActive(false);
    shouldTake.value = true;
  };

  const onCaptured = async (value?: string) => {
    if (value) {
      setIsActive(true);
      props.route.params.setImage(value);
      navigation.goBack();
    }
  };

  const onCapturedJS = Worklets.createRunOnJS(onCaptured);
  const frameProcessor = useFrameProcessor(
    frame => {
      'worklet';
      if (shouldTake.value) {
        shouldTake.value = false;
        const result = crop(frame, {
          cropRegion: cropRegion,
          includeImageBase64: true,
          saveAsFile: false,
        });
        onCapturedJS(result.base64);
      }
    },
    [cropRegion],
  );

  const captureAreaCustomContainer: StyleProp<ViewStyle> = {
    width: ((cropRegion.width + 10) / 100) * Dimensions.get('window').width,
    height: (cropRegion.height / 100) * Dimensions.get('window').height,
  };

  return (
    <View style={{flex: 1}}>
      {device && hasPermission ? (
        <>
          <Camera
            style={StyleSheet.absoluteFill}
            isActive={isActive}
            frameProcessor={frameProcessor}
            device={device}
            format={format}
            pixelFormat="yuv"
          />
        </>
      ) : null}
      <View style={[StyleSheet.absoluteFill]}>
        <View style={styles.backdrop} />
        <View style={styles.centerContainer}>
          <View style={styles.backdrop} />
          <View
            style={[styles.captureAreaContainer, captureAreaCustomContainer]}>
            <View style={styles.topLeft} />
            <View style={styles.topRight} />
            <View style={styles.bottomLeft} />
            <View style={styles.bottomRight} />
          </View>

          <View style={styles.backdrop} />
        </View>
        <View style={styles.backdrop} />
      </View>
      <View style={[styles.bottomBar]}>
        <Pressable
          onPressIn={() => {
            setPressed(true);
          }}
          onPressOut={() => {
            setPressed(false);
          }}
          onPress={() => {
            capture();
          }}>
          <View style={styles.outerCircle}>
            <View
              style={[
                styles.innerCircle,
                pressed ? styles.circlePressed : null,
              ]}></View>
          </View>
        </Pressable>
      </View>
      <View
        style={{
          flex: 1,
          top: '70%',
          alignItems: 'center',
          zIndex: 10,
        }}>
        <Text style={{color: 'white', fontSize: 36}}>Front Image</Text>
      </View>
    </View>
  );
};

export default CameraScreen;

const styles = StyleSheet.create({
  centerContainer: {
    flexDirection: 'row',
    zIndex: 10,
  },
  captureAreaContainer: {
    borderWidth: 1,
    borderColor: 'white',
    zIndex: 10,
  },
  topLeft: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderColor: 'white',
    borderTopWidth: 4,
    borderLeftWidth: 4,
    top: -4,
    left: -4,
  },
  topRight: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderColor: 'white',
    borderTopWidth: 4,
    borderRightWidth: 4,
    top: -4,
    right: -4,
  },
  bottomLeft: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderColor: 'white',
    borderBottomWidth: 4,
    borderLeftWidth: 4,
    bottom: -4,
    left: -4,
  },
  bottomRight: {
    position: 'absolute',
    height: 50,
    width: 50,
    borderColor: 'white',
    borderBottomWidth: 4,
    borderRightWidth: 4,
    bottom: -4,
    right: -4,
  },
  backdrop: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,.4)',
  },
  bottomBar: {
    position: 'absolute',
    width: '100%',
    bottom: 20,
    height: 60,
    flexDirection: 'row',
    justifyContent: 'center',
    zIndex: 20,
  },
  outerCircle: {
    width: 60,
    height: 60,
    borderRadius: 60 / 2,
    backgroundColor: 'lightgray',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  innerCircle: {
    width: 45,
    height: 45,
    borderRadius: 45 / 2,
    backgroundColor: 'white',
  },
  circlePressed: {
    backgroundColor: 'lightgray',
  },
});
