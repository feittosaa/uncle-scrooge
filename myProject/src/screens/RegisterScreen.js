import { useState } from 'react';
import { ActivityIndicator, Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { getUserByEmail, insertUser } from '../database/database';

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
      const existingUser = await getUserByEmail(email);
      if (existingUser) {
        Alert.alert("Erro", "Este email já está cadastrado.");
        return;
      }

      const result = await insertUser(nome, email, senha);
      const newUserId = result.lastInsertRowId;

      Alert.alert("Sucesso", "Conta criada com sucesso!");

      navigation.replace('Home', { nome, email, userId: newUserId });
    } catch (error) {
      console.error("Erro ao registrar usuário:", error);
      // Uma verificação adicional para erro de email duplicado, caso o DB retorne erro de UNIQUE constraint
      if (error.message.includes('UNIQUE constraint failed')) {
        Alert.alert("Erro", "Este email já está cadastrado.");
      } else {
        Alert.alert("Erro", "Ocorreu um erro ao criar a conta. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
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