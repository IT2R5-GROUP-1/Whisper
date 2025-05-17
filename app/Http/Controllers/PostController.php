<?php

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller
{
    // Create post
    public function store(Request $request)
    {
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'content' => 'required|string',
        ]);

        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        $post = Post::create($request->only('title', 'content'));

        return response()->json(['message' => 'Post created', 'post' => $post], 201);
    }

    // List posts or search
    public function index(Request $request)
    {
        $query = $request->query('q');

        if ($query) {
            $posts = Post::where('title', 'like', "%$query%")
                ->orWhere('content', 'like', "%$query%")
                ->get();
        } else {
            $posts = Post::all();
        }

        return response()->json($posts);
    }

    // Show post with comments and replies
    public function show($id)
    {
        $post = Post::with(['comments.replies'])->find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    public function destroy($id)
{
    $post = Post::find($id);

    if (!$post) {
        return response()->json(['message' => 'Post not found'], 404);
    }

    $post->delete();

    return response()->json(['message' => 'Post deleted successfully']);
}


}
