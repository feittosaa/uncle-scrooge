import { StyleSheet, Text, View } from 'react-native';

export default function DashboardScreen() {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Dashboard e Gráficos</Text>
      <Text style={styles.subtitle}>Aqui você verá um resumo visual das suas finanças.</Text>
      <Text style={styles.placeholderText}>(Funcionalidades de gráficos serão implementadas aqui)</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
    backgroundColor: '#e8f5e9',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#2e7d32',
  },
  subtitle: {
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 30,
    color: '#4caf50',
    paddingHorizontal: 20,
  },
  placeholderText: {
    fontSize: 16,
    fontStyle: 'italic',
    color: '#66bb6a',
    marginTop: 50,
  },
});