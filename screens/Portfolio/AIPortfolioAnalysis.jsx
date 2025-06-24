import React, { useState , useEffect} from 'react';
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
  const [isBenchmarkModalVisible, setBenchmarkModalVisible] = useState(false);
  const [isRebalanceModalVisible, setRebalanceModalVisible] = useState(false);
  const [selectedField, setSelectedField] = useState('');
  const [date, setDate] = useState(new Date());
  const [tableData, setTableData] = useState([
    { assetClass: '', symbol: '', holding: '', isLocked: false},
    { assetClass: '', symbol: '', holding: '', isLocked: false},
    { assetClass: '', symbol: '', holding: '', isLocked: false},
    { assetClass: '', symbol: '', holding: '', isLocked: false },
    { assetClass: '', symbol: '', holding: '', isLocked: false},
  ]);

  const [benchmark, setBenchmark] = useState('');
  const [transactionCost, setTransactionCost] = useState('0.0');
  const [allowShortSell, setAllowShortSell] = useState(false);
  const [rebalanceFrequency, setRebalanceFrequency] = useState('');
  const [riskFreeRate, setRiskFreeRate] = useState('0.0');
  const [riskTolerance, setRiskTolerance] = useState('0');
  const [targetReturn, setTargetReturn] = useState('0');
  const [assetClassOptions, setAssetClassOptions] = useState([]); 
  const [modalIndex, setModalIndex] = useState(-1); 

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

  const benchmarks = ['AFRICA40', 'AUXAUD', 'BCOUSD', 'BTCUSD', 'BUNDEUR', 'CNXUSD', 'CORNUSD', 'ETHUSD', 'ETXEUR', 'FRXEUR', 'GRXEUR', 'HKXHKD', 'HSCEI', 'INXUSD', 'ITALY40', 'JPYPY', 'KRWKRW', 'LTUSD', 'MXCN', 'NATGASUSD', 'NKY', 'NLXEUR', 'NSXUSD', 'SGXSGD', 'SOYBNUSD', 'SPXUSD', 'SUGARUSD', 'SWISS20', 'TWSE', 'TWXUSD', 'UDXUSD', 'UKXGBP', 'US2000USD', 'US30USD', 'USTEC', 'WHEATUSD', 'XAGUSD', 'XAUUSD', 'XPDUSD', 'XPTUSD'];
  const rebalanceFrequencies = ['Daily', 'Weekly', 'Monthly', 'Quarterly', 'Semi-annually', 'Annually', 'Auto'];

  const assetClassCategories = {
    'Commodity': ['COCOA', 'COFFEE', 'CORNUSD', 'SOYBNUSD', 'SUGARUSD', 'WHEATUSD'],
    'Crypto': ['ETHBTC', 'ETHBTCM', 'ETHEUR', 'ETHGBP', 'ETHUSD', 'ETHUSDM' ],
    'Energy': [], 
    'Equity (HKEX)': [],
    'Equity (KR)': [],
    'Equity (SA)': [],
    'Equity (SGX)': [],
    'Equity (SSE)': [],
    'Equity (SZSE)': [],
    'Equity (TWSE)': [],
    'Equity (TYO)': [],
    'Equity (US)': ['NVDA', 'AAPL', 'MSFT', 'GOOGL', 'AMZN'],
    'Forex': [], 
    // ASK BOSS FOR WHERE TO GET THIS LIST
  }; 

  const showDatePicker = (field) => {
    setSelectedField(field);
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateChange = (event, selected) => {
    if (selected) {
      const today = new Date();
      today.setHours(0, 0, 0, 0); // Set to midnight for comparison
      if (selected > today) {
        alert('Date cannot be today or in the future.');
        return;
      }
      setDate(selected);
      if (selectedField === 'startDate') setStartDate(selected.toLocaleDateString('en-GB'));
      if (selectedField === 'endDate') setEndDate(selected.toLocaleDateString('en-GB'));
    }
    hideDatePicker();
  };

//   useEffect(() => {
//     if (selectedField === 'assetClass' && tableData.some(row => !row.assetClass)) {
//       const firstEmptyIndex = tableData.findIndex(row => !row.assetClass);
//       const defaultCategory = tableData[firstEmptyIndex]?.assetClass || 'Commodity';
//       setAssetClassOptions(assetClassCategories[defaultCategory] || assetClassCategories['Commodity']);
//     }
//   }, [selectedField, tableData]);

  const showModal = (field, index = -1) => {
    setSelectedField(field);
    setModalIndex(index); 
    if (field === 'currency') setCurrencyModalVisible(true);
    if (field === 'objective') setObjectiveModalVisible(true);
    if (field === 'assetClass') {
      setAssetClassModalVisible(true);
      setAssetClassOptions(assetClasses); 
    }
    if (field === 'symbol') {
      const category = tableData[index]?.assetClass || 'Commodity';
      setAssetClassOptions(assetClassCategories[category] || assetClassCategories['Commodity']);
      setAssetClassModalVisible(true); // Reuse asset class modal for symbols
    }
    if (field === 'benchmark') setBenchmarkModalVisible(true);
    if (field === 'rebalanceFrequency') setRebalanceModalVisible(true);
    console.log('Showing modal for:', field, 'with index:', index);
  };

  const hideModal = () => {
    setCurrencyModalVisible(false);
    setObjectiveModalVisible(false);
    setAssetClassModalVisible(false);
    setBenchmarkModalVisible(false);
    setRebalanceModalVisible(false);
  };

  const selectOption = (option, index = -1) => {
    if (selectedField === 'currency') setCurrency(option);
    if (selectedField === 'objective') {
      setObjective(option);
      setBenchmark('');
      setTransactionCost('0.0');
      setAllowShortSell(false);
      setRebalanceFrequency('');
      setRiskFreeRate('0.0');
      setRiskTolerance('0');
      setTargetReturn('0');
    }
    if (selectedField === 'benchmark') setBenchmark(option);
    if (selectedField === 'rebalanceFrequency') setRebalanceFrequency(option);
    if (selectedField === 'assetClass' && index >= 0) {
      console.log('Selected assetClass:', option, 'at index:', index);
      const newTableData = [...tableData];
      newTableData[index].assetClass = option;
      setTableData(newTableData);
      console.log('Updated tableData:', newTableData);
    }
    if (selectedField === 'symbol' && index >= 0) {
      console.log('Selected symbol:', option, 'at index:', index);
      const newTableData = [...tableData];
      newTableData[index].symbol = option; // Ensure update targets the correct index
      setTableData(newTableData);
      console.log('Updated tableData:', newTableData);
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

  const updateNumericField = (setter, value, min, max, decimals = 1) => {
    const numValue = parseFloat(value) || 0;
    const newValue = Math.min(max, Math.max(min, numValue));
    setter(newValue.toFixed(decimals));
  };

  const incrementTransactionCost = () => {
    updateNumericField(setTransactionCost, transactionCost, 0, 10, 1);
  };

  const decrementTransactionCost = () => {
    updateNumericField(setTransactionCost, transactionCost, 0, 10, 1);
  };

  const handleCompute = async () => { 
    try {
      const portfolioParams = {
        allowShortSell,
        risk_tolerance: parseFloat(riskTolerance) / 100,
        target_return: parseFloat(targetReturn) / 100,
        total_portfolio_value: parseFloat(initialCapital) || 1000000,
        basecur: currency,
        risk_free_rate: parseFloat(riskFreeRate) / 100,
        arrSymbol: tableData
          .filter(row => row.symbol && row.holding)
          .map(row => row.symbol),
        objective: objectives.indexOf(objective),
        group_cond: {},
        StartDate: startDate,
        EndDate: endDate,
      };
  
      const result = await optimizePortfolio(portfolioParams);
      console.log('Optimization Result:', result.data);
    } catch (error) {
      console.error('Compute failed:', error.message);
      alert('Failed to optimize portfolio. Check console for details.');
    }
  };

  const handleOK = (index) => { 
    console.log('OK Pressed at index:', index);
    const newTableData = [...tableData];
    newTableData[index].isLocked = true;
    setTableData(newTableData);
  };

  const handleEdit = (index) => {
    const newTableData = [...tableData];
    newTableData[index].isLocked = false;
    setTableData(newTableData);
  };
  
  const handleDelete = (index) => {
    const newTableData = [...tableData.filter((_, i) => i !== index)];
    setTableData(newTableData);
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
          placeholder="100000"
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

      {objective && (
        <View style={styles.conditionalFields}>
          <View style={styles.inputRow}>
            <Text style={styles.label}>Benchmark:</Text>
            <TouchableOpacity style={styles.dropdown} onPress={() => showModal('benchmark')}>
              <Text style={styles.dropdownText}>{benchmark || 'Select Benchmark'}</Text>
            </TouchableOpacity>
          </View>

          {['Equally Weighted', 'Global Minimum Variance', 'Global Minimum Downside Volatility', 'Global Min Conditional VaR', 'Global Min Conditional DaR', 'Risk Parity Diversification'].includes(objective) && (
            <>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Transaction Cost (%):</Text>
                <View style={styles.inputWithArrows}>
                  <TextInput
                    style={styles.input}
                    value={transactionCost}
                    onChangeText={(value) => updateNumericField(setTransactionCost, value, 0, 10, 1)}
                    placeholder="0.0"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                  />
                  <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={incrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={decrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Rebalance Frequency:</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => showModal('rebalanceFrequency')}>
                  <Text style={styles.dropdownText}>{rebalanceFrequency || 'Select Frequency'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {['Max Sharpe Ratio'].includes(objective) && (
            <>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Risk Free Rate (%):</Text>
                <TextInput
                  style={styles.input}
                  value={riskFreeRate}
                  onChangeText={(value) => updateNumericField(setRiskFreeRate, value, 0, 10, 1)}
                  placeholder="0.0"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Transaction Cost (%):</Text>
                <View style={styles.inputWithArrows}>
                  <TextInput
                    style={styles.input}
                    value={transactionCost}
                    onChangeText={(value) => updateNumericField(setTransactionCost, value, 0, 10, 1)}
                    placeholder="0.0"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                  />
                  <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={incrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={decrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Allow Short Sell:</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setAllowShortSell(!allowShortSell)}
                >
                  <Text style={styles.dropdownText}>{allowShortSell ? 'True' : 'False'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Rebalance Frequency:</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => showModal('rebalanceFrequency')}>
                  <Text style={styles.dropdownText}>{rebalanceFrequency || 'Select Frequency'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {['Max Return given Risk Tolerance', 'Min Conditional VaR given Risk Tolerance', 'Min Conditional DaR given Risk Tolerance', 'Max Sortino Ratio given Risk Tolerance'].includes(objective) && (
            <>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Risk Tolerance (%):</Text>
                <TextInput
                  style={styles.input}
                  value={riskTolerance}
                  onChangeText={(value) => updateNumericField(setRiskTolerance, value, 0, 100, 0)}
                  placeholder="0"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Transaction Cost (%):</Text>
                <View style={styles.inputWithArrows}>
                  <TextInput
                    style={styles.input}
                    value={transactionCost}
                    onChangeText={(value) => updateNumericField(setTransactionCost, value, 0, 10, 1)}
                    placeholder="0.0"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                  />
                  <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={incrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={decrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Allow Short Sell:</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setAllowShortSell(!allowShortSell)}
                >
                  <Text style={styles.dropdownText}>{allowShortSell ? 'True' : 'False'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Rebalance Frequency:</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => showModal('rebalanceFrequency')}>
                  <Text style={styles.dropdownText}>{rebalanceFrequency || 'Select Frequency'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}

          {['Min Volatility given Target Return', 'Max Sortino Ratio given Target Return', 'Min Conditional VaR given Target Return', 'Min Conditional DaR given Target Return'].includes(objective) && (
            <>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Target Return (%):</Text>
                <TextInput
                  style={styles.input}
                  value={targetReturn}
                  onChangeText={(value) => updateNumericField(setTargetReturn, value, 0, 100, 0)}
                  placeholder="0"
                  placeholderTextColor="gray"
                  keyboardType="numeric"
                />
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Transaction Cost (%):</Text>
                <View style={styles.inputWithArrows}>
                  <TextInput
                    style={styles.input}
                    value={transactionCost}
                    onChangeText={(value) => updateNumericField(setTransactionCost, value, 0, 10, 1)}
                    placeholder="0.0"
                    placeholderTextColor="gray"
                    keyboardType="numeric"
                  />
                  <View style={styles.arrowContainer}>
                    <TouchableOpacity onPress={incrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↑</Text>
                    </TouchableOpacity>
                    <TouchableOpacity onPress={decrementTransactionCost} style={styles.arrow}>
                      <Text style={styles.arrowText}>↓</Text>
                    </TouchableOpacity>
                  </View>
                </View>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Allow Short Sell:</Text>
                <TouchableOpacity
                  style={styles.dropdown}
                  onPress={() => setAllowShortSell(!allowShortSell)}
                >
                  <Text style={styles.dropdownText}>{allowShortSell ? 'True' : 'False'}</Text>
                </TouchableOpacity>
              </View>
              <View style={styles.inputRow}>
                <Text style={styles.label}>Rebalance Frequency:</Text>
                <TouchableOpacity style={styles.dropdown} onPress={() => showModal('rebalanceFrequency')}>
                  <Text style={styles.dropdownText}>{rebalanceFrequency || 'Select Frequency'}</Text>
                </TouchableOpacity>
              </View>
            </>
          )}
        </View>
      )}

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
            <TouchableOpacity 
              style={styles.tableInput} 
              onPress={() => !row.isLocked && showModal('assetClass', index)}
              disabled={row.isLocked}
            >
              <Text style={styles.tableText}>{row.assetClass || '---'}</Text>
            </TouchableOpacity>
            <View style={styles.verticalLine} />
            <TouchableOpacity 
              style={styles.tableInput} 
              onPress={() => !row.isLocked && showModal('symbol', index)}
              disabled={row.isLocked}
            >
              <Text style={styles.tableText}>{row.symbol || '---'}</Text>
            </TouchableOpacity>
            <View style={styles.verticalLine} />
            <View style={styles.holdingColumn}>
              <TextInput
                style={[styles.tableInput , { flex: 1, paddingRight: 5}]}
                value={row.holding}
                onChangeText={(text) => !row.isLocked && updateHolding(text, index)} // Only allow changes when unlocked
                placeholder="0"
                placeholderTextColor="gray"
                keyboardType="numeric"
                editable={!row.isLocked} // Disable editing when locked
              />
              {row.isLocked ? (
                <View style={styles.iconContainer}>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleEdit(index)}>
                    <Text style={styles.iconText}>✏️</Text>
                  </TouchableOpacity>
                  <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(index)}>
                    <Text style={styles.iconText}>🗑️</Text>
                  </TouchableOpacity>
                </View>
              ) : (
                <TouchableOpacity 
                  style={[styles.okButton, !row.assetClass || !row.symbol || !row.holding ? styles.disabledOkButton : null]} 
                  onPress={() => handleOK(index)}
                  disabled={!row.assetClass || !row.symbol || !row.holding}
                >
                  <Text style={styles.okText}>Ok</Text>
                </TouchableOpacity>
              )}
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

      <TouchableOpacity style={styles.computeButton} onPress={handleCompute}>
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
                data={assetClassOptions}
                keyExtractor={(item) => item}
                renderItem={({ item }) => (
                <TouchableOpacity 
                    style={styles.modalOption} 
                    onPress={() => selectOption(item, modalIndex)} // Use modalIndex state
                >
                    <Text style={styles.modalText}>{item}</Text>
                </TouchableOpacity>
                )}
            />
            </View>
        </View>
      </Modal>

      <Modal transparent visible={isBenchmarkModalVisible} animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={benchmarks}
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

      <Modal transparent visible={isRebalanceModalVisible} animationType="fade" onRequestClose={hideModal}>
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <FlatList
              data={rebalanceFrequencies}
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
    padding: 8,
    textAlign: 'left',
    minHeight: 40,
    textAlignVertical: 'center',
    marginRight: 2, // Reduce margin to prevent overlap
  },
  tableText: {
    color: 'black',
    textAlign: 'left',
  },
  verticalLine: {
    width: 1,
    backgroundColor: '#ccc',
    marginHorizontal: 2,
  },
  okButton: {
    backgroundColor: '#4FC3F7',
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
  iconContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    width: 60, // Match the width of okButton
  },
  iconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30, // Half of okButton width
  },
  iconText: {
    fontSize: 16,
  },
});

export default AIPortfolioAnalysis;