import { Ionicons } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { useCallback, useState } from 'react';
import { Alert, Dimensions, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { BarChart, LineChart } from 'react-native-chart-kit';
import KeyboardAvoidingWrapper from '../components/KeyboardAvoidingWrapper';
import { getAllAccountRecordsByUserId, getGoalsByUserId } from '../database/database';

const screenWidth = Dimensions.get('window').width;

export default function HomeScreen({ navigation, route }) {
  const nome = route.params?.nome || 'Usuário';
  const userId = route.params?.userId;

  const [resumo, setResumo] = useState({ receita: 0, gasto: 0 });
  const [lineData, setLineData] = useState({ labels: [], datasets: [] });
  const [barData, setBarData] = useState({ labels: [], datasets: [] });
  const [metaPorCategoria, setMetaPorCategoria] = useState({});
  const [categorias, setCategorias] = useState([]);
  const [valoresGastos, setValoresGastos] = useState([]);
  const [coresBarras, setCoresBarras] = useState([]);

  const saldo = resumo.receita - resumo.gasto;

  useFocusEffect(
    useCallback(() => {
      const fetchData = async () => {
        const records = await getAllAccountRecordsByUserId(userId);
        const metas = await getGoalsByUserId(userId);
        setMetaPorCategoria(metas);

        let receita = 0, gasto = 0;
        const evolucaoMap = {};
        const gastoPorCategoria = {};

        for (const r of records) {
          const data = r.data_registro;
          const categoria = r.categoria || 'Outros';

          if (!evolucaoMap[data]) evolucaoMap[data] = { receita: 0, gasto: 0 };
          if (!gastoPorCategoria[categoria]) gastoPorCategoria[categoria] = 0;

          if (r.quantia_gasta > 0) {
            receita += r.quantia_gasta;
            evolucaoMap[data].receita += r.quantia_gasta;
          } else {
            const absVal = Math.abs(r.quantia_gasta);
            gasto += absVal;
            evolucaoMap[data].gasto += absVal;
            gastoPorCategoria[categoria] += absVal;
          }
        }

        setResumo({ receita, gasto });

        const datasOrdenadas = Object.keys(evolucaoMap).sort();
        setLineData({
          labels: datasOrdenadas.map(d => d.slice(5)),
          datasets: [
            { data: datasOrdenadas.map(d => evolucaoMap[d].receita), color: () => '#27ae60', strokeWidth: 2 },
            { data: datasOrdenadas.map(d => evolucaoMap[d].gasto), color: () => '#e74c3c', strokeWidth: 2 },
          ]
        });

        const categoriasOrdenadas = Object.keys(gastoPorCategoria).filter(cat => gastoPorCategoria[cat] > 0).sort();
        const valores = categoriasOrdenadas.map(cat => gastoPorCategoria[cat]);
        const cores = categoriasOrdenadas.map(cat =>
          gastoPorCategoria[cat] > (metas[cat] || 0) ? '#f1c40f' : '#27ae60'
        );

        setCategorias(categoriasOrdenadas);
        setValoresGastos(valores);
        setCoresBarras(cores);

        setBarData({
          labels: categoriasOrdenadas,
          datasets: [{ data: valores }],
        });
      };

      fetchData();
    }, [userId])
  );

  return (
    <KeyboardAvoidingWrapper>
      <ScrollView contentContainerStyle={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.welcomeText}>Bem-vindo, {nome}!</Text>
          <TouchableOpacity style={styles.logoutButton} onPress={() => {
            Alert.alert('Logout', 'Deseja realmente sair?', [
              { text: 'Cancelar', style: 'cancel' },
              { text: 'Sair', style: 'destructive', onPress: () => navigation.replace('Welcome') },
            ]);
          }}>
            <Ionicons name="log-out" size={24} color="#fff" />
            <Text style={styles.logoutButtonText}>Sair</Text>
          </TouchableOpacity>
        </View>

        {/* KPIs principais */}
        <View style={styles.kpiContainer}>
          <View style={styles.kpiBox}><Text style={styles.kpiLabel}>Receitas</Text><Text style={styles.kpiValue}>R$ {resumo.receita.toFixed(2)}</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiLabel}>Gastos</Text><Text style={styles.kpiValue}>R$ {resumo.gasto.toFixed(2)}</Text></View>
          <View style={styles.kpiBox}><Text style={styles.kpiLabel}>Saldo</Text><Text style={[styles.kpiValue, { color: saldo >= 0 ? 'green' : 'red' }]}>R$ {saldo.toFixed(2)}</Text></View>
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
              data={{
                labels: categorias,
                datasets: [{ data: valoresGastos }]
              }}
              width={screenWidth - 40}
              height={180}
              fromZero
              showValuesOnTopOfBars
              withInnerLines={false}
              chartConfig={{
                ...chartConfig,
                color: (opacity = 1, index) => coresBarras[index % coresBarras.length],
                barPercentage: 0.6,
              }}
              style={styles.chart}
            />
          </>
        )}

        {/* KPIs por categoria */}
        {categorias.length > 0 && (
          <View style={styles.kpiContainer}>
            {categorias.map((categoria, index) => {
              const gasto = valoresGastos[index];
              const meta = metaPorCategoria[categoria] || 0;
              const dentroMeta = gasto <= meta;

              return (
                <View key={categoria} style={[styles.kpiBoxCategory, { backgroundColor: dentroMeta ? '#0fcf0f' : '#ffdf00' }]}>
                  <Text style={styles.kpiLabelCategory}>{categoria}</Text>
                  <Text style={styles.kpiValueCategory}>R$ {gasto.toFixed(2)}</Text>
                </View>
              );
            })}
          </View>
        )}

        {/* Botões de ação */}
        <View style={styles.mainButtonsContainer}>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Record', { userId })}>
            <Ionicons name="add-circle-outline" size={40} color="#fff" />
            <Text style={styles.actionButtonText}>Registrar Conta</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('AccountList', { userId })}>
            <Ionicons name="list-outline" size={40} color="#fff" />
            <Text style={styles.actionButtonText}>Ver Registros</Text>
          </TouchableOpacity>
          <TouchableOpacity style={styles.actionButton} onPress={() => navigation.navigate('Goals', { userId })}>
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
};

