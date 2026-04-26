import React, { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { motion, AnimatePresence } from "framer-motion";
import "./Forum.css";

// ─── Gibberish Detection ──────────────────────────────────────────────────────

const COMMON_WORDS = new Set([
  "the",
  "be",
  "to",
  "of",
  "and",
  "a",
  "in",
  "that",
  "have",
  "it",
  "for",
  "not",
  "on",
  "with",
  "he",
  "as",
  "you",
  "do",
  "at",
  "this",
  "but",
  "his",
  "by",
  "from",
  "they",
  "we",
  "say",
  "her",
  "she",
  "or",
  "an",
  "will",
  "my",
  "one",
  "all",
  "would",
  "there",
  "their",
  "what",
  "so",
  "up",
  "out",
  "if",
  "about",
  "who",
  "get",
  "which",
  "go",
  "me",
  "when",
  "make",
  "can",
  "like",
  "time",
  "no",
  "just",
  "him",
  "know",
  "take",
  "people",
  "into",
  "year",
  "your",
  "good",
  "some",
  "could",
  "them",
  "see",
  "other",
  "than",
  "then",
  "now",
  "look",
  "only",
  "come",
  "its",
  "over",
  "think",
  "also",
  "back",
  "after",
  "use",
  "two",
  "how",
  "our",
  "work",
  "first",
  "well",
  "way",
  "even",
  "new",
  "want",
  "because",
  "any",
  "these",
  "give",
  "day",
  "most",
  "us",
  "is",
  "are",
  "was",
  "were",
  "has",
  "had",
  "did",
  "been",
  "being",
  "having",
  "doing",
  "am",
  "been",
  "i",
  "here",
  "yes",
  "no",
  "ok",
  "okay",
  "hi",
  "hello",
  "hey",
  "thanks",
  "thank",
  "please",
  "help",
  "need",
  "question",
  "answer",
  "problem",
  "issue",
  "error",
  "code",
  "algorithm",
  "data",
  "function",
  "class",
  "method",
  "variable",
  "array",
  "loop",
  "sort",
  "search",
  "graph",
  "tree",
  "node",
  "binary",
  "merge",
  "quick",
  "bubble",
  "insertion",
  "selection",
  "dynamic",
  "programming",
  "stack",
  "queue",
  "hash",
  "table",
  "map",
  "set",
  "list",
  "linked",
  "heap",
  "bfs",
  "dfs",
  "complexity",
  "time",
  "space",
  "big",
  "notation",
  "recursion",
  "iteration",
  "pointer",
  "memory",
  "cpu",
  "output",
  "input",
  "print",
  "return",
  "value",
  "index",
  "key",
  "object",
  "string",
  "int",
  "float",
  "bool",
  "null",
  "true",
  "false",
  "import",
  "export",
  "module",
  "what",
  "how",
  "why",
  "when",
  "where",
  "which",
  "who",
  "can",
  "does",
  "should",
  "would",
  "could",
  "using",
  "want",
  "understand",
  "explain",
  "working",
  "trying",
  "getting",
  "running",
]);

/**
 * Checks whether a string is meaningful or gibberish.
 * Returns { valid: boolean, reason: string }
 */
const validateMeaningfulness = (text) => {
  const trimmed = text.trim();

  // 1. Too short
  if (trimmed.length < 5) {
    return {
      valid: false,
      reason: "Your message is too short. Please write something meaningful.",
    };
  }

  // 2. All same character / repeated character spam
  if (/^(.)\1{4,}$/.test(trimmed)) {
    return {
      valid: false,
      reason:
        "Your message appears to be repeated characters. Please write something meaningful.",
    };
  }

  // 3. Detect long runs of consonants (gibberish like "sdhbvjshbvsjdhsb")
  const consonantRunMatch = trimmed.match(
    /[bcdfghjklmnpqrstvwxyzBCDFGHJKLMNPQRSTVWXYZ]{7,}/g,
  );
  if (consonantRunMatch) {
    return {
      valid: false,
      reason:
        "Your message contains gibberish text. Please write in proper words.",
    };
  }

  // 4. Check ratio of recognisable words vs total words
  const words = trimmed
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length > 0);

  if (words.length === 0) {
    return { valid: false, reason: "Please write a meaningful message." };
  }

  // For very short messages (1–3 words) just check consonant runs – already done above
  if (words.length <= 3) {
    // Check each word individually for excessive consonant ratio
    for (const word of words) {
      if (word.length >= 6) {
        const consonants = (word.match(/[bcdfghjklmnpqrstvwxyz]/g) || [])
          .length;
        const ratio = consonants / word.length;
        if (ratio > 0.85) {
          return {
            valid: false,
            reason:
              "Your message contains gibberish text. Please write in proper words.",
          };
        }
      }
    }
    return { valid: true, reason: "" };
  }

  // 5. For longer messages: check what fraction of words look "real"
  let realWordCount = 0;
  let gibberishWordCount = 0;

  for (const word of words) {
    if (COMMON_WORDS.has(word)) {
      realWordCount++;
      continue;
    }
    // Heuristic: if consonant ratio > 80% and word is >= 5 chars → likely gibberish
    if (word.length >= 5) {
      const consonants = (word.match(/[bcdfghjklmnpqrstvwxyz]/g) || []).length;
      const ratio = consonants / word.length;
      if (ratio > 0.8) {
        gibberishWordCount++;
      } else {
        realWordCount++;
      }
    } else {
      // Short unknown words — give benefit of the doubt
      realWordCount++;
    }
  }

  const gibberishRatio = gibberishWordCount / words.length;
  if (gibberishRatio > 0.5) {
    return {
      valid: false,
      reason:
        "Your message appears to contain mostly gibberish. Please write in meaningful sentences.",
    };
  }

  // 6. Detect keyboard mash patterns (e.g. "asdfgh", "qwerty" repeats)
  // Test per-word so real words like "between" aren't falsely flagged
  const keyboardMash =
    /^([qwert]{5,}|[asdfg]{5,}|[zxcvb]{5,}|[yuiop]{5,}|[hjkl]{4,}|[nm]{4,})$/i;
  const hasMashedWord = words.some((w) => keyboardMash.test(w));
  if (hasMashedWord) {
    return {
      valid: false,
      reason:
        "Your message looks like a keyboard mash. Please write something meaningful.",
    };
  }

  return { valid: true, reason: "" };
};

