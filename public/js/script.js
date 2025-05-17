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
  document.getElementById("session-username-display").innerText = `You are logged in as: ${username}`;
  fetchPosts(); // Load posts on page load
});

// === Fetch all posts from backend ===
function fetchPosts() {
  fetch("http://localhost:8000/posts")
    .then(res => res.json())
    .then(posts => renderPosts(posts));
}

// === Render posts to the page ===
function renderPosts(posts) {
  const container = document.getElementById("posts");
  container.innerHTML = ""; // Clear current posts

  posts.forEach(post => {
    const postDiv = document.createElement("div");
    postDiv.classList.add("post");
    postDiv.id = `post-${post.id}`;
    
    // Create the post's HTML
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
  console.log("Posting comment with username:", username);

  fetch(`http://localhost:8000/posts/${postId}/comments`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ content, username })
  })
    .then(res => res.json())
    .then(() => fetchComments(postId)); // Reload comments
}

// === Toggle show/hide comments ===
function toggleComments(postId) {
  const container = document.getElementById(`comments-${postId}`);
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

  // === Render all replies under this comment ===
  const repliesContainer = document.getElementById(`replies-${comment.id}`);
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
    .then(() => fetchComments(postId)); // Refresh comments
}

// === Show/hide the delete button ===
function toggleDeleteButton(postId) {
  const deleteBtn = document.getElementById(`delete-btn-${postId}`);
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
          document.getElementById(`post-${postId}`).remove();
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
  const title = document.getElementById("post-title").value;
  const content = document.getElementById("post-content").value;

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

  fetch(`http://localhost:8000/posts?q=${encodeURIComponent(query)}`)
    .then(res => res.json())
    .then(posts => {
      const container = document.getElementById("posts");
      container.innerHTML = "";

      if (posts.length === 0) {
        container.innerHTML = "<p>No posts found.</p>";
        return;
      }

      posts.forEach(post => {
        const postDiv = document.createElement("div");
        postDiv.classList.add("post");
        postDiv.id = `post-${post.id}`;
        postDiv.innerHTML = `
          <div class="post-header">
            <p class="post-username"><i class="fas fa-user-circle"></i> ${post.username || 'Anonymous'}</p>
            <p class="post-date">${new Date(post.created_at).toLocaleString()}</p>
          </div>
          <h3 class="post-title">${post.title}</h3>
          <div class="post-content">${post.content}</div>
        `;
        container.appendChild(postDiv);
      });
    })
    .catch(err => {
      console.error("Search failed:", err);
      alert("Failed to fetch search results.");
    });
}

// === Prevent rapid clicking when going home ===
let clicked = false;
function goHome() {
  if (clicked) return;
  clicked = true;
  window.location.href = 'index.html'; // Navigate to homepage
}