const styles = StyleSheet.create({
  container: { paddingTop: 30, paddingHorizontal: 20, backgroundColor: '#f5f5f5' },
  header: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center' },
  welcomeText: { fontSize: 18, fontWeight: 'bold', color: '#2c3e50' },
  logoutButton: { flexDirection: 'row', alignItems: 'center', backgroundColor: '#e74c3c', padding: 6, paddingHorizontal: 12, borderRadius: 25 },
  logoutButtonText: { color: '#fff', marginLeft: 5, fontSize: 16 },
  kpiContainer: { flexDirection: 'row', justifyContent: 'space-between', gap: 10, marginTop: 20, flexWrap: 'wrap' },
  kpiBox: { width: 100, height: 100, backgroundColor: '#ecf0f1', borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kpiBoxCategory: { width: 80, height: 60, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  kpiLabel: { fontSize: 16, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
  kpiLabelCategory: { fontSize: 12, fontWeight: 'bold', color: '#2c3e50', marginBottom: 5 },
  kpiValue: { fontSize: 14, color: '#34495e' },
  kpiValueCategory: { fontSize: 14, color: '#34495e' },
  graphTitle: { fontSize: 16, fontWeight: 'bold', marginBottom: 10, marginTop: 20, color: '#2c3e50' },
  chart: { borderRadius: 12 },
  mainButtonsContainer: { marginTop: 30, flexDirection: 'row', justifyContent: 'space-around', flexWrap: 'wrap', gap: 20 },
  actionButton: { backgroundColor: '#60afdf', width: 100, height: 100, borderRadius: 10, alignItems: 'center', justifyContent: 'center' },
  actionButtonText: { color: '#fff', fontSize: 16, fontWeight: 'bold', textAlign: 'center', paddingHorizontal: 5 }
});