// ─── Validation Modal ─────────────────────────────────────────────────────────

const ValidationModal = ({ message, onClose }) => (
  <AnimatePresence>
    {message && (
      <motion.div
        className="validation-overlay"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        onClick={onClose}
      >
        <motion.div
          className="validation-modal"
          initial={{ opacity: 0, scale: 0.85, y: 30 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.85, y: 30 }}
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          onClick={(e) => e.stopPropagation()}
        >
          <div className="validation-icon">⚠️</div>
          <h3 className="validation-title">Invalid Message</h3>
          <p className="validation-message">{message}</p>
          <motion.button
            className="validation-close-btn"
            onClick={onClose}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Got it
          </motion.button>
        </motion.div>
      </motion.div>
    )}
  </AnimatePresence>
);

// ─── Main Component ───────────────────────────────────────────────────────────

const Forum = () => {
  const navigate = useNavigate();
  const [posts, setPosts] = useState([]);
  const [currentPost, setCurrentPost] = useState({
    title: "",
    content: "",
    images: [],
  });
  const [currentComment, setCurrentComment] = useState({});
  const [currentReply, setCurrentReply] = useState({});
  const [searchTerm, setSearchTerm] = useState("");
  const [currentUser, setCurrentUser] = useState(null);
  const [activePost, setActivePost] = useState(null);
  const [viewMode, setViewMode] = useState("list");
  const [editingItem, setEditingItem] = useState({
    type: null,
    id: null,
    content: null,
  });
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [isDarkMode, setIsDarkMode] = useState(false);
  const [animatingAction, setAnimatingAction] = useState(null);

  // Validation modal state
  const [validationMessage, setValidationMessage] = useState("");

  const showValidationError = (msg) => setValidationMessage(msg);
  const closeValidationModal = () => setValidationMessage("");

  // Dark mode detection
  useEffect(() => {
    const checkDarkMode = () => {
      const bodyHasDark = document.body.classList.contains("dark");
      const htmlHasDark = document.documentElement.classList.contains("dark");
      const savedTheme = localStorage.getItem("theme");
      const prefersDark = window.matchMedia(
        "(prefers-color-scheme: dark)",
      ).matches;
      setIsDarkMode(
        bodyHasDark ||
          htmlHasDark ||
          savedTheme === "dark" ||
          (!savedTheme && prefersDark),
      );
    };

    checkDarkMode();
    const bodyObserver = new MutationObserver(checkDarkMode);
    bodyObserver.observe(document.body, {
      attributes: true,
      attributeFilter: ["class"],
    });
    const htmlObserver = new MutationObserver(checkDarkMode);
    htmlObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });
    window.addEventListener("storage", checkDarkMode);
    window.addEventListener("themeChange", checkDarkMode);

    return () => {
      bodyObserver.disconnect();
      htmlObserver.disconnect();
      window.removeEventListener("storage", checkDarkMode);
      window.removeEventListener("themeChange", checkDarkMode);
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
    const allNotifications =
      JSON.parse(localStorage.getItem("forumNotifications")) || {};
    const userNotifications = allNotifications[userId] || [];
    setNotifications(userNotifications.filter((n) => !n.read));
  };

  const addNotification = (
    recipientId,
    type,
    postId,
    content,
    commentId = null,
    replyId = null,
  ) => {
    if (recipientId === currentUser.id) return;
    const allNotifications =
      JSON.parse(localStorage.getItem("forumNotifications")) || {};
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
      read: false,
    };
    userNotifications.unshift(notification);
    allNotifications[recipientId] = userNotifications;
    localStorage.setItem(
      "forumNotifications",
      JSON.stringify(allNotifications),
    );
  };

  const markNotificationAsRead = (notificationId) => {
    const allNotifications =
      JSON.parse(localStorage.getItem("forumNotifications")) || {};
    const userNotifications = allNotifications[currentUser.id] || [];
    const updatedNotifications = userNotifications.map((n) =>
      n.id === notificationId ? { ...n, read: true } : n,
    );
    allNotifications[currentUser.id] = updatedNotifications;
    localStorage.setItem(
      "forumNotifications",
      JSON.stringify(allNotifications),
    );
    setNotifications(updatedNotifications.filter((n) => !n.read));
  };

  const handleNotificationClick = (notification) => {
    markNotificationAsRead(notification.id);
    const post = posts.find((p) => p.id === notification.postId);
    if (post) {
      viewPost(post);
      setShowNotifications(false);
    }
  };

  const handleMultipleImageUpload = (
    e,
    type,
    postId = null,
    commentId = null,
  ) => {
    const files = Array.from(e.target.files);
    if (!files.length) return;
    const promises = files.map(
      (file) =>
        new Promise((resolve) => {
          const reader = new FileReader();
          reader.onload = (event) => resolve(event.target.result);
          reader.readAsDataURL(file);
        }),
    );
    Promise.all(promises).then((images) => {
      if (type === "post") {
        setCurrentPost({
          ...currentPost,
          images: [...currentPost.images, ...images],
        });
      } else if (type === "comment" && postId) {
        const existing = currentComment[postId]?.images || [];
        setCurrentComment({
          ...currentComment,
          [postId]: {
            ...currentComment[postId],
            images: [...existing, ...images],
          },
        });
      } else if (type === "reply" && postId && commentId) {
        const existing = currentReply[`${postId}-${commentId}`]?.images || [];
        setCurrentReply({
          ...currentReply,
          [`${postId}-${commentId}`]: {
            ...currentReply[`${postId}-${commentId}`],
            images: [...existing, ...images],
          },
        });
      }
    });
  };

  const removeImage = (type, imageIndex, postId = null, commentId = null) => {
    if (type === "post") {
      setCurrentPost({
        ...currentPost,
        images: currentPost.images.filter((_, i) => i !== imageIndex),
      });
    } else if (type === "comment" && postId) {
      setCurrentComment({
        ...currentComment,
        [postId]: {
          ...currentComment[postId],
          images: (currentComment[postId]?.images || []).filter(
            (_, i) => i !== imageIndex,
          ),
        },
      });
    } else if (type === "reply" && postId && commentId) {
      setCurrentReply({
        ...currentReply,
        [`${postId}-${commentId}`]: {
          ...currentReply[`${postId}-${commentId}`],
          images: (currentReply[`${postId}-${commentId}`]?.images || []).filter(
            (_, i) => i !== imageIndex,
          ),
        },
      });
    }
  };

  // ── Validated Submission Handlers ──────────────────────────────────────────

  const handlePostSubmit = (e) => {
    e.preventDefault();
    if (!currentPost.title.trim() || !currentPost.content.trim()) return;

    const titleCheck = validateMeaningfulness(currentPost.title);
    if (!titleCheck.valid) {
      showValidationError(titleCheck.reason);
      return;
    }

    const contentCheck = validateMeaningfulness(currentPost.content);
    if (!contentCheck.valid) {
      showValidationError(contentCheck.reason);
      return;
    }

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
      comments: [],
    };
    const updatedPosts = [newPost, ...posts];
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    setCurrentPost({ title: "", content: "", images: [] });
    setAnimatingAction({ type: "create", id: newPost.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const handleCommentSubmit = (postId) => {
    if (!currentComment[postId]?.content?.trim()) return;

    const check = validateMeaningfulness(currentComment[postId].content);
    if (!check.valid) {
      showValidationError(check.reason);
      return;
    }

    const newComment = {
      id: Date.now(),
      content: currentComment[postId].content,
      images: currentComment[postId]?.images || [],
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      likes: [],
      replies: [],
    };
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        addNotification(
          post.userId,
          "comment",
          postId,
          `commented on your post: "${post.title}"`,
        );
        return { ...post, comments: [newComment, ...post.comments] };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    setCurrentComment({
      ...currentComment,
      [postId]: { content: "", images: [] },
    });
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      setActivePost(updatedPosts.find((p) => p.id === postId));
    }
    setAnimatingAction({ type: "comment", id: newComment.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const handleReplySubmit = (postId, commentId) => {
    if (!currentReply[`${postId}-${commentId}`]?.content?.trim()) return;

    const check = validateMeaningfulness(
      currentReply[`${postId}-${commentId}`].content,
    );
    if (!check.valid) {
      showValidationError(check.reason);
      return;
    }

    const newReply = {
      id: Date.now(),
      content: currentReply[`${postId}-${commentId}`].content,
      images: currentReply[`${postId}-${commentId}`]?.images || [],
      author: currentUser.username,
      userId: currentUser.id,
      timestamp: new Date().toISOString(),
      likes: [],
    };
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        const updatedComments = post.comments.map((comment) => {
          if (comment.id === commentId) {
            addNotification(
              comment.userId,
              "reply",
              postId,
              `replied to your comment`,
              commentId,
              newReply.id,
            );
            return { ...comment, replies: [...comment.replies, newReply] };
          }
          return comment;
        });
        return { ...post, comments: updatedComments };
      }
      return post;
    });
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    setCurrentReply({
      ...currentReply,
      [`${postId}-${commentId}`]: { content: "", images: [] },
    });
    if (viewMode === "detail" && activePost && activePost.id === postId) {
      setActivePost(updatedPosts.find((p) => p.id === postId));
    }
    setAnimatingAction({ type: "reply", id: newReply.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  const saveEdit = (newContent) => {
    if (!newContent.trim()) return;

    const check = validateMeaningfulness(newContent);
    if (!check.valid) {
      showValidationError(check.reason);
      return;
    }

    let updatedPosts;
    if (editingItem.type === "post") {
      updatedPosts = posts.map((post) =>
        post.id === editingItem.id ? { ...post, content: newContent } : post,
      );
    } else if (editingItem.type === "comment") {
      updatedPosts = posts.map((post) => {
        if (post.id === editingItem.postId) {
          return {
            ...post,
            comments: post.comments.map((c) =>
              c.id === editingItem.id ? { ...c, content: newContent } : c,
            ),
          };
        }
        return post;
      });
    } else if (editingItem.type === "reply") {
      updatedPosts = posts.map((post) => {
        if (post.id === editingItem.postId) {
          return {
            ...post,
            comments: post.comments.map((c) => {
              if (c.id === editingItem.commentId) {
                return {
                  ...c,
                  replies: c.replies.map((r) =>
                    r.id === editingItem.id ? { ...r, content: newContent } : r,
                  ),
                };
              }
              return c;
            }),
          };
        }
        return post;
      });
    }
    setPosts(updatedPosts);
    localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
    setEditingItem({ type: null, id: null, content: null });
    if (viewMode === "detail" && activePost) {
      setActivePost(updatedPosts.find((p) => p.id === activePost.id));
    }
    setAnimatingAction({ type: "update", id: editingItem.id });
    setTimeout(() => setAnimatingAction(null), 1000);
  };

  // ── Unchanged helpers ───────────────────────────────────────────────────────

  const handleLike = (type, postId, commentId = null, replyId = null) => {
    const updatedPosts = posts.map((post) => {
      if (post.id === postId) {
        if (type === "post") {
          let likesArray = Array.isArray(post.likes) ? [...post.likes] : [];
          const hasLiked = likesArray.includes(currentUser.id);
          if (hasLiked) {
            likesArray = likesArray.filter((id) => id !== currentUser.id);
          } else {
            likesArray.push(currentUser.id);
            addNotification(
              post.userId,
              "like",
              postId,
              `liked your post: "${post.title}"`,
            );
          }
          return { ...post, likes: likesArray };
        } else if (type === "comment" && commentId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id === commentId) {
              let likesArray = Array.isArray(comment.likes)
                ? [...comment.likes]
                : [];
              const hasLiked = likesArray.includes(currentUser.id);
              if (hasLiked) {
                likesArray = likesArray.filter((id) => id !== currentUser.id);
              } else {
                likesArray.push(currentUser.id);
                addNotification(
                  comment.userId,
                  "like",
                  postId,
                  `liked your comment`,
                  commentId,
                );
              }
              return { ...comment, likes: likesArray };
            }
            return comment;
          });
          return { ...post, comments: updatedComments };
        } else if (type === "reply" && commentId && replyId) {
          const updatedComments = post.comments.map((comment) => {
            if (comment.id === commentId) {
              const updatedReplies = comment.replies.map((reply) => {
                if (reply.id === replyId) {
                  let likesArray = Array.isArray(reply.likes)
                    ? [...reply.likes]
                    : [];
                  const hasLiked = likesArray.includes(currentUser.id);
                  if (hasLiked) {
                    likesArray = likesArray.filter(
                      (id) => id !== currentUser.id,
                    );
                  } else {
                    likesArray.push(currentUser.id);
                    addNotification(
                      reply.userId,
                      "like",
                      postId,
                      `liked your reply`,
                      commentId,
                      replyId,
                    );
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
      setActivePost(updatedPosts.find((p) => p.id === postId));
    }
  };

  const deletePost = (postId) => {
    if (window.confirm("Are you sure you want to delete this post?")) {
      const updatedPosts = posts.filter((post) => post.id !== postId);
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      if (viewMode === "detail" && activePost && activePost.id === postId)
        setViewMode("list");
      setAnimatingAction({ type: "delete", id: postId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const deleteComment = (postId, commentId) => {
    if (window.confirm("Are you sure you want to delete this comment?")) {
      const updatedPosts = posts.map((post) => {
        if (post.id === postId)
          return {
            ...post,
            comments: post.comments.filter((c) => c.id !== commentId),
          };
        return post;
      });
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      if (viewMode === "detail" && activePost && activePost.id === postId)
        setActivePost(updatedPosts.find((p) => p.id === postId));
      setAnimatingAction({ type: "delete", id: commentId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const deleteReply = (postId, commentId, replyId) => {
    if (window.confirm("Are you sure you want to delete this reply?")) {
      const updatedPosts = posts.map((post) => {
        if (post.id === postId) {
          return {
            ...post,
            comments: post.comments.map((c) =>
              c.id === commentId
                ? { ...c, replies: c.replies.filter((r) => r.id !== replyId) }
                : c,
            ),
          };
        }
        return post;
      });
      setPosts(updatedPosts);
      localStorage.setItem("forumPosts", JSON.stringify(updatedPosts));
      if (viewMode === "detail" && activePost && activePost.id === postId)
        setActivePost(updatedPosts.find((p) => p.id === postId));
      setAnimatingAction({ type: "delete", id: replyId });
      setTimeout(() => setAnimatingAction(null), 1000);
    }
  };

  const startEditing = (type, id, content, postId = null, commentId = null) => {
    setEditingItem({ type, id, content, postId, commentId });
  };

  const cancelEditing = () =>
    setEditingItem({ type: null, id: null, content: null });

  const viewPost = (post) => {
    let viewsArray = Array.isArray(post.views) ? [...post.views] : [];
    if (!viewsArray.includes(currentUser.id)) {
      viewsArray.push(currentUser.id);
      const updatedPosts = posts.map((p) =>
        p.id === post.id
          ? {
              ...p,
              views: viewsArray,
              likes: Array.isArray(p.likes) ? p.likes : [],
            }
          : p,
      );
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
    return `${String(date.getDate()).padStart(2, "0")}/${String(date.getMonth() + 1).padStart(2, "0")}/${date.getFullYear()}`;
  };

  const getLikeCount = (item) =>
    !item ? 0 : Array.isArray(item.likes) ? item.likes.length : 0;
  const hasUserLiked = (item) =>
    !item || !currentUser
      ? false
      : Array.isArray(item.likes) && item.likes.includes(currentUser.id);

  const filteredPosts = posts.filter(
    (post) =>
      post.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.content.toLowerCase().includes(searchTerm.toLowerCase()) ||
      post.author.toLowerCase().includes(searchTerm.toLowerCase()),
  );

  // ── Render ──────────────────────────────────────────────────────────────────

  return (
    <div className={`forum-wrapper ${isDarkMode ? "dark" : ""}`}>
      {/* Validation Modal */}
      <ValidationModal
        message={validationMessage}
        onClose={closeValidationModal}
      />

      <motion.div
        className="forum-top-bar"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
      >
        <h1>Discussion Forum</h1>
        <div className="top-bar-right">
          <div
            className="notification-bell"
            onClick={() => setShowNotifications(!showNotifications)}
          >
            <span className="bell-icon">🔔</span>
            {notifications.length > 0 && (
              <span className="notification-badge">{notifications.length}</span>
            )}
          </div>
          <div className="top-bar-actions">
            <motion.button
              className="dashboard-return-btn"
              onClick={() =>
                viewMode === "detail"
                  ? setViewMode("list")
                  : navigate("/dashboard")
              }
              whileHover={{ scale: 1.05, y: -2 }}
              whileTap={{ scale: 0.95 }}
            >
              {viewMode === "detail"
                ? "← Back to Forum"
                : "← Back to Dashboard"}
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
              notifications.map((notification) => (
                <motion.div
                  key={notification.id}
                  className="notification-item"
                  onClick={() => handleNotificationClick(notification)}
                  whileHover={{ x: 5, backgroundColor: "var(--bg-alt)" }}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                >
                  <div className="notification-content">
                    <strong>{notification.from}</strong> {notification.content}
                  </div>
                  <div className="notification-time">
                    {formatDate(notification.timestamp)}
                  </div>
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
                onChange={(e) =>
                  setCurrentPost({ ...currentPost, title: e.target.value })
                }
                className="title-field"
                required
              />
              <textarea
                placeholder="Share your thoughts, questions, or insights about algorithms..."
                value={currentPost.content}
                onChange={(e) =>
                  setCurrentPost({ ...currentPost, content: e.target.value })
                }
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
                  whileHover={{
                    y: -4,
                    boxShadow: "0 12px 24px rgba(0,0,0,0.15)",
                  }}
                >
                  <div className="preview-header">
                    <h3
                      onClick={() => viewPost(post)}
                      className="preview-title"
                    >
                      {post.title}
                    </h3>
                  </div>
                  <div className="preview-meta">
                    <span className="meta-author">👤 {post.author}</span>
                    <span className="meta-date">
                      📅 {formatDate(post.timestamp)}
                    </span>
                    <span className="meta-views">
                      👁️ {post.views?.length || 0} views
                    </span>
                  </div>
                  <p className="preview-excerpt">
                    {post.content.substring(0, 200)}...
                  </p>
                  {post.images && post.images.length > 0 && (
                    <div className="preview-images">
                      <img src={post.images[0]} alt="Post preview" />
                      {post.images.length > 1 && (
                        <span className="more-images">
                          +{post.images.length - 1}
                        </span>
                      )}
                    </div>
                  )}
                  <div className="preview-stats">
                    <span className="stat-likes">
                      <span className={hasUserLiked(post) ? "user-liked" : ""}>
                        {hasUserLiked(post) ? "💚" : "🤍"} {getLikeCount(post)}
                      </span>
                    </span>
                    <span className="stat-comments">
                      💬 {post.comments.length} comments
                    </span>
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
                        onClick={() =>
                          startEditing(
                            "post",
                            activePost.id,
                            activePost.content,
                          )
                        }
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
                {editingItem.type === "post" &&
                editingItem.id === activePost.id ? (
                  <div className="edit-zone">
                    <textarea
                      value={editingItem.content}
                      onChange={(e) =>
                        setEditingItem({
                          ...editingItem,
                          content: e.target.value,
                        })
                      }
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
                    className={`like-btn ${hasUserLiked(activePost) ? "liked" : ""}`}
                    whileHover={{ scale: 1.05 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {hasUserLiked(activePost) ? "💚" : "🤍"}{" "}
                    {getLikeCount(activePost)} Like
                    {getLikeCount(activePost) !== 1 ? "s" : ""}
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
                    onChange={(e) =>
                      setCurrentComment({
                        ...currentComment,
                        [activePost.id]: {
                          ...currentComment[activePost.id],
                          content: e.target.value,
                        },
                      })
                    }
                    className="comment-field"
                  />
                  <div className="images-upload-zone">
                    <label
                      htmlFor={`comment-imgs-${activePost.id}`}
                      className="upload-label"
                    >
                      📷 Upload Images
                    </label>
                    <input
                      id={`comment-imgs-${activePost.id}`}
                      type="file"
                      accept="image/*"
                      multiple
                      onChange={(e) =>
                        handleMultipleImageUpload(e, "comment", activePost.id)
                      }
                      className="upload-input"
                    />
                    {currentComment[activePost.id]?.images?.length > 0 && (
                      <div className="images-preview-grid">
                        {currentComment[activePost.id].images.map(
                          (img, idx) => (
                            <div key={idx} className="preview-item">
                              <img src={img} alt={`Preview ${idx + 1}`} />
                              <button
                                type="button"
                                className="remove-img-btn"
                                onClick={() =>
                                  removeImage("comment", idx, activePost.id)
                                }
                              >
                                ✕
                              </button>
                            </div>
                          ),
                        )}
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
                        <span className="comment-author">
                          👤 {comment.author}
                        </span>
                        <span className="comment-date">
                          📅 {formatDate(comment.timestamp)}
                        </span>
                      </div>
                      {comment.userId === currentUser.id && (
                        <div className="comment-actions">
                          <motion.button
                            onClick={() =>
                              startEditing(
                                "comment",
                                comment.id,
                                comment.content,
                                activePost.id,
                              )
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            ✏️
                          </motion.button>
                          <motion.button
                            onClick={() =>
                              deleteComment(activePost.id, comment.id)
                            }
                            whileHover={{ scale: 1.1 }}
                            whileTap={{ scale: 0.9 }}
                          >
                            🗑️
                          </motion.button>
                        </div>
                      )}
                    </div>
                    {editingItem.type === "comment" &&
                    editingItem.id === comment.id ? (
                      <div className="edit-zone">
                        <textarea
                          value={editingItem.content}
                          onChange={(e) =>
                            setEditingItem({
                              ...editingItem,
                              content: e.target.value,
                            })
                          }
                          className="edit-field"
                        />
                        <div className="edit-btns">
                          <motion.button
                            onClick={() => saveEdit(editingItem.content)}
                            whileHover={{ scale: 1.05 }}
                          >
                            💾 Save
                          </motion.button>
                          <motion.button
                            onClick={cancelEditing}
                            whileHover={{ scale: 1.05 }}
                          >
                            ❌ Cancel
                          </motion.button>
                        </div>
                      </div>
                    ) : (
                      <p className="comment-text">{comment.content}</p>
                    )}
                    {comment.images && comment.images.length > 0 && (
                      <div className="comment-images-grid">
                        {comment.images.map((img, idx) => (
                          <img
                            key={idx}
                            src={img}
                            alt={`Comment image ${idx + 1}`}
                          />
                        ))}
                      </div>
                    )}
                    <motion.button
                      onClick={() =>
                        handleLike("comment", activePost.id, comment.id)
                      }
                      className={`like-btn-small ${hasUserLiked(comment) ? "liked" : ""}`}
                      whileHover={{ scale: 1.05 }}
                      whileTap={{ scale: 0.95 }}
                    >
                      {hasUserLiked(comment) ? "💚" : "🤍"}{" "}
                      {getLikeCount(comment)}
                    </motion.button>

                    <div className="replies-area">
                      <h4>↩️ Replies ({comment.replies.length})</h4>
                      <div className="reply-form-box">
                        <textarea
                          placeholder="Write a reply..."
                          value={
                            currentReply[`${activePost.id}-${comment.id}`]
                              ?.content || ""
                          }
                          onChange={(e) =>
                            setCurrentReply({
                              ...currentReply,
                              [`${activePost.id}-${comment.id}`]: {
                                ...currentReply[
                                  `${activePost.id}-${comment.id}`
                                ],
                                content: e.target.value,
                              },
                            })
                          }
                          className="reply-field"
                        />
                        <div className="images-upload-zone">
                          <label
                            htmlFor={`reply-imgs-${activePost.id}-${comment.id}`}
                            className="upload-label"
                          >
                            📷 Images
                          </label>
                          <input
                            id={`reply-imgs-${activePost.id}-${comment.id}`}
                            type="file"
                            accept="image/*"
                            multiple
                            onChange={(e) =>
                              handleMultipleImageUpload(
                                e,
                                "reply",
                                activePost.id,
                                comment.id,
                              )
                            }
                            className="upload-input"
                          />
                          {currentReply[`${activePost.id}-${comment.id}`]
                            ?.images?.length > 0 && (
                            <div className="images-preview-grid">
                              {currentReply[
                                `${activePost.id}-${comment.id}`
                              ].images.map((img, idx) => (
                                <div key={idx} className="preview-item">
                                  <img src={img} alt={`Preview ${idx + 1}`} />
                                  <button
                                    type="button"
                                    className="remove-img-btn"
                                    onClick={() =>
                                      removeImage(
                                        "reply",
                                        idx,
                                        activePost.id,
                                        comment.id,
                                      )
                                    }
                                  >
                                    ✕
                                  </button>
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <motion.button
                          onClick={() =>
                            handleReplySubmit(activePost.id, comment.id)
                          }
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
                              <span className="reply-author">
                                👤 {reply.author}
                              </span>
                              <span className="reply-date">
                                📅 {formatDate(reply.timestamp)}
                              </span>
                            </div>
                            {reply.userId === currentUser.id && (
                              <div className="reply-actions">
                                <motion.button
                                  onClick={() =>
                                    startEditing(
                                      "reply",
                                      reply.id,
                                      reply.content,
                                      activePost.id,
                                      comment.id,
                                    )
                                  }
                                  whileHover={{ scale: 1.1 }}
                                >
                                  ✏️
                                </motion.button>
                                <motion.button
                                  onClick={() =>
                                    deleteReply(
                                      activePost.id,
                                      comment.id,
                                      reply.id,
                                    )
                                  }
                                  whileHover={{ scale: 1.1 }}
                                >
                                  🗑️
                                </motion.button>
                              </div>
                            )}
                          </div>
                          {editingItem.type === "reply" &&
                          editingItem.id === reply.id ? (
                            <div className="edit-zone">
                              <textarea
                                value={editingItem.content}
                                onChange={(e) =>
                                  setEditingItem({
                                    ...editingItem,
                                    content: e.target.value,
                                  })
                                }
                                className="edit-field"
                              />
                              <div className="edit-btns">
                                <motion.button
                                  onClick={() => saveEdit(editingItem.content)}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  💾 Save
                                </motion.button>
                                <motion.button
                                  onClick={cancelEditing}
                                  whileHover={{ scale: 1.05 }}
                                >
                                  ❌ Cancel
                                </motion.button>
                              </div>
                            </div>
                          ) : (
                            <p className="reply-text">{reply.content}</p>
                          )}
                          {reply.images && reply.images.length > 0 && (
                            <div className="reply-images-grid">
                              {reply.images.map((img, idx) => (
                                <img
                                  key={idx}
                                  src={img}
                                  alt={`Reply image ${idx + 1}`}
                                />
                              ))}
                            </div>
                          )}
                          <motion.button
                            onClick={() =>
                              handleLike(
                                "reply",
                                activePost.id,
                                comment.id,
                                reply.id,
                              )
                            }
                            className={`like-btn-small ${hasUserLiked(reply) ? "liked" : ""}`}
                            whileHover={{ scale: 1.05 }}
                          >
                            {hasUserLiked(reply) ? "💚" : "🤍"}{" "}
                            {getLikeCount(reply)}
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
            {animatingAction.type === "create" &&
              "✅ Post created successfully!"}
            {animatingAction.type === "update" && "✅ Updated successfully!"}
            {animatingAction.type === "delete" && "🗑️ Deleted successfully!"}
            {animatingAction.type === "comment" && "💬 Comment posted!"}
            {animatingAction.type === "reply" && "↩️ Reply posted!"}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default Forum;
