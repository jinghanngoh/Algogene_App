// Most work to do for now, so need to implement the list for say all the stocks in Equity (US) for example. Now its hardcoded as the API wasnt given to me
// Works for crypto as asset classes. Mainly BTCUSD, ETHUSD
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, TextInput, Modal, FlatList, Platform, ScrollView, Button} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import DateTimePicker from '@react-native-community/datetimepicker';
import { optimizePortfolio, objectiveMap } from '../../services/PortfolioApi';
import { useRouter } from 'expo-router';

const AIPortfolioAnalysis = () => {
  const router = useRouter();
  const [startDate, setStartDate] = useState('');
  const [endDate, setEndDate] = useState('');
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
  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState('');

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
    'Max Sharpe Ratio',
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
    'Crypto': ["XAUUSD","BTCUSD",'ETHBTC', 'ETHBTCM', 'ETHEUR', 'ETHGBP', 'ETHUSD', 'ETHUSDM' ],
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
    'Forex': ["EURUSD"], 
    // ASK BOSS FOR WHERE TO GET THIS LIST (We hardcoded everything for now, need reference the web page to get the exact ones)
  }; 

  const showDatePicker = (field) => {
    setSelectedField(field);
    setDate(new Date((field === 'startDate' && startDate) ? startDate : (field === 'endDate' && endDate) ? endDate : Date.now()));
    setDatePickerVisible(true);
  };

  const hideDatePicker = () => {
    setDatePickerVisible(false);
  };

  const handleDateChange = (event, selected) => {
    if (Platform.OS === 'ios' && event.type === 'dismissed') {
      hideDatePicker();
      return;
    }

    if (selected) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      if (selected > today) {
        alert('Date cannot be today or in the future.');
        return;
      }

      const formattedDate = selected.toISOString().split('T')[0];
      if (selectedField === 'startDate') {
        if (endDate && new Date(formattedDate) > new Date(endDate)) {
          alert('Start date cannot be after end date.');
          return;
        }
        setStartDate(formattedDate);
        } else if (selectedField === 'endDate') {
          if (startDate && new Date(formattedDate) < new Date(startDate)) {
          alert('End date cannot be before start date.');
          return;
        }
        setEndDate(formattedDate);
      }
      setDate(selected);
    }

    if (Platform.OS !== 'ios') {
      hideDatePicker();
    }
  };

  const confirmDate = () => {
    hideDatePicker();
  };

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
      setAssetClassModalVisible(true); 
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
      const newTableData = [...tableData];
      newTableData[index].assetClass = option;
      setTableData(newTableData);
    }
    if (selectedField === 'symbol' && index >= 0) {
      const newTableData = [...tableData];
      newTableData[index].symbol = option;
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

  const updateNumericField = (setter, value, min, max, decimals = 1) => {
    const numValue = parseFloat(value) || 0;
    const newValue = Math.min(max, Math.max(min, numValue));
    setter(newValue.toFixed(decimals));
  };

  const incrementTransactionCost = () => {
    updateNumericField(setTransactionCost, parseFloat(transactionCost) + 0.1, 0, 10, 1);
  };

  const decrementTransactionCost = () => {
    updateNumericField(setTransactionCost, parseFloat(transactionCost) - 0.1, 0, 10, 1);
  };
  
  const handleCompute = async () => {
    console.log("Compute Pressed");
    try {
      console.log("Router Object:", router);
      setIsLoading(true);
      setErrorMessage('');

      console.log('Input Validation:', { startDate, endDate, objective, tableData });
      if (!startDate || !endDate) throw new Error('Please select date range');
      if (new Date(endDate) < new Date(startDate)) throw new Error('End date cannot be earlier than start date');
      if (new Date(startDate) > new Date() || new Date(endDate) > new Date()) {
        throw new Error('Dates cannot be in the future');
      }
      if (!objective) throw new Error('Please select an objective');

      const validSymbols = tableData
        .filter(row => row.symbol && row.holding)
        .map(row => row.symbol);

      console.log('Valid Symbols:', validSymbols);
      if (validSymbols.length === 0) {
        throw new Error('Please add at least one asset');
      }

      const apiParams = {
        StartDate: startDate,
        EndDate: endDate,
        arrSymbol: validSymbols,
        objective: objectiveMap[objective] !== undefined ? objectiveMap[objective] : objectiveMap['Global Minimum Variance'],
        target_return: parseFloat(targetReturn) / 100 || 0.15,
        risk_tolerance: parseFloat(riskTolerance) / 100 || 0.3, // We have quite alot of hardcoded values for now, change in future 
        allowShortSell: allowShortSell || false,
        risk_free_rate: parseFloat(riskFreeRate) / 100 || 0.01,
        basecur: currency || 'USD',
        total_portfolio_value: parseFloat(initialCapital) || 1000000,
        group_cond: { // Not quite sure how to do this part or what it means
          map: validSymbols.reduce((acc, symbol, idx) => ({
            ...acc,
            [symbol]: `Group${idx + 1}`,
          }), {}),
          lower: validSymbols.reduce((acc, _, idx) => ({
            ...acc,
            // [`Group${idx + 1}`]: 0.0,
            [`Group${idx + 1}`]: 0.1,
          }), {}),
          upper: validSymbols.reduce((acc, _, idx) => ({
            ...acc,
            // [`Group${idx + 1}`]: 1.0,
            [`Group${idx + 1}`]: 0.5,
          }), {}),
        },
      };

      // console.log('API Parameters (Pre-Request):', JSON.stringify(apiParams, null, 2));

      const result = await optimizePortfolio(apiParams);

      // console.log('Asset Allocate:', result.data?.asset_allocate);

      if (!result.data) {
        throw new Error('No data returned from API');
      }

      if (result.data.asset_allocate.length === 0) {
        throw new Error('No allocations returned. Check symbol compatibility or date range.');
      }

      const resultData = {
        annualizedReturn: result.data.annualizedReturn || 0,
        annualizedVolatility: result.data.annualizedVolatility || 0,
        sharpeRatio: result.data.sharpeRatio || 0,
        var95: result.data.var95 || 0,
        cvar95: result.data.cvar95 || 0,
        cashLeft: result.data.cashLeft || 0,
        assets: result.data.asset_allocate?.map((allocation, index) => {
          const currentHolding = parseFloat(tableData.find(row => row.symbol === allocation.symbol)?.holding) || 0;
          const currentPrice = allocation.currentPrice || 1;
          const initialCapitalValue = parseFloat(initialCapital) || 1000000;
          const currentShares = (currentHolding / 100) * initialCapitalValue / currentPrice;
          return {
            id: `${index}`,
            name: allocation.symbol || 'UNKNOWN',
            currentPrice,
            currentHolding,
            optimalHolding: Math.round(allocation.weight * 100) || 0,
            optimalShares: allocation.shares || 0,
            changeInShares: allocation.shares ? allocation.shares - currentShares : 0,
          };
        }) || [],
      };

      console.log('Result Data for Navigation:', JSON.stringify(resultData, null, 2));

    router.push({
      pathname: 'Accounts/PortfolioResult',
      params: {
        resultData: encodeURIComponent(JSON.stringify(resultData)),
        assetAllocate: encodeURIComponent(JSON.stringify(result.data?.asset_allocate)),
        underlyingAssets: encodeURIComponent(JSON.stringify(apiParams.arrSymbol)),
        rebalanceStrategy: encodeURIComponent(rebalanceFrequency || 'None'),
      },
    });

      if (result.data.asset_allocate?.length > 0) {
        setTableData(
          result.data.asset_allocate.map(allocation => ({
            assetClass: tableData.find(row => row.symbol === allocation.symbol)?.assetClass || '',
            symbol: allocation.symbol,
            holding: Math.round(allocation.weight * 100).toString(),
            isLocked: true,
          }))
        );
      } else {
        console.warn('No allocation data to update tableData', {
          asset_allocate: result.data.asset_allocate,
          validSymbols,
          apiParams,
        });
      }
    } catch (error) {
      console.error('Optimization Error:', error.message, error.stack);
      setErrorMessage(error.message);
      alert(`Error: ${error.message}`);
    } finally {
      setIsLoading(false);
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
    <ScrollView contentContainerStyle={{ flexGrow: 1 }} keyboardShouldPersistTaps="handled">
    <View style={styles.container}>
      <TouchableOpacity
        style={styles.backButton}
        onPress={() => router.back()} // Use router.back() for navigation
      >
        <Ionicons name="arrow-back" size={24} color="white" />
      </TouchableOpacity>
      <Text style={styles.headerTitle}>PORTFOLIO OPTIMIZER</Text>

      <View style={styles.inputRow}>
        <Text style={styles.label}>Data Period:</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => showDatePicker('startDate')}>
            <Text style={styles.dropdownText}>{startDate || 'YYYY-MM-DD'}</Text>
        </TouchableOpacity>
          <Text style={styles.hyphen}>-</Text>
        <TouchableOpacity style={styles.dropdown} onPress={() => showDatePicker('endDate')}>
            <Text style={styles.dropdownText}>{endDate || 'YYYY-MM-DD'}</Text>
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
                  style={[styles.input, { flex: 1 }]}
                  value={transactionCost}
                  onChangeText={(value) => {
                    // Allow only valid numeric input with one decimal place
                    const formattedValue = value.match(/^\d*\.?\d{0,1}$/) ? value : transactionCost;
                    setTransactionCost(formattedValue);
                  }}
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
                onChangeText={(text) => !row.isLocked && updateHolding(text, index)} 
                placeholder="0"
                placeholderTextColor="gray"
                keyboardType="numeric"
                editable={!row.isLocked} 
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
        <Modal transparent visible={isDatePickerVisible} animationType="slide">
          <View style={styles.modalOverlay}>
            <View style={styles.datePickerContainer}>
              <DateTimePicker
                value={date}
                mode="date"
                display={Platform.OS === 'ios' ? 'spinner' : 'calendar'}
                onChange={handleDateChange}
                maximumDate={new Date()}
              />
              {Platform.OS === 'ios' && (
                <View style={styles.datePickerButtons}>
                  <Button title="Cancel" onPress={hideDatePicker} />
                  <Button title="Confirm" onPress={confirmDate} />
                </View>
              )}
            </View>
          </View>
        </Modal>
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
                    onPress={() => selectOption(item, modalIndex)} 
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
    </ScrollView>
  );
}; 

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  backButton: {
    position: 'absolute',
    top: 40,
    left: 20,
    zIndex: 1,
    marginTop: 40,
  },
  headerTitle: {
    fontSize: 20,
    color: 'white',
    fontWeight: 'bold',
    marginBottom: 20,
    marginTop: 40,
    textAlign: 'center',
    marginTop: 80,
  },
  inputRow: {
    flexDirection: 'row',
    marginBottom: 15,
    alignItems: 'center',
    height: 50,
  },
  inputWithArrows: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1, 
    backgroundColor: 'white',
    borderRadius: 5,
    paddingHorizontal: 5,
    marginLeft: 10,
    minHeight: 40,
  },
  arrowContainer: {
    flexDirection: 'column',
    justifyContent: 'center',
    marginLeft: 5,
  },
  arrow: {
    paddingHorizontal: 5,
    paddingVertical: 2,
  },
  arrowText: {
    fontSize: 16,
    color: 'black',
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
    marginRight: 2, 
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
    width: 60,
  },
  iconButton: {
    padding: 5,
    alignItems: 'center',
    justifyContent: 'center',
    width: 30, 
  },
  iconText: {
    fontSize: 16,
  },
  datePickerContainer: { backgroundColor: '#2A2A2A', borderRadius: 10, padding: 20, alignItems: 'center' },
  datePickerButtons: { flexDirection: 'row', justifyContent: 'space-between', width: '100%', marginTop: 10 },
});

export default AIPortfolioAnalysis;