
"use client";

import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/auth-context';
import type { Todo } from '@/lib/types';
import { getUserTodos, addTodo, updateTodoStatus, deleteTodo } from '@/lib/firebase';
import { Checkbox } from '@/components/ui/checkbox';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Plus, Trash2, Loader2, Info } from 'lucide-react';
import { Skeleton } from './ui/skeleton';
import { useToast } from '@/hooks/use-toast';
import { AnimatePresence, motion } from 'framer-motion';

export function TodoList() {
    const { user } = useAuth();
    const { toast } = useToast();
    const [todos, setTodos] = useState<Todo[]>([]);
    const [newTodoText, setNewTodoText] = useState('');
    const [loading, setLoading] = useState(true);
    const [isAdding, setIsAdding] = useState(false);

    useEffect(() => {
        if (!user) {
            setLoading(false);
            setTodos([]);
            return;
        }

        setLoading(true);
        getUserTodos(user.uid)
            .then(setTodos)
            .catch(err => {
                console.error("Failed to fetch todos:", err);
                toast({ variant: 'destructive', title: 'Error', description: 'Could not load your to-do list.' });
            })
            .finally(() => setLoading(false));
    }, [user, toast]);

    const handleAddTodo = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!user || !newTodoText.trim()) return;

        setIsAdding(true);
        try {
            const newTodoId = await addTodo(user.uid, newTodoText.trim());
            const newTodo: Todo = {
                id: newTodoId,
                text: newTodoText.trim(),
                completed: false,
                createdAt: new Date().toISOString(),
            };
            setTodos(prev => [...prev, newTodo]);
            setNewTodoText('');
        } catch (error) {
            console.error("Failed to add todo:", error);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not add the new task.' });
        } finally {
            setIsAdding(false);
        }
    };

    const handleToggleTodo = (todoId: string, completed: boolean) => {
        if (!user) return;
        
        // Optimistically update the UI
        setTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed } : t));

        updateTodoStatus(user.uid, todoId, completed).catch(err => {
            console.error("Failed to update todo:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not sync task status.' });
            // Revert optimistic update on failure
            setTodos(prev => prev.map(t => t.id === todoId ? { ...t, completed: !completed } : t));
        });
    };

    const handleDeleteTodo = (todoId: string) => {
        if (!user) return;

        // Optimistically update UI
        setTodos(prev => prev.filter(t => t.id !== todoId));

        deleteTodo(user.uid, todoId).catch(err => {
            console.error("Failed to delete todo:", err);
            toast({ variant: 'destructive', title: 'Error', description: 'Could not delete the task.' });
            // Note: Reverting deletion is more complex, might require re-fetching. For now, we'll leave it as is.
        });
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
                <Skeleton className="h-8 w-full" />
            </div>
        );
    }
    
    if(!user) {
         return (
            <div className="flex flex-col items-center justify-center h-40 text-center text-muted-foreground bg-muted/50 rounded-lg">
                <Info className="w-8 h-8 mb-2" />
                <p className="font-semibold">Sign In Required</p>
                <p className="text-sm">Sign in to manage your to-do list.</p>
            </div>
          );
    }

    return (
        <div className="space-y-4">
            <div className="space-y-2">
                 <AnimatePresence>
                    {todos.map(todo => (
                        <motion.div
                            key={todo.id}
                            layout
                            initial={{ opacity: 0, y: -10 }}
                            animate={{ opacity: 1, y: 0 }}
                            exit={{ opacity: 0, x: -20, transition: { duration: 0.2 } }}
                            className="flex items-center group"
                        >
                            <Checkbox 
                                id={`task-${todo.id}`} 
                                checked={todo.completed}
                                onCheckedChange={(checked) => handleToggleTodo(todo.id, !!checked)}
                                className="mr-3"
                            />
                            <Label 
                                htmlFor={`task-${todo.id}`} 
                                className="flex-1 text-sm font-medium leading-none data-[state=checked]:line-through"
                            >
                                {todo.text}
                            </Label>
                            <Button
                                variant="ghost"
                                size="icon"
                                className="h-6 w-6 opacity-0 group-hover:opacity-100 transition-opacity"
                                onClick={() => handleDeleteTodo(todo.id)}
                            >
                                <Trash2 className="h-4 w-4 text-muted-foreground" />
                            </Button>
                        </motion.div>
                    ))}
                 </AnimatePresence>

                 {todos.length === 0 && !loading && (
                     <p className="text-sm text-muted-foreground text-center py-4">Your to-do list is empty. Add a task to get started.</p>
                 )}
            </div>

            <form onSubmit={handleAddTodo} className="flex gap-2">
                <Input 
                    placeholder="Add a new task..."
                    value={newTodoText}
                    onChange={(e) => setNewTodoText(e.target.value)}
                    disabled={isAdding}
                />
                <Button type="submit" size="icon" disabled={isAdding || !newTodoText.trim()}>
                    {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                </Button>
            </form>
        </div>
    );
}
