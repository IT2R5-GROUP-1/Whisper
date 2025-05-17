<?php

namespace App\Http\Controllers;

use App\Models\Comment;
use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class CommentController extends Controller
{
    // Add comment to post
    public function store(Request $request, $postId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = Post::find($postId);
        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $comment = Comment::create([
            'post_id' => $postId,
            'parent_comment_id' => null,
            'content' => $request->content,
        ]);

        return response()->json(['message' => 'Comment added', 'comment' => $comment], 201);
    }

    // Reply to comment
    public function reply(Request $request, $commentId)
    {
        $validator = Validator::make($request->all(), [
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $parentComment = Comment::find($commentId);
        if (!$parentComment) {
            return response()->json(['message' => 'Comment not found'], 404);
        }

        $reply = Comment::create([
            'post_id' => $parentComment->post_id,
            'parent_comment_id' => $commentId,
            'content' => $request->content,
        ]);

        return response()->json(['message' => 'Reply added', 'reply' => $reply], 201);
    }
}
