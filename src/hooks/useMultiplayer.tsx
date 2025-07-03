
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
  const [error, setError] = useState<string | null>(null);

  // Fetch available game rooms
  const fetchGameRooms = async () => {
    setLoading(true);
    setError(null);
    
    try {
      const { data, error } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('status', 'waiting')
        .order('created_at', { ascending: false });

      if (error) {
        console.error('Error fetching game rooms:', error);
        setError('Failed to fetch game rooms');
      } else {
        setGameRooms(data || []);
      }
    } catch (err) {
      console.error('Unexpected error:', err);
      setError('An unexpected error occurred');
    } finally {
      setLoading(false);
    }
  };

  // Create a new game room
  const createGameRoom = async (gameType: GameType, maxPlayers: number = 4) => {
    if (!walletAddress) {
      setError('Wallet address is required');
      return null;
    }

    setError(null);

    try {
      const roomCode = await generateRoomCode();
      const { data, error } = await supabase
        .from('game_rooms')
        .insert({
          room_code: roomCode,
          game_type: gameType,
          max_players: maxPlayers,
          host_wallet_address: walletAddress,
          entry_fee: 45,
          prize_pool: 45
        })
        .select()
        .single();

      if (error) {
        console.error('Error creating game room:', error);
        setError('Failed to create game room');
        return null;
      }

      // Join the room as host
      const joinSuccess = await joinGameRoom(data.id);
      if (!joinSuccess) {
        setError('Failed to join created room');
        return null;
      }

      return data;
    } catch (err) {
      console.error('Unexpected error creating room:', err);
      setError('An unexpected error occurred while creating room');
      return null;
    }
  };

  // Join a game room
  const joinGameRoom = async (roomId: string) => {
    if (!walletAddress) {
      setError('Wallet address is required');
      return false;
    }

    setError(null);

    try {
      // Check if already in room
      const { data: existingPlayer } = await supabase
        .from('room_players')
        .select('id')
        .eq('room_id', roomId)
        .eq('wallet_address', walletAddress)
        .single();

      if (existingPlayer) {
        console.log('Already in room');
      } else {
        const { error } = await supabase
          .from('room_players')
          .insert({
            room_id: roomId,
            wallet_address: walletAddress,
          });

        if (error) {
          console.error('Error joining game room:', error);
          setError('Failed to join game room');
          return false;
        }
      }

      // Fetch the room details
      const { data: room, error: roomError } = await supabase
        .from('game_rooms')
        .select('*')
        .eq('id', roomId)
        .single();

      if (roomError) {
        console.error('Error fetching room details:', roomError);
        setError('Failed to fetch room details');
        return false;
      }

      if (room) {
        setCurrentRoom(room);
      }

      return true;
    } catch (err) {
      console.error('Unexpected error joining room:', err);
      setError('An unexpected error occurred while joining room');
      return false;
    }
  };

  // Leave current room
  const leaveGameRoom = async () => {
    if (!walletAddress || !currentRoom) return;

    setError(null);

    try {
      await supabase
        .from('room_players')
        .delete()
        .eq('room_id', currentRoom.id)
        .eq('wallet_address', walletAddress);

      setCurrentRoom(null);
      setRoomPlayers([]);
    } catch (err) {
      console.error('Error leaving room:', err);
      setError('Failed to leave room');
    }
  };

  // Start game room
  const startGameRoom = async (roomId: string) => {
    setError(null);

    try {
      const { error } = await supabase
        .from('game_rooms')
        .update({
          status: 'active',
          started_at: new Date().toISOString(),
        })
        .eq('id', roomId);

      if (error) {
        console.error('Error starting game room:', error);
        setError('Failed to start game room');
        return false;
      }

      return true;
    } catch (err) {
      console.error('Unexpected error starting room:', err);
      setError('An unexpected error occurred while starting room');
      return false;
    }
  };

  // Generate unique room code
  const generateRoomCode = async (): Promise<string> => {
    try {
      const { data } = await supabase.rpc('generate_room_code');
      return data || Math.random().toString(36).substring(2, 8).toUpperCase();
    } catch (err) {
      console.error('Error generating room code:', err);
      return Math.random().toString(36).substring(2, 8).toUpperCase();
    }
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
    error,
    fetchGameRooms,
    createGameRoom,
    joinGameRoom,
    leaveGameRoom,
    startGameRoom,
  };
};
