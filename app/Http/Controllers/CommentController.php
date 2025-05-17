<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    // ✅ Add a new comment to a specific post
    public function store(Request $request, $postId)
    {
        // 🔍 Validate input
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        // ❌ Return errors if validation fails
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 🔎 Check if post exists
        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        // 💬 Create a new top-level comment (not a reply)
        $comment = Comment::create([
            'post_id' => $postId,
            'parent_comment_id' => null,
            'content' => $request->content,
            'username' => $request->username, // save username of commenter
        ]);

        // ✅ Return success response
        return response()->json(['message' => 'Comment added', 'comment' => $comment], 201);
    }

    // 🔁 Reply to an existing comment
    public function reply(Request $request, $commentId)
    {
        // 🔍 Validate input
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        // ❌ Return errors if validation fails
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 🔎 Check if parent comment exists
        $parentComment = Comment::find($commentId);
        if (!$parentComment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        // 💬 Create a reply to the parent comment
        $reply = Comment::create([
            'post_id' => $parentComment->post_id, // use the same post ID
            'parent_comment_id' => $commentId,    // set parent comment ID
            'content' => $request->content,
            'username' => $request->username,     // save username of replier
        ]);

        // ✅ Return success response
        return response()->json(['message' => 'Reply added', 'reply' => $reply], 201);
    }

    // 📋 Get all comments for a specific post
    public function getComments($postId)
    {
        // 🔃 Fetch comments sorted by creation time
        $comments = Comment::where('post_id', $postId)
            ->orderBy('created_at', 'asc')
            ->get();

        return response()->json($comments);
    }
}
