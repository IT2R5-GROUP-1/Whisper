<?php  

namespace App\Http\Controllers;

use App\Models\Post;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\Validator;

class PostController extends Controller 
{
    // ✅ Create a new post
    public function store(Request $request) 
    {
        // 🔍 Validate incoming request data
        $validator = Validator::make($request->all(), [
            'title' => 'required|string',
            'content' => 'required|string',
            'username' => 'required|string', // validate the username
        ]);

        // ❌ If validation fails, return errors
        if ($validator->fails()) {
            return response()->json(['errors' => $validator->errors()], 422);
        }

        // 📝 Create the post and save to database
        $post = Post::create([
            'title' => $request->title,
            'content' => $request->content,
            'username' => $request->username, // save the username too
        ]);

        // ✅ Return success response with the new post
        return response()->json(['message' => 'Post created', 'post' => $post], 201);
    }

    // 🔍 List all posts or search by query
    public function index(Request $request)
    {
        $query = $request->query('q'); // get the search keyword from URL

        if ($query) {
            // 🔎 Search posts by title or content
            $posts = Post::where('title', 'like', "%$query%")
                ->orWhere('content', 'like', "%$query%")
                ->get();
        } else {
            // 📋 If no search query, return all posts
            $posts = Post::all();
        }

        return response()->json($posts);
    }

    // 👁️ Show a specific post along with its comments and replies
    public function show($id)
    {
        // 🧠 Use eager loading to include comments and their replies
        $post = Post::with(['comments.replies'])->find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        return response()->json($post);
    }

    // ❌ Delete a specific post by ID
    public function destroy($id) 
    {
        $post = Post::find($id);

        if (!$post) {
            return response()->json(['message' => 'Post not found'], 404);
        }

        $post->delete(); // 🗑️ Remove the post from database

        return response()->json(['message' => 'Post deleted successfully']);
    }
}
