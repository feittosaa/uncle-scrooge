import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { getUserByEmail } from '../database/database';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleLogin = () => {
    getUserByEmail(email,
      (user) => {
        if (!user) {
          Alert.alert("Erro", "Usuário não encontrado.");
        } else if (user.senha !== senha) {
          Alert.alert("Erro", "Senha incorreta.");
        } else {
          Alert.alert("Sucesso", `Bem-vindo, ${user.nome}`);
          navigation.replace('Home', { nome: user.nome });
        }
      },
      (error) => Alert.alert("Erro", "Erro ao fazer login: " + error.message)
    );
  };

  return (
    <View>
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      <Button title="Login" onPress={handleLogin} />
    </View>
  );
}
