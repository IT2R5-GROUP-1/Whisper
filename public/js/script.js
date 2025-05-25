// === Set the base URL for the backend API ===
const BASE_URL = window.location.hostname.includes("localhost")
  ? "http://localhost:8000"
  : "https://whisper-production-7380.up.railway.app"; // replace with your Railway URL

// === Generate a random session username ===
function generateSessionUsername() {
  const adjectives = ["Happy", "Brave", "Clever", "Gentle", "Wise", "Swift", "Kind", "Bold", "Calm", "Witty"];
  const nouns = ["Tiger", "Eagle", "Dolphin", "Panda", "Wolf", "Lion", "Fox", "Owl", "Bear", "Hawk", "Cheetah", "Cat", "Dog", "Monkey"];
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 9999) + 1;
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

// === Get username from session or generate a new one ===
function getSessionUsername() {
  let username = sessionStorage.getItem('whisper_username');
  if (!username) {
    username = generateSessionUsername();
    sessionStorage.setItem('whisper_username', username);
  }
  return username;
}

// === Run when page loads ===
document.addEventListener("DOMContentLoaded", function () {
  const username = getSessionUsername();
  const usernameDisplay = document.getElementById("session-username-display");
  if (usernameDisplay) {
    usernameDisplay.innerText = `You are logged in as: ${username}`;
  }
  fetchPosts(); // Load posts on page load

  // Sidebar toggle logic
  const sidebar = document.querySelector('.sidebar');
  const overlay = document.querySelector('.sidebar-overlay');
  const trigger = document.querySelector('.sidebar-trigger-area');

  if(trigger && sidebar && overlay){
    trigger.addEventListener('click', () => {
      sidebar.classList.add('show');
      overlay.classList.add('active');
    });

    overlay.addEventListener('click', () => {
      sidebar.classList.remove('show');
      overlay.classList.remove('active');
    });
  }
});

// === Fetch all posts from backend ===
function fetchPosts() {
  fetch("http://localhost:8000/posts")
    .then(res => res.json())
    .then(posts => renderPosts(posts))
    .catch(err => console.error("Error fetching posts:", err));
}

// === Render posts to the page ===
function renderPosts(posts) {
  const container = document.getElementById("posts");
  if (!container) return;

  container.innerHTML = ""; // Clear current posts

  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");
    postDiv.id = `post-${post.id}`;

    postDiv.innerHTML = `
      <div class="post-header">
        <p class="post-username"><i class="fas fa-user-circle"></i> ${post.username || 'Anonymous'}</p>
        <p class="post-date">${new Date(post.created_at).toLocaleString()}</p>
        ${post.username === getSessionUsername() ? `
          <button class="dots-btn" onclick="toggleDeleteButton(${post.id})">...</button>
          <button class="delete-btn" id="delete-btn-${post.id}" style="display: none;" onclick="deletePost(${post.id})">Delete</button>
        ` : ''}
      </div>
      <h3 class="post-title">${post.title}</h3>
      <div class="post-content">${post.content}</div>
      <button onclick="addComment(${post.id})">Add Comment</button>
      <button onclick="event.preventDefault(); toggleComments(${post.id})">View Comments</button>
      <div class="comments" id="comments-${post.id}" style="display: none;"></div>
    `;
    container.appendChild(postDiv);
  });
}

