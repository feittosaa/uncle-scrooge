import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Usuário';
  const email = route.params?.email || 'N/A'; // Adicionando o email

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          // Usa navigation.replace para ir para a WelcomeScreen, limpando o histórico de navegação
          navigation.replace('Welcome');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo, {nome}!</Text>
      <Text style={styles.emailText}>Email: {email}</Text>
      <View style={styles.buttonContainer}>
        <Button title="Logout" onPress={handleLogout} />
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e0f7fa',
  },
  text: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 10,
    color: '#00796b',
    textAlign: 'center',
  },
  emailText: {
    fontSize: 18,
    marginBottom: 30,
    color: '#4caf50',
    textAlign: 'center',
  },
  buttonContainer: {
    marginTop: 20,
    width: '60%',
  }
});