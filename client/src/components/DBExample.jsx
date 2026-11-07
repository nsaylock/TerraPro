import { useState, useEffect } from 'react';
import '../css/App.css';

const API_URL = 'http://localhost:3000/api/users';

function DBExample() {
  const [users, setUsers] = useState([]);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [error, setError] = useState('');

  // 1. Fetch users when the component loads
  useEffect(() => {
    fetchUsers();
  }, []);

  const fetchUsers = async () => {
    try {
      const response = await fetch(API_URL);
      const data = await response.json();
      setUsers(data);
    } catch (err) {
      console.error('Error fetching users', err);
    }
  };

  // 2. Handle creating a new user
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');

    try {
      const response = await fetch(API_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email }),
      });
      const data = await response.json();
      if(!response.ok) {
        throw new Error(data.message || 'Failed to add user');
      }
      //Append new user to state and reset inputs
      setUsers([...users, data]);
      setName('');
      setEmail('');
    } catch (err) {
      setError(err.message);
    }
  };

  // 3. Handle deleting a user
  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this user?')) return;

    try {
      const response = await fetch(`${API_URL}/${id}`, {
        method: 'DELETE',
      });
        if (response.ok) {
          // Filter out deleted user from UI state instantly
          setUsers(users.filter((user) => user.id !== id));
        }
    } catch (err) {
      console.error('Error deleting user:', err)
    }
  };

  const triggerRead = (id) => {
    alert(id)
  }

  return (
    <div style={{maxWidth: '500px', margin: '40px', padding: '0 20px', fontFamily: 'sans-serif'}}>
      <h2>Add New User (React)</h2>
      <form onSubmit={handleSubmit} style={{display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '30px'}}>
        <input 
          type='text'
          placeholder='name'
          value={name}
          onChange={(e)=> setName(e.target.value)}
          required
          style={{padding: '8px', fontSize: '16px'}}
        />
        <input 
          type='email'
          placeholder='email'
          value={email}
          onChange={(e)=>setEmail(e.target.value)}
          required
          style={{padding: '8px', fontSize: '16px'}}
        />
        <button type='submit' style={{padding:'8px', fontSize:'16px', cursor:'pointer'}}>
          Add User
        </button>
        </form>

        <h2>User List</h2>
        <ul style={{ listStyle:'none', padding: '0'}}>
          {users.map((user)=>(
            <li key={user.id} style={{padding: '10px', borderBottom:'1px solid #eee', display: 'flex', justifyContent: 'space-between', alignItems: 'center'}}>
              <span><strong>{user.name}</strong> | {user.email}</span>
              <button onClick={()=>triggerRead(user.id)}>Read</button>
              <button
                onClick={()=>handleDelete(user.id)}
                style={{background: '#ff4d4d', color: 'white', border:'none', padding:'5px 10px', cursor: 'pointer'}}
              >
                Delete
              </button>
            </li>
          ))}
        </ul>
    </div>
  )


}

export default DBExample;