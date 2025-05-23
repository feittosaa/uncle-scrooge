import React, { useState } from 'react';
import { View, TextInput, Button, Alert, StyleSheet, Text, ActivityIndicator } from 'react-native';
import { insertUser, getUserByEmail } from '../database/database'; // Ajuste o caminho conforme necessário

export default function RegisterScreen({ navigation }) {
  const [nome, setNome] = useState('');
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleRegister = async () => {
    if (!nome || !email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      // Primeiro, verifica se o email já está cadastrado
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert("Erro", "Este email já está cadastrado.");
        return; // Sai da função
      }

      // Se o email não existe, insere o novo usuário
      await insertUser(nome, email, senha);
      Alert.alert("Sucesso", "Conta criada com sucesso!");
      // Navega para a Home após o registro bem-sucedido
      navigation.replace('Home', { nome, email });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      Alert.alert("Erro", "Ocorreu um erro ao criar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Criar Nova Conta</Text>
      <TextInput
        style={styles.input}
        placeholder="Nome"
        value={nome}
        onChangeText={setNome}
      />
      <TextInput
        style={styles.input}
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        keyboardType="email-address"
        autoCapitalize="none"
      />
      <TextInput
        style={styles.input}
        placeholder="Senha"
        secureTextEntry
        value={senha}
        onChangeText={setSenha}
      />
      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Registrando..." : "Registrar"}
          onPress={handleRegister}
          disabled={loading}
        />
      </View>
      <View style={styles.loginPrompt}>
        <Text>Já tem uma conta?</Text>
        <Button title="Fazer Login" onPress={() => navigation.navigate('Login')} />
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}
    </View>
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
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 15,
    backgroundColor: '#fff',
  },
  buttonContainer: {
    width: '90%',
    marginTop: 10,
  },
  loginPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});