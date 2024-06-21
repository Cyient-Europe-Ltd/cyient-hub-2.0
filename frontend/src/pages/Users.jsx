import React from 'react';
import '../resources/Users.css';

const UserManagement = () => {
  return (
    <div className="user-management">
      <h1>User Management</h1>
      <table>
        <thead>
          <tr>
            <th>First Name</th>
            <th>Last Name</th>
            <th>Team</th>
            <th>Role</th>
            <th>Agency</th>
            <th>Edit</th>
            <th>Password Reset</th>
            <th>End Date</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td>Abdul-Rahman</td>
            <td>Adegbite</td>
            <td>Team 2</td>
            <td>Diq</td>
            <td>Kinect</td>
            <td><button>Edit</button></td>
            <td><button>Reset Password</button></td>
            <td><button>Resignation</button></td>
          </tr>
        </tbody>
      </table>
    </div>
  );
};

export default UserManagement;