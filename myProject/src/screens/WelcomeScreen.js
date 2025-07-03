import { Button, StyleSheet, Text, View } from 'react-native';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';

export default function WelcomeScreen({ navigation }) {
  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Bem-vindo!</Text>
        <View style={styles.buttonContainer}>
          <Button
            title="Login"
            onPress={() => navigation.navigate('Login')}
          />
        </View>
        <View style={styles.buttonContainer}>
          <Button
            title="Registrar"
            onPress={() => navigation.navigate('Register')}
          />
        </View>
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#f0f0f0',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 40,
    color: '#333',
  },
  buttonContainer: {
    width: '80%',
    marginVertical: 10,
  },
});