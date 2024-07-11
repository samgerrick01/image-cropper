import React, {useState} from 'react';
import {useNavigation} from '@react-navigation/native';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  StyleSheet,
  Pressable,
  Button,
} from 'react-native';

const HomeScreen = () => {
  const [firstImage, setFirstImage] = useState('');
  const navigation = useNavigation();

  const onPressButton = () => {
    navigation.navigate('Camera', {setImage: value => setFirstImage(value)});
  };

  return (
    <View>
      {firstImage ? (
        <Image
          style={styles.cardImage}
          source={{
            uri: 'data:image/jpeg;base64,' + firstImage,
          }}
        />
      ) : (
        <Text style={styles.noImageText}>No Image Selected</Text>
      )}
      <Button onPress={onPressButton} title="Save Front Image" />
    </View>
  );
};

export default HomeScreen;

const styles = StyleSheet.create({
  cardImage: {
    height: 200,
    resizeMode: 'contain',
  },
  noImageText: {
    alignSelf: 'center',
    marginVertical: 40,
    color: 'black',
  },
});
