import React, { useState } from 'react';
import { View, TextInput, Button, Alert } from 'react-native';
import { insertUser, getUserByEmail } from '../database/database';

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');

  const handleRegister = () => {
    getUserByEmail(email,
      (user) => {
        if (user) {
          Alert.alert("Erro", "Email já cadastrado.");
        } else {
          insertUser(nome, email, senha,
            () => {
              Alert.alert("Sucesso", "Conta criada!");
              navigation.replace('Home', { nome });
            },
            (error) => Alert.alert("Erro", "Erro ao criar conta: " + error.message)
          );
        }
      },
      (error) => Alert.alert("Erro", "Erro ao verificar email: " + error.message)
    );
  };

  return (
    <View>
      <TextInput placeholder="Nome" value={nome} onChangeText={setNome} />
      <TextInput placeholder="Email" value={email} onChangeText={setEmail} />
      <TextInput placeholder="Senha" secureTextEntry value={senha} onChangeText={setSenha} />
      <Button title="Registrar" onPress={handleRegister} />
    </View>
  );
}
