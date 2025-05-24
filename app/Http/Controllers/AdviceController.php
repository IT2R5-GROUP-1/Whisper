<?php

namespace App\Http\Controllers;

use App\Services\AdviceService;
use Laravel\Lumen\Routing\Controller as BaseController;

class AdviceController extends BaseController
{
    protected $adviceService;

    public function __construct(AdviceService $adviceService)
    {
        $this->adviceService = $adviceService;
    }

    public function randomAdvice()
    {
        $advice = $this->adviceService->getRandomAdvice();
        return response()->json(['advice' => $advice]);
    }
}
