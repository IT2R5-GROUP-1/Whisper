// Username Generator for Session
function generateSessionUsername() {
  const adjectives = [
    "Happy", "Brave", "Clever", "Gentle", "Wise", "Swift", "Kind", "Bold", 
    "Calm", "Witty", "Sharp", "Bright", "Eager", "Loyal", "Quiet", "Fierce",
    "Sleepy", "Curious", "Jolly", "Silly", "Proud", "Peaceful", "Thoughtful"
  ];
  
  const nouns = [
    "Tiger", "Eagle", "Dolphin", "Panda", "Wolf", "Lion", "Fox", "Owl",
    "Bear", "Hawk", "Rabbit", "Koala", "Dragon", "Falcon", "Otter", "Raccoon",
    "Turtle", "Penguin", "Giraffe", "Monkey", "Jaguar", "Phoenix", "Squirrel"
  ];
  
  const randomAdjective = adjectives[Math.floor(Math.random() * adjectives.length)];
  const randomNoun = nouns[Math.floor(Math.random() * nouns.length)];
  const randomNumber = Math.floor(Math.random() * 100) + 1;
  
  return `${randomAdjective}${randomNoun}${randomNumber}`;
}

// Get the current session username (creates new one if needed)
function getSessionUsername() {
  // Check if a username is already stored in sessionStorage
  let username = sessionStorage.getItem('whisper_username');
  
  // If no username is found, generate a new one and store it
  if (!username) {
    username = generateSessionUsername();
    sessionStorage.setItem('whisper_username', username); // Fixed: setItem, not getItem
  }
  
  return username;
}

document.addEventListener("DOMContentLoaded", function () {
    const username = getSessionUsername();
    console.log("Current session username:", username);
    document.getElementById("session-username-display").innerText = `You are logged in as: ${username}`;
    fetchPosts();
});


// Fetch all posts from Post API (port 8000)
function fetchPosts() {
    fetch("http://localhost:8000/posts")
        .then(res => res.json())
        .then(posts => {
            const container = document.getElementById("posts");
            container.innerHTML = ""; // Clear any existing posts

            posts.forEach(post => {
                const postDiv = document.createElement("div");
                postDiv.classList.add("post");
                postDiv.id = `post-${post.id}`; // Add a unique ID for each post

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
                    <button onclick="toggleComments(${post.id})">View Comments</button>
                    <div class="comments" id="comments-${post.id}" style="display: none;"></div>
                `;

                container.appendChild(postDiv);
            });
        });
}


// Show and hide the create post form
function showCreatePostForm() {
    document.getElementById("create-post-form").style.display = "block";
}

function hideCreatePostForm() {
    document.getElementById("create-post-form").style.display = "none";
}

// Submit new post to Post API (port 8000)
function submitPost() {
    const title = document.getElementById("post-title").value.trim();
    const content = document.getElementById("post-content").value.trim();

    if (!title || !content) {
        alert("Please enter both title and content.");
        return;
    }

    fetch("http://localhost:8000/posts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            title, 
            content,
            username: getSessionUsername() // Add the session username
        })
    })
        .then(res => res.json())
        .then(() => {
            hideCreatePostForm();
            fetchPosts(); // Refresh post list
        })
        .catch(err => {
            console.error("Error submitting post:", err);
            alert("Failed to submit post.");
        });
}

// Submit new comment to Comment API (port 8001)
function addComment(postId) {
    const text = prompt("Enter your comment:");
    if (!text) return;

    fetch(`http://localhost:8001/posts/${postId}/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text, 
            username: getSessionUsername() // Add the session username
        })
    })
        .then(res => res.json())
        .then(() => fetchComments(postId));
}

