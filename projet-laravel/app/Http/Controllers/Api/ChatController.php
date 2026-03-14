<?php

namespace App\Http\Controllers\Api;

use App\Http\Controllers\Controller;
use App\Models\Conversation;
use App\Models\Message;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Illuminate\Support\Facades\Log;

class ChatController extends Controller
{
    public function index()
    {
        Log::info('Méthode index appelée'); // facultatif
        $user = auth()->user();
        $conversations = $user->conversations()
            ->with(['users' => function ($q) {
                $q->select('users.id', 'users.name', 'users.photo');
            }, 'lastMessage.user'])
            ->get();
        return response()->json($conversations);
    }

    public function store(Request $request)
    {
        $request->validate([
            'user_ids' => 'required|array',
            'user_ids.*' => 'exists:users,id',
        ]);

        if (count($request->user_ids) == 2) {
            $existing = Conversation::whereHas('users', function ($q) use ($request) {
                $q->where('user_id', $request->user_ids[0]);
            })->whereHas('users', function ($q) use ($request) {
                $q->where('user_id', $request->user_ids[1]);
            })->whereDoesntHave('users', function ($q) use ($request) {
                $q->whereNotIn('user_id', $request->user_ids);
            })->first();

            if ($existing) {
                return response()->json($existing->load('users'));
            }
        }

        $conversation = Conversation::create();
        $conversation->users()->attach($request->user_ids);
        return response()->json($conversation->load('users'), 201);
    }

    public function show(Conversation $conversation)
    {
        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $messages = $conversation->messages()->with('user')->orderBy('created_at', 'asc')->get();
        return response()->json($messages);
    }

    public function sendMessage(Request $request, Conversation $conversation)
    {
        $request->validate(['content' => 'required|string']);

        if (!$conversation->users()->where('user_id', auth()->id())->exists()) {
            return response()->json(['message' => 'Accès interdit'], 403);
        }

        $message = Message::create([
            'conversation_id' => $conversation->id,
            'user_id'         => auth()->id(),
            'content'         => $request->content,
            'seen'            => false,
        ]);

        return response()->json($message->load('user'), 201);
    }

    public function markAsRead(Conversation $conversation)
    {
        $user = auth()->user();

        Message::where('conversation_id', $conversation->id)
            ->where('user_id', '!=', $user->id)
            ->where('seen', false)
            ->update(['seen' => true]);

        return response()->json(['message' => 'Messages marqués comme lus']);
    }
}