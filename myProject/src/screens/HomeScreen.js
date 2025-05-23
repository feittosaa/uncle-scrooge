import React from 'react';
import { View, Text, StyleSheet, Button, Alert } from 'react-native';

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Usuário';

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          navigation.replace('Login');
        },
      },
    ]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.text}>Bem-vindo, {nome}!</Text>
      <Button title="Logout" onPress={handleLogout} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  text: { fontSize: 22, marginBottom: 20 },
});