// Toggle visibility of comments
function toggleComments(postId) {
    const container = document.getElementById(`comments-${postId}`);
    const isHidden = container.style.display === "none";

    if (isHidden) {
        fetchComments(postId);
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
}

// Fetch comments from Comment API (port 8001)
// Fetch comments and replies for a post
function fetchComments(postId) {
    fetch(`http://localhost:8001/posts/${postId}/comments`)
        .then(res => res.json())
        .then(comments => {
            const container = document.getElementById(`comments-${postId}`);
            container.innerHTML = ""; // Clear previous comments

            // Helper function to display a comment
            function displayComment(comment, replies) {
                const commentDiv = document.createElement("div");
                commentDiv.classList.add("comment");

                commentDiv.innerHTML = `
                    <p><strong>${comment.username || "User"}:</strong> ${comment.text}</p>
                    <button onclick="replyToComment(${comment.id}, ${postId})">Reply</button>
                    <div class="replies" id="replies-${comment.id}">
                        <!-- Replies will go here -->
                    </div>
                `;

                // Show replies under this comment
                replies.forEach(reply => {
                    const replyDiv = document.createElement("div");
                    replyDiv.classList.add("reply");
                    replyDiv.innerHTML = `<p><em>${reply.username || 'Anonymous'}:</em> ${reply.text}</p>`;
                    commentDiv.querySelector(`#replies-${comment.id}`).appendChild(replyDiv);
                });

                container.appendChild(commentDiv);
            }

            // Iterate over each comment and display it with its replies
            comments.forEach(comment => {
                // Filter out the replies for this comment
                const replies = comments.filter(reply => reply.parent_id === comment.id);
                if (comment.parent_id === null) { // Only show top-level comments
                    displayComment(comment, replies);
                }
            });
        });
}


// Submit reply to a comment
function replyToComment(commentId, postId) {
    const text = prompt("Enter your reply:");
    if (!text) return;

    fetch(`http://localhost:8001/comments/${commentId}/reply`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ 
            text,
            username: getSessionUsername() // Add the session username
        })
    })
        .then(res => res.json())
        .then(() => fetchComments(postId));
}

// Fetch replies for a comment
function fetchReplies(commentId) {
    fetch(`http://localhost:8001/comments/${commentId}/replies`)
        .then(res => res.json())
        .then(replies => {
            const container = document.getElementById(`replies-${commentId}`);
            container.innerHTML = "";

            replies.forEach(reply => {
                const replyDiv = document.createElement("div");
                replyDiv.classList.add("reply");
                replyDiv.innerHTML = `<p><em>${reply.username || 'Anonymous'}:</em> ${reply.text}</p>`;
                container.appendChild(replyDiv);
            });
        });
}

// Toggle comments with debugging
function toggleComments(postId) {
    console.log("Toggling comments for post:", postId);

    const container = document.getElementById(`comments-${postId}`);
    const isHidden = container.style.display === "none" || container.innerHTML === "";

    if (isHidden) {
        fetchComments(postId);
        container.style.display = "block";
    } else {
        container.style.display = "none";
    }
}

function searchPosts() {
    const query = document.getElementById("search-input").value.trim();

    if (!query) {
        alert("Please enter a search term.");
        return;
    }

    fetch(`http://localhost:8000/posts/search?q=${query}`)
        .then(res => res.json())
        .then(posts => {
            const container = document.getElementById("posts");
            container.innerHTML = ""; // Clear previous posts

            if (posts.length === 0) {
                container.innerHTML = "<p>No posts found.</p>";
            }

            posts.forEach(post => {
                const postDiv = document.createElement("div");
                postDiv.classList.add("post");

                postDiv.innerHTML = `
                    <div class="post-header">
                        <p class="post-username"><i class="fas fa-user-circle"></i> ${post.username || 'Anonymous'}</p>
                        <button class="dots-btn" onclick="toggleDeleteButton(${post.id})">...</button>
                    </div>
                    <h3 class="post-title">${post.title}</h3>
                    <div class="post-content">${post.content}</div>
                    <button onclick="addComment(${post.id})">Add Comment</button>
                    <button onclick="toggleComments(${post.id})">View Comments</button>
                    <div class="comments" id="comments-${post.id}" style="display: none;"></div>
                `;

                container.appendChild(postDiv);
            });
        })
        .catch(err => {
            console.error("Error fetching search results:", err);
            alert("Failed to fetch search results.");
        });
}

// Toggle visibility of the delete button
function toggleDeleteButton(postId) {
    const deleteBtn = document.getElementById(`delete-btn-${postId}`);
    const isHidden = deleteBtn.style.display === "none";

    // Show or hide the delete button
    deleteBtn.style.display = isHidden ? "inline-block" : "none";
}

// Delete a post
function deletePost(postId) {
    if (confirm("Are you sure you want to delete this post?")) {
        fetch(`http://localhost:8000/posts/${postId}`, {
            method: "DELETE",
        })
        .then(res => {
            if (res.ok) {
                // Remove the post from the DOM
                const postDiv = document.getElementById(`post-${postId}`);
                postDiv.remove();
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

