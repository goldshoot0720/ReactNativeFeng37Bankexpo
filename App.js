import React, { useState, useEffect, useMemo } from 'react';
import { StyleSheet, Text, ScrollView, StatusBar, Button, Alert, View, TextInput } from 'react-native';
import { SafeAreaView, SafeAreaProvider } from 'react-native-safe-area-context';
import { SelectList } from 'react-native-dropdown-select-list';
import AsyncStorage from '@react-native-async-storage/async-storage';

const App = () => {
  const [selected, setSelected] = useState("");  // Selected bank value
  const [depositAmount, setDepositAmount] = useState("0");  // Default deposit amount is 0
  const [bankSavings, setBankSavings] = useState(Array(10).fill(0));  // Track savings for each bank
  const [selectedIndex, setSelectedIndex] = useState(0);  // Selected bank index
  const [sumSaving, setSumSaving] = useState(0);  // Total savings

  // Memoize the data array to prevent it from changing on every render
  const data = useMemo(() => [
    {key: '0', value: '(006)合作金庫(5880)'},
    {key: '1', value: '(013)國泰世華(2882)'},
    {key: '2', value: '(017)兆豐銀行(2886)'},
    {key: '3', value: '(048)王道銀行(2897)'},
    {key: '4', value: '(103)新光銀行(2888)'},
    {key: '5', value: '(396)街口支付(6038)'},
    {key: '6', value: '(700)中華郵政'},
    {key: '7', value: '(808)玉山銀行(2884)'},
    {key: '8', value: '(812)台新銀行(2887)'},
    {key: '9', value: '(822)中國信託(2891)'},
  ], []);  // This ensures `data` remains constant across renders

  useEffect(() => {
    // When component mounts, retrieve saved data from AsyncStorage
    const loadData = async () => {
      try {
        const savedSavings = await AsyncStorage.getItem('bankSavings');
        const savedSelectedIndex = await AsyncStorage.getItem('selectedIndex');
        
        // If data exists, update state
        if (savedSavings) {
          setBankSavings(JSON.parse(savedSavings));  // Load the bank savings data if available
        }
        // If there's a saved selected index, set it. Otherwise, default to 0.
        setSelectedIndex(savedSelectedIndex ? parseInt(savedSelectedIndex) : 0);
      } catch (error) {
        console.error("Failed to load data", error);
      }
    };

    loadData();
  }, []);  // Empty dependency array ensures it only runs once

  useEffect(() => {
    // Ensure the selected index is valid and the bank savings are not null
    if (bankSavings[selectedIndex] !== null && bankSavings[selectedIndex] !== undefined) {
      setDepositAmount(bankSavings[selectedIndex].toString());
    } else {
      setDepositAmount("0"); // Default to 0 if savings are invalid
    }

    // Update selected bank name
    setSelected(data[selectedIndex]?.value || "");

    // Recalculate the sum of all bank savings
    const total = bankSavings.reduce((acc, curr) => acc + curr, 0);
    setSumSaving(total);

  }, [selectedIndex, bankSavings]);  // Re-run this effect whenever selectedIndex or bankSavings changes

  const handleModify = () => {
    const updatedSavings = [...bankSavings];
    
    const parsedAmount = parseFloat(depositAmount);
    if (isNaN(parsedAmount) || parsedAmount < 0) {
      Alert.alert("錯誤", "請輸入有效的存款金額");
      return; // Exit if the deposit amount is invalid
    }

    updatedSavings[selectedIndex] = parsedAmount;  // Update the deposit amount for selected bank
    setBankSavings(updatedSavings);

    // Show an alert with the updated bank and deposit amount
    Alert.alert(`修改成功`, `銀行: ${data[selectedIndex].value}\n存款金額: ${depositAmount}`);
  };

  const handleSave = async () => {
    try {
      await AsyncStorage.setItem('bankSavings', JSON.stringify(bankSavings));  // Save the bank savings to AsyncStorage
      await AsyncStorage.setItem('selectedIndex', selectedIndex.toString());  // Save the selected bank index to AsyncStorage
      Alert.alert("存檔成功", "已將存款資料儲存至設備");
    } catch (error) {
      Alert.alert("存檔失敗", "無法儲存資料");
      console.error("Failed to save data", error);
    }
  };

  const handleBankSelection = (val) => {
    setSelected(val);
    const index = data.findIndex(item => item.value === val);  // Get the selected bank index
    setSelectedIndex(index);
  };

  return (
    <SafeAreaProvider>
      <SafeAreaView style={styles.container} edges={['top']}>
        <ScrollView style={styles.scrollView}>
          <Text style={styles.text}>金融機構：</Text>
          <SelectList 
            setSelected={handleBankSelection}  // Handle bank selection
            data={data} 
            save="value"
            defaultOption={data[selectedIndex].value}  // Set default value based on selected index
          />
          <Text style={styles.text}>存款金額：</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            value={depositAmount}
            onChangeText={(text) => setDepositAmount(text)}  // Update deposit amount as user types
            keyboardType="numeric"  // Ensure only numeric input
          />
          <Text style={styles.text}>累積存款：</Text>
          <TextInput
            style={styles.textInput}
            placeholder="0"
            value={sumSaving.toString()}
            editable={false}  // Disable the TextInput for cumulative savings
          />
          <View style={styles.buttonRow}>
            <View style={styles.buttonContainer}>
              <Button
                title="修改"
                onPress={handleModify}  // Trigger saving update
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="存檔"
                onPress={handleSave}  // Trigger save to AsyncStorage
              />
            </View>
            <View style={styles.buttonContainer}>
              <Button
                title="彩蛋"
                onPress={() => Alert.alert('ReactNative_鋒兄三七_銀行', 
                  '委任第五職等\n簡任第十二職等\n第12屆臺北市長\n第23任總統\n中央銀行鋒兄分行')}
              />
            </View>
          </View>
        </ScrollView>
      </SafeAreaView>
    </SafeAreaProvider>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    paddingTop: StatusBar.currentHeight,
  },
  scrollView: {
    backgroundColor: 'lightblue',
  },
  text: {
    fontSize: 42,
    padding: 12,
  },
  textInput: {
    fontSize: 36,
    padding: 10,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: 'gray',
    borderRadius: 5,
  },
  buttonRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  buttonContainer: {
    flex: 1,
    marginHorizontal: 5,
  },
});

export default App;
