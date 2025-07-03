import { Picker } from '@react-native-picker/picker';
import { useNavigation, useRoute } from '@react-navigation/native';
import { useState } from 'react';
import { Alert, Button, StyleSheet, Text, TextInput, View } from 'react-native';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { updateAccountRecord } from '../database/database';

const gastoCategories = ['Alimentação', 'Saúde', 'Transporte', 'Lazer', 'Outros'];
const receitaCategories = ['Salário', 'Renda Extra', 'Outros'];

export default function EditRecordScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { record, userId } = route.params;

  const isGastoInicial = record.quantia_gasta < 0;
  const tipoInicial = isGastoInicial ? 'gasto' : 'receita';
  const valorAbsoluto = Math.abs(record.quantia_gasta);

  const [quantia, setQuantia] = useState(valorAbsoluto.toString());
  const [nome, setNome] = useState(record.nome_conta);
  const [tipo, setTipo] = useState(tipoInicial);
  const [categoria, setCategoria] = useState(record.categoria);
  const [data, setData] = useState(record.data_registro);

  const categorias = tipo === 'gasto' ? gastoCategories : receitaCategories;

  const handleUpdate = async () => {
    if (!quantia || !nome || !categoria || !data) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    const parsedQuantia = parseFloat(quantia.replace(',', '.'));
    if (isNaN(parsedQuantia) || parsedQuantia <= 0) {
      Alert.alert('Erro', 'A quantia deve ser um número positivo.');
      return;
    }

    const valorFinal = tipo === 'gasto' ? -parsedQuantia : parsedQuantia;

    try {
      await updateAccountRecord(record.id, userId, valorFinal, nome, categoria, data);
      Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      Alert.alert('Erro', 'Falha ao atualizar registro.');
    }
  };

  return (
    <KeyboardAvoidingWrapper>
      <View style={styles.container}>
        <Text style={styles.title}>Editar Registro</Text>

        <Text>Tipo:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={tipo}
            onValueChange={(value) => {
              setTipo(value);
              setCategoria('');
            }}
          >
            <Picker.Item label="Gasto" value="gasto" />
            <Picker.Item label="Receita" value="receita" />
          </Picker>
        </View>

        <Text>Quantia:</Text>
        <TextInput
          style={styles.input}
          value={quantia}
          keyboardType="numeric"
          onChangeText={setQuantia}
        />

        <Text>Nome:</Text>
        <TextInput
          style={styles.input}
          value={nome}
          onChangeText={setNome}
        />

        <Text>Categoria:</Text>
        <View style={styles.pickerContainer}>
          <Picker
            selectedValue={categoria}
            onValueChange={(itemValue) => setCategoria(itemValue)}
          >
            <Picker.Item label="Selecione uma categoria" value="" />
            {categorias.map((cat) => (
              <Picker.Item key={cat} label={cat} value={cat} />
            ))}
          </Picker>
        </View>

        <Text>Data:</Text>
        <TextInput
          style={styles.input}
          value={data}
          onChangeText={setData}
          placeholder="AAAA-MM-DD"
        />

        <Button title="Salvar Alterações" onPress={handleUpdate} />
      </View>
    </KeyboardAvoidingWrapper>
  );
}

const styles = StyleSheet.create({
  container: { padding: 20, backgroundColor: '#fff', flex: 1 },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 20 },
  input: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    padding: 10,
    marginBottom: 15,
  },
  pickerContainer: {
    borderWidth: 1,
    borderColor: '#ccc',
    borderRadius: 6,
    marginBottom: 15,
  },
});
