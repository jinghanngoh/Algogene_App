import React from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image, Dimensions } from 'react-native';
import { MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import newpost from '../../assets/img/add_post.png';

const Community = () => {
  const posts = [
    { 
      id: 1,
      username: 'TraderPro',
      date: 'June 15, 2023',
      title: 'Market Analysis Update',
      content: 'The recent market trends suggest a bullish pattern forming in tech stocks. We might see a 10-15% increase in the coming weeks.',
      views: 124,
      likes: 56,
      comments: 23
    },
    { 
      id: 2,
      username: 'DataGuru',
      date: 'June 14, 2023',
      title: 'New Dataset Available',
      content: 'Just uploaded a comprehensive dataset of cryptocurrency prices from 2015-2023. Perfect for backtesting strategies!',
      views: 89,
      likes: 42,
      comments: 12
    },
    { 
      id: 3,
      username: 'QuantQueen',
      date: 'June 12, 2023',
      title: 'Algorithm Performance',
      content: 'My new trading algorithm has shown 23% returns in backtesting. Looking forward to testing it live next week. Any suggestions for improvement?',
      views: 215,
      likes: 98,
      comments: 37
    },
    { 
      id: 4,
      username: 'MarketWatcher',
      date: 'June 10, 2023',
      title: 'Economic Indicators',
      content: 'The latest employment numbers suggest we might see rate hikes sooner than expected. How is everyone adjusting their portfolios?',
      views: 176,
      likes: 73,
      comments: 29
    }
  ];

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="white" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#aaa"
        />
      </View>

      {/* Posts */}
      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {posts.map((post) => (
          <View key={post.id} style={styles.postBox}>
            {/* User info section */}
            <View style={styles.userContainer}>
              <Image
                source={require('../../assets/img/placeholder.png')}
                style={styles.userIcon}
              />
              <View>
                <Text style={styles.userName}>{post.username}</Text>
                <Text style={styles.postDate}>posted on {post.date}</Text>
              </View>
            </View>

            {/* Post content */}
            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            {/* Comment and stats row */}
            <View style={styles.bottomRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#aaa"
              />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Feather name="eye" size={16} color="white" />
                  <Text style={styles.statText}>{post.views.toString().padStart(2, '0')}</Text>
                </View>
                <View style={[styles.statItem, { marginLeft: 15 }]}>
                  <FontAwesome name="heart-o" size={16} color="white" />
                  <Text style={styles.statText}>{post.likes.toString().padStart(2, '0')}</Text>
                </View>
              </View>
            </View>
          </View>
        ))}
      </ScrollView>

      <TouchableOpacity style={styles.addButton}>
        <Image source={newpost} style={styles.addButtonIcon} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: 'black',
    paddingTop: 50,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#333',
    borderRadius: 25,
    paddingHorizontal: 15,
    marginHorizontal: 15,
    marginBottom: 20,
    height: 50,
  },
  searchIcon: {
    marginRight: 10,
  },
  searchInput: {
    flex: 1,
    color: 'white',
    fontSize: 16,
  },
  scrollContainer: {
    flex: 1,
    width: '100%',
  },
  scrollContentContainer: {
    paddingHorizontal: 15,
    paddingBottom: 20,
  },
  postBox: {
    backgroundColor: '#333',
    marginBottom: 20,
    padding: 20,
    borderRadius: 10,
    width: '100%',
  },
  userContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 15,
  },
  userIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
  },
  postDate: {
    color: '#aaa',
    fontSize: 12,
    marginTop: 2,
  },
  postTitle: {
    color: 'white',
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  postContent: {
    color: 'white',
    fontSize: 14,
    lineHeight: 20,
    marginBottom: 15,
  },
  bottomRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    marginRight: 15,
  },
  statsContainer: {
    flexDirection: 'row',
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  statText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  addButton: {
    position: 'absolute',
    bottom: 20,
    right: 20,
    width: 50,
    height: 50,
    borderRadius: 25,
    marginRight: 10, 
    marginBottom: 10, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    width: 70,
    height: 70,
  },
});

export default Community;