'use client';

import { useUser } from '@clerk/nextjs';
import { Todo } from '@prisma/client';
import React, { useCallback, useEffect, useState } from 'react'
import { useDebounceValue } from 'usehooks-ts';


function Dashboard() {
    const {user} = useUser()
    const [todos, setTodos]  = useState<Todo[]>([])
    const [searchTerm, setSearchTerm] = useState('')
    const [loading, setLoading] = useState(false)
    const [totalPages, setTotalPages] = useState(1)
    const [currentPage, setCurrentPage] = useState(1)
    const [isSubscribed, setIsSubscribed] = useState(false)


    const debouncedSearchTerm = useDebounceValue(searchTerm,300)

    const fetchTodos = useCallback(async(page:number)=>{
        try {
            setLoading(true)
            const response = await fetch(`/api/todos?page=${page}&search=${debouncedSearchTerm}`)
            if(!response.ok){
                throw new Error('An error occurred while fetching the data')
            }
            const data = await response.json()
            setTodos(data.todos)
            setTotalPages(data.totalPages)
            setCurrentPage(data.currentPage)
            setLoading(false)
        } catch (error) {
            setLoading(false)
        }
    },[debouncedSearchTerm])


    useEffect(()=>{
        fetchTodos(1)
        fetchSubscriptionStatus()
    },[])

    const fetchSubscriptionStatus = async()=>{
        const res = await fetch('/api/subscription')
        if(!res.ok){
            throw new Error('Failed to fetch subscription status')
        }
        const data = await res.json()
        setIsSubscribed(data.isSubscribed)
    }

    const handleAddTodo = async(title:string)=>{
        try {
            const res = await fetch('/api/todos',{
                method:'POST',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({title})
            })
            if(!res.ok){
                throw new Error('Failed to add todo')
            }
            await fetchTodos(currentPage)

        } catch (error) {
            console.log("Error adding todo",error);
            
        }
    }

    const handleUpdateTodo = async(id:string,completed:boolean)=>{
        try {
            const res = await fetch(`/api/todos/${id}`,{
                method:'PUT',
                headers:{
                    'Content-Type':'application/json'
                },
                body:JSON.stringify({completed})
            })
            if(!res.ok){
                throw new Error('Failed to update todo')
            }
            await fetchTodos(currentPage)
        } catch (error) {
            console.log("Error updating todo",error);
        }
    }


    const handleDeleteTodo = async(id:string)=>{
        try {
            const res = await fetch(`/api/todos/${id}`,{
                method:'DELETE'
            })
            if(!res.ok){
                throw new Error('Failed to delete todo')
            }
            await fetchTodos(currentPage)
        } catch (error) {
            console.log("Error deleting todo",error);
        }
    }

    return (
        <div>

        </div>
    )
}

export default Dashboard
