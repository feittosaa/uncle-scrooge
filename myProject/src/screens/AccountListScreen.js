import { useFocusEffect, useNavigation, useRoute } from '@react-navigation/native';
import { useCallback, useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, RefreshControl, StyleSheet, Text, View } from 'react-native';
import { TouchableOpacity } from 'react-native-gesture-handler';
import { deleteAccountRecordById, getAllAccountRecordsByUserId } from '../database/database';

export default function AccountListScreen() {
  const route = useRoute();
  const userId = route.params?.userId;

  const [records, setRecords] = useState([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState(null);

  const navigation = useNavigation();

  const handleDelete = (id) => {
    Alert.alert(
      "Confirmar Exclusão",
      "Tem certeza que deseja excluir este registro?",
      [
        { text: "Cancelar", style: "cancel" },
        {
          text: "Excluir",
          style: "destructive",
          onPress: async () => {
            try {
              await deleteAccountRecordById(id);
              Alert.alert("Sucesso", "Registro excluído.");
              loadRecords(); // Recarrega a lista
            } catch (error) {
              console.error("Erro ao deletar registro:", error);
              Alert.alert("Erro", "Falha ao excluir o registro.");
            }
          }
        }
      ]
    );
  };

  const handleEdit = (item) => {
    navigation.navigate('EditRecord', { record: item, userId: userId });
  };

  const loadRecords = useCallback(async () => {
    if (!userId) {
      setError("ID do usuário não encontrado. Não foi possível carregar os registros.");
      setLoading(false);
      setRefreshing(false);
      return;
    }

    setLoading(true);
    setError(null);
    try {
      const data = await getAllAccountRecordsByUserId(userId);
      console.log("Dados do DB carregados:", data);
      setRecords(data);

    } catch (err) {
      console.error("Erro ao carregar registros do banco de dados:", err);
      setError("Não foi possível carregar os registros. Tente novamente.");
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  }, [userId]);

  useEffect(() => {
    loadRecords();
  }, [loadRecords]);

  useFocusEffect(
    useCallback(() => {
      onRefresh();
    }, [])
  );

  const onRefresh = () => {
    setRefreshing(true);
    loadRecords();
  };

  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color="#0000ff" />
        <Text style={styles.loadingText}>Carregando registros...</Text>
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.center}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  const renderItem = ({ item }) => (
    <View style={styles.recordItem}>
      <Text style={styles.recordName}>{item.nome_conta}</Text>
      <Text style={styles.recordDetail}>Quantia: R$ {item.quantia_gasta?.toFixed(2) || '0.00'}</Text>
      <Text style={styles.recordDetail}>Categoria: {item.categoria}</Text>
      <Text style={styles.recordDetail}>Data: {item.data_registro}</Text>

      <View style={styles.buttonRow}>
        <TouchableOpacity
          style={[styles.button, styles.editButton]}
          onPress={() => handleEdit(item)}
        >
          <Text style={styles.buttonText}>Editar</Text>
        </TouchableOpacity>

        <TouchableOpacity
          style={[styles.button, styles.deleteButton]}
          onPress={() => handleDelete(item.id)}
        >
          <Text style={styles.buttonText}>Excluir</Text>
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Meus Registros</Text>
      {records.length === 0 ? (
        <Text style={styles.noRecordsText}>Nenhum registro encontrado.</Text>
      ) : (
        <FlatList
          data={records}
          keyExtractor={(item) => item.id?.toString() || Math.random().toString()}
          renderItem={renderItem}
          contentContainerStyle={styles.listContent}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
          }
        />
      )}
    </View>
  );
}


const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 10,
    backgroundColor: '#f0f0f0',
  },
  center: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#f0f0f0',
  },
  loadingText: {
    marginTop: 10,
    fontSize: 18,
    color: '#555',
  },
  errorText: {
    marginTop: 10,
    fontSize: 18,
    color: 'red',
    textAlign: 'center',
    marginHorizontal: 20,
  },
  title: {
    fontSize: 26,
    fontWeight: 'bold',
    marginBottom: 20,
    textAlign: 'center',
    color: '#333',
  },
  listContent: {
    paddingBottom: 20,
  },
  recordItem: {
    backgroundColor: '#fff',
    padding: 15,
    borderRadius: 8,
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 1.41,
    elevation: 2,
  },
  recordName: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: '#333',
  },
  recordDetail: {
    fontSize: 16,
    color: '#666',
    marginBottom: 2,
  },
  noRecordsText: {
    textAlign: 'center',
    fontSize: 18,
    color: '#888',
    marginTop: 50,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 10,
  },
  button: {
    flex: 1,
    padding: 10,
    borderRadius: 6,
    alignItems: 'center',
    marginHorizontal: 5,
  },
  editButton: {
    backgroundColor: '#4CAF50',
  },
  deleteButton: {
    backgroundColor: '#F44336',
  },
  buttonText: {
    color: '#fff',
    fontWeight: 'bold',
  },
});