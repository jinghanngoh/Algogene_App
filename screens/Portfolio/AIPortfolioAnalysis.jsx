import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, FlatList, Platform } from 'react-native';
import DateTimePicker from '@react-native-community/datetimepicker';

const AIPortfolioAnalysis = () => {
  const [startDate, setStartDate] = useState(null);
  const [endDate, setEndDate] = useState(null);
  const [initialCapital, setInitialCapital] = useState('');
  const [currency, setCurrency] = useState('AUD');
  const [objective, setObjective] = useState('');
  const [isDatePickerVisible, setDatePickerVisible] = useState(false);
  const [isCurrencyModalVisible, setCurrencyModalVisible] = useState(false);
  const [isObjectiveModalVisible, setObjectiveModalVisible] = useState(false);
  const [isAssetClassModalVisible, setAssetClassModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [date, setDate] = useState(new Date());
  const [tableData, setTableData] = useState([
    { assetClass: '', symbol: '', holding: '' },
    { assetClass: '', symbol: '', holding: '' },
    { assetClass: '', symbol: '', holding: '' },
    { assetClass: '', symbol: '', holding: '' },
    { assetClass: '', symbol: '', holding: '' },
  ]);

  const assetClasses = [
    'Algo Marketplace',
    'Commodity',
    'Crypto',
    'Energy',
    'Equity (HKEX)',
    'Equity (KR)',
    'Equity (SA)',
    'Equity (SGX)',
    'Equity (SSE)',
    'Equity (SZSE)',
    'Equity (TWSE)',
    'Equity (TYO)',
    'Equity (US)',
    'Forex',
    'Index',
    'Interest Rate',
    'MPF',
    'Metal',
  ];

  const currencies = ['AUD', 'CAD', 'CHF', 'CNY', 'EUR', 'GBP', 'HKD', 'JPY', 'SGD', 'USD'];
  const objectives = [
    'Equally Weighted',
    'Global Minimum Variance',
    'Max Sharpe Ration',
    'Max Return given Risk Tolerance',
    'Min Volatility given Target Return',
    'Global Minimum Downside Volatility',
    'Max Sortino Ratio given Target Return',
    'Max Sortino Ratio given Risk Tolerance',
    'Global Min Conditional VaR',
    'Min Conditional VaR given Target Return',
    'Min Conditional VaR given Risk Tolerance', 
    'Global Min Conditional DaR', 
    'Min Conditional DaR given Target Return',
    'Min Conditional DaR given Risk Tolerance',
    'Risk Parity Diversification',
  ];

  const showDatePicker = (field) => {
    setSelectedField(field);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      setDate(selected);
      if (selectedField === 'startDate') setStartDate(selected.toLocaleDateString('en-GB'));
      if (selectedField === 'endDate') setEndDate(selected.toLocaleDateString('en-GB'));
    }
    hideDatePicker();
  };

  const showModal = (field) => {
    setSelectedField(field);
    if (field === 'currency') setCurrencyModalVisible(true);
    if (field === 'objective') setObjectiveModalVisible(true);
    if (field === 'assetClass') setAssetClassModalVisible(true);
  };

  const hideModal = () => {
    setCurrencyModalVisible(false);
    setObjectiveModalVisible(false);
    setAssetClassModalVisible(false);
  };

  const selectOption = (option, index = -1) => {
    if (selectedField === 'currency') setCurrency(option);
    if (selectedField === 'objective') setObjective(option);
    if (selectedField === 'assetClass' && index >= 0) {
      const newTableData = [...tableData];
      newTableData[index].assetClass = option;
      setTableData(newTableData);
    }
    hideModal();
  };

  const updateHolding = (value, index) => {
    const newTableData = [...tableData];
    newTableData[index].holding = value.replace(/[^0-9]/g, '');
    const total = newTableData.reduce((sum, row) => sum + (parseInt(row.holding) || 0), 0);
    if (total > 100) {
      newTableData[index].holding = '';
    } else {
      setTableData(newTableData);
    }
  };

  const addNewAsset = () => {
    setTableData([...tableData, { assetClass: '', symbol: '', holding: '' }]);
  };

  return (
    <View style={styles.container}>
      <Text style={styles.headerTitle}>PORTFOLIO OPTIMIZER</Text>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Data Period:</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => showDatePicker('startDate')}>
          <Text style={styles.dropdownText}>{startDate || 'DD/MM/YYYY'}</Text>
        </TouchableOpacity>
        <Text style={styles.hyphen}>-</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => showDatePicker('endDate')}>
          <Text style={styles.dropdownText}>{endDate || 'DD/MM/YYYY'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Initial Capital:</Text>
        <TextInput
          style={styles.input}
          value={initialCapital}
          onChangeText={setInitialCapital}
          placeholder="10000"
          placeholderTextColor="gray"
          keyboardType="numeric"
        />
        <TouchableOpacity style={styles.dropdown} onPress={() => showModal('currency')}>
          <Text style={styles.dropdownText}>{currency}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Objective:</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => showModal('objective')}>
          <Text style={styles.dropdownText}>{objective || '....'}</Text>
        </TouchableOpacity>
      </View>

      <View style={styles.table}>
        <View style={styles.tableHeader}>
          <Text style={styles.tableCellHeader}>Asset Class</Text>
          <View style={styles.verticalLine} />
          <Text style={styles.tableCellHeader}>Symbol / Strategy</Text>
          <View style={styles.verticalLine} />
          <View style={styles.holdingColumn}>
            <Text style={styles.tableCellHeader}>Current Holding (%)</Text>
          </View>
        </View>
        {tableData.map((row, index) => (
          <View style={styles.tableRow} key={index}>
            <TouchableOpacity style={styles.tableInput} onPress={() => showModal('assetClass', index)}>
              <Text style={styles.tableText}>{row.assetClass || '---'}</Text>
            </TouchableOpacity>
            <View style={styles.verticalLine} />
            <TextInput
              style={styles.tableInput}
              value={row.symbol}
              onChangeText={(text) => {
                const newTableData = [...tableData];
                newTableData[index].symbol = text;
                setTableData(newTableData);
              }}
              placeholder="---"
              placeholderTextColor="gray"
            />
            <View style={styles.verticalLine} />
            <View style={styles.holdingColumn}>
              <TextInput
                style={styles.tableInput}
                value={row.holding}
                onChangeText={(text) => updateHolding(text, index)}
                placeholder="0"
                placeholderTextColor="gray"
                keyboardType="numeric"
              />
              <TouchableOpacity style={styles.okButton}>
                <Text style={styles.okText}>Ok</Text>
              </TouchableOpacity>
            </View>
          </View>
        ))}
        <TouchableOpacity style={styles.newAssetRow} onPress={addNewAsset}>
          <View style={styles.logoCircle}>
            <Text style={styles.plusSign}>+</Text>
          </View>
          <Text style={styles.newAssetText}>New Asset</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity style={styles.computeButton}>
        <Text style={styles.computeButtonText}>COMPUTE</Text>
      </TouchableOpacity>

      {isDatePickerVisible && (
        <DateTimePicker
          value={date}
          mode="date"
          display="calendar"
          onChange={handleDateChange}
          style={styles.datePicker}
        />
      )}

      <Modal transparent visible={isCurrencyModalVisible} animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={currencies}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => selectOption(item)}>
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isObjectiveModalVisible} animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={objectives}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => selectOption(item)}>
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>

      <Modal transparent visible={isAssetClassModalVisible} animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={assetClasses}
              keyExtractor={(item) => item}
              renderItem={({ item }) => (
                <TouchableOpacity style={styles.modalOption} onPress={() => selectOption(item, selectedField)}>
                  <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
              )}
            />
          </View>
        </View>
      </Modal>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
  },
  label: {
    color: 'lightgray',
    width: 120,
  },
  dropdown: {
    flex: 1,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
    justifyContent: 'center',
    minHeight: 40,
  },
  dropdownText: {
    color: 'black',
    textAlign: 'left',
  },
  hyphen: {
    color: 'white',
    marginHorizontal: 10,
    fontSize: 18,
  },
  input: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    marginLeft: 10,
    minHeight: 40,
    textAlignVertical: 'center',
  },
  table: {
    marginBottom: 15,
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
  },
  tableHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 5,
    padding: 5,
    borderBottomWidth: 1,
    borderBottomColor: '#ccc',
  },
  tableCellHeader: {
    color: 'black',
    flex: 1,
    textAlign: 'left',
    fontWeight: 'bold',
  },
  tableInput: {
    flex: 1,
    color: 'black',
    backgroundColor: 'white',
    borderRadius: 5,
    padding: 5,
    textAlign: 'left',
    minHeight: 40,
    textAlignVertical: 'center',
  },
  tableText: {
    color: 'black',
    textAlign: 'left',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 5,
  },
  okButton: {
    backgroundColor: '#333',
    padding: 5,
    borderRadius: 5,
    justifyContent: 'center',
    minHeight: 40,
    alignItems: 'center',
    marginLeft: 5,
  },
  okText: {
    color: 'white',
    fontSize: 12,
  },
  okPlaceholder: {
    flex: 1,
    minHeight: 40,
  },
  holdingColumn: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
  },
  newAssetRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 5,
    width: '100%',
    backgroundColor: 'white',
  },
  logoCircle: {
    width: 24,
    height: 24,
    borderRadius: 12,
    backgroundColor: '#4FC3F7',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
  },
  plusSign: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  newAssetText: {
    color: 'black',
    fontSize: 14,
    textAlign: 'center',
  },
  computeButton: {
    backgroundColor: '#4FC3F7',
    padding: 15,
    borderRadius: 5,
    alignItems: 'center',
  },
  computeButtonText: {
    color: 'white',
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#2a2a2a',
    borderRadius: 5,
    padding: 10,
    width: '80%',
    maxHeight: '50%',
  },
  modalOption: {
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#333',
  },
  modalText: {
    color: 'white',
    textAlign: 'center',
  },
  datePicker: {
    width: 320,
    backgroundColor: 'white',
  },
});

export default AIPortfolioAnalysis;