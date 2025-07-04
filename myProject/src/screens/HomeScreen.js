import { Ionicons } from '@expo/vector-icons';
import { useEffect, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { getAllAccountRecordsByUserId } from '../database/database';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Usuário';
  const email = route.params?.email || 'N/A';
  const userId = route.params?.userId;

  const [resumo, setResumo] = useState({ receita: 0, gasto: 0 });
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState({ labels: [], datasets: [] });

  const handleLogout = () => {
    Alert.alert('Logout', 'Deseja realmente sair?', [
      { text: 'Cancelar', style: 'cancel' },
      {
        text: 'Sair',
        style: 'destructive',
        onPress: () => {
          navigation.replace('Welcome');
        },
      },
    ]);
  };

  useEffect(() => {
    const fetchData = async () => {
      const records = await getAllAccountRecordsByUserId(userId);
      let receita = 0, gasto = 0;
      const evolucaoMap = {};
      const gastoPorMes = {};

      for (const r of records) {
        const data = r.data_registro; // AAAA-MM-DD
        const mes = data.slice(0, 7); // AAAA-MM (ex: 2025-07)

        if (!evolucaoMap[data]) evolucaoMap[data] = { receita: 0, gasto: 0 };
        if (!gastoPorMes[mes]) gastoPorMes[mes] = 0;

        if (r.quantia_gasta > 0) {
          receita += r.quantia_gasta;
          evolucaoMap[data].receita += r.quantia_gasta;
        } else {
          const absVal = Math.abs(r.quantia_gasta);
          gasto += absVal;
          evolucaoMap[data].gasto += absVal;
          gastoPorMes[mes] += absVal;
        }
      }

      setResumo({ receita, gasto });

      // Gráfico de linha (evolução por dia)
      const datasOrdenadas = Object.keys(evolucaoMap).sort();
      const receitas = datasOrdenadas.map((d) => evolucaoMap[d].receita);
      const gastos = datasOrdenadas.map((d) => evolucaoMap[d].gasto);
      setLineData({
        labels: datasOrdenadas.map(d => d.slice(5)), // mostra só MM-DD
        datasets: [
          { data: receitas, color: () => '#27ae60', strokeWidth: 2 },
          { data: gastos, color: () => '#e74c3c', strokeWidth: 2 },
        ]
      });

      // Gráfico de barras (gastos por mês)
      const mesesOrdenados = Object.keys(gastoPorMes).sort();
      const valores = mesesOrdenados.map(m => gastoPorMes[m]);
      setBarData({
        labels: mesesOrdenados.map(m => m.slice(5)), // exibe só "07" para julho
        datasets: [{ data: valores }]
      });
    };

    fetchData();
  }, []);

  const saldo = resumo.receita - resumo.gasto;

  return (
    <KeyboardAvoidingWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bem-vindo, {nome}!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={handleLogout}>
            <Ionicons name="log-out" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* KPIs */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Receitas</Text>
            <Text style={styles.kpiValue}>R$ {resumo.receita.toFixed(2)}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Gastos</Text>
            <Text style={styles.kpiValue}>R$ {resumo.gasto.toFixed(2)}</Text>
          </View>
          <View style={styles.kpiBox}>
            <Text style={styles.kpiLabel}>Saldo</Text>
            <Text
              style={[
                styles.kpiValue,
                { color: saldo >= 0 ? 'green' : 'red' }
              ]}
            >
              R$ {saldo.toFixed(2)}
            </Text>
          </View>
        </View>

        {/* Gráfico de linha */}
        {lineData.labels.length > 0 && (
          <>
            <Text style={styles.graphTitle}>Evolução Financeira</Text>
            <LineChart
              data={lineData}
              width={screenWidth - 40}
              height={180}
              chartConfig={chartConfig}
              bezier
              style={styles.chart}
            />
          </>
        )}

        {/* Gráfico de barras */}
        {barData.labels.length > 0 && (
          <>
            <Text style={styles.graphTitle}>Gastos por Categoria</Text>
            <BarChart
              data={barData}
              width={Dimensions.get('window').width - 40}
              height={180}
              chartConfig={{
                backgroundGradientFrom: '#f5f5f5',
                backgroundGradientTo: '#f5f5f5',
                decimalPlaces: 2,
                color: (opacity = 1) => `rgba(52, 152, 219, ${opacity})`,
                labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
                style: { borderRadius: 16 },
                propsForLabels: { fontSize: 12 },
              }}
              fromZero={true}
            />
          </>
        )}

        {/* Botões principais */}
        <View style={styles.mainButtonsContainer}>
          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Record', { userId })}
          >
            <Ionicons name="add-circle-outline" size={40} color="#fff" />
            <Text style={styles.actionButtonText}>Registrar Conta</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('AccountList', { userId })}
          >
            <Ionicons name="list-outline" size={40} color="#fff" />
            <Text style={styles.actionButtonText}>Ver Registros</Text>
          </TouchableOpacity>

          <TouchableOpacity
            style={styles.actionButton}
            onPress={() => navigation.navigate('Goals', { userId })}
          >
            <Ionicons name="trophy-outline" size={40} color="#fff" />
            <Text style={styles.actionButtonText}>Metas de Gasto</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </KeyboardAvoidingWrapper>
  );
}

const chartConfig = {
  backgroundGradientFrom: "#f5f5f5",
  backgroundGradientTo: "#f5f5f5",
  decimalPlaces: 2,
  color: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  labelColor: (opacity = 1) => `rgba(44, 62, 80, ${opacity})`,
  style: { borderRadius: 16 },
  propsForDots: {
    r: "4",
    strokeWidth: "1",
    stroke: "#2c3e50",
  },
};

const styles = StyleSheet.create({
  container: {
    padding: 20,
    backgroundColor: '#f5f5f5',
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    paddingTop: 10,
  },
  welcomeText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#2c3e50',
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#e74c3c',
    padding: 2,
    paddingHorizontal: 12,
    borderRadius: 25,
  },
  logoutButtonText: {
    color: '#fff',
    marginLeft: 5,
    fontSize: 16,
  },
  emailText: {
    fontSize: 16,
    color: '#7f8c8d',
    marginBottom: 20,
  },
  kpiContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: 10,
    marginTop: 20,
    flexWrap: 'wrap',
  },

  kpiBox: {
    width: 100,
    height: 100,
    backgroundColor: '#ecf0f1',
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    elevation: 3,
  },

  kpiLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#2c3e50',
    marginBottom: 5,
    textAlign: 'center',
  },

  kpiValue: {
    fontSize: 14,
    color: '#34495e',
    textAlign: 'center',
  },
  graphTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
    marginTop: 20,
    color: '#2c3e50',
  },
  chart: {
    borderRadius: 12,
  },
  mainButtonsContainer: {
    marginTop: 30,
    flexDirection: 'row',
    justifyContent: 'space-around',
    flexWrap: 'wrap',
    gap: 20,
  },
  actionButton: {
    backgroundColor: '#3498db',
    width: 100,
    height: 100,
    borderRadius: 10,
    alignItems: 'center',
    justifyContent: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 3.84,
    elevation: 5,
  },
  actionButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
    alignItems: 'center',
    justifyContent: 'center',
    textAlign: 'center',
    paddingHorizontal: 5
  },
});
