// 
import React, { useState } from 'react';
import { Modal, View, Text, TouchableOpacity, StyleSheet, TextInput, Keyboard } from 'react-native';
import { Feather, MaterialIcons, Ionicons } from '@expo/vector-icons';

const CreatePostModal = ({ visible, onClose, onPost }) => {
  const [postContent, setPostContent] = useState('');
  const [replySetting, setReplySetting] = useState('Everyone');

  const handlePost = () => {
    if (postContent.trim()) {
      onPost(postContent);
      setPostContent('');
      Keyboard.dismiss();
      onClose();
    }
  };

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
          <TouchableOpacity 
            style={[styles.postButton, !postContent.trim() && styles.disabledButton]}
            onPress={handlePost}
            disabled={!postContent.trim()}
          >
            <Text style={styles.postButtonText}>Post</Text>
          </TouchableOpacity>
        </View>

        <View style={styles.postContainer}>
          <View style={styles.userContainer}>
            <Ionicons name="person-circle-outline" size={40} color="#555" />
            <View style={styles.userInfo}>
              <Text style={styles.userName}>You</Text>
              <Text style={styles.postDate}>Posting now</Text>
            </View>
          </View>
          
          <TextInput
            style={styles.postInput}
            placeholder="What's on your mind?"
            placeholderTextColor="#aaa"
            multiline
            autoFocus
            value={postContent}
            onChangeText={setPostContent}
          />

          <TouchableOpacity style={styles.addPhoto}>
            <MaterialIcons name="add-a-photo" size={20} color="#1DA1F2" />
            <Text style={styles.addPhotoText}>Add photo</Text>
          </TouchableOpacity>
        </View>

        <TouchableOpacity style={styles.replySettings}>
          <MaterialIcons name="people-outline" size={20} color="#1DA1F2" />
          <Text style={styles.replySettingsText}>{replySetting} can reply</Text>
        </TouchableOpacity>
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
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 20,
    marginTop: 40
  },
  postButton: {
    backgroundColor: '#1DA1F2',
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
  },
  disabledButton: {
    backgroundColor: '#0A4D80',
  },
  postButtonText: {
    color: 'white',
    fontWeight: 'bold',
    fontSize: 16,
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
  userInfo: {
    marginLeft: 10,
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
  postInput: {
    color: 'white',
    fontSize: 16,
    lineHeight: 22,
    maxHeight: 200,
    paddingTop: 10,
    textAlignVertical: 'top',
  },
  addPhoto: {
    flexDirection: 'row',
    alignItems: 'center',
    marginTop: 10,
  },
  addPhotoText: {
    color: '#1DA1F2',
    marginLeft: 10,
    fontSize: 14,
  },
  replySettings: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    backgroundColor: '#222',
    borderRadius: 10,
  },
  replySettingsText: {
    color: '#1DA1F2',
    marginLeft: 10,
    fontSize: 14,
  },
});

export default CreatePostModal;