// 4th tab. Community tab is kinda like the Twitter for the app where users can make posts and share news/information
// Currently, no REST API is involved with Community so everything is purely hardcoded here
import React, { useState } from 'react';
import { StyleSheet, Text, View, TouchableOpacity, ScrollView, TextInput, Image } from 'react-native';
import { MaterialIcons, Feather, FontAwesome } from '@expo/vector-icons';
import newpost from '../../assets/img/add_post.png';
import ReadPostModal from '../components/ReadPostModal';
import CreatePostModal from '../components/CreatePostModal';

const Community = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPost, setSelectedPost] = useState(null);
  const [postModalVisible, setPostModalVisible] = useState(false);
  const [createPostModalVisible, setCreatePostModalVisible] = useState(false);
  const [posts, setPosts] = useState([ // Hardcoded Sample posts for now (As no link, its all temporary, need to be saved to DB)
    { 
      id: 1,
      username: 'TraderPro',
      date: 'June 15, 2023',
      title: 'Market Analysis Update',
      content: 'The recent market trends suggest a bullish pattern forming in tech stocks. We might see a 10-15% increase in the coming weeks.',
      views: 124,
      likes: 56,
      comments: 23,
      liked: false
    },
    { 
      id: 2,
      username: 'DataGuru',
      date: 'June 14, 2023',
      title: 'New Dataset Available',
      content: 'Just uploaded a comprehensive dataset of cryptocurrency prices from 2015-2023. Perfect for backtesting strategies!',
      views: 89,
      likes: 42,
      comments: 12,
      liked: false
    },
    { 
      id: 3,
      username: 'QuantQueen',
      date: 'June 12, 2023',
      title: 'Algorithm Performance',
      content: 'My new trading algorithm has shown 23% returns in backtesting. Looking forward to testing it live next week. Any suggestions for improvement?',
      views: 215,
      likes: 98,
      comments: 37,
      liked: false
    },
    { 
      id: 4,
      username: 'MarketWatcher',
      date: 'June 10, 2023',
      title: 'Economic Indicators',
      content: 'The latest employment numbers suggest we might see rate hikes sooner than expected. How is everyone adjusting their portfolios?',
      views: 176,
      likes: 73,
      comments: 29,
      liked: false
    }
  ]);

  const handleCreatePost = (content) => {
    const newPost = {
      id: posts.length + 1,
      username: 'CurrentUser',
      date: new Date().toLocaleDateString('en-US', { 
        year: 'numeric', 
        month: 'long', 
        day: 'numeric' 
      }),
      title: 'New Post',
      content: content,
      views: 0,
      likes: 0,
      comments: 0,
      liked: false
    };
    
    setPosts([newPost, ...posts]);
  };

  const handleSearch = (query) => {
    setSearchQuery(query);
  };

  const handlePostPress = (post) => {
    setSelectedPost(post);
    setPostModalVisible(true);
    
    setPosts(posts.map(p =>  // Views + 1 each time
      p.id === post.id ? {...p, views: p.views + 1} : p
    ));
  };

  const handleLike = () => {
    if (!selectedPost) return;
    
    setPosts(posts.map(post => 
      post.id === selectedPost.id 
        ? {...post, likes: post.liked ? post.likes - 1 : post.likes + 1, liked: !post.liked}
        : post
    ));
    
    setSelectedPost(prev => ({
      ...prev,
      likes: prev.liked ? prev.likes - 1 : prev.likes + 1,
      liked: !prev.liked
    }));
  };

  const filteredPosts = posts.filter(post =>
    post.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
    post.username.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <View style={styles.container}>
      <View style={styles.searchContainer}>
        <MaterialIcons name="search" size={24} color="white" style={styles.searchIcon} />
        <TextInput
          style={styles.searchInput}
          placeholder="Search"
          placeholderTextColor="#aaa"
          value={searchQuery}
          onChangeText={handleSearch}
        />
      </View>

      <ScrollView 
        style={styles.scrollContainer}
        contentContainerStyle={styles.scrollContentContainer}
      >
        {filteredPosts.map((post) => (
          <TouchableOpacity 
            key={post.id} 
            style={styles.postBox}
            onPress={() => handlePostPress(post)}
          >
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

            <Text style={styles.postTitle}>{post.title}</Text>
            <Text style={styles.postContent}>{post.content}</Text>

            <View style={styles.bottomRow}>
              <TextInput
                style={styles.commentInput}
                placeholder="Write a comment..."
                placeholderTextColor="#aaa"
                editable={false}
              />
              <View style={styles.statsContainer}>
                <View style={styles.statItem}>
                  <Feather name="eye" size={16} color="white" />
                  <Text style={styles.statText}>{post.views.toString().padStart(2, '0')}</Text>
                </View>
                <View style={[styles.statItem, { marginLeft: 15 }]}>
                  <FontAwesome name={post.liked ? "heart" : "heart-o"} size={16} color={post.liked ? "red" : "white"} />
                  <Text style={styles.statText}>{post.likes.toString().padStart(2, '0')}</Text>
                </View>
              </View>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>

      <TouchableOpacity 
        style={styles.addButton}
        onPress={() => setCreatePostModalVisible(true)}
      >
        <Image source={newpost} style={styles.addButtonIcon} />
      </TouchableOpacity>

      <ReadPostModal
        visible={postModalVisible}
        post={selectedPost}
        onClose={() => setPostModalVisible(false)}
        onLike={handleLike}
      />

      <CreatePostModal
        visible={createPostModalVisible}
        onClose={() => setCreatePostModalVisible(false)}
        onPost={handleCreatePost}
      />
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
    marginRight: 5, 
    marginBottom: 10, 
    justifyContent: 'center',
    alignItems: 'center',
  },
  addButtonIcon: {
    width: 60,
    height: 60,
  },
});

export default Community;