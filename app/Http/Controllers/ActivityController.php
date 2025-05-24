<?php

namespace App\Http\Controllers;

use App\Services\ActivityService;

class ActivityController extends Controller
{
    protected $activityService;

    public function __construct(ActivityService $activityService)
    {
        $this->activityService = $activityService;
    }

    public function getActivity()
    {
        $activity = $this->activityService->getActivity();
        return response()->json($activity);
    }
}
