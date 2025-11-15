import React from 'react'
import { Link } from 'react-router-dom'

export default function Home() {
  return (
    <div className="mt-8">
      <div className="bg-white p-6 rounded shadow">
        <h2 className="text-xl font-semibold mb-2">Welcome</h2>
        <p className="mb-4">This is a simple frontend for the User Registration API.</p>
        <div className="space-x-2">
          <Link to="/register" className="text-blue-600">Sign Up</Link>
          <Link to="/login" className="text-blue-600">Login</Link>
        </div>
      </div>
    </div>
  )
}
