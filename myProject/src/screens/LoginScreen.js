import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import { getUserByEmail } from '../database/database';

export default function LoginScreen({ navigation }) {
  const [email, setEmail] = useState('');
  const [senha, setSenha] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !senha) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    setLoading(true);
    try {
      const user = await getUserByEmail(email);

      if (!user) {
        Alert.alert("Erro", "Usuário não encontrado.");
      } else if (user.senha !== senha) {
        Alert.alert("Erro", "Senha incorreta.");
      } else {
        Alert.alert("Sucesso", `Bem-vindo, ${user.nome}!`);
        navigation.replace('Home', { nome: user.nome, email: user.email, userId: user.id });
      }
    } catch (error) {
      console.error("Erro ao fazer login:", error);
      Alert.alert("Erro", "Ocorreu um erro ao tentar fazer login. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Fazer Login</Text>
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
          title={loading ? "Carregando..." : "Entrar"}
          onPress={handleLogin}
          disabled={loading}
        />
      </View>
      <View style={styles.registerPrompt}>
        <Text>Não tem uma conta?</Text>
        <Button title="Registrar-se" onPress={() => navigation.navigate('Register')} />
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
  registerPrompt: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});