<?php

namespace App\Http\Controllers;

use App\Models\Property;
use Illuminate\Http\Request;

class PropertyController extends Controller
{
    public function index()
    {
        $properties = Property::with('user')->latest()->get();
        return response()->json($properties);
    }

    public function store(Request $request)
    {
        $validated = $request->validate([
            'type' => 'required|in:casa,apartamento,local,oficina',
            'title' => 'required|string|max:255',
            'description' => 'nullable|string',
            'address' => 'required|string|max:255',
            'city' => 'required|string|max:100',
            'area_m2' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'monthly_rent' => 'required|numeric',
            'status' => 'nullable|in:disponible,arrendado,mantenimiento',
            'image_url' => 'nullable|url',
        ]);

        $validated['user_id'] = $request->user()->id;

        $property = Property::create($validated);

        return response()->json($property, 201);
    }

    public function show(Property $property)
    {
        return response()->json($property->load('user'));
    }

    public function update(Request $request, Property $property)
    {
        // Verificar que el usuario sea el dueño
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $validated = $request->validate([
            'type' => 'sometimes|in:casa,apartamento,local,oficina',
            'title' => 'sometimes|string|max:255',
            'description' => 'nullable|string',
            'address' => 'sometimes|string|max:255',
            'city' => 'sometimes|string|max:100',
            'area_m2' => 'nullable|numeric',
            'bedrooms' => 'nullable|integer',
            'bathrooms' => 'nullable|integer',
            'monthly_rent' => 'sometimes|numeric',
            'status' => 'nullable|in:disponible,arrendado,mantenimiento',
            'image_url' => 'nullable|url',
        ]);

        $property->update($validated);

        return response()->json($property);
    }

    public function destroy(Property $property, Request $request)
    {
        if ($property->user_id !== $request->user()->id) {
            return response()->json(['message' => 'No autorizado'], 403);
        }

        $property->delete();

        return response()->json(['message' => 'Propiedad eliminada']);
    }

    public function stats(Request $request)
    {
        $userId = $request->user()->id;

        $stats = [
            'total' => Property::where('user_id', $userId)->count(),
            'disponibles' => Property::where('user_id', $userId)->where('status', 'disponible')->count(),
            'arrendadas' => Property::where('user_id', $userId)->where('status', 'arrendado')->count(),
            'ingresos_mensuales' => Property::where('user_id', $userId)
                ->where('status', 'arrendado')
                ->sum('monthly_rent'),
        ];

        return response()->json($stats);
    }
}