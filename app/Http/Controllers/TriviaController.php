<?php

namespace App\Http\Controllers;

use App\Services\TriviaService;

class TriviaController extends Controller
{
    protected $triviaService;

    public function __construct(TriviaService $triviaService)
    {
        $this->triviaService = $triviaService;
    }

    public function getTrivia()
    {
        $trivia = $this->triviaService->getTrivia();
        return response()->json($trivia);
    }
}
