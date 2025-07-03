import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { ActivityIndicator, Alert, Button, ScrollView, StyleSheet, Text, TextInput, View } from 'react-native';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { insertAccountRecord } from '../database/database';

const gastoCategories = ['Alimentação', 'Saúde', 'Transporte', 'Lazer', 'Outros'];
const receitaCategories = ['Salário', 'Renda Extra', 'Outros'];

export default function RecordScreen() {
  const route = useRoute();
  const userId = route.params?.userId;

  const [quantia, setQuantia] = useState('');
  const [nomeConta, setNomeConta] = useState('');
  const [tipo, setTipo] = useState('gasto'); // gasto ou receita
  const [categoria, setCategoria] = useState('');
  const [data, setData] = useState(new Date().toISOString().split('T')[0]);
  const [loading, setLoading] = useState(false);

  const categorias = tipo === 'gasto' ? gastoCategories : receitaCategories;

  const handleRecord = async () => {
    if (!userId) {
      Alert.alert("Erro", "ID do usuário não encontrado. Por favor, faça login novamente.");
      return;
    }

    if (!quantia || !nomeConta || !categoria) {
      Alert.alert("Erro", "Por favor, preencha todos os campos.");
      return;
    }

    const parsedQuantia = parseFloat(quantia.replace(',', '.'));
    if (isNaN(parsedQuantia) || parsedQuantia <= 0) {
      Alert.alert("Erro", "A quantia deve ser um número positivo.");
      return;
    }

    const dateRegex = /^\d{4}-\d{2}-\d{2}$/;
    if (!data.match(dateRegex)) {
      Alert.alert("Erro", "Formato de data inválido. Use AAAA-MM-DD.");
      return;
    }

    const valorFinal = tipo === 'gasto' ? -parsedQuantia : parsedQuantia;

    setLoading(true);
    try {
      await insertAccountRecord(
        userId,
        valorFinal,
        nomeConta,
        categoria,
        data
      );

      Alert.alert("Sucesso", "Registro adicionado com sucesso!");

      // Limpar campos
      setQuantia('');
      setNomeConta('');
      setCategoria('');
      setTipo('gasto');
      setData(new Date().toISOString().split('T')[0]);
    } catch (error) {
      console.error("Erro ao registrar:", error);
      Alert.alert("Erro", "Não foi possível registrar. Tente novamente.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <Text style={styles.title}>Registrar Receita/Gasto</Text>

        <Text style={styles.label}>Tipo:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipo}
            onValueChange={(value) => {
              setTipo(value);
              setCategoria('');
            }}
            style={styles.picker}
          >
            <Picker.Item label="Gasto" value="gasto" />
            <Picker.Item label="Receita" value="receita" />
          </Picker>
        </View>

        <Text style={styles.label}>Quantia:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: 150.75"
          keyboardType="numeric"
          value={quantia}
          onChangeText={setQuantia}
        />

        <Text style={styles.label}>Nome/Descrição:</Text>
        <TextInput
          style={styles.input}
          placeholder="Ex: Salário, Aluguel, Supermercado"
          value={nomeConta}
          onChangeText={setNomeConta}
        />

        <Text style={styles.label}>Categoria:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoria}
            onValueChange={(value) => setCategoria(value)}
            style={styles.picker}
          >
            <Picker.Item label="Selecione uma categoria..." value="" />
            {categorias.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Text style={styles.label}>Data:</Text>
        <TextInput
          style={styles.input}
          placeholder="AAAA-MM-DD"
          value={data}
          onChangeText={setData}
        />

        <View style={styles.buttonContainer}>
          <Button
            title={loading ? "Registrando..." : "Registrar"}
            onPress={handleRecord}
            disabled={loading}
          />
        </View>

        {loading && <ActivityIndicator size="large" color="#0000ff" style={styles.loadingIndicator} />}
      </ScrollView>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#f9f9f9',
    alignItems: 'center'
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
  pickerContainer: {
    width: '90%',
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 8,
    marginBottom: 20,
    backgroundColor: '#fff',
  },
  picker: {
    width: '100%',
    height: 50,
  },
  buttonContainer: {
    width: '90%',
    marginTop: 20,
  },
  loadingIndicator: {
    marginTop: 20,
  },
});
