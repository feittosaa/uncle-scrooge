import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import { insertAccountRecord } from '../database/database';

export default function RecordScreen() {
  const route = useRoute(); // Hook para acessar os parâmetros da rota
  const userId = route.params?.userId; // Obtém o userId passado pela navegação

  const [quantiaGasta, setQuantiaGasta] = useState('');
  const [nomeConta, setNomeConta] = useState('');
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]); // Data atual no formato YYYY-MM-DD
  const [loading, setLoading] = useState(false);

  const handleRecord = async () => {
    if (!userId) {
      Alert.alert("Erro", "ID do usuário não encontrado. Por favor, faça login novamente.");
      return;
    }
    if (!quantiaGasta || !nomeConta || !categoria) {
      Alert.alert("Erro", "Por favor, preencha todos os campos obrigatórios.");
      return;
    }

    // Validação básica da quantia (opcional, mas recomendado)
    const parsedQuantia = parseFloat(quantiaGasta.replace(',', '.')); // Garante ponto como separador decimal
    if (isNaN(parsedQuantia) || parsedQuantia <= 0) {
      Alert.alert("Erro", "A quantia gasta deve ser um número válido e positivo.");
      return;
    }

    // Validação básica da data (opcional)
    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!data.match(dateRegex)) {
      Alert.alert("Erro", "Formato de data inválido. Use AAAA-MM-DD.");
      return;
    }

    setLoading(true);
    try {
      await insertAccountRecord(
        userId,
        parsedQuantia,
        nomeConta,
        categoria,
        data
      );

      Alert.alert("Sucesso", "Conta registrada com sucesso!");

      // Limpar campos após registro
      setQuantiaGasta('');
      setNomeConta('');
      setCategoria('');
      setData(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error("Erro ao registrar conta:", error);
      Alert.alert("Erro", "Ocorreu um erro ao registrar a conta. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <ScrollView contentContainerStyle={styles.container}>
      <Text style={styles.title}>Registrar Nova Conta</Text>

      <Text style={styles.label}>Quantia Gasta:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 150.75"
        keyboardType="numeric"
        value={quantiaGasta}
        onChangeText={setQuantiaGasta}
      />

      <Text style={styles.label}>Nome/Descrição:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Aluguel, Supermercado, Cinema"
        value={nomeConta}
        onChangeText={setNomeConta}
      />

      <Text style={styles.label}>Categoria:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: Moradia, Alimentação, Lazer"
        value={categoria}
        onChangeText={setCategoria}
      />

      <Text style={styles.label}>Data:</Text>
      <TextInput
        style={styles.input}
        placeholder="AAAA-MM-DD"
        value={data}
        onChangeText={text => setData(text)}
      />

      <View style={styles.buttonContainer}>
        <Button
          title={loading ? "Registrando..." : "Registrar Conta"}
          onPress={handleRecord}
          disabled={loading}
        />
      </View>
      {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center',
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 30,
    color: '#333',
  },
  label: {
    fontSize: 18,
    alignSelf: 'flex-start',
    marginLeft: '5%',
    marginBottom: 5,
    color: '#555',
  },
  input: {
    width: '90%',
    height: 50,
    borderColor: '#ccc',
    borderWidth: 1,
    borderRadius: 8,
    paddingHorizontal: 15,
    marginBottom: 20,
    backgroundColor: '#fff',
    fontSize: 16,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});