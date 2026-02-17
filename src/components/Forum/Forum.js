import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Forum.css";

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState({ title: "", content: "", images: [] });
  const [currentComment, setCurrentComment] = useState({});
  const [currentReply, setCurrentReply] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [editingItem, setEditingItem] = useState({ type: null, id: null, content: null });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animatingAction, setAnimatingAction] = useState(null);

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const bodyHasDark = document.body.classList.contains('dark');
      const htmlHasDark = document.documentElement.classList.contains('dark');
      const savedTheme = localStorage.getItem('theme');
      const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
      
      setIsDarkMode(bodyHasDark || htmlHasDark || savedTheme === 'dark' || (!savedTheme && prefersDark));
    };

    checkDarkMode();
    const bodyObserver = new MutationObserver(checkDarkMode);
    bodyObserver.observe(document.body, { attributes: true, attributeFilter: ['class'] });
    const htmlObserver = new MutationObserver(checkDarkMode);
    htmlObserver.observe(document.documentElement, { attributes: true, attributeFilter: ['class'] });
    window.addEventListener('storage', checkDarkMode);
    window.addEventListener('themeChange', checkDarkMode);

    return () => {
      bodyObserver.disconnect();
      htmlObserver.disconnect();
      window.removeEventListener('storage', checkDarkMode);
      window.removeEventListener('themeChange', checkDarkMode);
    };
  }, []);

  useEffect(() => {
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
      loadNotifications(user.id);
    } else {
      navigate("/login");
    }

    const savedPosts = JSON.parse(localStorage.getItem("forumPosts")) || [];
    setPosts(savedPosts);
  }, [navigate]);

  const loadNotifications = (userId) => {
    const allNotifications = JSON.parse(localStorage.getItem("forumNotifications")) || {};
    const userNotifications = allNotifications[userId] || [];
    setNotifications(userNotifications.filter(n => !n.read));
  };

  const addNotification = (recipientId, type, postId, content, commentId = null, replyId = null) => {
    if (recipientId === currentUser.id) return;

    const allNotifications = JSON.parse(localStorage.getItem("forumNotifications")) || {};
    const userNotifications = allNotifications[recipientId] || [];
    
    const notification = {
      id: Date.now(),
      type,
      postId,
      commentId,
      replyId,
      content,
      from: currentUser.username,
      timestamp: new Date().toISOString(),
      read: false
    };

    userNotifications.unshift(notification);
    allNotifications[recipientId] = userNotifications;
    localStorage.setItem("forumNotifications", JSON.stringify(allNotifications));
  };

  const markNotificationAsRead = (notificationId) => {
    const allNotifications = JSON.parse(localStorage.getItem("forumNotifications")) || {};
    const userNotifications = allNotifications[currentUser.id] || [];
    
    const updatedNotifications = userNotifications.map(n => 
      n.id === notificationId ? { ...n, read: true } : n
    );
    
    allNotifications[currentUser.id] = updatedNotifications;
    localStorage.setItem("forumNotifications", JSON.stringify(allNotifications));
    setNotifications(updatedNotifications.filter(n => !n.read));
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    const post = posts.find(p => p.id === notification.postId);
    if (post) {
      viewPost(post);
      setShowNotifications(false);
    }
  };

  const handleMultipleImageUpload = (e, type, postId = null, commentId = null) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;

    const promises = files.map(file => {
      return new Promise((resolve) => {
        const reader = new FileReader();
        reader.onload = (event) => resolve(event.target.result);
        reader.readAsDataURL(file);
      });
    });

    Promise.all(promises).then(images => {
      if (type === "post") {
        setCurrentPost({ ...currentPost, images: [...currentPost.images, ...images] });
      } else if (type === "comment" && postId) {
        const existing = currentComment[postId]?.images || [];
        setCurrentComment({ 
          ...currentComment, 
          [postId]: { ...currentComment[postId], images: [...existing, ...images] } 
        });
      } else if (type === "reply" && postId && commentId) {
        const existing = currentReply[`${postId}-${commentId}`]?.images || [];
        setCurrentReply({ 
          ...currentReply, 
          [`${postId}-${commentId}`]: { 
            ...currentReply[`${postId}-${commentId}`], 
            images: [...existing, ...images] 
          } 
        });
      }
    });
  };

  const removeImage = (type, imageIndex, postId = null, commentId = null) => {
    if (type === "post") {
      const newImages = currentPost.images.filter((_, i) => i !== imageIndex);
      setCurrentPost({ ...currentPost, images: newImages });
    } else if (type === "comment" && postId) {
      const newImages = (currentComment[postId]?.images || []).filter((_, i) => i !== imageIndex);
      setCurrentComment({ 
        ...currentComment, 
        [postId]: { ...currentComment[postId], images: newImages } 
      });
    } else if (type === "reply" && postId && commentId) {
      const newImages = (currentReply[`${postId}-${commentId}`]?.images || []).filter((_, i) => i !== imageIndex);
      setCurrentReply({ 
        ...currentReply, 
        [`${postId}-${commentId}`]: { 
          ...currentReply[`${postId}-${commentId}`], 
          images: newImages 
        } 
      });
    }
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!currentPost.title.trim() || !currentPost.content.trim()) return;

    const newPost = {
      id: Date.now(),
      title: currentPost.title,
      content: currentPost.content,
      images: currentPost.images,
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      views: [],
      likes: [],
      comments: []
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    setCurrentPost({ title: "", content: "", images: [] });
    setAnimatingAction({ type: 'create', id: newPost.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const handleCommentSubmit = (postId) => {
    if (!currentComment[postId]?.content?.trim()) return;

    const newComment = {
      id: Date.now(),
      content: currentComment[postId].content,
      images: currentComment[postId]?.images || [],
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      likes: [],
      replies: []
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        addNotification(post.userId, 'comment', postId, `commented on your post: "${post.title}"`);
        return {
          ...post,
          comments: [newComment, ...post.comments]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    setCurrentComment({ ...currentComment, [postId]: { content: "", images: [] } });
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
    
    setAnimatingAction({ type: 'comment', id: newComment.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const handleReplySubmit = (postId, commentId) => {
    if (!currentReply[`${postId}-${commentId}`]?.content?.trim()) return;

    const newReply = {
      id: Date.now(),
      content: currentReply[`${postId}-${commentId}`].content,
      images: currentReply[`${postId}-${commentId}`]?.images || [],
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      likes: []
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
            addNotification(comment.userId, 'reply', postId, `replied to your comment`, commentId, newReply.id);
            return {
              ...comment,
              replies: [...comment.replies, newReply]
            };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    setCurrentReply({ ...currentReply, [`${postId}-${commentId}`]: { content: "", images: [] } });
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
    
    setAnimatingAction({ type: 'reply', id: newReply.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const handleLike = (type, postId, commentId = null, replyId = null) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (type === "post") {
          let likesArray = Array.isArray(post.likes) ? [...post.likes] : [];
          const hasLiked = likesArray.includes(currentUser.id);
          
          if (hasLiked) {
            likesArray = likesArray.filter(id => id !== currentUser.id);
          } else {
            likesArray.push(currentUser.id);
            addNotification(post.userId, 'like', postId, `liked your post: "${post.title}"`);
          }
          
          return { ...post, likes: likesArray };
        } else if (type === "comment" && commentId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
              let likesArray = Array.isArray(comment.likes) ? [...comment.likes] : [];
              const hasLiked = likesArray.includes(currentUser.id);
              
              if (hasLiked) {
                likesArray = likesArray.filter(id => id !== currentUser.id);
              } else {
                likesArray.push(currentUser.id);
                addNotification(comment.userId, 'like', postId, `liked your comment`, commentId);
              }
              
              return { ...comment, likes: likesArray };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        } else if (type === "reply" && commentId && replyId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === replyId) {
                  let likesArray = Array.isArray(reply.likes) ? [...reply.likes] : [];
                  const hasLiked = likesArray.includes(currentUser.id);
                  
                  if (hasLiked) {
                    likesArray = likesArray.filter(id => id !== currentUser.id);
                  } else {
                    likesArray.push(currentUser.id);
                    addNotification(reply.userId, 'like', postId, `liked your reply`, commentId, replyId);
                  }
                  
                  return { ...reply, likes: likesArray };
                }
                return reply;
              });
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        }
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
  };

  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      
      if (viewMode === "detail" && activePost && activePost.id === postId) {
        setViewMode("list");
      }
      
      setAnimatingAction({ type: 'delete', id: postId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const deleteComment = (postId, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.filter(comment => comment.id !== commentId)
          };
        }
        return post;
      });

      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      
      if (viewMode === "detail" && activePost && activePost.id === postId) {
        const updatedActivePost = updatedPosts.find(p => p.id === postId);
        setActivePost(updatedActivePost);
      }
      
      setAnimatingAction({ type: 'delete', id: commentId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const deleteReply = (postId, commentId, replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      const updatedPosts = posts.map(post => {
        if (post.id === postId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
              return {
                ...comment,
                replies: comment.replies.filter(reply => reply.id !== replyId)
              };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      });

      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      
      if (viewMode === "detail" && activePost && activePost.id === postId) {
        const updatedActivePost = updatedPosts.find(p => p.id === postId);
        setActivePost(updatedActivePost);
      }
      
      setAnimatingAction({ type: 'delete', id: replyId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const startEditing = (type, id, content, postId = null, commentId = null) => {
    setEditingItem({ type, id, content, postId, commentId });
  };

  const cancelEditing = () => {
    setEditingItem({ type: null, id: null, content: null });
  };

  const saveEdit = (newContent) => {
    if (!newContent.trim()) return;

    let updatedPosts;
    
    if (editingItem.type === "post") {
      updatedPosts = posts.map(post => {
        if (post.id === editingItem.id) {
          return { ...post, content: newContent };
        }
        return post;
      });
    } else if (editingItem.type === "comment") {
      updatedPosts = posts.map(post => {
        if (post.id === editingItem.postId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === editingItem.id) {
              return { ...comment, content: newContent };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      });
    } else if (editingItem.type === "reply") {
      updatedPosts = posts.map(post => {
        if (post.id === editingItem.postId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === editingItem.commentId) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === editingItem.id) {
                  return { ...reply, content: newContent };
                }
                return reply;
              });
              return { ...comment, replies: updatedReplies };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        }
        return post;
      });
    }

    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    setEditingItem({ type: null, id: null, content: null });
    
    if (viewMode === "detail" && activePost) {
      const updatedActivePost = updatedPosts.find(p => p.id === activePost.id);
      setActivePost(updatedActivePost);
    }
    
    setAnimatingAction({ type: 'update', id: editingItem.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const viewPost = (post) => {
    let viewsArray = Array.isArray(post.views) ? [...post.views] : [];
    
    if (!viewsArray.includes(currentUser.id)) {
      viewsArray.push(currentUser.id);
      
      const updatedPosts = posts.map(p => {
        if (p.id === post.id) {
          return { 
            ...p, 
            views: viewsArray,
            likes: Array.isArray(p.likes) ? p.likes : []
          };
        }
        return p;
      });
      
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      setActivePost({ ...post, views: viewsArray });
    } else {
      setActivePost(post);
    }
    
    setViewMode("detail");
  };

  const formatDate = (timestamp) => {
    const date = new Date(timestamp);
    const day = String(date.getDate()).padStart(2, '0');
    const month = String(date.getMonth() + 1).padStart(2, '0');
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const getLikeCount = (item) => {
    if (!item) return 0;
    return Array.isArray(item.likes) ? item.likes.length : 0;
  };

  const hasUserLiked = (item) => {
    if (!item || !currentUser) return false;
    return Array.isArray(item.likes) && item.likes.includes(currentUser.id);
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className={`forum-wrapper ${isDarkMode ? 'dark' : ''}`}>
      <motion.div 
        className="forum-top-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Discussion Forum</h1>
        <div className="top-bar-right">
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            <span className="bell-icon">🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>
          <div className="top-bar-actions">
            <motion.button
              className="dashboard-return-btn"
              onClick={() => viewMode === "detail" ? setViewMode("list") : navigate("/dashboard")}
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === "detail" ? "← Back to Forum" : "← Back to Dashboard"}
            </motion.button>
            <div className="user-display">
              <span>{currentUser?.username}</span>
            </div>
          </div>
        </div>
      </motion.div>

      <AnimatePresence>
        {showNotifications && (
          <motion.div
            className="notifications-panel"
            initial={{ opacity: 0, y: -20, scale: 0.95 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.95 }}
            transition={{ duration: 0.2 }}
          >
            <h3>Notifications</h3>
            {notifications.length === 0 ? (
              <p className="no-notifications">No new notifications</p>
            ) : (
              notifications.map(notification => (
                <motion.div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                  whileHover={{ x: 5, backgroundColor: 'var(--bg-alt)' }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="notification-content">
                    <strong>{notification.from}</strong> {notification.content}
                  </div>
                  <div className="notification-time">{formatDate(notification.timestamp)}</div>
                </motion.div>
              ))
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {viewMode === "list" ? (
        <>
          <motion.div 
            className="search-wrapper"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
          >
            <input
              type="text"
              placeholder="🔍 Search posts by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-field"
            />
          </motion.div>

          <motion.div 
            className="create-post-box"
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
          >
            <h2>✍️ Create a New Post</h2>
            <form onSubmit={handlePostSubmit}>
              <input
                type="text"
                placeholder="Post Title"
                value={currentPost.title}
                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                className="title-field"
                required
              />
              <textarea
                placeholder="Share your thoughts, questions, or insights about algorithms..."
                value={currentPost.content}
                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                className="content-field"
                required
              />
              <div className="images-upload-zone">
                <label htmlFor="post-images" className="upload-label">
                  📷 Upload Images
                </label>
                <input
                  id="post-images"
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={(e) => handleMultipleImageUpload(e, "post")}
                  className="upload-input"
                />
                {currentPost.images.length > 0 && (
                  <div className="images-preview-grid">
                    {currentPost.images.map((img, idx) => (
                      <div key={idx} className="preview-item">
                        <img src={img} alt={`Preview ${idx + 1}`} />
                        <button 
                          type="button" 
                          className="remove-img-btn"
                          onClick={() => removeImage("post", idx)}
                        >
                          ✕
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>
              <motion.button 
                type="submit" 
                className="submit-post-btn"
                whileHover={{ scale: 1.02, y: -2 }}
                whileTap={{ scale: 0.98 }}
              >
                Post Question
              </motion.button>
            </form>
          </motion.div>

          <div className="posts-feed">
            <h2>Community Discussions</h2>
            {filteredPosts.length === 0 ? (
              <motion.div 
                className="no-posts"
                initial={{ opacity: 0, scale: 0.9 }}
                animate={{ opacity: 1, scale: 1 }}
              >
                No posts found. Be the first to start a discussion!
              </motion.div>
            ) : (
              filteredPosts.map((post, index) => (
                <motion.div
                  key={post.id}
                  className="post-preview-card"
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 + index * 0.05 }}
                  whileHover={{ y: -4, boxShadow: '0 12px 24px rgba(0,0,0,0.15)' }}
                >
                  <div className="preview-header">
                    <h3 onClick={() => viewPost(post)} className="preview-title">{post.title}</h3>
                  </div>
                  <div className="preview-meta">
                    <span className="meta-author">👤 {post.author}</span>
                    <span className="meta-date">📅 {formatDate(post.timestamp)}</span>
                    <span className="meta-views">👁️ {post.views?.length || 0} views</span>
                  </div>
                  <p className="preview-excerpt">{post.content.substring(0, 200)}...</p>
                  {post.images && post.images.length > 0 && (
                    <div className="preview-images">
                      <img src={post.images[0]} alt="Post preview" />
                      {post.images.length > 1 && (
                        <span className="more-images">+{post.images.length - 1}</span>
                      )}
                    </div>
                  )}
                  <div className="preview-stats">
                    <span className="stat-likes">
                      <span className={hasUserLiked(post) ? 'user-liked' : ''}>
                        {hasUserLiked(post) ? '💚' : '🤍'} {getLikeCount(post)}
                      </span>
                    </span>
                    <span className="stat-comments">💬 {post.comments.length} comments</span>
                    <motion.button 
                      onClick={() => viewPost(post)} 
                      className="view-btn"
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      View Discussion →
                    </motion.button>
                  </div>
                </motion.div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="post-full-view">
          {activePost && (
            <>
              <motion.div 
                className="post-detail-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <div className="detail-header">
                  <h2>{activePost.title}</h2>
                  {activePost.userId === currentUser.id && (
                    <div className="detail-actions">
                      <motion.button 
                        className="edit-action"
                        onClick={() => startEditing("post", activePost.id, activePost.content)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        ✏️
                      </motion.button>
                      <motion.button 
                        className="delete-action"
                        onClick={() => deletePost(activePost.id)}
                        whileHover={{ scale: 1.1 }}
                        whileTap={{ scale: 0.9 }}
                      >
                        🗑️
                      </motion.button>
                    </div>
                  )}
                </div>
                <div className="detail-meta">
                  <span>👤 {activePost.author}</span>
                  <span>📅 {formatDate(activePost.timestamp)}</span>
                  <span>👁️ {activePost.views?.length || 0} views</span>
                </div>
                
                {editingItem.type === "post" && editingItem.id === activePost.id ? (
                  <div className="edit-zone">
                    <textarea
                      value={editingItem.content}
                      onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                      className="edit-field"
                    />
                    <div className="edit-btns">
                      <motion.button 
                        onClick={() => saveEdit(editingItem.content)}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        💾 Save
                      </motion.button>
                      <motion.button 
                        onClick={cancelEditing}
                        whileHover={{ scale: 1.05 }}
                        whileTap={{ scale: 0.95 }}
                      >
                        ❌ Cancel
                      </motion.button>
                    </div>
                  </div>
                ) : (
                  <p className="detail-content">{activePost.content}</p>
                )}
                
                {activePost.images && activePost.images.length > 0 && (
                  <div className="detail-images-grid">
                    {activePost.images.map((img, idx) => (
                      <motion.img 
                        key={idx} 
                        src={img} 
                        alt={`Post image ${idx + 1}`}
                        initial={{ opacity: 0, scale: 0.9 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: idx * 0.1 }}
                      />
                    ))}
                  </div>
                )}
                
                <div className="like-section">
                  <motion.button 
                    onClick={() => handleLike("post", activePost.id)} 
                    className={`like-btn ${hasUserLiked(activePost) ? 'liked' : ''}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {hasUserLiked(activePost) ? '💚' : '🤍'} {getLikeCount(activePost)} Like{getLikeCount(activePost) !== 1 ? 's' : ''}
                  </motion.button>
                </div>
              </motion.div>

              <motion.div 
                className="comments-box"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.2 }}
              >
                <h3>💬 Comments ({activePost.comments.length})</h3>
                
                <div className="comment-form-box">
                  <textarea
                    placeholder="Share your thoughts..."
                    value={currentComment[activePost.id]?.content || ""}
                    onChange={(e) => setCurrentComment({ 
                      ...currentComment, 
                      [activePost.id]: { ...currentComment[activePost.id], content: e.target.value } 
                    })}
                    className="comment-field"
                  />
                  <div className="images-upload-zone">
                    <label htmlFor={`comment-imgs-${activePost.id}`} className="upload-label">
                      📷 Upload Images
                    </label>
                    <input
                      id={`comment-imgs-${activePost.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) => handleMultipleImageUpload(e, "comment", activePost.id)}
                      className="upload-input"
                    />
                    {currentComment[activePost.id]?.images?.length > 0 && (
                      <div className="images-preview-grid">
                        {currentComment[activePost.id].images.map((img, idx) => (
                          <div key={idx} className="preview-item">
                            <img src={img} alt={`Preview ${idx + 1}`} />
                            <button 
                              type="button" 
                              className="remove-img-btn"
                              onClick={() => removeImage("comment", idx, activePost.id)}
                            >
                              ✕
                            </button>
                          </div>
                        ))}
                      </div>
                    )}
                  </div>
                  <motion.button 
                    onClick={() => handleCommentSubmit(activePost.id)} 
                    className="submit-comment-btn"
                    whileHover={{ scale: 1.02 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    💬 Post Comment
                  </motion.button>
                </div>

                {activePost.comments.map((comment, cIdx) => (
                  <motion.div
                    key={comment.id}
                    className="comment-item"
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: cIdx * 0.05 }}
                  >
                    <div className="comment-top">
                      <div>
                        <span className="comment-author">👤 {comment.author}</span>
                        <span className="comment-date">📅 {formatDate(comment.timestamp)}</span>
                      </div>
                      {comment.userId === currentUser.id && (
                        <div className="comment-actions">
                          <motion.button 
                            onClick={() => startEditing("comment", comment.id, comment.content, activePost.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✏️
                          </motion.button>
                          <motion.button 
                            onClick={() => deleteComment(activePost.id, comment.id)}
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      )}
                    </div>
                    
                    {editingItem.type === "comment" && editingItem.id === comment.id ? (
                      <div className="edit-zone">
                        <textarea
                          value={editingItem.content}
                          onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                          className="edit-field"
                        />
                        <div className="edit-btns">
                          <motion.button onClick={() => saveEdit(editingItem.content)} whileHover={{ scale: 1.05 }}>💾 Save</motion.button>
                          <motion.button onClick={cancelEditing} whileHover={{ scale: 1.05 }}>❌ Cancel</motion.button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{comment.content}</p>
                    )}
                    
                    {comment.images && comment.images.length > 0 && (
                      <div className="comment-images-grid">
                        {comment.images.map((img, idx) => (
                          <img key={idx} src={img} alt={`Comment image ${idx + 1}`} />
                        ))}
                      </div>
                    )}
                    
                    <motion.button 
                      onClick={() => handleLike("comment", activePost.id, comment.id)} 
                      className={`like-btn-small ${hasUserLiked(comment) ? 'liked' : ''}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {hasUserLiked(comment) ? '💚' : '🤍'} {getLikeCount(comment)}
                    </motion.button>

                    <div className="replies-area">
                      <h4>↩️ Replies ({comment.replies.length})</h4>
                      
                      <div className="reply-form-box">
                        <textarea
                          placeholder="Write a reply..."
                          value={currentReply[`${activePost.id}-${comment.id}`]?.content || ""}
                          onChange={(e) => setCurrentReply({ 
                            ...currentReply, 
                            [`${activePost.id}-${comment.id}`]: { 
                              ...currentReply[`${activePost.id}-${comment.id}`], 
                              content: e.target.value 
                            } 
                          })}
                          className="reply-field"
                        />
                        <div className="images-upload-zone">
                          <label htmlFor={`reply-imgs-${activePost.id}-${comment.id}`} className="upload-label">
                            📷 Images
                          </label>
                          <input
                            id={`reply-imgs-${activePost.id}-${comment.id}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) => handleMultipleImageUpload(e, "reply", activePost.id, comment.id)}
                            className="upload-input"
                          />
                          {currentReply[`${activePost.id}-${comment.id}`]?.images?.length > 0 && (
                            <div className="images-preview-grid">
                              {currentReply[`${activePost.id}-${comment.id}`].images.map((img, idx) => (
                                <div key={idx} className="preview-item">
                                  <img src={img} alt={`Preview ${idx + 1}`} />
                                  <button 
                                    type="button" 
                                    className="remove-img-btn"
                                    onClick={() => removeImage("reply", idx, activePost.id, comment.id)}
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <motion.button 
                          onClick={() => handleReplySubmit(activePost.id, comment.id)} 
                          className="submit-reply-btn"
                          whileHover={{ scale: 1.02 }}
                          whileTap={{ scale: 0.98 }}
                        >
                          ↩️ Reply
                        </motion.button>
                      </div>

                      {comment.replies.map((reply, rIdx) => (
                        <motion.div
                          key={reply.id}
                          className="reply-item"
                          initial={{ opacity: 0, x: -10 }}
                          animate={{ opacity: 1, x: 0 }}
                          transition={{ delay: rIdx * 0.05 }}
                        >
                          <div className="reply-top">
                            <div>
                              <span className="reply-author">👤 {reply.author}</span>
                              <span className="reply-date">📅 {formatDate(reply.timestamp)}</span>
                            </div>
                            {reply.userId === currentUser.id && (
                              <div className="reply-actions">
                                <motion.button 
                                  onClick={() => startEditing("reply", reply.id, reply.content, activePost.id, comment.id)}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  ✏️
                                </motion.button>
                                <motion.button 
                                  onClick={() => deleteReply(activePost.id, comment.id, reply.id)}
                                  whileHover={{ scale: 1.1 }}
                                >
                                  🗑️
                                </motion.button>
                              </div>
                            )}
                          </div>
                          
                          {editingItem.type === "reply" && editingItem.id === reply.id ? (
                            <div className="edit-zone">
                              <textarea
                                value={editingItem.content}
                                onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                                className="edit-field"
                              />
                              <div className="edit-btns">
                                <motion.button onClick={() => saveEdit(editingItem.content)} whileHover={{ scale: 1.05 }}>💾 Save</motion.button>
                                <motion.button onClick={cancelEditing} whileHover={{ scale: 1.05 }}>❌ Cancel</motion.button>
                              </div>
                            </div>
                          ) : (
                            <p className="reply-text">{reply.content}</p>
                          )}
                          
                          {reply.images && reply.images.length > 0 && (
                            <div className="reply-images-grid">
                              {reply.images.map((img, idx) => (
                                <img key={idx} src={img} alt={`Reply image ${idx + 1}`} />
                              ))}
                            </div>
                          )}
                          
                          <motion.button 
                            onClick={() => handleLike("reply", activePost.id, comment.id, reply.id)} 
                            className={`like-btn-small ${hasUserLiked(reply) ? 'liked' : ''}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {hasUserLiked(reply) ? '💚' : '🤍'} {getLikeCount(reply)}
                          </motion.button>
                        </motion.div>
                      ))}
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            </>
          )}
        </div>
      )}

      <AnimatePresence>
        {animatingAction && (
          <motion.div
            className="action-toast"
            initial={{ opacity: 0, y: -50, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -50, scale: 0.9 }}
            transition={{ duration: 0.3 }}
          >
            {animatingAction.type === 'create' && '✅ Post created successfully!'}
            {animatingAction.type === 'update' && '✅ Updated successfully!'}
            {animatingAction.type === 'delete' && '🗑️ Deleted successfully!'}
            {animatingAction.type === 'comment' && '💬 Comment posted!'}
            {animatingAction.type === 'reply' && '↩️ Reply posted!'}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;