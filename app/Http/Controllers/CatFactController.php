<?php

namespace App\Http\Controllers;

use App\Services\CatFactService;

class CatFactController extends Controller
{
    protected $catFactService;

    public function __construct(CatFactService $catFactService)
    {
        $this->catFactService = $catFactService;
    }

    public function getCatFact()
    {
        $fact = $this->catFactService->getCatFact();
        return response()->json(['fact' => $fact]);
    }
}
