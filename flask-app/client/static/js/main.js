document.addEventListener('DOMContentLoaded', function() {
    fetchUsers();
});

async function fetchUsers() {
    try {
        const response = await fetch('/api/users');
        const users = await response.json();
        displayUsers(users);
    } catch (error) {
        console.error('Error fetching users:', error);
    }
}

function displayUsers(users) {
    const userList = document.getElementById('user-list');
    userList.innerHTML = users.map(user => 
        `<div class="user-item">
            <p>Username: ${user.username}</p>
        </div>`
    ).join('');
} 