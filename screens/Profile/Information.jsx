// router.push({
//     pathname: '/profile_update',
//     params: { 
//         updatedName: 'John Doe',
//         updatedEmail: 'john@example.com'
//     }
// });
// DO WE WANT TO CONSIDER THIS TO SHOW UPDATED DATA IN THE CONFIRMATION SCREEN 

import React, { useState } from 'react';
import { StyleSheet, Text, View, ScrollView, TextInput, TouchableOpacity, Dimensions } from "react-native";
import { useRouter } from 'expo-router';
import { Picker } from '@react-native-picker/picker';
import DateTimePicker from '@react-native-community/datetimepicker';

const { width } = Dimensions.get('window');

const Information = () => {
    const router = useRouter();
    const [date, setDate] = useState(new Date());
    const [showDatePicker, setShowDatePicker] = useState(false);
    const [selectedLanguage, setSelectedLanguage] = useState(null);
    const [selectedCurrency, setSelectedCurrency] = useState(null);
    const [selectedIncome, setSelectedIncome] = useState(null);
    const [selectedEducation, setSelectedEducation] = useState(null);
    const [formData, setFormData] = useState({
        userName: '',
        password: '',
        legalName: '',
        email: '',
        contactNo: '',
        address: '',
        nationality: ''
    });

    // Sample data for dropdowns
    const languages = [
        { label: "English", value: "english" },
        { label: "中文 (繁體)", value: "chinese_traditional" },
        { label: "中文 (简体)", value: "chinese_simplified" },
        { label: "日本語", value: "japanese" },
        { label: "한국어", value: "korean" },
        { label: "起こる", value: "other" },
    ];

    const currencies = [
        { label: "AUD", value: "AUD" },
        { label: "CAD", value: "CAD" },
        { label: "EUR", value: "EUR" },
        { label: "GBP", value: "GBP" },
        { label: "HKD", value: "HKD" },
        { label: "INR", value: "INR" },
        { label: "JPY", value: "JPY" },
        { label: "KRW", value: "KRW" },
        { label: "NZD", value: "NZD" },
        { label: "USD", value: "USD" },
    ];

    const income = [
        {label: "< 50k (USD)", value: "< 50k (USD)"},
        {label: "50k - 100k (USD)", value: "50k - 100k (USD)"},
        {label: "100k - 500k (USD)", value: "100k - 500k (USD)"},
        {label: "> 500k (USD)", value: "> 500k (USD)"},
    ];

    const education = [
        {label: "High School", value: "High School"},
        {label: "Associate Diploma", value: "Associate Diploma"},
        {label: "Bachelor Degree", value: "Bachelor Degree"},
        {label: "Master Degree", value: "Master Degree"},
        {label: "PhD", value: "PhD"},
    ];

    const formatDate = (date) => {
        if (!date) return "dd/mm/yyyy";
        const day = date.getDate().toString().padStart(2, '0');
        const month = (date.getMonth() + 1).toString().padStart(2, '0');
        const year = date.getFullYear();
        return `${day}/${month}/${year}`;
    };

    const onDateChange = (event, selectedDate) => {
        setShowDatePicker(false);
        if (selectedDate) {
            setDate(selectedDate);
        }
    };

    const handleInputChange = (field, value) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleUpdateProfile = () => {
        router.push({
            pathname: '/Profile/Update',
            params: {
                updatedData: JSON.stringify({
                    ...formData,
                    birthday: formatDate(date),
                    preferredLanguage: selectedLanguage,
                    preferredCurrency: selectedCurrency,
                    annualIncome: selectedIncome,
                    educationLevel: selectedEducation
                })
            }
        });
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.contentContainer}>
            {/* Profile Header */}
            <Text style={styles.header}>Profile</Text>
            
            {/* Profile Picture */}
            <View style={styles.profilePictureContainer}>
                <View style={styles.profilePicture} />
            </View>

            {/* SYSTEM INFO Section */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.sectionTitle}>SYSTEM INFO</Text>
                    <View style={styles.dividerLine} />
                </View>

                <ProfileField label="User ID:" input={<TextInput style={styles.inputField} />} />
                <ProfileField 
                    label="User Name:" 
                    input={
                        <TextInput 
                            style={styles.inputField} 
                            value={formData.userName}
                            onChangeText={(text) => handleInputChange('userName', text)}
                        />
                    } 
                />
                <ProfileField 
                    label="Password:" 
                    input={
                        <TextInput 
                            style={styles.inputField} 
                            secureTextEntry 
                            value={formData.password}
                            onChangeText={(text) => handleInputChange('password', text)}
                        />
                    } 
                />
            
                
                <ProfileField 
                    label="Preferred Language:" 
                    input={
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedLanguage}
                                onValueChange={(itemValue) => setSelectedLanguage(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="black"
                                mode="dropdown"
                            >
                                <Picker.Item label="Select language" value={null} />
                                {languages.map((lang) => (
                                    <Picker.Item key={lang.value} label={lang.label} value={lang.value} />
                                ))}
                            </Picker>
                            {selectedLanguage && (
                                <Text style={styles.pickerSelectedText}>
                                    {languages.find(lang => lang.value === selectedLanguage)?.label}
                                </Text>
                            )}
                        </View>
                    }
                />
                
                <ProfileField 
                    label="Preferred Currency:" 
                    input={
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedCurrency}
                                onValueChange={(itemValue) => setSelectedCurrency(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="black"
                                mode="dropdown"
                            >
                                <Picker.Item label="Select currency" value={null} />
                                {currencies.map((curr) => (
                                    <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
                                ))}
                            </Picker>
                            {selectedCurrency && (
                                <Text style={styles.pickerSelectedText}>
                                    {currencies.find(curr => curr.value === selectedCurrency)?.label}
                                </Text>
                            )}
                        </View>
                    }
                />
                
                <ProfileField 
                    label="Referral Link:" 
                    input={
                        <View style={styles.actionFieldRow}>
                            <TextInput style={[styles.inputField, styles.halfWidthField]} />
                            <TouchableOpacity style={[styles.actionButton, styles.detachedButton]}>
                                <Text style={styles.actionButtonText}>Create</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
                
                <ProfileField 
                    label="REST API Key:" 
                    input={
                        <View style={styles.actionFieldRow}>
                            <TextInput style={[styles.inputField, styles.halfWidthField]} />
                            <TouchableOpacity style={[styles.actionButton, styles.detachedButton]}>
                                <Text style={styles.actionButtonText}>Generate</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
                
                <ProfileField 
                    label="Telegram Chat ID:" 
                    input={
                        <View style={styles.actionFieldRow}>
                            <TextInput style={[styles.inputField, styles.halfWidthField]} />
                            <TouchableOpacity style={[styles.actionButton, styles.detachedButton]}>
                                <Text style={styles.actionButtonText}>Connect</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
                
                <ProfileField 
                    label="OTP Authenticator:" 
                    input={
                        <View style={styles.actionFieldRow}>
                            <TextInput style={[styles.inputField, styles.halfWidthField]} />
                            <TouchableOpacity style={[styles.actionButton, styles.detachedButton]}>
                                <Text style={styles.actionButtonText}>Set</Text>
                            </TouchableOpacity>
                        </View>
                    }
                />
            </View>

            {/* Personal Info Section */}
            <View style={styles.sectionContainer}>
                <View style={styles.sectionHeader}>
                    <View style={styles.dividerLine} />
                    <Text style={styles.sectionTitle}>Personal Info</Text>
                    <View style={styles.dividerLine} />
                </View>

                {/* <ProfileField label="Legal Name:" input={<TextInput style={styles.inputField} />} />
                <ProfileField label="Email:" input={<TextInput style={styles.inputField} />} /> */}
                <ProfileField 
                    label="Legal Name:" 
                    input={
                        <TextInput 
                            style={styles.inputField} 
                            value={formData.legalName}
                            onChangeText={(text) => handleInputChange('legalName', text)}
                        />
                    } 
                />
            
                <ProfileField 
                    label="Email:" 
                    input={
                        <TextInput 
                            style={styles.inputField} 
                            value={formData.email}
                            onChangeText={(text) => handleInputChange('email', text)}
                            keyboardType="email-address"
                        />
                    } 
                />
                <ProfileField label="Contact No:" input={<TextInput style={styles.inputField} />} />
                <ProfileField label="Address:" input={<TextInput style={styles.inputField} />} />
                
                <ProfileField 
                    label="Birthday:" 
                    input={
                        <View style={styles.dateInputContainer}>
                            <TouchableOpacity 
                                style={styles.inputField} 
                                onPress={() => setShowDatePicker(true)}
                            >
                                <Text style={styles.dateText}>{formatDate(date)}</Text>
                            </TouchableOpacity>
                            {showDatePicker && (
                                <DateTimePicker
                                    value={date}
                                    mode="date"
                                    display="default"
                                    onChange={onDateChange}
                                />
                            )}
                        </View>
                    }
                />

                
                <ProfileField 
                    label="Annual Income:" 
                    input={
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedIncome}
                                onValueChange={(itemValue) => setSelectedIncome(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="black"
                                mode="dropdown"
                            >
                                <Picker.Item label="Select income" value={null} />
                                {income.map((curr) => (
                                    <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
                                ))}
                            </Picker>
                            {selectedIncome && (
                                <Text style={styles.pickerSelectedText}>
                                    {income.find(curr => curr.value === selectedIncome)?.label}
                                </Text>
                            )}
                        </View>
                    }
                />   
                       
                <ProfileField 
                    label="Education Level:" 
                    input={
                        <View style={styles.pickerContainer}>
                            <Picker
                                selectedValue={selectedEducation}
                                onValueChange={(itemValue) => setSelectedEducation(itemValue)}
                                style={styles.picker}
                                dropdownIconColor="black"
                                mode="dropdown"
                            >
                                <Picker.Item label="Select education" value={null} />
                                {education.map((curr) => (
                                    <Picker.Item key={curr.value} label={curr.label} value={curr.value} />
                                ))}
                            </Picker>
                            {selectedEducation && (
                                <Text style={styles.pickerSelectedText}>
                                    {education.find(curr => curr.value === selectedEducation)?.label}
                                </Text>
                            )}
                        </View>
                    }
                />  
                
                <ProfileField label="Nationality:" input={<TextInput style={styles.inputField} />} />
                {/* How to do this part. Just query from DB */}
            </View>

            {/* Update Button */}
            <TouchableOpacity 
                style={styles.updateButton} 
                onPress={handleUpdateProfile}
            >
                <Text style={styles.updateButtonText}>Update</Text>
            </TouchableOpacity>
        </ScrollView>
    );
};

const ProfileField = ({ label, input }) => (
    <View style={styles.fieldContainer}>
        <Text style={styles.fieldLabel}>{label}</Text>
        {input}
    </View>
);

const styles = StyleSheet.create({
    container:{
        flex: 1,
        backgroundColor: 'black',
    },
    contentContainer: {
        paddingHorizontal: 20,
        paddingBottom: 40,
    },
    header: {
        fontWeight: 'bold',
        fontSize: 20,
        color: 'white',
        marginTop: 40,
        marginBottom: 20,
        textAlign: 'left',
    },
    profilePictureContainer: {
        alignItems: 'center',
        marginBottom: 30,
    },
    profilePicture: {
        width: 100,
        height: 100,
        borderRadius: 50,
        backgroundColor: 'gray',
    },
    sectionContainer: {
        marginBottom: 20,
    },
    sectionHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    sectionTitle: {
        color: 'white',
        fontSize: 16,
        fontWeight: 'bold',
        marginHorizontal: 8,
    },
    dividerLine: {
        flex: 1,
        height: 1,
        backgroundColor: 'gray',
    },
    fieldContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 12,
    },
    fieldLabel: {
        color: 'white',
        width: '35%',
        fontSize: 12,
    },
    inputField: {
        flex: 1,
        height: 40, // Increased from 32 to 40 for better text visibility
        backgroundColor: 'white',
        borderRadius: 16,
        paddingHorizontal: 12,
        justifyContent: 'center',
        fontSize: 14, // Increased from 12 to 14
        paddingVertical: 8, // Added vertical padding
    },
    dateText: {
        color: 'black',
        fontSize: 14,
    },
    dateInputContainer: {
        flex: 1,  // This makes it take up remaining space
    },
    pickerContainer: {
        flex: 1,
        backgroundColor: 'white',
        borderRadius: 16,
        height: 40, // Increased from 32 to 40
        justifyContent: 'center',
        overflow: 'hidden',
        position: 'relative',
    },
    picker: {
        width: '100%',
        height: '100%',
        color: 'transparent', // Make picker text transparent
        position: 'absolute',
    },
    pickerSelectedText: {
        position: 'absolute',
        left: 12,
        right: 12,
        color: 'black',
        fontSize: 14,
    },
    actionFieldRow: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
    },
    halfWidthField: {
        width: '50%',
        marginRight: 8,
    },
    detachedButton: {
        width: '40%',
        borderRadius: 16,
        height: 40, // Increased from 32 to 40
    },
    actionButton: {
        backgroundColor: '#37B3E9',
        paddingHorizontal: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    actionButtonText: {
        color: 'white',
        fontSize: 12,
    },
    updateButton: {
        alignSelf: 'flex-end',
        backgroundColor: '#37B3E9',
        paddingVertical: 8,
        paddingHorizontal: 20,
        borderRadius: 16,
        marginTop: 16,
    },
    updateButtonText: {
        color: 'white',
        fontSize: 14,
    },
});

export default Information;
