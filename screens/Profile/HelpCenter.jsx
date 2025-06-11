// screens/(tabs)/profile/HelpCenter.jsx
import { useState } from 'react';
import { View, Text, TouchableOpacity, StyleSheet, ScrollView, TextInput } from 'react-native';
import { useRouter } from 'expo-router';
import { Ionicons, MaterialIcons } from '@expo/vector-icons';

const HelpCenter = () => {
  const router = useRouter();
  const [activeCategory, setActiveCategory] = useState('technical');
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    { id: 'account', name: 'Account', icon: 'person' },
    { id: 'features', name: 'APP Features', icon: 'apps' },
    { id: 'technical', name: 'Technical', icon: 'build' },
  ];

  const faqs = {
    account: [
      { question: 'How do I reset my password?', answer: 'Go to Settings > Account > Reset Password.' },
      { question: 'How to update email?', answer: 'Visit your profile settings to change your email.' },
    ],
    features: [
      { question: 'How to use the portfolio tracker?', answer: 'Navigate to Portfolio tab and connect your wallet.' },
      { question: 'How to invite friends?', answer: 'Go to Profile > Invite Friends to share your referral link.' },
    ],
    technical: [
      { question: 'App crashes on startup', answer: 'Try clearing cache or reinstalling the app.' },
      { question: 'Connection issues', answer: 'Check your internet connection and try again.' },
      { question: 'Notification problems', answer: 'Ensure notifications are enabled in device settings.' },
    ],
  };

  const filteredFAQs = faqs[activeCategory].filter(faq => 
    faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
    faq.answer.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <ScrollView contentContainerStyle={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={20} color="#999" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search help center..."
          value={searchQuery}
          onChangeText={setSearchQuery}
          placeholderTextColor="#999"
        />
      </View>

      {/* FAQ Header */}
      <Text style={styles.sectionHeader}>Frequently Asked Questions</Text>

      {/* Category Buttons - Vertical */}
      <View style={styles.categoryContainer}>
        {categories.map((category) => (
          <TouchableOpacity
            key={category.id}
            style={[
              styles.categoryButton,
              activeCategory === category.id && styles.activeCategoryButton
            ]}
            onPress={() => setActiveCategory(category.id)}
          >
            <Ionicons 
              name={category.icon} 
              size={20} 
              color={activeCategory === category.id ? 'white' : '#333'} 
            />
            <Text style={[
              styles.categoryText,
              activeCategory === category.id && styles.activeCategoryText
            ]}>
              {category.name}
            </Text>
          </TouchableOpacity>
        ))}
      </View>

      {/* FAQ List */}
      <View style={styles.faqList}>
        {filteredFAQs.length > 0 ? (
          filteredFAQs.map((faq, index) => (
            <View key={index} style={styles.faqItem}>
              <Text style={styles.question}>{faq.question}</Text>
              <Text style={styles.answer}>{faq.answer}</Text>
              {index < filteredFAQs.length - 1 && <View style={styles.divider} />}
            </View>
          ))
        ) : (
          <Text style={styles.noResults}>No results found</Text>
        )}
      </View>

      {/* Back Button */}
      <TouchableOpacity 
        style={styles.backButton}
        onPress={() => router.back()}
      >
        <Text style={styles.backButtonText}>Back to Profile</Text>
      </TouchableOpacity>
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: {
    flexGrow: 1,
    padding: 20,
    backgroundColor: '#000',
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    height: '100%',
  },
  sectionHeader: {
    color: 'white',
    fontSize: 22,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  categoryContainer: {
    gap: 12,
    marginBottom: 25,
  },
  categoryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#1E1E1E',
    borderRadius: 10,
    paddingVertical: 16,
    paddingHorizontal: 20,
    gap: 12,
  },
  activeCategoryButton: {
    backgroundColor: '#4FC3F7', 
  },
  categoryText: {
    color: '#999',
    fontSize: 16,
    fontWeight: '500',
  },
  activeCategoryText: {
    color: 'white',
  },
  faqList: {
    marginBottom: 30,
  },
  faqItem: {
    paddingVertical: 15,
  },
  question: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
    marginBottom: 8,
  },
  answer: {
    color: '#CCCCCC',
    fontSize: 14,
    lineHeight: 20,
  },
  divider: {
    height: 1,
    backgroundColor: '#333',
    marginVertical: 15,
  },
  noResults: {
    color: '#999',
    textAlign: 'center',
    marginTop: 20,
  },
  backButton: {
    marginTop: 20,
  },
  backButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '500',
  },
});

export default HelpCenter;