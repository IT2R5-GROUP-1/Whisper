<?php

namespace App\Http\Controllers;

use App\Services\JokeService;

class JokeController extends Controller
{
    protected $jokeService;

    public function __construct(JokeService $jokeService)
    {
        $this->jokeService = $jokeService;
    }

    public function getJoke()
    {
        $joke = $this->jokeService->getRandomJoke();
        return response()->json(['joke' => $joke]);
    }
}
