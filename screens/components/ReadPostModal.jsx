import React from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Image } from 'react-native';
import { Feather, FontAwesome } from '@expo/vector-icons';

const ReadPostModal = ({ visible, post, onClose, onLike }) => {
  if (!post) return null;

  return (
    <Modal
      animationType="slide"
      transparent={false}
      visible={visible}
      onRequestClose={onClose}
    >
      <View style={styles.modalContainer}>
        <View style={styles.header}>
          <TouchableOpacity onPress={onClose}>
            <Feather name="x" size={24} color="white" />
          </TouchableOpacity>
        </View>

        <View style={styles.postContainer}>
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

          <View style={styles.statsContainer}>
            <TouchableOpacity style={styles.statItem} onPress={onLike}>
              <FontAwesome name={post.liked ? "heart" : "heart-o"} size={20} color={post.liked ? "red" : "white"} />
              <Text style={styles.statText}>{post.likes.toString().padStart(2, '0')}</Text>
            </TouchableOpacity>
            <View style={styles.statItem}>
              <Feather name="eye" size={20} color="white" />
              <Text style={styles.statText}>{post.views.toString().padStart(2, '0')}</Text>
            </View>
          </View>
        </View>

        <View style={styles.commentsContainer}>
          <Text style={styles.commentsTitle}>Comments ({post.comments})</Text>
          <View style={styles.commentItem}>
            <Text style={styles.commentText}>Sample comment: This is really helpful!</Text>
          </View>
        </View>

        <View style={styles.addCommentContainer}>
          <TextInput
            style={styles.commentInput}
            placeholder="Write a comment..."
            placeholderTextColor="#aaa"
          />
          <TouchableOpacity style={styles.sendButton}>
            <Feather name="send" size={20} color="white" />
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
};

const styles = StyleSheet.create({
  modalContainer: {
    flex: 1,
    backgroundColor: 'black',
    padding: 20,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginBottom: 20,
    marginTop: 10, 
  },
  postContainer: {
    backgroundColor: '#333',
    padding: 20,
    borderRadius: 10,
    marginBottom: 20,
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
  statsContainer: {
    flexDirection: 'row',
    marginTop: 10,
  },
  statItem: {
    flexDirection: 'row',
    alignItems: 'center',
    marginRight: 20,
  },
  statText: {
    color: 'white',
    fontSize: 14,
    marginLeft: 5,
  },
  commentsContainer: {
    flex: 1,
  },
  commentsTitle: {
    color: 'white',
    fontSize: 16,
    fontWeight: 'bold',
    marginBottom: 10,
  },
  commentItem: {
    backgroundColor: '#222',
    padding: 10,
    borderRadius: 5,
    marginBottom: 10,
  },
  commentText: {
    color: 'white',
  },
  addCommentContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  commentInput: {
    flex: 1,
    backgroundColor: '#222',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 10,
    color: 'white',
    fontSize: 14,
    marginRight: 10,
  },
  sendButton: {
    padding: 10,
  },
});

export default ReadPostModal;