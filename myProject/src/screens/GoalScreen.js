import { Picker } from '@react-native-picker/picker';
import { useRoute } from '@react-navigation/native';
import { useEffect, useState } from 'react';
import { Alert, Button, FlatList, StyleSheet, Text, TextInput, View } from 'react-native';
import { deleteGoal, getGoalsByUserId, insertGoal, updateGoal } from '../database/database';

export default function GoalScreen() {
  const route = useRoute();
  const userId = route.params?.userId;

  const [categoria, setCategoria] = useState('');
  const [valorMeta, setValorMeta] = useState('');
  const [goals, setGoals] = useState([]);
  const [editingGoal, setEditingGoal] = useState(null);

  const categories = ['Alimentação', 'Saúde', 'Transporte', 'Lazer'];

  const loadGoals = async () => {
    try {
      const data = await getGoalsByUserId(userId);
      setGoals(data);
    } catch (error) {
      console.error('Erro ao carregar metas:', error);
    }
  };

  useEffect(() => {
    loadGoals();
  }, []);

  const handleSave = async () => {
    if (!categoria || !valorMeta) {
      Alert.alert('Erro', 'Preencha todos os campos.');
      return;
    }

    try {
      if (editingGoal) {
        await updateGoal(editingGoal.id, categoria, parseFloat(valorMeta));
        Alert.alert('Sucesso', 'Meta atualizada!');
        setEditingGoal(null);
      } else {
        await insertGoal(userId, categoria, parseFloat(valorMeta));
        Alert.alert('Sucesso', 'Meta criada!');
      }

      setCategoria('');
      setValorMeta('');
      loadGoals();
    } catch (error) {
      console.error('Erro ao salvar meta:', error);
    }
  };

  const handleEdit = (goal) => {
    setCategoria(goal.categoria);
    setValorMeta(goal.valor_meta.toString());
    setEditingGoal(goal);
  };

  const handleDelete = async (id) => {
    Alert.alert('Confirmar', 'Deseja realmente excluir esta meta?', [
      { text: 'Cancelar' },
      {
        text: 'Excluir',
        style: 'destructive',
        onPress: async () => {
          try {
            await deleteGoal(id);
            loadGoals();
          } catch (error) {
            console.error('Erro ao excluir meta:', error);
          }
        }
      }
    ]);
  };

  const renderItem = ({ item }) => (
    <View style={styles.goalItem}>
      <Text style={styles.goalText}>{item.categoria} - R$ {item.valor_meta.toFixed(2)}</Text>
      <View style={styles.buttonRow}>
        <Button title="Editar" onPress={() => handleEdit(item)} />
        <Button title="Excluir" color="red" onPress={() => handleDelete(item.id)} />
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>{editingGoal ? 'Editar Meta' : 'Nova Meta de Gasto'}</Text>

      <Text>Categoria:</Text>
      <View style={styles.pickerContainer}>
        <Picker
          selectedValue={categoria}
          onValueChange={(value) => setCategoria(value)}
        >
          <Picker.Item label="Selecione uma categoria" value="" />
          {categories.map((cat) => (
            <Picker.Item key={cat} label={cat} value={cat} />
          ))}
        </Picker>
      </View>

      <Text>Valor da Meta:</Text>
      <TextInput
        style={styles.input}
        placeholder="Ex: 500"
        keyboardType="numeric"
        value={valorMeta}
        onChangeText={setValorMeta}
      />

      <Button title={editingGoal ? "Salvar Alterações" : "Criar Meta"} onPress={handleSave} />

      <FlatList
        data={goals}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        contentContainerStyle={{ marginTop: 20 }}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: '#fff' },
  title: { fontSize: 22, fontWeight: 'bold', marginBottom: 15 },
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
  goalItem: {
    backgroundColor: '#f9f9f9',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
  },
  goalText: {
    fontSize: 16,
    marginBottom: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
});