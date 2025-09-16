import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import "./Forum.css";

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState({ title: "", content: "", image: null });
  const [currentComment, setCurrentComment] = useState({});
  const [currentReply, setCurrentReply] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [viewMode, setViewMode] = useState("list"); // 'list' or 'detail'
  const [editingItem, setEditingItem] = useState({ type: null, id: null, content: null }); // 'post', 'comment', 'reply'

  // Helper function to migrate old data format to new format
  const migratePostFormat = (post) => {
    // If upvotes is a number, convert it to an array
    if (typeof post.upvotes === 'number') {
      return {
        ...post,
        upvotes: [],
        downvotes: [],
        views: []
      };
    }
    return post;
  };

  const migrateCommentFormat = (comment) => {
    if (typeof comment.upvotes === 'number') {
      return {
        ...comment,
        upvotes: [],
        downvotes: []
      };
    }
    return comment;
  };

  const migrateReplyFormat = (reply) => {
    if (typeof reply.upvotes === 'number') {
      return {
        ...reply,
        upvotes: [],
        downvotes: []
      };
    }
    return reply;
  };

  useEffect(() => {
    // Get current user from localStorage
    const user = JSON.parse(localStorage.getItem("currentUser"));
    if (user) {
      setCurrentUser(user);
    } else {
      navigate("/");
    }

    // Load posts from localStorage and migrate format if needed
    const savedPosts = JSON.parse(localStorage.getItem("forumPosts")) || [];
    
    // Migrate posts format if needed
    const migratedPosts = savedPosts.map(post => {
      let migratedPost = migratePostFormat(post);
      
      // Migrate comments
      if (migratedPost.comments && migratedPost.comments.length > 0) {
        migratedPost.comments = migratedPost.comments.map(comment => {
          let migratedComment = migrateCommentFormat(comment);
          
          // Migrate replies
          if (migratedComment.replies && migratedComment.replies.length > 0) {
            migratedComment.replies = migratedComment.replies.map(migrateReplyFormat);
          }
          
          return migratedComment;
        });
      }
      
      return migratedPost;
    });
    
    setPosts(migratedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(migratedPosts));
  }, [navigate]);

  // Safe version of getUserVoteStatus that handles both formats
  const getUserVoteStatus = (item) => {
    if (!item || !currentUser) return null;
    
    // Handle both number and array formats for upvotes/downvotes
    if (Array.isArray(item.upvotes)) {
      if (item.upvotes.includes(currentUser.id)) return "upvoted";
      if (Array.isArray(item.downvotes) && item.downvotes.includes(currentUser.id)) return "downvoted";
    } else if (typeof item.upvotes === 'number') {
      // This is the old format - we'll migrate it when user interacts with it
      return null;
    }
    
    return null;
  };

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!currentPost.title.trim() || !currentPost.content.trim()) return;

    const newPost = {
      id: Date.now(),
      title: currentPost.title,
      content: currentPost.content,
      image: currentPost.image,
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      views: [],
      upvotes: [],
      downvotes: [],
      comments: []
    };

    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    setCurrentPost({ title: "", content: "", image: null });
    document.getElementById("image-upload").value = "";
  };

  const handleImageUpload = (e, type, postId = null, commentId = null) => {
    const file = e.target.files[0];
    if (!file) return;

    const reader = new FileReader();
    reader.onload = (event) => {
      if (type === "post") {
        setCurrentPost({ ...currentPost, image: event.target.result });
      } else if (type === "comment" && postId) {
        setCurrentComment({ 
          ...currentComment, 
          [postId]: { ...currentComment[postId], image: event.target.result } 
        });
      } else if (type === "reply" && postId && commentId) {
        setCurrentReply({ 
          ...currentReply, 
          [`${postId}-${commentId}`]: { 
            ...currentReply[`${postId}-${commentId}`], 
            image: event.target.result 
          } 
        });
      }
    };
    reader.readAsDataURL(file);
  };

  // Add function to remove image
  const removeImage = (type, postId = null, commentId = null) => {
    if (type === "post") {
      setCurrentPost({ ...currentPost, image: null });
      document.getElementById("image-upload").value = "";
    } else if (type === "comment" && postId) {
      setCurrentComment({ 
        ...currentComment, 
        [postId]: { ...currentComment[postId], image: null } 
      });
      document.getElementById(`comment-image-${postId}`).value = "";
    } else if (type === "reply" && postId && commentId) {
      setCurrentReply({ 
        ...currentReply, 
        [`${postId}-${commentId}`]: { 
          ...currentReply[`${postId}-${commentId}`], 
          image: null 
        } 
      });
      document.getElementById(`reply-image-${postId}-${commentId}`).value = "";
    }
  };

  const handleCommentSubmit = (postId) => {
    if (!currentComment[postId]?.content?.trim()) return;

    const newComment = {
      id: Date.now(),
      content: currentComment[postId].content,
      image: currentComment[postId]?.image || null,
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      upvotes: [],
      downvotes: [],
      replies: []
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        return {
          ...post,
          comments: [newComment, ...post.comments]
        };
      }
      return post;
    });

    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    
    // Clear the comment input and image preview for this specific post
    setCurrentComment({ 
      ...currentComment, 
      [postId]: { content: "", image: null } 
    });
    document.getElementById(`comment-image-${postId}`).value = "";
    
    // Update activePost if we're in detail view to show the new comment immediately
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
  };

  const handleReplySubmit = (postId, commentId) => {
    if (!currentReply[`${postId}-${commentId}`]?.content?.trim()) return;

    const newReply = {
      id: Date.now(),
      content: currentReply[`${postId}-${commentId}`].content,
      image: currentReply[`${postId}-${commentId}`]?.image || null,
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      upvotes: [],
      downvotes: []
    };

    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        const updatedComments = post.comments.map(comment => {
          if (comment.id === commentId) {
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
    
    // Clear the reply input and image preview for this specific comment
    setCurrentReply({ 
      ...currentReply, 
      [`${postId}-${commentId}`]: { content: "", image: null } 
    });
    document.getElementById(`reply-image-${postId}-${commentId}`).value = "";
    
    // Update activePost if we're in detail view to show the new reply immediately
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
  };

  const handleVote = (type, postId, commentId = null, replyId = null, voteType) => {
    const updatedPosts = posts.map(post => {
      if (post.id === postId) {
        if (type === "post") {
          // Ensure we're working with arrays (migrate if needed)
          let upvotesArray = Array.isArray(post.upvotes) ? [...post.upvotes] : [];
          let downvotesArray = Array.isArray(post.downvotes) ? [...post.downvotes] : [];
          let viewsArray = Array.isArray(post.views) ? [...post.views] : [];
          
          // Check if user has already voted
          const hasUpvoted = upvotesArray.includes(currentUser.id);
          const hasDownvoted = downvotesArray.includes(currentUser.id);
          
          if (voteType === "upvote") {
            if (hasUpvoted) {
              // Remove upvote if already upvoted
              upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
            } else {
              // Add upvote and remove downvote if exists
              upvotesArray.push(currentUser.id);
              downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
            }
          } else if (voteType === "downvote") {
            if (hasDownvoted) {
              // Remove downvote if already downvoted
              downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
            } else {
              // Add downvote and remove upvote if exists
              downvotesArray.push(currentUser.id);
              upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
            }
          }
          
          return {
            ...post,
            upvotes: upvotesArray,
            downvotes: downvotesArray,
            views: viewsArray
          };
        } else if (type === "comment" && commentId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
              // Ensure we're working with arrays
              let upvotesArray = Array.isArray(comment.upvotes) ? [...comment.upvotes] : [];
              let downvotesArray = Array.isArray(comment.downvotes) ? [...comment.downvotes] : [];
              
              const hasUpvoted = upvotesArray.includes(currentUser.id);
              const hasDownvoted = downvotesArray.includes(currentUser.id);
              
              if (voteType === "upvote") {
                if (hasUpvoted) {
                  upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
                } else {
                  upvotesArray.push(currentUser.id);
                  downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
                }
              } else if (voteType === "downvote") {
                if (hasDownvoted) {
                  downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
                } else {
                  downvotesArray.push(currentUser.id);
                  upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
                }
              }
              
              return {
                ...comment,
                upvotes: upvotesArray,
                downvotes: downvotesArray
              };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        } else if (type === "reply" && commentId && replyId) {
          const updatedComments = post.comments.map(comment => {
            if (comment.id === commentId) {
              const updatedReplies = comment.replies.map(reply => {
                if (reply.id === replyId) {
                  // Ensure we're working with arrays
                  let upvotesArray = Array.isArray(reply.upvotes) ? [...reply.upvotes] : [];
                  let downvotesArray = Array.isArray(reply.downvotes) ? [...reply.downvotes] : [];
                  
                  const hasUpvoted = upvotesArray.includes(currentUser.id);
                  const hasDownvoted = downvotesArray.includes(currentUser.id);
                  
                  if (voteType === "upvote") {
                    if (hasUpvoted) {
                      upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
                    } else {
                      upvotesArray.push(currentUser.id);
                      downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
                    }
                  } else if (voteType === "downvote") {
                    if (hasDownvoted) {
                      downvotesArray = downvotesArray.filter(id => id !== currentUser.id);
                    } else {
                      downvotesArray.push(currentUser.id);
                      upvotesArray = upvotesArray.filter(id => id !== currentUser.id);
                    }
                  }
                  
                  return {
                    ...reply,
                    upvotes: upvotesArray,
                    downvotes: downvotesArray
                  };
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
    
    // Update activePost if we're in detail view
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      const updatedActivePost = updatedPosts.find(p => p.id === postId);
      setActivePost(updatedActivePost);
    }
  };

  // Delete functions
  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter(post => post.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      
      if (viewMode === "detail" && activePost && activePost.id === postId) {
        setViewMode("list");
      }
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
    }
  };

  // Edit functions
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
  };

  const viewPost = (post) => {
    // Ensure we're working with arrays
    let viewsArray = Array.isArray(post.views) ? [...post.views] : [];
    
    // Check if user has already viewed this post
    if (!viewsArray.includes(currentUser.id)) {
      viewsArray.push(currentUser.id);
      
      const updatedPosts = posts.map(p => {
        if (p.id === post.id) {
          return { 
            ...p, 
            views: viewsArray,
            // Ensure upvotes and downvotes are arrays too
            upvotes: Array.isArray(p.upvotes) ? p.upvotes : [],
            downvotes: Array.isArray(p.downvotes) ? p.downvotes : []
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
    return `${date.toLocaleDateString()} ${date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}`;
  };

  // Helper function to get vote count (handles both number and array formats)
  const getVoteCount = (item, voteType) => {
    if (!item) return 0;
    
    if (Array.isArray(item[voteType])) {
      return item[voteType].length;
    } else if (typeof item[voteType] === 'number') {
      return item[voteType];
    }
    
    return 0;
  };

  const filteredPosts = posts.filter(post => 
    post.title.toLowerCase().includes(searchTerm.toLowerCase()) || 
    post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
    post.author.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="forum-container">
      <div className="forum-header">
        <button className="back-button" onClick={() => viewMode === "detail" ? setViewMode("list") : navigate("/dashboard")}>
          {viewMode === "detail" ? "← Back to Forum" : "← Back to Dashboard"}
        </button>
        <h1>Discussion Forum</h1>
        <div className="user-info">
          <span>USER: {currentUser?.username}</span>
        </div>
      </div>

      {viewMode === "list" ? (
        <>
          <div className="search-container">
            <input
              type="text"
              placeholder="Search posts by title, content, or author..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="search-input"
            />
          </div>

          <div className="post-form">
            <h2>Create a New Post</h2>
            <form onSubmit={handlePostSubmit}>
              <input
                type="text"
                placeholder="Post Title"
                value={currentPost.title}
                onChange={(e) => setCurrentPost({ ...currentPost, title: e.target.value })}
                className="post-title-input"
                required
              />
              <textarea
                placeholder="What's your question or insight about algorithms?"
                value={currentPost.content}
                onChange={(e) => setCurrentPost({ ...currentPost, content: e.target.value })}
                className="post-content-input"
                required
              />
              <div className="image-upload-container">
                <label htmlFor="image-upload" className="image-upload-label">
                  📷 Upload Image
                </label>
                <input
                  id="image-upload"
                  type="file"
                  accept="image/*"
                  onChange={(e) => handleImageUpload(e, "post")}
                  className="image-upload-input"
                />
                {currentPost.image && (
                  <div className="image-preview">
                    <img src={currentPost.image} alt="Preview" />
                    <button 
                      type="button" 
                      className="remove-image-btn"
                      onClick={() => removeImage("post")}
                    >
                      ✕ Remove
                    </button>
                  </div>
                )}
              </div>
              <button type="submit" className="submit-post-btn">Post Question</button>
            </form>
          </div>

          <div className="posts-list">
            <h2>Community Discussions</h2>
            {filteredPosts.length === 0 ? (
              <div className="no-posts">No posts found. Be the first to start a discussion!</div>
            ) : (
              filteredPosts.map(post => (
                <div key={post.id} className="post-card">
                  <div className="post-header">
                    <h3 onClick={() => viewPost(post)} className="post-title">{post.title}</h3>
                    {post.userId === currentUser.id && (
                      <div className="post-actions">
                        <button 
                          className="edit-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            startEditing("post", post.id, post.content);
                          }}
                        >
                          ✏️
                        </button>
                        <button 
                          className="delete-btn"
                          onClick={(e) => {
                            e.stopPropagation();
                            deletePost(post.id);
                          }}
                        >
                          🗑️
                        </button>
                      </div>
                    )}
                  </div>
                  <div className="post-meta">
                    <span className="post-author">By: {post.author}</span>
                    <span className="post-date">{formatDate(post.timestamp)}</span>
                    <span className="post-views">👁️ {getVoteCount(post, 'views')} views</span>
                  </div>
                  <p className="post-content-preview">{post.content.substring(0, 150)}...</p>
                  {post.image && (
                    <div className="post-image-preview">
                      <img src={post.image} alt="Post" />
                    </div>
                  )}
                  <div className="post-stats">
                    <span className="post-votes">
                      <span className={`upvote-count ${getUserVoteStatus(post) === 'upvoted' ? 'user-voted' : ''}`}>
                        ▲ {getVoteCount(post, 'upvotes')}
                      </span>
                      <span className={`downvote-count ${getUserVoteStatus(post) === 'downvoted' ? 'user-voted' : ''}`}>
                        ▼ {getVoteCount(post, 'downvotes')}
                      </span>
                    </span>
                    <span className="post-comments">💬 {post.comments.length} comments</span>
                  </div>
                  <button onClick={() => viewPost(post)} className="view-post-btn">View Discussion</button>
                </div>
              ))
            )}
          </div>
        </>
      ) : (
        <div className="post-detail">
          {activePost && (
            <>
              <div className="post-detail-card">
                <div className="post-header">
                  <h2>{activePost.title}</h2>
                  {activePost.userId === currentUser.id && (
                    <div className="post-actions">
                      <button 
                        className="edit-btn"
                        onClick={() => startEditing("post", activePost.id, activePost.content)}
                      >
                        ✏️
                      </button>
                      <button 
                        className="delete-btn"
                        onClick={() => deletePost(activePost.id)}
                      >
                        🗑️
                      </button>
                    </div>
                  )}
                </div>
                <div className="post-meta">
                  <span className="post-author">By: {activePost.author}</span>
                  <span className="post-date">{formatDate(activePost.timestamp)}</span>
                  <span className="post-views">👁️ {getVoteCount(activePost, 'views')} views</span>
                </div>
                
                {editingItem.type === "post" && editingItem.id === activePost.id ? (
                  <div className="edit-container">
                    <textarea
                      value={editingItem.content}
                      onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                      className="edit-textarea"
                    />
                    <div className="edit-actions">
                      <button onClick={() => saveEdit(editingItem.content)} className="save-edit-btn">Save</button>
                      <button onClick={cancelEditing} className="cancel-edit-btn">Cancel</button>
                    </div>
                  </div>
                ) : (
                  <p className="post-content">{activePost.content}</p>
                )}
                
                {activePost.image && (
                  <div className="post-image">
                    <img src={activePost.image} alt="Post" />
                  </div>
                )}
                <div className="post-voting">
                  <button 
                    onClick={() => handleVote("post", activePost.id, null, null, "upvote")} 
                    className={`upvote-btn ${getUserVoteStatus(activePost) === 'upvoted' ? 'user-upvoted' : ''}`}
                  >
                    ▲ {getVoteCount(activePost, 'upvotes')}
                  </button>
                  <button 
                    onClick={() => handleVote("post", activePost.id, null, null, "downvote")} 
                    className={`downvote-btn ${getUserVoteStatus(activePost) === 'downvoted' ? 'user-downvoted' : ''}`}
                  >
                    ▼ {getVoteCount(activePost, 'downvotes')}
                  </button>
                </div>
              </div>

              <div className="comments-section">
                <h3>Comments ({activePost.comments.length})</h3>
                <div className="comment-form">
                  <textarea
                    placeholder="Add a comment..."
                    value={currentComment[activePost.id]?.content || ""}
                    onChange={(e) => setCurrentComment({ 
                      ...currentComment, 
                      [activePost.id]: { ...currentComment[activePost.id], content: e.target.value } 
                    })}
                    className="comment-input"
                  />
                  <div className="image-upload-container">
                    <label htmlFor={`comment-image-${activePost.id}`} className="image-upload-label">
                      📷 Upload Image
                    </label>
                    <input
                      id={`comment-image-${activePost.id}`}
                      type="file"
                      accept="image/*"
                      onChange={(e) => handleImageUpload(e, "comment", activePost.id)}
                      className="image-upload-input"
                    />
                    {currentComment[activePost.id]?.image && (
                      <div className="image-preview">
                        <img src={currentComment[activePost.id].image} alt="Preview" />
                        <button 
                          type="button" 
                          className="remove-image-btn"
                          onClick={() => removeImage("comment", activePost.id)}
                        >
                          ✕ Remove
                        </button>
                      </div>
                    )}
                  </div>
                  <button onClick={() => handleCommentSubmit(activePost.id)} className="submit-comment-btn">Post Comment</button>
                </div>

                {activePost.comments.map(comment => (
                  <div key={comment.id} className="comment-card">
                    <div className="comment-header">
                      <span className="comment-author">{comment.author}</span>
                      <span className="comment-date">{formatDate(comment.timestamp)}</span>
                      {comment.userId === currentUser.id && (
                        <div className="comment-actions">
                          <button 
                            className="edit-btn"
                            onClick={() => startEditing("comment", comment.id, comment.content, activePost.id)}
                          >
                            ✏️
                          </button>
                          <button 
                            className="delete-btn"
                            onClick={() => deleteComment(activePost.id, comment.id)}
                          >
                            🗑️
                          </button>
                        </div>
                      )}
                    </div>
                    
                    {editingItem.type === "comment" && editingItem.id === comment.id ? (
                      <div className="edit-container">
                        <textarea
                          value={editingItem.content}
                          onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                          className="edit-textarea"
                        />
                        <div className="edit-actions">
                          <button onClick={() => saveEdit(editingItem.content)} className="save-edit-btn">Save</button>
                          <button onClick={cancelEditing} className="cancel-edit-btn">Cancel</button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-content">{comment.content}</p>
                    )}
                    
                    {comment.image && (
                      <div className="comment-image">
                        <img src={comment.image} alt="Comment" />
                      </div>
                    )}
                    <div className="comment-voting">
                      <button 
                        onClick={() => handleVote("comment", activePost.id, comment.id, null, "upvote")} 
                        className={`upvote-btn ${getUserVoteStatus(comment) === 'upvoted' ? 'user-upvoted' : ''}`}
                      >
                        ▲ {getVoteCount(comment, 'upvotes')}
                      </button>
                      <button 
                        onClick={() => handleVote("comment", activePost.id, comment.id, null, "downvote")} 
                        className={`downvote-btn ${getUserVoteStatus(comment) === 'downvoted' ? 'user-downvoted' : ''}`}
                      >
                        ▼ {getVoteCount(comment, 'downvotes')}
                      </button>
                    </div>

                    <div className="replies-section">
                      <h4>Replies ({comment.replies.length})</h4>
                      <div className="reply-form">
                        <textarea
                          placeholder="Add a reply..."
                          value={currentReply[`${activePost.id}-${comment.id}`]?.content || ""}
                          onChange={(e) => setCurrentReply({ 
                            ...currentReply, 
                            [`${activePost.id}-${comment.id}`]: { 
                              ...currentReply[`${activePost.id}-${comment.id}`], 
                              content: e.target.value 
                            } 
                          })}
                          className="reply-input"
                        />
                        <div className="image-upload-container">
                          <label htmlFor={`reply-image-${activePost.id}-${comment.id}`} className="image-upload-label">
                            📷 Upload Image
                          </label>
                          <input
                            id={`reply-image-${activePost.id}-${comment.id}`}
                            type="file"
                            accept="image/*"
                            onChange={(e) => handleImageUpload(e, "reply", activePost.id, comment.id)}
                            className="image-upload-input"
                          />
                          {currentReply[`${activePost.id}-${comment.id}`]?.image && (
                            <div className="image-preview">
                              <img src={currentReply[`${activePost.id}-${comment.id}`].image} alt="Preview" />
                              <button 
                                type="button" 
                                className="remove-image-btn"
                                onClick={() => removeImage("reply", activePost.id, comment.id)}
                              >
                                ✕ Remove
                              </button>
                            </div>
                          )}
                        </div>
                        <button onClick={() => handleReplySubmit(activePost.id, comment.id)} className="submit-reply-btn">Post Reply</button>
                      </div>

                      {comment.replies.map(reply => (
                        <div key={reply.id} className="reply-card">
                          <div className="reply-header">
                            <span className="reply-author">{reply.author}</span>
                            <span className="reply-date">{formatDate(reply.timestamp)}</span>
                            {reply.userId === currentUser.id && (
                              <div className="reply-actions">
                                <button 
                                  className="edit-btn"
                                  onClick={() => startEditing("reply", reply.id, reply.content, activePost.id, comment.id)}
                                >
                                  ✏️
                                </button>
                                <button 
                                  className="delete-btn"
                                  onClick={() => deleteReply(activePost.id, comment.id, reply.id)}
                                >
                                  🗑️
                                </button>
                              </div>
                            )}
                          </div>
                          
                          {editingItem.type === "reply" && editingItem.id === reply.id ? (
                            <div className="edit-container">
                              <textarea
                                value={editingItem.content}
                                onChange={(e) => setEditingItem({...editingItem, content: e.target.value})}
                                className="edit-textarea"
                              />
                              <div className="edit-actions">
                                <button onClick={() => saveEdit(editingItem.content)} className="save-edit-btn">Save</button>
                                <button onClick={cancelEditing} className="cancel-edit-btn">Cancel</button>
                              </div>
                            </div>
                          ) : (
                            <p className="reply-content">{reply.content}</p>
                          )}
                          
                          {reply.image && (
                            <div className="reply-image">
                              <img src={reply.image} alt="Reply" />
                            </div>
                          )}
                          <div className="reply-voting">
                            <button 
                              onClick={() => handleVote("reply", activePost.id, comment.id, reply.id, "upvote")} 
                              className={`upvote-btn ${getUserVoteStatus(reply) === 'upvoted' ? 'user-upvoted' : ''}`}
                            >
                              ▲ {getVoteCount(reply, 'upvotes')}
                            </button>
                            <button 
                              onClick={() => handleVote("reply", activePost.id, comment.id, reply.id, "downvote")} 
                              className={`downvote-btn ${getUserVoteStatus(reply) === 'downvoted' ? 'user-downvoted' : ''}`}
                            >
                              ▼ {getVoteCount(reply, 'downvotes')}
                            </button>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                ))}
              </div>
            </>
          )}
        </div>
      )}
    </div>
  );
};

export default Forum;