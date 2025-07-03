
import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import type { Database } from '@/integrations/supabase/types';

type GameRoom = Database['public']['Tables']['game_rooms']['Row'];
type RoomPlayer = Database['public']['Tables']['room_players']['Row'];
type GameType = Database['public']['Enums']['game_type'];

export const useMultiplayer = (walletAddress?: string) => {
  const [gameRooms, setGameRooms] = useState<GameRoom[]>([]);
  const [currentRoom, setCurrentRoom] = useState<GameRoom | null>(null);
  const [roomPlayers, setRoomPlayers] = useState<RoomPlayer[]>([]);
  const [loading, setLoading] = useState(false);

  // Fetch available game rooms
  const fetchGameRooms = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('status', 'waiting')
      .order('created_at', { ascending: false });

    if (error) {
      console.error('Error fetching game rooms:', error);
    } else {
      setGameRooms(data || []);
    }
    setLoading(false);
  };

  // Create a new game room
  const createGameRoom = async (gameType: GameType, maxPlayers: number = 4) => {
    if (!walletAddress) return null;

    const roomCode = await generateRoomCode();
    const { data, error } = await supabase
      .from('game_rooms')
      .insert({
        room_code: roomCode,
        game_type: gameType,
        max_players: maxPlayers,
        host_wallet_address: walletAddress,
      })
      .select()
      .single();

    if (error) {
      console.error('Error creating game room:', error);
      return null;
    }

    // Join the room as host
    await joinGameRoom(data.id);
    return data;
  };

  // Join a game room
  const joinGameRoom = async (roomId: string) => {
    if (!walletAddress) return false;

    const { error } = await supabase
      .from('room_players')
      .insert({
        room_id: roomId,
        wallet_address: walletAddress,
      });

    if (error) {
      console.error('Error joining game room:', error);
      return false;
    }

    // Fetch the room details
    const { data: room } = await supabase
      .from('game_rooms')
      .select('*')
      .eq('id', roomId)
      .single();

    if (room) {
      setCurrentRoom(room);
    }

    return true;
  };

  // Leave current room
  const leaveGameRoom = async () => {
    if (!walletAddress || !currentRoom) return;

    await supabase
      .from('room_players')
      .delete()
      .eq('room_id', currentRoom.id)
      .eq('wallet_address', walletAddress);

    setCurrentRoom(null);
    setRoomPlayers([]);
  };

  // Start game room
  const startGameRoom = async (roomId: string) => {
    const { error } = await supabase
      .from('game_rooms')
      .update({
        status: 'active',
        started_at: new Date().toISOString(),
      })
      .eq('id', roomId);

    if (error) {
      console.error('Error starting game room:', error);
      return false;
    }

    return true;
  };

  // Generate unique room code
  const generateRoomCode = async (): Promise<string> => {
    const { data } = await supabase.rpc('generate_room_code');
    return data || Math.random().toString(36).substring(2, 8).toUpperCase();
  };

  // Real-time subscriptions
  useEffect(() => {
    // Subscribe to game rooms changes
    const roomsChannel = supabase
      .channel('game-rooms-changes')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'game_rooms'
      }, () => {
        fetchGameRooms();
      })
      .subscribe();

    // Subscribe to room players if in a room
    let playersChannel: any = null;
    if (currentRoom) {
      playersChannel = supabase
        .channel('room-players-changes')
        .on('postgres_changes', {
          event: '*',
          schema: 'public',
          table: 'room_players',
          filter: `room_id=eq.${currentRoom.id}`
        }, async () => {
          const { data } = await supabase
            .from('room_players')
            .select('*')
            .eq('room_id', currentRoom.id);
          setRoomPlayers(data || []);
        })
        .subscribe();
    }

    return () => {
      supabase.removeChannel(roomsChannel);
      if (playersChannel) {
        supabase.removeChannel(playersChannel);
      }
    };
  }, [currentRoom]);

  // Fetch room players when room changes
  useEffect(() => {
    if (currentRoom) {
      const fetchRoomPlayers = async () => {
        const { data } = await supabase
          .from('room_players')
          .select('*')
          .eq('room_id', currentRoom.id);
        setRoomPlayers(data || []);
      };
      fetchRoomPlayers();
    }
  }, [currentRoom]);

  return {
    gameRooms,
    currentRoom,
    roomPlayers,
    loading,
    fetchGameRooms,
    createGameRoom,
    joinGameRoom,
    leaveGameRoom,
    startGameRoom,
  };
};