// === Prompt user to add comment and post it ===
function addComment(postId) {
  const content = prompt("Enter your comment:");
  if (!content) return;

  const username = getSessionUsername();

  fetch(`http://localhost:8000/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, username })
  })
    .then(res => res.json())
    .then(() => fetchComments(postId)) // Reload comments
    .catch(err => console.error("Error posting comment:", err));
}

// === Toggle show/hide comments ===
function toggleComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
  if (!container) return;

  const isHidden = container.style.display === "none" || container.innerHTML === "";
  if (isHidden) {
    fetchComments(postId); // Fetch and show
    container.style.display = "block";
  } else {
    container.style.display = "none"; // Hide
  }
}

// === Fetch and render comments + replies ===
function fetchComments(postId) {
  fetch(`http://localhost:8000/posts/${postId}/comments`)
    .then(res => res.json())
    .then(comments => {
      const container = document.getElementById(`comments-${postId}`);
      if (!container) return;

      container.innerHTML = "";

      const topLevel = comments.filter(c => !c.parent_comment_id);
      const replies = comments.filter(c => c.parent_comment_id);

      topLevel.forEach(comment => {
        displayComment(comment, replies, container);
      });
    })
    .catch(err => console.error("Error fetching comments:", err));
}

// === Render a comment and its replies ===
function displayComment(comment, allReplies, container) {
  const commentDiv = document.createElement("div");
  commentDiv.classList.add("comment");
  commentDiv.innerHTML = `
    <p><strong>${comment.username || "Anonymous"}:</strong> ${comment.content}</p>
    <button onclick="replyToComment(${comment.id}, ${comment.post_id})">Reply</button>
    <div class="replies" id="replies-${comment.id}"></div>
  `;
  container.appendChild(commentDiv);

  // Render all replies under this comment
  const repliesContainer = document.getElementById(`replies-${comment.id}`);
  if (!repliesContainer) return;

  const replies = allReplies.filter(r => r.parent_comment_id === comment.id);
  replies.forEach(reply => {
    const replyDiv = document.createElement("div");
    replyDiv.classList.add("reply");
    replyDiv.innerHTML = `<p><em>${reply.username || 'Anonymous'}:</em> ${reply.content}</p>`;
    repliesContainer.appendChild(replyDiv);
  });
}

// === Prompt reply to comment and post it ===
function replyToComment(commentId, postId) {
  const content = prompt("Enter your reply:");
  if (!content) return;

  fetch(`http://localhost:8000/comments/${commentId}/reply`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, username: getSessionUsername() })
  })
    .then(res => res.json())
    .then(() => fetchComments(postId)) // Refresh comments
    .catch(err => console.error("Error posting reply:", err));
}

// === Show/hide the delete button ===
function toggleDeleteButton(postId) {
  const deleteBtn = document.getElementById(`delete-btn-${postId}`);
  if (!deleteBtn) return;

  const isHidden = deleteBtn.style.display === "none";
  deleteBtn.style.display = isHidden ? "inline-block" : "none";
}

// === Delete a post ===
function deletePost(postId) {
  if (confirm("Are you sure you want to delete this post?")) {
    fetch(`http://localhost:8000/posts/${postId}`, {
      method: "DELETE",
    })
      .then(res => {
        if (res.ok) {
          const postElem = document.getElementById(`post-${postId}`);
          if (postElem) postElem.remove();
          alert("Post deleted successfully.");
        } else {
          alert("Failed to delete the post.");
        }
      })
      .catch(err => {
        console.error("Error deleting post:", err);
        alert("Failed to delete the post.");
      });
  }
}

// === Show the post creation form ===
function showCreatePostForm() {
  const form = document.getElementById('create-post-form');
  if (form) {
    form.style.display = 'block';
  } else {
    console.error("Create post form not found.");
  }
}

// === Submit a new post to the server ===
async function submitPost() {
  const title = document.getElementById("post-title")?.value;
  const content = document.getElementById("post-content")?.value;

  if (!title || !content) {
    alert("Please fill out both title and content!");
    return;
  }

  const postData = {
    title,
    content,
    username: getSessionUsername(),
  };

  try {
    const res = await fetch("http://localhost:8000/posts", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(postData),
    });

    const result = await res.json();

    if (res.ok) {
      alert("Post created!");

      // Clear form fields
      document.getElementById("post-title").value = "";
      document.getElementById("post-content").value = "";

      // Hide form
      hideCreatePostForm();

      // Refresh posts list
      fetchPosts();
    } else {
      alert(result.message || "Something went wrong.");
    }
  } catch (error) {
    console.error("Error submitting post:", error);
    alert("Failed to create post.");
  }
}

// === Hide the post creation form ===
function hideCreatePostForm() {
  const form = document.getElementById('create-post-form');
  if (form) {
    form.style.display = 'none';
  }
}

// === Search for posts based on query ===
function searchPosts() {
  const input = document.getElementById("search-input");
  if (!input) {
    alert("Search input not found!");
    return;
  }

  const query = input.value.trim();
  if (!query) {
    alert("Please enter a search term.");
    return;
  }

  fetch(`http://localhost:8000/posts/search?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(posts => renderPosts(posts))
    .catch(err => {
      console.error("Error searching posts:", err);
      alert("Failed to search posts.");
    });
}

// === Clear search and reload all posts ===
function clearSearch() {
  const input = document.getElementById("search-input");
  if (input) input.value = "";
  fetchPosts();
}
