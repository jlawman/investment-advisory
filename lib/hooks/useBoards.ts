import useSWR from 'swr';
import { useState } from 'react';

const fetcher = (url: string) => fetch(url).then(res => res.json());

export interface Board {
  id: string;
  userId: string;
  name: string;
  investors: string[];
  createdAt: string;
  updatedAt: string;
}

export function useBoards() {
  const { data, error, mutate } = useSWR<{ boards: Board[] }>('/api/boards', fetcher);
  const [isCreating, setIsCreating] = useState(false);
  const [isUpdating, setIsUpdating] = useState(false);
  const [isDeleting, setIsDeleting] = useState(false);

  const createBoard = async (name: string, investors: string[]) => {
    setIsCreating(true);
    try {
      const response = await fetch('/api/boards', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, investors }),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to create board');
      }

      const result = await response.json();
      
      // Optimistically update the cache
      mutate(
        current => ({
          boards: [...(current?.boards || []), result.board],
        }),
        false
      );

      return result.board;
    } catch (error) {
      throw error;
    } finally {
      setIsCreating(false);
    }
  };

  const updateBoard = async (id: string, updates: { name?: string; investors?: string[] }) => {
    setIsUpdating(true);
    try {
      const response = await fetch(`/api/boards?id=${id}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(updates),
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to update board');
      }

      const result = await response.json();
      
      // Optimistically update the cache
      mutate(
        current => ({
          boards: current?.boards.map(b => 
            b.id === id ? result.board : b
          ) || [],
        }),
        false
      );

      return result.board;
    } catch (error) {
      throw error;
    } finally {
      setIsUpdating(false);
    }
  };

  const deleteBoard = async (id: string) => {
    setIsDeleting(true);
    try {
      const response = await fetch(`/api/boards?id=${id}`, {
        method: 'DELETE',
      });

      if (!response.ok) {
        const error = await response.json();
        throw new Error(error.error || 'Failed to delete board');
      }

      // Optimistically update the cache
      mutate(
        current => ({
          boards: current?.boards.filter(b => b.id !== id) || [],
        }),
        false
      );
    } catch (error) {
      throw error;
    } finally {
      setIsDeleting(false);
    }
  };

  return {
    boards: data?.boards || [],
    isLoading: !error && !data,
    isError: error,
    isCreating,
    isUpdating,
    isDeleting,
    createBoard,
    updateBoard,
    deleteBoard,
    mutate,
  };
}