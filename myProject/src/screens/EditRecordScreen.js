import React, { useState } from 'react';
import { View, Text, TextInput, Button, Alert, StyleSheet } from 'react-native';
import { useRoute, useNavigation } from '@react-navigation/native';
import { updateAccountRecord } from '../database/database';
import { Picker } from '@react-native-picker/picker';

export default function EditRecordScreen() {
  const route = useRoute();
  const navigation = useNavigation();

  const { record, userId } = route.params;

  const [quantia, setQuantia] = useState(record.quantia_gasta.toString());
  const [nome, setNome] = useState(record.nome_conta);
  const [categoria, setCategoria] = useState(record.categoria);
  const [data, setData] = useState(record.data_registro);

  const categories = ['Alimentação', 'Saúde', 'Transporte', 'Lazer'];

  const handleUpdate = async () => {
    if (!quantia || !nome || !categoria || !data) {
      Alert.alert('Erro', 'Por favor, preencha todos os campos.');
      return;
    }

    try {
      await updateAccountRecord(record.id, userId, parseFloat(quantia), nome, categoria, data);
      Alert.alert('Sucesso', 'Registro atualizado com sucesso!');
      navigation.goBack();
    } catch (error) {
      console.error('Erro ao atualizar registro:', error);
      Alert.alert('Erro', 'Falha ao atualizar registro.');
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Editar Registro</Text>

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
          {categories.map((cat) => (
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
