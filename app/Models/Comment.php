<?php

namespace App\Models;

use Illuminate\Database\Eloquent\Model;

class Comment extends Model
{
    protected $fillable = 
        [
        'post_id', 
        'parent_comment_id', 
        'content', 
        'username'
        ];

    public function replies()
    {
        return $this->hasMany(Comment::class, 'parent_comment_id');
    }

    public function post()
    {
        return $this->belongsTo(Post::class);
    }
}
